import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import BodyForm from "./BodyForm";
import MealForm from "./MealForm";
import Review from "./Review";
import { useSelector, useDispatch } from "react-redux";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const steps = ["Calorie Calculator", "Meal planner", "Review your plan"];

function getStepContent(step) {
  switch (step) {
    case 0:
      return <BodyForm />;
    case 1:
      return <MealForm />;
    case 2:
      return <Review />;
    default:
      throw new Error("Unknown step");
  }
}

export default function Checkout() {
  const mealData = useSelector((state) => state.user.mealData);
  const isCalculated = useSelector((state) => state.form.isCalculated);
  const selectedCalorieGoal = useSelector((state) => state.user.selectedCalorieGoal);
  const user = useSelector((state) => state.user.user);
  
  // Redirect to step 3 ONLY if the logged-in user has a saved meal plan loaded from DB.
  // That means: we have a week object and at least one day has meals.
  const hasMealPlanFlag =
    typeof window !== 'undefined' && localStorage.getItem('hasMealPlan') === 'true';

  const hasMealPlan = Boolean(
    user?.id &&
      selectedCalorieGoal &&
      (mealData?.source === 'db' || (hasMealPlanFlag && !mealData?.source)) &&
      mealData?.week &&
      Object.values(mealData.week).some((d) => Array.isArray(d?.meals) && d.meals.length > 0)
  );
  
  // If user has saved meal plan with actual data, start at step 2 (Review)
  const initialStep = hasMealPlan ? 2 : 0;
  const [activeStep, setActiveStep] = React.useState(initialStep);
  
  // Update step if meal data is loaded after component mount
  React.useEffect(() => {
    const hasMealPlanNow = Boolean(
      user?.id &&
        selectedCalorieGoal &&
        (mealData?.source === 'db' ||
          (hasMealPlanFlag && !mealData?.source)) &&
        mealData?.week &&
        Object.values(mealData.week).some((d) => Array.isArray(d?.meals) && d.meals.length > 0)
    );
    
    if (hasMealPlanNow && activeStep < 2) {
      setActiveStep(2);
    }
  }, [mealData, selectedCalorieGoal, user, activeStep]);
  
  console.log("Meal Data in Redux Store:", mealData);

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  // const handleDownload = () => {
  //   if (mealData) {
  //     const fileName = "meal_plan.json";
  //     const fileContent = JSON.stringify(mealData, null, 2);
  //     const blob = new Blob([fileContent], { type: "application/json" });
  //     saveAs(blob, fileName);
  //   } else {
  //     alert("No meal plan data to download.");
  //   }
  // };

  const handleDownloadPDF = () => {
    if (mealData) {
      const doc = new jsPDF();
      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 14;
      let yPosition = 20;

      // Заглавие на документа
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(25, 118, 210);
      doc.text("Weekly Meal Plan", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;

      // За всяка седмица (ден) - API връща директно {monday: {...}, tuesday: {...}}
      const weekData = mealData.week || mealData;
      
      // Подредба на дните по ред
      const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const sortedDays = Object.keys(weekData).sort((a, b) => {
        return dayOrder.indexOf(a.toLowerCase()) - dayOrder.indexOf(b.toLowerCase());
      });

      sortedDays.forEach((day, index) => {
        const data = weekData[day];
        
        // Проверка за нова страница
        if (yPosition > pageHeight - 80) {
          doc.addPage();
          yPosition = 20;
        }

        // Заглавие на деня
        doc.setFontSize(14);
        doc.setFont("Helvetica", "bold");
        doc.setTextColor(40, 40, 40);
        doc.text(day.charAt(0).toUpperCase() + day.slice(1), margin, yPosition);
        yPosition += 8;

        // Таблица за храненията
        const mealRows = data.meals.map((meal) => [
          meal.title,
          `${meal.readyInMinutes} min`,
          `${meal.servings}`,
        ]);

        doc.autoTable({
          startY: yPosition,
          head: [["Meal", "Time", "Servings"]],
          body: mealRows,
          theme: "striped",
          headStyles: { 
            fillColor: [25, 118, 210],
            textColor: [255, 255, 255],
            fontStyle: "bold"
          },
          styles: {
            fontSize: 10,
            cellPadding: 3,
          },
          columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 30, halign: 'center' },
            2: { cellWidth: 30, halign: 'center' },
          },
          margin: { left: margin, right: margin },
        });

        yPosition = doc.lastAutoTable.finalY + 10;

        // Добавяне на нутриенти
        doc.setFontSize(11);
        doc.setFont("Helvetica", "bold");
        doc.setTextColor(40, 40, 40);
        doc.text("Nutrients:", margin, yPosition);
        yPosition += 6;
        
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`Calories: ${data.nutrients.calories.toFixed(0)}`, margin, yPosition);
        yPosition += 5;
        doc.text(`Protein: ${data.nutrients.protein.toFixed(1)}g`, margin, yPosition);
        yPosition += 5;
        doc.text(`Fat: ${data.nutrients.fat.toFixed(1)}g`, margin, yPosition);
        yPosition += 5;
        doc.text(`Carbohydrates: ${data.nutrients.carbohydrates.toFixed(1)}g`, margin, yPosition);
        yPosition += 12;
      });

      // Запазване на PDF файла
      doc.save("meal_plan.pdf");
    } else {
      alert("No meal plan data to download.");
    }
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <Container
        component="main"
        maxWidth="sm"
        sx={{ mb: 4, backgroundColor: "#ffffff" }}
      >
        <Paper
          variant="outlined"
          sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
        >
          <Typography
            component="h1"
            variant="h4"
            align="center"
            color="#1976D2"
          >
            Free Health & Fitness Calculator
          </Typography>
          <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {activeStep === steps.length ? (
            <React.Fragment>
              {getStepContent(steps.length - 1)}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button 
                  onClick={handleBack} 
                  sx={{ mt: 3, ml: 1 }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleDownloadPDF}
                  sx={{
                    mt: 3,
                    ml: 1,
                    backgroundColor: "#1976D2",
                    color: "white",
                  }}
                >
                  Download Meal Plan
                </Button>
              </Box>
            </React.Fragment>
          ) : (
            <React.Fragment>
              {getStepContent(activeStep)}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                {activeStep !== 0 && (
                  <Button onClick={handleBack} sx={{ mt: 3, ml: 1 }}>
                    Back
                  </Button>
                )}
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    mt: 3,
                    ml: 1,
                    backgroundColor: "#1976D2",
                    color: "white",
                  }}
                  disabled={
                    (activeStep === 0 && !isCalculated) ||
                    (activeStep === 1 && !selectedCalorieGoal)
                  }
                >
                  {activeStep === steps.length - 1 ? "Download" : "Next"}
                </Button>
              </Box>
            </React.Fragment>
          )}
        </Paper>
      </Container>
    </React.Fragment>
  );
}
