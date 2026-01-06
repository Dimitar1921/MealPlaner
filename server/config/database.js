const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database/nutrition.db'),
  logging: false // Set to console.log for SQL queries debugging
});

module.exports = sequelize;


