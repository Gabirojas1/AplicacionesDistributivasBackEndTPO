const { Sequelize, DataTypes } = require('sequelize');
const { sq } = require('../db/database.js');

const Property = require('./Property.js');

const { PropertyTypeEnum, ContractTypeEnum, CurrencyTypeEnum, UserTypeEnum, UserStateEnum } = require('../common/constants.js');
const ContractType = require('./ContractType.js');
const Location = require('./Location.js');

const User = sq.define('user', {
  id: {
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
  cuit: {
    type: DataTypes.STRING,
  },
  phone: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.STRING,
  },
  photo: {
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
    defaultScope: {
      attributes: { exclude: ['password'] },
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password'] },
      }
    }
  });

User.sync().then(async () => {

  console.log("Initializing mocked data. . . . . . . ");
  await Location.sync();
  await Property.sync();
  await ContractType.sync();

  let latitude = -34.617047;
  let longitude = -58.3819187;

  let location = await Location.findOrCreate({
    where: { id: "aaf30feed1000000001aaf" },
    defaults: {
      id: "aaf30feed1000000001aaf",
      latitude: latitude,
      longitude: longitude,
      country: "Argentina",
      province: "Buenos Aires",
      district: "Ciudad Autónoma de Buenos Aires",
      street: "Lima",
      streetNumber: 756,
      departament: "N/A"
    }
  });

  let userMail = "inmobiliaria@my.home"
  let userMail2 = "user@my.home";

  // Mocked Usuario
  await User.findOrCreate({
    where: { id: 8888 },
    defaults: {
      id: 8888,
      firstName: "Jane",
      lastName: "Doe",
      userType: UserTypeEnum.USUARIO,
      // TODO! state pattern de usuario
      status: UserStateEnum.CONFIRMED,
      mail: userMail2,
      password: "$2b$06$8wf1xpWSuUiqA5O5rCj9suJAyIwgoOFHuNTw583p4XTFTOp1wbI8G", //123456
      phone: "+5491187654321",
      //TODO! cloudinary
      photo: "photourl.jpg"
    }
  })

  // Mocked Inmobiliaria
  await User.findOrCreate({
    where: { id: 9999 },
    defaults: {
      id: 9999,
      firstName: "John",
      lastName: "Doe",
      userType: UserTypeEnum.INMOBILIARIA,
      // TODO! estado de usuario
      status: UserStateEnum.CONFIRMED,
      mail: userMail,
      password: "$2b$06$8wf1xpWSuUiqA5O5rCj9suJAyIwgoOFHuNTw583p4XTFTOp1wbI8G", //123456
      contactMail: "gaxelac@outlook.com",
      fantasyName: "RE/MAX Argentina",
      cuit: "99-12345678-88",
      phone: "+5491187654321",
      //TODO! cloudinary
      photo: "photourl.jpg"
    }
  })
    .then(async res => {

      await Property.findOrCreate({
        where: { id: 9999 },
        defaults: {
          id: 9999,
          userId: res[0].id,
          propertyType: PropertyTypeEnum.HOUSE,
          title: "Mocked Casa",
          description: "Casa en el centro de Banfield con cuatro ambientes y multiples ammenities.",
          locationId: "aaf30feed1000000001aaf",
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
        }
      }).then(async res => {

        res[0].setLocation(location[0]);

        await ContractType.findOrCreate({
          where: { id: 9999 },
          defaults: {
            id: 9999,
            propertyId: res[0].id,
            contractType: ContractTypeEnum.SALE,
            price: 999,
            expPrice: 888,
            currency: CurrencyTypeEnum.ARS,
          }
        });

        res[0].save();
      });

      await Property.findOrCreate({
        where: { id: 9998 },
        defaults: {
          id: 9998,
          userId: res[0].id,
          propertyType: PropertyTypeEnum.DEPARTMENT,
          title: "Mocked Depto",
          description: "Depto en el centro de Banfield con cuatro ambientes y multiples ammenities.",

        }
      }).then(async res => {

        await ContractType.findOrCreate({
          where: { id: 9998 },
          defaults: {
            id: 9998,
            propertyId: res[0].id,
            contractType: ContractTypeEnum.RENT,
            price: 99,
            expPrice: 12,
            currency: CurrencyTypeEnum.ARS,
            contractDays: 30
          }
        });

        res[0].save();

      });
    });
});

User.hasMany(Property, { foreignKey: 'userId' });

Property.hasMany(ContractType, { foreignKey: 'propertyId' });

Location.hasMany(Property, { foreignKey: 'locationId' });
Property.belongsTo(Location, { foreignKey: 'locationId' });


module.exports = User;