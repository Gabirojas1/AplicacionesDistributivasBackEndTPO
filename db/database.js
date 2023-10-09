const Sequelize = require('sequelize');

let conn_string = "postgres://myhome:1234@myhome.pg:5432/myhome";
console.log(conn_string);
const sequelize = new Sequelize(conn_string);
// const db = {};

// db.Sequelize = Sequelize;
// db.sequelize = sequelize;

// db.users = require("../models/User");
// db.properties = require("../models/Property");

// db.users.hasMany(db.properties, { as: "properties" });
// db.properties.belongsTo(db.users, {
//   foreignKey: "idUsuario",
//   as: "IdUsuario",
// });


// Init data
// db.users.create(
//  {
//   firstName: "FirstName",
//   lastName: "LastName", 
//   userType: "Usuario",
//   mail: "gaxelac@outlook.com",
//   password: "$2b$06$Nqq5r0jxYW8YO6K7d83ug.9fvDcLF3Ul3uzrXhC/ty9K5UZKW2F1a",
// }).then(res => {
//   console.log("sucess init data:")
//   console.log(res);
// }).catch((error) => {
//   console.log('Failed to load init data : ', error);
// });

const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

module.exports = {
  sq: sequelize,
  testDbConnection,
};