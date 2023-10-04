var constants = require("../common/constants");

const UserRepository = require("../db/repository/UserRepository");
const PropertiesRepository = require("../db/repository/PropertiesRepository.js");


// Metodo general que es utilizado en dos endpoints distintos ya que es configurable el metodo de ordenamiento, por cuales campos filtrar
// y el paginado que se desea.
const getProperties = async (req, res) => {
  try {
    var skip = req.query.skip ? req.query.skip : 0;
    var limit = req.query.limit ? req.query.limit : 10;

    const body = req.body;
    
    let total = await PropertiesRepository.getProperties(body);

    body.skip = skip;
    body.limit = limit;

    let properties = await PropertiesRepository.getProperties(body);

    return res.status(200).json({ status: "ok", count: total.length, data: properties });
  } catch (e) {
    return res.status(400).json({ status: "err", message: e.message });
  }
};

// Usuario agrega property
const addProperty = async (req, res) => {
  const body = req.body;
  body.idUsuario = req.idUsuario;

  try {
    let user = await UserRepository.getUserByIdUsuario(body.idUsuario);
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "No existe el usuario para dar de alta la propiedad",
      });
    }

    let property = await PropertiesRepository.addProperty(body);
    return res.status(200).json({
      status: "ok",
      message: "property dada de alta exitosamente",
      data: property,
    });
  } catch (e) {
    return res
      .status(e.statusCode)
      .json({ status: e.name, message: e.message });
  }
};

// Actualiza property existente
const updateProperty = async (req, res) => {
  const body = req.body;
  body.idUsuario = req.idUsuario;

    // TODO validar ownership de la property para el usuario
  try {

    // Validar que la propiedad existe
    let properties= await PropertiesRepository.getProperties({property_id: body.idProperty});
    if (properties.length < 1) {
      return res.status(404).json({
        status: "error",
        message: "la propiedad no existe",
      });
    }
    

    let result = await PropertiesRepository.updateProperty(body);
    if (!result) {
      return res.status(200).json({
        status: "error",
      });
    }

    return res.status(200).json({
      status: "ok",
      message: "propiedad actualizada",
      data: result,
    });
  } catch (e) {
    return res
      .status(e.statusCode)
      .json({ status: e.name, message: e.message });
  }
};

// Elimina propiedad existente
const deleteProperty = async (req, res) => {
  const body = req.body;
  body.idUsuario = req.idUsuario;

    // TODO validar ownership de la propiedad para el usuario

  try {

    // Validar que la propiedad existe
    let properties = await PropertiesRepository.getProperties({property_id: body.idProperty});
    if (properties.length < 1) {
      return res.status(404).json({
        status: "error",
        message: "la propiedad no existe",
      });
    }

    let result = await PropertiesRepository.deleteProperty(body);
    if (!result) {
      return res.status(200).json({
        status: "error",
      });
    }

    return res.status(200).json({
      status: "ok",
      message: "propiedad dada de baja, no se mostrara en resultados de busqueda",
    });
  } catch (e) {
    return res
      .status(e.statusCode)
      .json({ status: e.name, message: e.message });
  }
};

module.exports = {
  getProperties,
  addProperty,
  updateProperty,
  deleteProperty,
};
