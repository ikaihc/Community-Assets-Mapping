const express = require('express')
const router = express.Router();
const app = express();

const addressRoutes = require('../controllers/address');
const authRoutes = require('../controllers/auth');
const assetRoutes = require('../controllers/asset');
const assetContactRoutes = require('../controllers/asset_contact');
const userRoutes = require('../controllers/user');
const categoryRoutes = require('../controllers/category');
const { authenticateToken, optionalAuthenticateToken, requireAdmin, requireNavigatorOrAdmin } = require('../middleware/isauth');

// =====================
// AUTH ROUTES
// =====================
// Note: Public registration disabled - users must be created by admins
router.route('/login').post(authRoutes.login);

// Protected routes - require authentication
router.route('/profile')
  .get(authenticateToken, authRoutes.getProfile)
  .put(authenticateToken, authRoutes.updateProfile);

router.route('/change-password')
  .post(authenticateToken, authRoutes.changePassword);

// =====================
// ASSET ROUTES
// =====================
router.route('/assets')
  .get(optionalAuthenticateToken, assetRoutes.getAllAssets)
  .post(optionalAuthenticateToken, assetRoutes.createAsset);

router.route('/assets/my')
  .get(authenticateToken, assetRoutes.getMyAssets);

router.route('/assets/pending')
  .get(authenticateToken, requireNavigatorOrAdmin, assetRoutes.getPendingAssets);

router.route('/assets/stats')
  .get(authenticateToken, requireNavigatorOrAdmin, assetRoutes.getAssetStats);

router.route('/assets/status/:status')
  .get(authenticateToken, requireNavigatorOrAdmin, assetRoutes.getAssetsByStatus);

router.route('/assets/:id')
  .get(optionalAuthenticateToken, assetRoutes.getAssetById)
  .put(authenticateToken, assetRoutes.updateAsset)
  .delete(authenticateToken, assetRoutes.deleteAsset);

router.route('/assets/:id/approve')
  .patch(authenticateToken, requireNavigatorOrAdmin, assetRoutes.approveAsset);

router.route('/assets/:id/reject')
  .patch(authenticateToken, requireNavigatorOrAdmin, assetRoutes.rejectAsset);

// =====================
// ADDRESS ROUTES
// =====================
router.route('/addresses')
  .get(addressRoutes.getAllAddresses)
  .post(authenticateToken, addressRoutes.createAddress);

router.route('/addresses/nearby')
  .get(addressRoutes.searchNearbyAddresses);

router.route('/addresses/:id')
  .get(addressRoutes.getAddressById)
  .put(authenticateToken, addressRoutes.updateAddress)
  .delete(authenticateToken, requireAdmin, addressRoutes.deleteAddress);

// =====================
// ASSET CONTACT ROUTES
// =====================
router.route('/asset-contacts')
  .get(assetContactRoutes.getAllAssetContacts)
  .post(authenticateToken, assetContactRoutes.createAssetContact);

router.route('/asset-contacts/:id')
  .get(assetContactRoutes.getAssetContactById)
  .put(authenticateToken, assetContactRoutes.updateAssetContact)
  .delete(authenticateToken, assetContactRoutes.deleteAssetContact);

// =====================
// USER ROUTES (Admin)
// =====================
router.route('/users')
  .get(authenticateToken, requireAdmin, userRoutes.getAllUsers)
  .post(authenticateToken, requireAdmin, userRoutes.createUser); // Admin-only user creation

router.route('/users/stats')
  .get(authenticateToken, requireAdmin, userRoutes.getUserStats);

router.route('/users/:id')
  .get(authenticateToken, userRoutes.getUserById)
  .put(authenticateToken, userRoutes.updateUser);

router.route('/users/:id/deactivate')
  .patch(authenticateToken, requireAdmin, userRoutes.deactivateUser);

router.route('/users/:id/activate')
  .patch(authenticateToken, requireAdmin, userRoutes.activateUser);

router.route('/users/:id/role')
  .patch(authenticateToken, requireAdmin, userRoutes.changeUserRole);

router.route('/users/:id/reset-password')
  .patch(authenticateToken, requireAdmin, userRoutes.resetUserPassword);

// =====================
// CATEGORY ROUTES
// =====================
router.route('/categories')
  .get(categoryRoutes.getAllCategories)
  .post(authenticateToken, requireAdmin, categoryRoutes.createCategory);

router.route('/categories/:id')
  .get(categoryRoutes.getCategoryById)
  .put(authenticateToken, requireAdmin, categoryRoutes.updateCategory)
  .delete(authenticateToken, requireAdmin, categoryRoutes.deleteCategory);

module.exports = router