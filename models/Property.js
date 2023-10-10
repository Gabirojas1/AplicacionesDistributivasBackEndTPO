const { Sequelize, DataTypes } = require('sequelize');
const { sq } = require('../db/database')

const User = require('./User.js')

const Property = sq.define('property', {
  idProperty: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  idUsuario: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  idLocation: {
    type: DataTypes.STRING,
    allowNull: false
  },
  propertyType: {
    type: DataTypes.STRING,
    allowNull: false,
    default: "casa"
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  antiquity: {
    type: DataTypes.INTEGER,
  },
  mtsCovered: {
    type: DataTypes.INTEGER,
  },
  mtsHalfCovered: {
    type: DataTypes.INTEGER,
  },
  mtsUncovered: {
    type: DataTypes.INTEGER,
  },
  position: {
    type: DataTypes.STRING,
  },
  orientation: {
    type: DataTypes.STRING,
  },
  numEnvironments: {
    type: DataTypes.INTEGER,
  },
  numRooms: {
    type: DataTypes.INTEGER,
  },
  numBathrooms: {
    type: DataTypes.INTEGER,
  },
  numCars: {
    type: DataTypes.INTEGER,
  },
  roofTop: {
    type: DataTypes.BOOLEAN
  },
  balcony: {
    type: DataTypes.BOOLEAN
  },
  vault: {
    type: DataTypes.BOOLEAN
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    default: "Initial"
  }
},
{
  tableName: 'properties',
});

Property.sync().then(async () => {
  console.log("Initializing Properties data. . . . . . . ");
});

Property.associate = function(models) {
  Property.belongsTo (User, {
    foreignKey: { name: 'idUsuario', allowNull: false }
  });
}

module.exports = Property;
