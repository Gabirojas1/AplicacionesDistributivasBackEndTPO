const { Sequelize, DataTypes } = require('sequelize');
const { sq } = require('../db/database');

const Location = sq.define('location', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
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
  latitud: {
    type: DataTypes.DECIMAL(11, 2),
  },
  longitud: {
    type: DataTypes.DECIMAL(11, 2),
  }
},
{
  tableName: 'locations',
});

module.exports = Location;
