const { Sequelize, DataTypes } = require('sequelize');
const { sq } = require('../db/database');

const Favorite = sq.define('favorite', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  propertyId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
},
{
  tableName: 'favorite',
});

module.exports = Favorite;
