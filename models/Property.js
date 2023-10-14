const { Sequelize, DataTypes } = require('sequelize');
const { sq } = require('../db/database');
const { PropertyState } = require('./State/PropertyState');

const {PropertyTypeEnum, PropertyStateEnum} = require('../common/constants');
const ContractType = require('./ContractType');

const Property = sq.define('property', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  propertyType: {
    type: DataTypes.ENUM,
    values: Object.values(PropertyTypeEnum),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  locationId: {
    type: DataTypes.INTEGER,
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
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  balcony: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  vault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  sum: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  laundry: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  swimming_pool: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  sport_field: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  solarium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  gym: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  sauna: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  security: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  game_room: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM,
    values: Object.values(PropertyStateEnum),
    defaultValue: PropertyStateEnum.INITIAL_1
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

module.exports = Property;
