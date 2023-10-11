const { Sequelize, DataTypes } = require('sequelize');
const { sq } = require('../db/database.js');

const Property = require('./Property.js');

const { PropertyTypeEnum } = require('../common/constants')

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

  let userMail = "gaxelac@outlook.com";

  await User.findOne({
    where: {
      mail: userMail
    }
  }).then(async res => {

      if (!res) {

        const mockedUser = await User.create({
          firstName: "FirstName",
          lastName: "LastName",
          userType: "Usuario",
          status: "Confirmado",
          mail: userMail,
          password: "$2b$06$Nqq5r0jxYW8YO6K7d83ug.9fvDcLF3Ul3uzrXhC/ty9K5UZKW2F1a",
        });
        
        Property.create({
          idUsuario: mockedUser.idUsuario,
          idLocation: 9999,
          propertyType: PropertyTypeEnum.HOUSE,
          title: "Casa en Lomas de Zamora",
          description: "Casa en el centro de Lomas de Zamora con cuatro ambientes y multiples ammenities.",
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
          vault: true
        });

        Property.create({
          idUsuario: mockedUser.idUsuario,
          propertyType: PropertyTypeEnum.DEPARTMENT,
          title: "Depto en Banfield",
          description: "Depto en el centro de Banfield con cuatro ambientes y multiples ammenities."
        });
      }
  }).catch((error) => {
      console.error('Failed to insert data : ', error);
  });

});

User.associate = function (models) {
  User.hasMany(Property, {
    foreignKey: { name: 'idUsuario', allowNull: false }
  });
}

module.exports = User;