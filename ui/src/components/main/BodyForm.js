import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormHelperText from "@mui/material/FormHelperText";

import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

//redux
import { useSelector, useDispatch } from "react-redux";
import {
  updateFormData,
  updateCalorieData,
} from "../../redux/actions/formActions";
import { updateUserData } from "../../redux/actions/userActions";
import { setCalculatedFlag } from "../../redux/actions/formActions";

export default function BodyForm() {
  const user = useSelector((state) => state.user.user);

  const username = user?.username || "";
  const [calText, setCalText] = useState(false);
  const [calculatedCalories, setCalculatedCalories] = useState(0);

  const dispatch = useDispatch();
  const formDataFromStore = useSelector((state) => state.form.formData); // Извличане на данните от store

  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    weight: "",
    height: "",
    activitylevel: "",
  });

  const [errors, setErrors] = useState({
    age: "",
    gender: "",
    weight: "",
    height: "",
    activitylevel: "",
  });

  useEffect(() => {
    if (formDataFromStore) {
      setFormData(formDataFromStore);
    }
  }, [formDataFromStore]);

  function calculateCaloriesLocal(formData) {
    const { age, gender, weight, height, activitylevel } = formData;

    const isMale = gender === "male";
    const BMR = isMale
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

    let activityFactor = 1.2;
    switch (activitylevel) {
      case "level_1":
        activityFactor = 1.2;
        break;
      case "level_2":
        activityFactor = 1.375;
        break;
      case "level_3":
        activityFactor = 1.55;
        break;
      case "level_4":
        activityFactor = 1.725;
        break;
      case "level_5":
        activityFactor = 1.9;
        break;
      default:
        activityFactor = 1.2;
    }

    // Калкулатор за поддържане на тегло
    const maintainCalories = BMR * activityFactor;

    return maintainCalories;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    
    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    
    setErrors(newErrors);
    
    // Check if there are any errors
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Изчисляване на калориите
    const result = calculateCaloriesLocal(formData);

    const newCaloriesData = {
      "maintain weight": { calory: result },
      "Mild weight gain": { calory: result + 200 },
      "Mild weight loss": { calory: result - 200 },
    };

    dispatch(
      updateUserData({
        ...formData,
        calories: newCaloriesData,
      })
    );

    setCalculatedCalories(result);
    dispatch(updateCalorieData(result));
    dispatch(setCalculatedFlag(true));
    setCalText(true);
  };

  // Reset the flag if any form data changes
  useEffect(() => {
    dispatch(setCalculatedFlag(false));
  }, [formData, dispatch]);

  // Validation function
  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "age":
        if (!value) {
          error = "Age is required";
        } else if (isNaN(value) || parseFloat(value) < 1 || parseFloat(value) > 120) {
          error = "Age must be between 1 and 120";
        }
        break;
      case "weight":
        if (!value) {
          error = "Weight is required";
        } else if (isNaN(value) || parseFloat(value) < 1 || parseFloat(value) > 500) {
          error = "Weight must be between 1 and 500 kg";
        }
        break;
      case "height":
        if (!value) {
          error = "Height is required";
        } else if (isNaN(value) || parseFloat(value) < 50 || parseFloat(value) > 250) {
          error = "Height must be between 50 and 250 cm";
        }
        break;
      case "gender":
        if (!value) {
          error = "Gender is required";
        }
        break;
      case "activitylevel":
        if (!value) {
          error = "Activity level is required";
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  // Dispatching form data
  const handleChange = (event) => {
    const { name, value } = event.target;
    const newFormData = { ...formData, [name]: value };
    const error = validateField(name, value);
    
    setFormData(newFormData);
    setErrors({ ...errors, [name]: error });
    dispatch(updateFormData(newFormData));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Welcome {username || ""}!
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            InputLabelProps={{
              shrink: true,
            }}
            id="age"
            name="age"
            label="Age"
            fullWidth
            variant="outlined"
            type="number"
            value={formData.age || ""}
            onChange={handleChange}
            error={!!errors.age}
            helperText={errors.age}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required variant="outlined" error={!!errors.gender}>
            <InputLabel id="gender-label">Gender</InputLabel>
            <Select
              labelId="gender-label"
              id="gender"
              name="gender"
              value={formData.gender || ""}
              onChange={handleChange}
              label="Gender"
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
            </Select>
            {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            InputLabelProps={{
              shrink: true,
            }}
            id="weight"
            name="weight"
            label="Weight (kg)"
            fullWidth
            variant="outlined"
            type="number"
            value={formData.weight || ""}
            onChange={handleChange}
            error={!!errors.weight}
            helperText={errors.weight}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            InputLabelProps={{
              shrink: true,
            }}
            id="height"
            name="height"
            label="Height (cm)"
            fullWidth
            variant="outlined"
            type="number"
            value={formData.height || ""}
            onChange={handleChange}
            error={!!errors.height}
            helperText={errors.height}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth required variant="outlined" error={!!errors.activitylevel}>
            <InputLabel id="activitylevel-label">Activity Level</InputLabel>
            <Select
              labelId="activitylevel-label"
              id="activitylevel"
              name="activitylevel"
              value={formData.activitylevel || ""}
              onChange={handleChange}
              label="Activity Level"
            >
              <MenuItem value="level_1">
                Sedentary (little or no exercise)
              </MenuItem>
              <MenuItem value="level_2">
                Lightly active (light exercise/sports 1-3 days/week)
              </MenuItem>
              <MenuItem value="level_3">
                Moderately active (moderate exercise/sports 3-5 days/week)
              </MenuItem>
              <MenuItem value="level_4">
                Very active (hard exercise/sports 6-7 days a week)
              </MenuItem>
              <MenuItem value="level_5">
                Extra active (very hard exercise/sports & physical job)
              </MenuItem>
            </Select>
            {errors.activitylevel && <FormHelperText>{errors.activitylevel}</FormHelperText>}
          </FormControl>
        </Grid>
      </Grid>
      <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
        Calculate Calories
      </Button>
      {calText && (
        <>
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Your optimal calories for maintaining weight based on your stats
            are: {calculatedCalories.toFixed(2)} cal.
          </Typography>
        </>
      )}
    </form>
  );
}
