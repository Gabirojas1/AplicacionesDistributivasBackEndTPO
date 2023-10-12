const { Sequelize, DataTypes } = require('sequelize');
const { sq } = require('../db/database');
const { PropertyState } = require('../models/State/PropertyState');

const User = require('./User.js');
const {PropertyTypeEnum, PropertyStateEnum} = require('../common/constants');
const Location = require('./Location');

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
    type: DataTypes.INTEGER,
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

Property.sync().then(async () => {
  console.log("Initializing Properties data. . . . . . . ");
});

Property.associate = function (models) {
  Property.hasMany(ContractType, {
    foreignKey: { name: 'idProperty', allowNull: false }
  });
}

Property.associate = function (models) {
  Property.belongsTo(User, {
    foreignKey: { name: 'idUsuario', allowNull: false }
  });
}

Property.associate = function (models) {
  Property.belongsTo(Location, {
    foreignKey: { name: 'idLocation', allowNull: false }
  });
}

module.exports = Property;
