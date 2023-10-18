const { Sequelize, DataTypes } = require('sequelize');
const { sq } = require('../db/database');

const Location = sq.define('location', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false
  },
  province: {
    type: DataTypes.STRING,
    allowNull: false
  },
  district: {
    type: DataTypes.STRING,
    allowNull: false
  },
  street: {
    type: DataTypes.STRING,
    allowNull: false
  },
  streetNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  departament: {
    type: DataTypes.STRING,
    defaultValue: "N/A"
  },
  latitude: {
    type: DataTypes.FLOAT,
  },
  longitude: {
    type: DataTypes.FLOAT,
  }
},
{
  tableName: 'locations',
});

module.exports = Location;
