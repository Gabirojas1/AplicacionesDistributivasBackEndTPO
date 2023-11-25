const Sequelize = require('sequelize');
const constants = require('../common/constants');

const sequelize = new Sequelize(constants.PG_CONNECTION_STRING, {
  logging: true,
  dialect: 'postgres',
  dialectOptions: {
    ssl: constants.PG_ENABLE_SSL
  }
});
console.log(constants.PG_CONNECTION_STRING);

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