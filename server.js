const express = require('express');
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

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}));
app.use(allRoutes)


Asset.belongsTo(User, { foreignKey: 'created_by' });
Asset.belongsTo(User, { foreignKey: 'last_Update_By' });

Asset.belongsTo(Address, { foreignKey: 'address_id' });
Asset.belongsTo(AssetContact, { foreignKey: 'contact_Info_Id' });

User.hasMany(Asset, { foreignKey: 'created_by' });
User.hasMany(Asset, { foreignKey: 'last_Update_By' });

Address.hasMany(Asset, { foreignKey: 'address_id' });
AssetContact.hasMany(Asset, { foreignKey: 'contact_Info_Id' });
Asset.belongsToMany(Category, { through: 'asset_categories', foreignKey: 'asset_id' });
Category.belongsToMany(Asset, { through: 'asset_categories', foreignKey: 'category_id' });

sequelize.sync({force:true})  // Use force:true to drop and recreate tables
    .then(() => {
        app.listen(port)
        console.log("app is up and running on port"+ " "+ port);
    })
    .catch(err => {
        console.error('Error creating database:', err);
    });