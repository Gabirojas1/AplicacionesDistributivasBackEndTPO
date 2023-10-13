const { Sequelize, DataTypes } = require('sequelize');
const { sq } = require('../db/database');

const property = require('./Property');

const constants = require('../common/constants');


// Localización	Localizacion_ID	PK	País	País	Provincia	Provincia	Distrito	Distrito	Calle	String	Altura	String	Depto	String	Latitud	NUMERIC	Longitud	NUMERIC
const Location = sq.define('location', {
  idLocation: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false
  },
  province: {
    type: DataTypes.STRING,
    allowNull: false
  },
  district: {
    type: DataTypes.STRING,
    allowNull: false
  },
  street: {
    type: DataTypes.STRING,
    allowNull: false
  },
  streetNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  departament: {
    type: DataTypes.STRING,
    allowNull: false
  },
  latitud: {
    type: DataTypes.DECIMAL(11,2),
    allowNull: false
  },
  longitud: {
    type: DataTypes.DECIMAL(11,2),
    allowNull: false
  }
},
  {
    tableName: 'locations',
  });

Location.sync().then(async () => {
  console.log("Initializing Location data. . . . . . . ");

  let latitud = -77.0364;
  let longitud = -77.0364;

  await Location.findOne({
    where: {
      idLocation: 9999,
    }
  }).then(async res => {

    if (!res) {

      await Location.create({
        idLocation: 9999,
        latitud: latitud,
        longitud: longitud,
        country: "Argentina",
        province: "Buenos Aires",
        district: "Lomas de Zamora",
        street: "Av. Simpreviva",
        streetNumber: 1234,
        departament: "N/A"
      });

    }

  }).catch(error => {
    console.error('Failed to insert data : ', error);
  });

});

// Location.associate = function (models) {
//   Location.hasMany(property, {
//     foreignKey: { name: 'propertyId', allowNull: false }
//   });
// }

module.exports = Location;
