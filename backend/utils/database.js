const Sequelize = require('sequelize');
const {db_name, db_host, db_password, db_user,db_type} = require('../config');
const dbName = db_name;
const host =db_host;
const userName = db_user;
const psd = db_password;
const dbType = db_type;

const sequelize = new Sequelize(dbName,userName,psd,{
    dialect: dbType,
    host:host
});

module.exports = sequelize;