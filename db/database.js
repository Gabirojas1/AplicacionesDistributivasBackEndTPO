const Sequelize = require('sequelize');

let conn_string = "postgres://myhome:1234@backend-myhome.pg:5432/myhome";
console.log(conn_string);

const sequelize = new Sequelize(conn_string, {logging: false});
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

const testDbConnection = async () => {
  console.log("Checking database connection.");

  try {
    // wait postgres
    await new Promise(resolve => setTimeout(resolve, 3000));
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