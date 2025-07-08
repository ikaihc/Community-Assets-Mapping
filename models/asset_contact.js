const Sequelize = require('sequelize')
const sequelize = require('../utils/database')


  const AssetContact = sequelize.define(
    "AssetContact",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: Sequelize.STRING,
        validate: {
          isEmail: true,
        },
      },
      phone_number: {
        type: Sequelize.STRING,
      },
      website: {
        type: Sequelize.STRING,
        validate: {
          isUrl: true,
        },
      },
      name: {
        type: Sequelize.STRING,
      },
    },
    {
      tableName: "asset_contacts",
      freezeTableName: true,
      timestamps: true,
    }
  );

module.exports = AssetContact