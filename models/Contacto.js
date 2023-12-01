const { Sequelize, DataTypes } = require('sequelize');
const { sq } = require('../db/database');

const constants = require('../common/constants')

const Contacto = sq.define('contact', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  inmobiliariaId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  propertyId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  contactType: {
    type: DataTypes.ENUM,
    values: Object.values(constants.ContactTypeEnum),
    allowNull: false
  },
  contactDate: {
    type: Sequelize.DATEONLY,
    defaultValue: Sequelize.NOW
  },
  visitDate: {
    type: Sequelize.DATEONLY,
  },
  visitTime: {
    type: DataTypes.ENUM,
    values: Object.values(constants.ContactTimeTypesEnum),
  },
  status: { 
    type: DataTypes.ENUM,
    values: Object.values(constants.ContactStateEnum),
    defaultValue: constants.ContactStateEnum.SENT
  }, 
  statusMessage: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Su contacto fue enviado, espere a que la inmobiliaria le responda."
  }
},
{
  tableName: 'contact',
});

module.exports = Contacto;
