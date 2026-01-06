const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const User = require('../../../models/User');
const { validateUserRegistration, validateUserLogin } = require('../../../middleware/validation');
const { generateToken } = require('../../../middleware/auth');

// POST /api/v1/auth/register - Register new user
router.post('/register', validateUserRegistration, async (req, res) => {
  try {
    const { email, username, password, firstName, lastName, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Create new user
    const user = await User.create({
      email,
      username,
      password,
      firstName,
      lastName,
      phone
    });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone
        },
        token
      }
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
      message: 'Error registering user',
      error: error.message
    });
  }
});

// POST /api/v1/auth/login - Login user
router.post('/login', validateUserLogin, async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user has a password (not Google OAuth user)
    if (user.password) {
      // Password is required for users with password
      if (!req.body.password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required'
        });
      }
      
      const isPasswordValid = await user.comparePassword(req.body.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password'
        });
      }
    } else {
      // User registered via Google OAuth - no password required
      // But we should still allow login with email/username only
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          picture: user.picture
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
});

// POST /api/v1/auth/google - Google OAuth login/register
router.post('/google', async (req, res) => {
  try {
    const { email, name, picture, googleId } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      });
    }

    // Find or create user
    let user = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { googleId }
        ]
      }
    });

    if (user) {
      // Update user if needed
      if (googleId && !user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
      if (picture && !user.picture) {
        user.picture = picture;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        email,
        username: name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now(),
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' ') || null,
        picture,
        googleId
      });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Google authentication successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          picture: user.picture
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during Google authentication',
      error: error.message
    });
  }
});

module.exports = router;

