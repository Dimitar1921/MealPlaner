const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const User = require('../../../models/User');
const { validateUserUpdate } = require('../../../middleware/validation');
const { authenticateToken } = require('../../../middleware/auth');

// GET /api/v1/users - Get all users (admin only, or for testing)
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// GET /api/v1/users/:id - Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// PUT /api/v1/users/:id - Update user
router.put('/:id', authenticateToken, validateUserUpdate, async (req, res) => {
  try {
    // Check if user is updating their own profile
    if (parseInt(req.params.id) !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own profile'
      });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update(req.body);
    const updatedUser = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Email or username already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
});

// DELETE /api/v1/users/:id - Delete user
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is deleting their own profile
    if (parseInt(req.params.id) !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own profile'
      });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.destroy();
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

module.exports = router;

