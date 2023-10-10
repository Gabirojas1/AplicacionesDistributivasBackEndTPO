const { Sequelize, DataTypes } = require('sequelize');
const { sq } = require('../db/database.js')

const Property = require('./Property.js')

const User = sq.define('user', {
  idUsuario: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mail: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contactMail: {
    type: DataTypes.STRING,
  },
  fantasyName: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Initial"
  }
},
{
  tableName: 'users',
});

User.sync().then(async () => {
  
  console.log("Initializing User data. . . . . . . ");
  
  const mockedUser = await User.create({
    firstName: "FirstName",
    lastName: "LastName",
    userType: "Usuario",
    status: "Confirmado",
    mail: "gaxelac@outlook.com",
    password: "$2b$06$Nqq5r0jxYW8YO6K7d83ug.9fvDcLF3Ul3uzrXhC/ty9K5UZKW2F1a",
  });
  
  Property.create({
    idUsuario: mockedUser.idUsuario,
    idLocation: "TODO!",
    propertyType: "casa",
    description: "Alquiler de casa en LDZ",
    antiquity: 1,
    mtsCovered: 50,
    mtsHalfCovered: 50,
    mtsUncovered: 50,
    position: "Horizontal",
    orientation: "Norte",
    numEnvironments: 4,
    numRooms: 4,
    numBathrooms: 2,
    numCars: 2,
    roofTop: true,
    balcony: true,
    vault: true,
    status: "Publicada",
  });
});

User.associate = function (models) {
  User.hasMany(Property, {
    foreignKey: { name: 'idUsuario', allowNull: false }
  });
}

module.exports = User;