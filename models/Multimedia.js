const { Sequelize, DataTypes } = require('sequelize');
const { sq } = require('../db/database');

const Multimedia = sq.define('multimedia', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  propertyId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  }
},
{
  tableName: 'multimedia',
});

module.exports = Multimedia;
