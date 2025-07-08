const express = require('express')
const router = express.Router();
const app = express();

const addressRoutes = require('../controllers/address');
const authRoutes = require('../controllers/auth');
const assetRoutes = require('../controllers/asset');
const assetContactRoutes = require('../controllers/asset_contact');
const userRoutes = require('../controllers/user');
const { authenticateToken, requireAdmin } = require('../middleware/isauth');


router.route('/register').post(authRoutes.register);
router.route('/login').post(authRoutes.login);

// Protected routes - require authentication
router.route('/profile')
  .get(authenticateToken, authRoutes.getProfile)
  .put(authenticateToken, authRoutes.updateProfile);

router.route('/change-password')
  .post(authenticateToken, authRoutes.changePassword);

// Example: Admin only routes
// router.route('/admin/users')
//   .get(authenticateToken, requireAdmin, userRoutes.getAllUsers);

module.exports = router