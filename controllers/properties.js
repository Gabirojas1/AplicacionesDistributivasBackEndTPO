var constants = require("../common/constants");

const UserRepository = require("../db/repository/UserRepository");
const PropertiesRepository = require("../db/repository/PropertiesRepository.js");

const multimediaHelper = require('../helpers/multimedia')

// Metodo general que es utilizado en dos endpoints distintos ya que es configurable el metodo de ordenamiento, por cuales campos filtrar
// y el paginado que se desea.
const getProperties = async (req, res) => {
  try {
    const params = req.query

    params.skip = params.skip ? parseInt(params.skip, 10) : 0;
    params.limit = params.limit ? parseInt(params.limit, 10) : 10;
    params.filterOwned = req.filterOwned ? true : false;
    let result = await PropertiesRepository.getProperties(params)
    
    return res.status(200).jsonExtra(result)
  } catch (error) {
    return res.status(error.status ? error.status : 500).jsonExtra({ 
      "code": error.status ? error.status : 500,
      "msg": error.message ? error.message : "Unexpected Error",

      "data": [] 
    })
  }
};

// Metodo especifico para obtener propiedades del usuario logeado
const getOwnedProperties = async (req, res) => {

  try {
    // Get Logged-Sn User properties....
    // don't filter by status, get em' all.
    req.filterOwned = true;
    req.query.ownerUserId = req.body.id;

    return await getProperties(req, res);
  } catch (error) {
    return res.status(error.status ? error.status : 500).jsonExtra({ 
      "code": error.status ? error.status : 500,
      "msg": error.message ? error.message : "Unexpected Error",
      "data": [] 
    })
  }
};

// Metodo usuario agrega property
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

    let photosArray = [];

    // cloudinary (photo upload)
    let photos = req.files && req.files["photos"];
    if (photos) {

      // una sola imagen
      if(!photos.length) {
        let tmp_path = photos.path;

        photos = []
        photos.push({path: tmp_path});
      }

      for (const photo of photos) {
        const newPath = await multimediaHelper.cloudinaryImageUploadMethod(photo.path);
        photosArray.push(newPath);
      }
    }

    body.photos = photosArray;


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
      .status(e.status ? e.status : 500)
      .jsonExtra({ status: e.status ? e.status : 500, message: e.message ? e.message : "Unexpected Error" });
  }
};

// Actualiza property existente
const updateProperty = async (req, res) => {
  const body = req.body;

  try {

    // Validar que la propiedad existe
    // Tiene que existir con el propertyId y pertenecer al usuario loggeado.
    let property = await PropertiesRepository.getPropertyById(body.propertyId);

    // La propiedad no existe
    if (property == null) {
      return res.status(401).jsonExtra({
        status: "error",
        message: "No autorizado. La propiedad no existe o no te pertenece.",
      });
    }

    if (property.ownerUserId != body.id) {
      return res.status(401).jsonExtra({
        status: "error",
        message: "No autorizado. La propiedad no existe o no te pertenece.",
      });
    }

    if (req.body.status == constants.PropertyStateEnum.DESPUBLICADA) {
      return res.status(401).jsonExtra({
        status: "error",
        message: "No autorizado. Para despublicar una propiedad, utilize DELETE /v1/properties?propertyId=" + property.id,
      });
    }

    if (req.body.status == constants.PropertyStateEnum.RESERVADA) {
      return res.status(401).jsonExtra({
        status: "error",
        message: "No autorizado. Para reservar una propiedad, debe hacerlo un usuario creando un contrato a través de POST /v1/contracts.",
      });
    }

    let photosArray = [];

    // cloudinary (photo upload)
    let photos = req.files && req.files["photos"];
    if (photos) {

      // una sola imagen
      if(!photos.length) {
        let tmp_path = photos.path;

        photos = []
        photos.push({path: tmp_path});
      }

      for (const photo of photos) {
        const newPath = await multimediaHelper.cloudinaryImageUploadMethod(photo.path);
        photosArray.push(newPath);
      }
    }

    body.photos = photosArray;

    // update base property
    let result = await PropertiesRepository.updateProperty(property, body);
    if (!result) {
      return res.status(500).jsonExtra({
        status: "error",
        message: "unexpected error at updateProperty"
      });
    }

    return res.status(200).jsonExtra({
      status: "ok",
      message: "propiedad actualizada",
      data: result,
    });
  } catch (e) {
    return res
      .status(e.status ? e.status : 500)
      .jsonExtra({ status: e.status ? e.status : 500, message: e.message ? e.message : "Unexpected Error" });
  }
};

// Elimina logicamente propiedad existente
const deleteProperty = async (req, res) => {
  try {

    // Validar que la propiedad existe
    // Tiene que existir con el propertyId y pertenecer al usuario loggeado.
    let property = await PropertiesRepository.getPropertyById(req.query.propertyId);

    // La propiedad no existe
    if (property == null) {
      return res.status(401).jsonExtra({
        status: "error",
        message: "No autorizado. La propiedad no existe o no te pertenece.",
      });
    }

    // El usuario no es dueño de la propiedad o 
    if (property.ownerUserId != req.body.id) {
      return res.status(401).jsonExtra({
        status: "error",
        message: "No autorizado. La propiedad no te pertenece.",
      });
    }

    if(property.status != constants.PropertyStateEnum.PUBLICADA) {
      return res.status(400).jsonExtra({
        status: "error",
        message: "La propiedad no se encuentra publicada. Estado actual: " + property.status,
        data: property
      });
    }
    
    await PropertiesRepository.deleteProperty(property);
    return res.status(200).jsonExtra({
      status: "ok",
      message: "Propiedad despublicada, no se mostrara en resultados de búsqueda. Para volverla a publicar, utilize PATCH /v1/properties con status igual a Publicada.",
    });
  } catch (e) {
    return res
      .status(e.status ? e.status : 500)
      .jsonExtra({ status: e.status ? e.status : 500, message: e.message ? e.message : "Unexpected Error" });
  }
};

module.exports = {
  getProperties,
  getOwnedProperties,
  addProperty,
  updateProperty,
  deleteProperty,
};
