const express = require('express')
const router = express.Router();
const app = express();

const addressRoutes = require('../controllers/address');
const authRoutes = require('../controllers/auth');
const assetRoutes = require('../controllers/asset');
const assetContactRoutes = require('../controllers/asset_contact');
const categoryRoutes = require('../controllers/category');
const userRoutes = require('../controllers/user');

router.use('/address/get', addressRoutes.getAllAddresses);