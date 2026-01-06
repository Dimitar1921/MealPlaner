import { mealAPI } from './api';
import { setMealData, setCalorieGoal } from '../redux/actions/userActions';

/**
 * Loads the authenticated user's saved meals from the backend and hydrates Redux
 * into the shape expected by `Review` (Spoonacular-like weekly format).
 *
 * Returns:
 * - true if a non-empty plan (at least one meal) was loaded
 * - false otherwise
 */
export async function loadMealPlanFromDatabase(dispatch) {
  try {
    const response = await mealAPI.getAll(); // { success, data: Meal[] }
    const meals = response?.success ? response.data : [];

    if (!Array.isArray(meals) || meals.length === 0) return false;

    const mealsByDay = {};
    let totalCalories = 0;

    for (const meal of meals) {
      const day = String(meal.day || '').toLowerCase();
      if (!day) continue;

      if (!mealsByDay[day]) {
        mealsByDay[day] = {
          meals: [],
          nutrients: {
            calories: 0,
            protein: 0,
            fat: 0,
            carbohydrates: 0,
          },
        };
      }

      const calories =
        typeof meal.calories === 'number' ? meal.calories : parseFloat(meal.calories) || 0;
      const protein =
        typeof meal.protein === 'number' ? meal.protein : parseFloat(meal.protein) || 0;
      const fat = typeof meal.fat === 'number' ? meal.fat : parseFloat(meal.fat) || 0;
      const carbs = typeof meal.carbs === 'number' ? meal.carbs : parseFloat(meal.carbs) || 0;

      mealsByDay[day].meals.push({
        id: meal.recipeId || meal.id,
        title: meal.name,
        readyInMinutes: meal.recipeData?.readyInMinutes || 30,
        servings: meal.recipeData?.servings || 1,
        image: meal.recipeData?.image || null,
        sourceUrl: meal.recipeData?.sourceUrl || '#',
        nutrition: {
          calories,
          protein,
          fat,
          carbohydrates: carbs,
        },
      });

      mealsByDay[day].nutrients.calories += calories;
      mealsByDay[day].nutrients.protein += protein;
      mealsByDay[day].nutrients.fat += fat;
      mealsByDay[day].nutrients.carbohydrates += carbs;
      totalCalories += calories;
    }

    const hasAnyMeals = Object.values(mealsByDay).some(
      (d) => Array.isArray(d?.meals) && d.meals.length > 0
    );
    if (!hasAnyMeals) return false;

    // Normalize nutrients for display
    Object.keys(mealsByDay).forEach((day) => {
      mealsByDay[day].nutrients.calories = Math.round(mealsByDay[day].nutrients.calories);
      mealsByDay[day].nutrients.protein = parseFloat(mealsByDay[day].nutrients.protein.toFixed(2));
      mealsByDay[day].nutrients.fat = parseFloat(mealsByDay[day].nutrients.fat.toFixed(2));
      mealsByDay[day].nutrients.carbohydrates = parseFloat(
        mealsByDay[day].nutrients.carbohydrates.toFixed(2)
      );
    });

    const daysWithMeals = Object.values(mealsByDay).filter(
      (d) => Array.isArray(d?.meals) && d.meals.length > 0
    ).length;
    const avgDailyCalories = daysWithMeals ? totalCalories / daysWithMeals : totalCalories;

    dispatch(setMealData({ week: mealsByDay, source: 'db' }));
    dispatch(setCalorieGoal({ calory: Math.round(avgDailyCalories) }));

    return true;
  } catch (e) {
    // Silent fail: user can continue normal flow
    return false;
  }
}


