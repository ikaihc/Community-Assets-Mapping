const User = require('../models/user');
const bcrypt = require('bcryptjs');

// Get all users (Admin only)
exports.getAllUsers = (req, res) => {
  const { page = 1, limit = 10, role, is_active, search } = req.query;
  const offset = (page - 1) * limit;
  const whereClause = {};

  // Filter by role
  if (role) {
    whereClause.role = role;
  }

  // Filter by active status
  if (is_active !== undefined) {
    whereClause.is_active = is_active === 'true';
  }

  // Search in name and email
  if (search) {
    whereClause[require('sequelize').Op.or] = [
      { first_name: { [require('sequelize').Op.iLike]: `%${search}%` } },
      { last_name: { [require('sequelize').Op.iLike]: `%${search}%` } },
      { email: { [require('sequelize').Op.iLike]: `%${search}%` } }
    ];
  }

  User.findAndCountAll({
    where: whereClause,
    attributes: { exclude: ['password'] }, // Never send passwords
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['createdAt', 'DESC']]
  })
  .then(result => {
    const { count, rows: users } = result;
    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  })
  .catch(error => {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  });
};

// Get user by ID
exports.getUserById = (req, res) => {
  const { id } = req.params;
  const requestingUserId = req.user.userId;
  const requestingUserRole = req.user.role;

  // Users can only view their own profile unless they're admin
  if (parseInt(id) !== requestingUserId && requestingUserRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: You can only view your own profile'
    });
  }

  User.findByPk(id, {
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
      data: user
    });
  })
  .catch(error => {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  });
};

// Update user (Admin can update any user, users can update themselves)
exports.updateUser = (req, res) => {
  const { id } = req.params;
  const {
    first_name,
    last_name,
    job_title,
    role,
    is_active
  } = req.body;

  const requestingUserId = req.user.userId;
  const requestingUserRole = req.user.role;

  // Users can only update their own profile unless they're admin
  if (parseInt(id) !== requestingUserId && requestingUserRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: You can only update your own profile'
    });
  }

  User.findByPk(id)
  .then(user => {
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Only admins can change role and is_active status
    const updateData = {
      first_name: first_name || user.first_name,
      last_name: last_name || user.last_name,
      job_title: job_title || user.job_title
    };

    if (requestingUserRole === 'admin') {
      if (role !== undefined) updateData.role = role;
      if (is_active !== undefined) updateData.is_active = is_active;
    }

    return user.update(updateData);
  })
  .then(() => {
    // Return updated user without password
    return User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
  })
  .then(updatedUser => {
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  })
  .catch(error => {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  });
};

// Deactivate user (Soft delete)
exports.deactivateUser = (req, res) => {
  const { id } = req.params;
  const requestingUserRole = req.user.role;

  // Only admins can deactivate users
  if (requestingUserRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Admin privileges required'
    });
  }

  User.findByPk(id)
  .then(user => {
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return user.update({ is_active: false });
  })
  .then(() => {
    res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });
  })
  .catch(error => {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  });
};

// Activate user
exports.activateUser = (req, res) => {
  const { id } = req.params;
  const requestingUserRole = req.user.role;

  // Only admins can activate users
  if (requestingUserRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Admin privileges required'
    });
  }

  User.findByPk(id)
  .then(user => {
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return user.update({ is_active: true });
  })
  .then(() => {
    res.status(200).json({
      success: true,
      message: 'User activated successfully'
    });
  })
  .catch(error => {
    console.error('Activate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  });
};

// Change user role (Admin only)
exports.changeUserRole = (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const requestingUserRole = req.user.role;

  // Only admins can change user roles
  if (requestingUserRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Admin privileges required'
    });
  }

  if (!role || !['user', 'navigator', 'admin'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role. Must be user, navigator, or admin'
    });
  }

  User.findByPk(id)
  .then(user => {
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return user.update({ role });
  })
  .then(() => {
    return User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
  })
  .then(updatedUser => {
    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: updatedUser
    });
  })
  .catch(error => {
    console.error('Change user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  });
};

// Reset user password (Admin only)
exports.resetUserPassword = (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  const requestingUserRole = req.user.role;

  // Only admins can reset passwords
  if (requestingUserRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Admin privileges required'
    });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password is required and must be at least 6 characters'
    });
  }

  User.findByPk(id)
  .then(user => {
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hash new password
    const saltRounds = 12;
    return bcrypt.hash(newPassword, saltRounds)
    .then(hashedPassword => {
      return user.update({ password: hashedPassword });
    });
  })
  .then(() => {
    res.status(200).json({
      success: true,
      message: 'User password reset successfully'
    });
  })
  .catch(error => {
    console.error('Reset user password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  });
};

// Get user statistics (Admin only)
exports.getUserStats = (req, res) => {
  const requestingUserRole = req.user.role;

  if (requestingUserRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Admin privileges required'
    });
  }

  const totalUsersPromise = User.count();
  const activeUsersPromise = User.count({ where: { is_active: true } });
  const inactiveUsersPromise = User.count({ where: { is_active: false } });
  
  const usersByRolePromise = User.findAll({
    attributes: [
      'role',
      [require('sequelize').fn('COUNT', require('sequelize').col('role')), 'count']
    ],
    group: ['role']
  });

  Promise.all([
    totalUsersPromise,
    activeUsersPromise,
    inactiveUsersPromise,
    usersByRolePromise
  ])
  .then(([totalUsers, activeUsers, inactiveUsers, usersByRole]) => {
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        usersByRole: usersByRole.map(item => ({
          role: item.role,
          count: parseInt(item.dataValues.count)
        }))
      }
    });
  })
  .catch(error => {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  });
};