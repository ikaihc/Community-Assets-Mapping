const jwt = require('jsonwebtoken');

// JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify JWT token
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

// Middleware to check if user is admin
exports.requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
};

// Middleware to check if user is navigator or admin
exports.requireModerator = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'navigator')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'navigator or admin access required'
    });
  }
};



