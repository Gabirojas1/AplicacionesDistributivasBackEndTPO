const { Sequelize, DataTypes } = require('sequelize');
const { sq } = require('../db/database');
const { PropertyState } = require('./State/PropertyState');

const { ContractTypeEnum, ContractTypeStateEnum, CurrencyTypeEnum} = require('../common/constants');
const Property = require('./Property');

// ContractType	idContractType	PK	idProperty	FK	
// contractType	ContractType	price	Money	expPrice	Money	
// currency	CurrencyType	contractDays	Number	status	
// EstadoPropiedadContrato
const ContractType = sq.define('contract_type', {
  idContractType: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  idProperty: {
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
      idProperty: 9999,
      contractType: ContractTypeEnum.SALE,
      price: 999,
      expPrice: 888,
      currency: CurrencyTypeEnum.ARS,
    }
  });

  await ContractType.findOrCreate({
    where: { idContractType: 9998 },
    defaults: {
      idProperty: 9998,
      contractType: ContractTypeEnum.RENT,
      price: 99,
      expPrice: 12,
      currency: CurrencyTypeEnum.ARS,
      contractDays: 30
    }
  });

});

ContractType.associate = function (models) {
  ContractType.belongsTo(Property, {
    foreignKey: { name: 'idProperty', allowNull: false }
  });
}

module.exports = ContractType;
