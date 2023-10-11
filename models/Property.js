const { Sequelize, DataTypes } = require('sequelize');
const { sq } = require('../db/database')
const { PropertyState } = require('../models/State/PropertyState')

const User = require('./User.js');
const constants = require('../common/constants');

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
  },
  propertyType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
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
    type: DataTypes.ENUM,
    values: Object.values(constants.PropertyStateEnum),
    defaultValue: constants.PropertyStateEnum.INITIAL_1
  },
  rating: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
},
  {
    tableName: 'properties',
    hooks: {
      beforeSave: async (property) => {
        await new PropertyState(property).execute()
          .then(res => {
            return res.property;
          }).catch((error) => {
            console.error('Failed to transition state : ', error);
          });
      }
    }
  });

Property.sync().then(async () => {
  console.log("Initializing Properties data. . . . . . . ");
});

Property.associate = function (models) {
  Property.belongsTo(User, {
    foreignKey: { name: 'idUsuario', allowNull: false }
  });
}

module.exports = Property;
