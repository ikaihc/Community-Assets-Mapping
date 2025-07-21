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
      website: {
        type: Sequelize.STRING,
        allowNull: true,
      },
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
        defaultValue: 1, // Default to guest user ID
        references: {
          model: 'users',
          key: 'id'
        }
      },
      address_id: {
        type: Sequelize.INTEGER,
        allowNull: true, // Make optional
      },
      contact_Info_Id: {
        type: Sequelize.INTEGER,
        allowNull: true, // Make optional
      },
      service_hrs: {
        type: Sequelize.DATE,
      },
      last_Update_By: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      approved_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
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
