const { Sequelize, DataTypes } = require('sequelize');
const { sq } = require('../db/database.js');

const Property = require('./Property.js');

const { PropertyTypeEnum, ContractTypeEnum, CurrencyTypeEnum, UserTypeEnum, UserStateEnum } = require('../common/constants');
const ContractType = require('./ContractType.js');

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
  });
User.sync().then(async () => {

  console.log("Initializing User data. . . . . . . ");

  let userMail = "inmobiliaria@my.home"
  let userMail2 = "user@my.home";

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

  let user = await User.findOrCreate({
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
  .then (async res => {

    let prop1=await Property.create({
      userId: res[0].id,
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

    let prop2= await Property.create({
      userId: res[0].id,
      propertyType: PropertyTypeEnum.DEPARTMENT,
      title: "Renta depto en Banfield",
      description: "Depto en el centro de Banfield con cuatro ambientes y multiples ammenities.",
  
    });

    res[0].addProperties([prop1, prop2]);

  });
  

});



User.hasMany(Property);
Property.belongsTo(User);


module.exports = User;