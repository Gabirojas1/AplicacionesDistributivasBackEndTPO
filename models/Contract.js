const { Sequelize, DataTypes } = require('sequelize');
const { sq } = require('../db/database');

const constants = require('../common/constants');

const Contract = sq.define('contract', {
  contractId: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  contractorUserId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  contractTypeId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM,
    values: Object.values(constants.ContractStatusEnum),
    defaultValue: constants.ContractStatusEnum.INITIALIZED
  },
  reservedAmount: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  reservationReceiptNumber: {
    type: DataTypes.STRING,
    defaultValue: "XX-XXXXXXXXXXX-XXXXXXXXXXXXXX"
  },
},
{
  tableName: 'contract',
});

module.exports = Contract;
