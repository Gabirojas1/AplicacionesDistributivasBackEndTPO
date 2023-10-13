const { Sequelize, DataTypes } = require('sequelize');
const { sq } = require('../db/database');
const { PropertyState } = require('./State/PropertyState');

const { ContractTypeEnum, ContractTypeStateEnum, CurrencyTypeEnum} = require('../common/constants');
const Property = require('./Property');

const ContractType = sq.define('type', {
  idContractType: {
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
    type: DataTypes.INTEGER
  },
  status: {
    type: DataTypes.ENUM,
    values: Object.values(ContractTypeStateEnum),
    defaultValue: ContractTypeStateEnum.INITIALIZED
  }
},
  {
    tableName: 'contract_types',
  });

ContractType.sync().then(async () => {
  console.log("Initializing ContractType data. . . . . . . ");

  await ContractType.findOrCreate({
    where: { idContractType: 9999 },
    defaults: {
      propertyId: 9999,
      contractType: ContractTypeEnum.SALE,
      price: 999,
      expPrice: 888,
      currency: CurrencyTypeEnum.ARS,
    }
  });

  await ContractType.findOrCreate({
    where: { idContractType: 9998 },
    defaults: {
      propertyId: 9998,
      contractType: ContractTypeEnum.RENT,
      price: 99,
      expPrice: 12,
      currency: CurrencyTypeEnum.ARS,
      contractDays: 30
    }
  });

});

// ContractType.associate = function (models) {
//   ContractType.belongsTo(Property, {
//     foreignKey: { name: 'propertyId', allowNull: false }
//   });
// }

module.exports = ContractType;
