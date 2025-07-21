const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken, requireAdmin } = require('../middleware/isauth');

// JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

// Register a new user
exports.register = (req, res) => {
  const { email, password, first_name, last_name, job_title, role } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Validate role if provided
  if (role && !['navigator', 'admin'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role. Must be navigator or admin'
    });
  }

  // Check if user already exists
  User.findOne({ where: { email } })
  .then(existingUser => {
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  })
  .then(hashedPassword => {
    // Create user
    return User.create({
      email,
      password: hashedPassword,
      first_name,
      last_name,
      job_title,
      role: role, // Will use model default 'navigator' if not provided
      is_active: true
    });
  })
  .then(user => {
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Remove password from response
    const userResponse = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      job_title: user.job_title,
      role: user.role,
      is_active: user.is_active
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userResponse,
      token
    });
  })
  .catch(error => {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  });
};

// Login user
exports.login = (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Find user by email
  User.findOne({ where: { email } })
  .then(user => {
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    return bcrypt.compare(password, user.password)
    .then(isPasswordValid => {
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Remove password from response
      const userResponse = {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        job_title: user.job_title,
        role: user.role,
        is_active: user.is_active
      };

      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: userResponse,
        token
      });
    });
  })
  .catch(error => {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  });
};

// Get current user profile
exports.getProfile = (req, res) => {
  User.findByPk(req.user.userId, {
    attributes: { exclude: ['password'] }
  })
  .then(user => {
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  })
  .catch(error => {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  });
};

// Update user profile
exports.updateProfile = (req, res) => {
  const { first_name, last_name, job_title } = req.body;
  const userId = req.user.userId;

  User.findByPk(userId)
  .then(user => {
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user fields
    return user.update({
      first_name: first_name || user.first_name,
      last_name: last_name || user.last_name,
      job_title: job_title || user.job_title
    });
  })
  .then(() => {
    // Return updated user without password
    return User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
  })
  .then(updatedUser => {
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  })
  .catch(error => {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  });
};

// Change password
exports.changePassword = (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.userId;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Current password and new password are required'
    });
  }

  User.findByPk(userId)
  .then(user => {
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    return bcrypt.compare(currentPassword, user.password)
    .then(isCurrentPasswordValid => {
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const saltRounds = 12;
      return bcrypt.hash(newPassword, saltRounds)
      .then(hashedNewPassword => {
        // Update password
        return user.update({ password: hashedNewPassword });
      });
    });
  })
  .then(() => {
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  })
  .catch(error => {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  });
};

