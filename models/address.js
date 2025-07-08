
const Sequelize = require('sequelize')
const sequelize = require('../utils/database')

  const Address = sequelize.define('Address', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true, 
    },
    city: {
      type: Sequelize.STRING,
    },
    city_code: {
      type: Sequelize.STRING,
    },
    street_address: {
      type: Sequelize.STRING,
    },
    post_code: {
      type: Sequelize.STRING,
    },
    longitude: {
      type: Sequelize.DECIMAL(10, 7),
    },
    latitude: {
      type: Sequelize.DECIMAL(10, 7),
    },
    google_maps_url: {
      type: Sequelize.STRING,
    }
  }, {
    tableName: 'addresses',
    freezeTableName: true,
    timestamps: true 
  });
  
module.exports = Address

