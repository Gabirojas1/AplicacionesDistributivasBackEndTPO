const { Sequelize, DataTypes } = require('sequelize');
const { sq } = require('../db/database.js')


const User = sq.define('User', {
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
}, {
  // Other model options go here
});

User.sync().then(() => {
  console.log("User Model synced");
});

console.log(User === sq.models.User);

module.exports = User;