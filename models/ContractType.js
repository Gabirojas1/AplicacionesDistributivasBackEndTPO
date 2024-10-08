const { Sequelize, DataTypes } = require('sequelize');
const { sq } = require('../db/database');
const { ContractTypeEnum, CurrencyTypeEnum} = require('../common/constants');

const ContractType = sq.define('contract_type', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  propertyId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  contractType: {
    type: DataTypes.ENUM,
    values: Object.values(ContractTypeEnum),
    allowNull: false
  },
  price: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  expPrice: {
    type: DataTypes.DOUBLE,
  },
  currency: {
    type: DataTypes.ENUM,
    values: Object.values(CurrencyTypeEnum),
    defaultValue: CurrencyTypeEnum.ARS
  },
  contractDays: {
    type: DataTypes.INTEGER,
    defaultValue: 1095
  }
},
  {
    tableName: 'contract_types',
  }); 

module.exports = ContractType;
