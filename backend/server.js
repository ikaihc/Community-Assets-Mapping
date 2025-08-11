const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const sequelize = require('./utils/database')
const port = process.env.PORT || 3000
const app = express()

const Address = require('./models/address')
const User  = require('./models/user')
const Category = require('./models/category')
const AssetContact = require('./models/asset_contact')
const Asset = require('./models/asset');

const allRoutes = require('./routes/index')

// CORS middleware
app.use(cors({
  origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}));
app.use(allRoutes)

// Asset associations
Asset.belongsTo(Address, { foreignKey: 'address_id', as: 'address' });
Asset.belongsTo(AssetContact, { foreignKey: 'contact_Info_Id', as: 'contact' });
Asset.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Asset.belongsTo(User, { foreignKey: 'last_Update_By', as: 'lastUpdater' });
Asset.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });

// Reverse associations
Address.hasMany(Asset, { foreignKey: 'address_id' });
AssetContact.hasMany(Asset, { foreignKey: 'contact_Info_Id' });
User.hasMany(Asset, { foreignKey: 'created_by', as: 'createdAssets' });
User.hasMany(Asset, { foreignKey: 'last_Update_By', as: 'updatedAssets' });
User.hasMany(Asset, { foreignKey: 'approved_by', as: 'approvedAssets' });

// Category associations
Asset.belongsToMany(Category, { through: 'asset_categories', foreignKey: 'asset_id' });
Category.belongsToMany(Asset, { through: 'asset_categories', foreignKey: 'category_id' });

sequelize.sync({ force: false })  // Changed to false - don't drop tables on restart
    .then(() => {
        app.listen(port)
        console.log("app is up and running on port"+ " "+ port);
    })
    .catch(err => {
        console.error('Error creating database:', err);
    });