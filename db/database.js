const Sequelize = require('sequelize');

let conn_string = "postgres://myhome:1234@backend-myhome.pg:5432/myhome";
console.log(conn_string);

const sequelize = new Sequelize(conn_string);
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

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
  console.log("Checking database connection.");

  try {
    // wait 1 second for postgres
    await new Promise(resolve => setTimeout(resolve, 1000));
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

module.exports = {
  sq: db.sequelize,
  testDbConnection,
};