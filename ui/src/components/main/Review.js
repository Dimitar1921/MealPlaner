import React, { useState, useEffect, useRef } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import { useSelector, useDispatch } from "react-redux";

import axios from "axios";
import Meal from "./Meal";
import { mealAPI } from "../../services/api";
export default function Review() {
  const selectedCalorieGoal = useSelector(
    (state) => state.user.selectedCalorieGoal?.calory
  );
  const mealDataFromStore = useSelector((state) => state.user.mealData);

  const [expanded, setExpanded] = useState(false);
  const [mealData, setMealData] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  // Use mealData from Redux store if available, otherwise use local state
  const displayMealData = mealDataFromStore || mealData;
  const isMealPlanFromDb = Boolean(mealDataFromStore && mealDataFromStore.source === 'db');
  const lastFetchedCaloriesRef = useRef(null);

  useEffect(() => {
    // If we have mealData from Redux store, use it
    if (mealDataFromStore) {
      console.log('Using mealData from Redux store:', mealDataFromStore);
      setMealData(mealDataFromStore);
      return;
    }

    // Otherwise, fetch from Spoonacular API if we have calorie goal
    if (selectedCalorieGoal && !mealData) {
      // Guard against double-fetch in React.StrictMode and repeated renders
      if (lastFetchedCaloriesRef.current === selectedCalorieGoal) return;
      lastFetchedCaloriesRef.current = selectedCalorieGoal;
      fetchMealPlanWeek();
      console.log('Fetching meal plan from Spoonacular API for calories:', selectedCalorieGoal);
    }
  }, [selectedCalorieGoal, mealData, mealDataFromStore]);

  const fetchMealPlanWeek = async () => {
    if (isFetching) return;

    setIsFetching(true);
    try {
      const response = await axios.get(
        `https://api.spoonacular.com/mealplanner/generate?apiKey=d8b3d0f2b4e446eba0b48e40c6893ac3&timeFrame=week&targetCalories=${selectedCalorieGoal}`
      );
      const plan = { ...response.data, source: 'spoonacular' };
      setMealData(plan);
      dispatch({ type: "SET_MEAL_DATA", payload: plan });
    } catch (error) {
      console.error("Error fetching meal plan:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const saveMealsToDatabase = async () => {
    const planToSave = displayMealData;
    if (!planToSave || !user || !user.id) {
      setSaveMessage({ type: 'error', text: 'Please log in to save meals' });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const weekData = planToSave.week || planToSave;
      const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const mealTypeMap = {
        1: 'breakfast',
        2: 'lunch',
        3: 'dinner'
      };

      let savedCount = 0;
      let errorCount = 0;

      for (const dayName of dayOrder) {
        const dayData = weekData[dayName];
        if (!dayData || !dayData.meals) continue;

        const mealsCount = dayData.meals.length || 0;
        const dayNutrients = dayData.nutrients || {};
        // Spoonacular "generate week" gives nutrients per day, not per meal.
        // To avoid saving 0s, distribute daily totals across meals.
        const perMealCalories = mealsCount ? (Number(dayNutrients.calories) || 0) / mealsCount : 0;
        const perMealProtein = mealsCount ? (Number(dayNutrients.protein) || 0) / mealsCount : 0;
        const perMealFat = mealsCount ? (Number(dayNutrients.fat) || 0) / mealsCount : 0;
        const perMealCarbs = mealsCount ? (Number(dayNutrients.carbohydrates) || 0) / mealsCount : 0;

        for (let i = 0; i < dayData.meals.length; i++) {
          const meal = dayData.meals[i];
          const mealType = mealTypeMap[i + 1] || 'snack';

          try {
            await mealAPI.create({
              day: dayName,
              mealType: mealType,
              name: meal.title || 'Untitled Meal',
              calories: Math.max(0, Math.round(perMealCalories)),
              protein: Math.max(0, Number(perMealProtein.toFixed(2))),
              carbs: Math.max(0, Number(perMealCarbs.toFixed(2))),
              fat: Math.max(0, Number(perMealFat.toFixed(2))),
              recipeId: meal.id,
              recipeData: {
                // Spoonacular "generate" doesn't include image; keep null unless available.
                image: meal.image || null,
                readyInMinutes: meal.readyInMinutes,
                servings: meal.servings,
                sourceUrl: meal.sourceUrl
              }
            });
            savedCount++;
          } catch (error) {
            console.error(`Error saving meal ${meal.id}:`, error);
            errorCount++;
          }
        }
      }

      if (savedCount > 0) {
        setSaveMessage({ 
          type: 'success', 
          text: `Successfully saved ${savedCount} meal(s) to your database!${errorCount > 0 ? ` (${errorCount} failed)` : ''}` 
        });

        // Mark current plan as "saved" so UI switches to "Loaded from your saved plan"
        dispatch({ type: "SET_MEAL_DATA", payload: { ...(planToSave.week ? planToSave : { week: weekData }), source: 'db' } });
      } else {
        setSaveMessage({ 
          type: 'error', 
          text: `Failed to save meals. ${errorCount > 0 ? `${errorCount} error(s) occurred.` : 'Please try again.'}` 
        });
      }
    } catch (error) {
      console.error('Error saving meals:', error);
      setSaveMessage({ 
        type: 'error', 
        text: 'An error occurred while saving meals. Please try again.' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      {displayMealData && (
        <>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" component="h2">
              Your Weekly Meal Plan
            </Typography>
            {user && user.id && !isMealPlanFromDb && (
              <Button
                variant="contained"
                color="primary"
                onClick={saveMealsToDatabase}
                disabled={isSaving}
                sx={{ ml: 2 }}
              >
                {isSaving ? 'Saving...' : 'Save All Meals to Database'}
              </Button>
            )}
            {isMealPlanFromDb && (
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                Loaded from your saved plan
              </Typography>
            )}
          </Box>
          {saveMessage && (
            <Alert 
              severity={saveMessage.type} 
              onClose={() => setSaveMessage(null)}
              sx={{ mb: 2 }}
            >
              {saveMessage.text}
            </Alert>
          )}
        </>
      )}
      {!displayMealData && selectedCalorieGoal && (
        <Typography variant="body1" color="text.secondary">
          Loading your meal plan...
        </Typography>
      )}
      {!displayMealData && !selectedCalorieGoal && (
        <Typography variant="body1" color="text.secondary">
          Please complete the previous steps to generate your meal plan.
        </Typography>
      )}
      {displayMealData &&
        (() => {
          const weekData = displayMealData.week || displayMealData;
          // Order days: Monday first
          const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
          const sortedDays = Object.keys(weekData).sort((a, b) => {
            const aIndex = dayOrder.indexOf(a.toLowerCase());
            const bIndex = dayOrder.indexOf(b.toLowerCase());
            // If day not found in order, put it at the end
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
          });
          
          return sortedDays.map((dayName, index) => {
            const dayData = weekData[dayName];
            return (
          <Accordion
            key={dayName}
            expanded={expanded === `panel${index}`}
            onChange={handleChange(`panel${index}`)}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}bh-content`}
              id={`panel${index}bh-header`}
            >
              <Typography>
                {dayName.charAt(0).toUpperCase() + dayName.slice(1)}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div>
                <h1>Macros</h1>
                <ul>
                  <li>Calories: {dayData.nutrients.calories.toFixed(0)}</li>
                  <li>
                    Carbohydrates: {dayData.nutrients.carbohydrates.toFixed(0)}
                  </li>
                  <li>Fat: {dayData.nutrients.fat.toFixed(0)}</li>
                  <li>Protein: {dayData.nutrients.protein.toFixed(0)}</li>
                </ul>
              </div>
              {dayData.meals.map((meal, mealIndex) => (
                <Meal key={`${dayName}-${meal.id}-${mealIndex}`} meal={meal} />
              ))}
            </AccordionDetails>
          </Accordion>
            );
          });
        })()}
    </div>
  );
}
