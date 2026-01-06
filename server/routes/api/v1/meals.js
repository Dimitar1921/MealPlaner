const express = require('express');
const router = express.Router();
const Meal = require('../../../models/Meal');
const User = require('../../../models/User');
const { validateMeal } = require('../../../middleware/validation');
const { authenticateToken } = require('../../../middleware/auth');

// Apply authentication to all meal routes
router.use(authenticateToken);

// GET /api/v1/meals - Get all meals for authenticated user
router.get('/', async (req, res) => {
  try {
    const meals = await Meal.findAll({
      where: { userId: req.userId },
      order: [['day', 'ASC'], ['mealType', 'ASC']]
    });

    res.json({
      success: true,
      data: meals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching meals',
      error: error.message
    });
  }
});

// GET /api/v1/meals/:id - Get meal by ID
router.get('/:id', async (req, res) => {
  try {
    const meal = await Meal.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    res.json({
      success: true,
      data: meal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching meal',
      error: error.message
    });
  }
});

// POST /api/v1/meals - Create new meal
router.post('/', validateMeal, async (req, res) => {
  try {
    const meal = await Meal.create({
      ...req.body,
      userId: req.userId
    });

    res.status(201).json({
      success: true,
      message: 'Meal created successfully',
      data: meal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating meal',
      error: error.message
    });
  }
});

// PUT /api/v1/meals/:id - Update meal
router.put('/:id', validateMeal, async (req, res) => {
  try {
    const meal = await Meal.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    await meal.update(req.body);

    res.json({
      success: true,
      message: 'Meal updated successfully',
      data: meal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating meal',
      error: error.message
    });
  }
});

// DELETE /api/v1/meals/:id - Delete meal
router.delete('/:id', async (req, res) => {
  try {
    const meal = await Meal.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    await meal.destroy();

    res.json({
      success: true,
      message: 'Meal deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting meal',
      error: error.message
    });
  }
});

// GET /api/v1/meals/week/:day - Get meals for a specific day
router.get('/week/:day', async (req, res) => {
  try {
    const { day } = req.params;
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    if (!validDays.includes(day.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid day. Must be one of: monday, tuesday, wednesday, thursday, friday, saturday, sunday'
      });
    }

    const meals = await Meal.findAll({
      where: {
        userId: req.userId,
        day: day.toLowerCase()
      },
      order: [['mealType', 'ASC']]
    });

    res.json({
      success: true,
      data: meals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching meals for day',
      error: error.message
    });
  }
});

module.exports = router;


