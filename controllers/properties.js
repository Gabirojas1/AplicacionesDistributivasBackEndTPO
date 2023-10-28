var constants = require("../common/constants");

const UserRepository = require("../db/repository/UserRepository");
const PropertiesRepository = require("../db/repository/PropertiesRepository.js");
const moment = require('moment');
const Location = require("../models/Location");
const ContractType = require("../models/ContractType");


// Metodo general que es utilizado en dos endpoints distintos ya que es configurable el metodo de ordenamiento, por cuales campos filtrar
// y el paginado que se desea.
const getProperties = async (req, res) => {
  try {
    const params = req.query

    params.skip = params.skip ? parseInt(params.skip, 10) : 0
    params.limit = params.limit ? parseInt(params.limit, 10) : 10
    params.filterOwned = req.filterOwned ? true : false

    let result = await PropertiesRepository.getProperties(params)
    
    return res.status(200).jsonExtra(result)
  } catch (e) {
    return res.status(e.status).jsonExtra({ 
      "code": e.status,
      "msg": e.message,
      "data": [] 
    })

  }
};

// Metodo especifico para obtener propiedades del usuario logeado
const getOwnedProperties = async (req, res) => {

  // Get Logged-Sn User properties....
  // don't filter by status, get em' all.
  req.filterOwned = true;
  req.query.userId = req.body.id;

  return await getProperties(req, res);
};

// Usuario agrega property
const addProperty = async (req, res) => {

  const body = req.body;

  try {
    let user = await UserRepository.getUserByIdUsuario(body.id);
    if (!user) {
      return res.status(401).jsonExtra({
        status: "error",
        message: "No existe el usuario para dar de alta la propiedad",
      });
    }

    if (user.userType != constants.UserTypeEnum.INMOBILIARIA) {
      return res.status(400).jsonExtra({
        status: "error",
        message: "Error: solo las inmobiliarias pueden agregar propiedades.",
      });
    }

    let property = await PropertiesRepository.addProperty(body);
    if (property) {
      return res.status(200).jsonExtra({
        status: "ok",
        message: "property dada de alta exitosamente",
        data: property,
      });
    } else {
      return res.status(500).jsonExtra({
        status: "error",
        message: "Error. No se pudo agregar la propiedad.",
      });
    }

  } catch (e) {
    return res
      .status(e.statusCode ? e.statusCode : 500)
      .jsonExtra({ status: e.name, message: e.message });
  }
};

// Actualiza property existente
const updateProperty = async (req, res) => {
  const body = req.body;

  try {

    // Validar que la propiedad existe
    // Tiene que existir con el propertyId y pertenecer al usuario loggeado.
    let properties = await PropertiesRepository.getProperties({
      propertyId: body.propertyId,
      userId: body.id, // body.id siempre contiene el id del usuario loggeado
      filterOwned: true
    });


    // El usuario no es dueño de la propiedad o 
    // La propiedad no existe
    if (properties.length < 1) {
      return res.status(401).jsonExtra({
        status: "error",
        message: "No autorizado. La propiedad no existe o no te pertenece.",
      });
    }

    let property = properties.data[0];
    if (property.userId != body.id) {
      return res.status(401).jsonExtra({
        status: "error",
        message: "No autorizado. La propiedad no existe o no te pertenece.",
      });
    }

    // update base property
    let result = await PropertiesRepository.updateProperty(property, body);
    if (!result) {
      return res.status(500).jsonExtra({
        status: "error",
        message: "unexpected error at updateProperty"
      });
    }

    // refresh fields
    finalResult = await PropertiesRepository.getProperties({
      propertyId: result.id,
      filterOwned: true
    });

    return res.status(200).jsonExtra({
      status: "ok",
      message: "propiedad actualizada",
      data: finalResult[0],
    });
  } catch (e) {
    return res
      .status(e.statusCode ? e.statusCode : 500)
      .jsonExtra({ status: e.name, message: e.message });
  }
};

// Elimina propiedad existente
const deleteProperty = async (req, res) => {
  const body = req.body;

  // TODO validar ownership de la propiedad para el usuario

  try {

    // Validar que la propiedad existe
    let properties = await PropertiesRepository.getProperties({ propertyId: body.propertyId });
    if (properties.length < 1) {
      return res.status(404).jsonExtra({
        status: "error",
        message: "la propiedad no existe",
      });
    }

    let result = await PropertiesRepository.deleteProperty(body);
    if (!result) {
      return res.status(200).jsonExtra({
        status: "error",
      });
    }

    return res.status(200).jsonExtra({
      status: "ok",
      message: "propiedad dada de baja, no se mostrara en resultados de busqueda",
    });
  } catch (e) {
    return res
      .status(e.statusCode)
      .jsonExtra({ status: e.name, message: e.message });
  }
};

module.exports = {
  getProperties,
  getOwnedProperties,
  addProperty,
  updateProperty,
  deleteProperty,
};
