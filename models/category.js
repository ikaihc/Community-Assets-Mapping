const Sequelize = require('sequelize')
const sequelize = require('../utils/database')

  const Category = sequelize.define(
    "Category",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: Sequelize.STRING,
      description: Sequelize.STRING,
    },
    {
      tableName: "categories",
      freezeTableName: true,
      timestamps: true,
    }
  );

module.exports = Category