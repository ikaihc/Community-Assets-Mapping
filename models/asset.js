const Sequelize = require('sequelize')
const sequelize = require('../utils/database')

  const Asset = sequelize.define(
    "Asset",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: Sequelize.STRING,
      description: Sequelize.STRING,
      volunteer_details: Sequelize.STRING,
      has_volunteer_opportunities: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'deleted'),
        defaultValue: 'pending',
        allowNull: false,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      address_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      contact_Info_Id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      service_hrs: {
        type: Sequelize.DATE,
      },
      last_Update_By: {
        type: Sequelize.INTEGER,
      },
      approved_by: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      approved_at: {
        type: Sequelize.DATE,
      },
      rejection_reason: {
        type: Sequelize.TEXT,
      },
    },
    {
      tableName: "assets",
      freezeTableName: true,
      timestamps: true,
    }
  );

  module.exports = Asset
