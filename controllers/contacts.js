const { response } = require("express");
const bcrypt = require("bcrypt");
const { generateJWT } = require("../helpers/jwt");
const UserRepository = require("../db/repository/UserRepository");

const PropertiesRepository = require("../db/repository/PropertiesRepository");

var constants = require("../common/constants");

const mailHelper = require("../helpers/mail");
const Contacto = require("../models/Contacto");
const Property = require("../models/User");


// Obtiene contactos de inmobiliaria o usuario loggeado.
// Inmobiliaria: obtiene los contactos que recibieron todas sus propiedades.
// Usuario: obtiene todos los contactos que envio a inmobiliarias.
const getContacts = async (req, res = response) => {
  const uid = req.body.id;
  try {

    // validar usuario existente
    const loggedUserId = req.body.id;
    let user = await UserRepository.getUserByIdUsuario(loggedUserId);
    if (user == null) {
      return res.status(400).jsonExtra({
        ok: false,
        message: "No se pudo encontrar el usuario loggeado. Sesion Expirada o el usuario no existe.",
      });
    }

    let contacts = [];

    // Usuario
    if (user.userType == "Usuario") {
      contacts = await Contacto.findAll({
        where: {
          userId: loggedUserId
        }
      })
    }
    // Inmobiliaria
    else {
      contacts = await Contacto.findAll({
        where: {
          inmobiliariaId: loggedUserId
        }
      })
    }

    return res.status(200).jsonExtra({
      ok: true,
      data: contacts
    });

  } catch(error) {
    return res.status(error.status ? error.status : 500).jsonExtra({
      ok: false,
      message: error.message ? error.message : "Error inesperado al obtener  los contactos",
      error: error
    });
  }
};

// Metodo para enviar un contacto a una inmobiliaria acerca de una propiedad
// Solo puede ser usado por usuarios.
const addContact = async (req, res) => {
  try {

    // validar usuario existente
    const loggedUserId = req.body.id;
    let user = await UserRepository.getUserByIdUsuario(loggedUserId);
    if (user == null) {
      return res.status(400).jsonExtra({
        ok: false,
        message: "No se pudo encontrar el usuario loggeado. Sesion Expirada o el usuario no existe.",
      });
    }

    // validar tipo de usuario
    if (user.userType != "Usuario") {
      return res.status(401).jsonExtra({
        ok: false,
        message: "No autorizado! Este endpoint es solo para usuarios.",
      });
    }

    // obtener y validar que la propiedad existe
    const propertyId = req.body.propertyId;
    let properties = await PropertiesRepository.getProperties({
      propertyId: propertyId
    });

    if (properties.length < 1) {
      return res.status(401).jsonExtra({
        ok: false,
        message: "No se encontro la propiedad.",
      });
    }

    let property = properties.data[0];


    const contactType = req.body.contactType;

    const visitDate = req.body.visitDate;

    const visitTime = req.body.visitTime;

    const statusMessage = req.body.statusMessage;


    // validar que si es visita, se informe visitDate y visitTime
    if (contactType == constants.ContactTypeEnum.VISIT
      && (visitTime == undefined || visitDate == undefined)) {
        return res.status(400).jsonExtra({
          ok: false,
          message: "Debe informar fecha y hora de visita.",
        });
    }

    let contact = await Contacto.findOrCreate({
      where: { userId: loggedUserId, propertyId: property.id },
      defaults: {
        userId: loggedUserId,
        inmobiliariaId: property.userId,
        propertyId: property.id,
        contactType: contactType,
        visitDate: visitDate ? visitDate : null,
        visitTime: visitTime ? visitTime : null,
        statusMessage: statusMessage
      }
    });

    if(contact[0] != null) {
      if (contact[1]) {

        await user.addContact(contact[0]);
        await property.addContact(contact[0]);

        return res
        .status(201)
        .jsonExtra({
          ok: true,
          data: contact[0]
        });
      } else {
        return res
        .status(200)
        .jsonExtra({
          ok: true,
          message: "Ya enviaste un contacto. Para generar uno nuevo, da de baja el anterior y envia otro.",
          data: contact[0],

        });
      } 
    }

    return res.status(500).jsonExtra({
      ok: true,
      message: "Error al intentar dar de alta el contacto..",
    });

  } catch(error) {
    return res.status(error.status ? error.status : 500).jsonExtra({
      ok: false,
      message: error.message ? error.message : "Error inesperado al dar de alta el contacto",
      error: error
    });
  }
};

// Metodo de actualizacion de contacto usado por inmobiliarias y usuarios
// La inmobiliaria y/o usuario podra aceptar, rechazar o proponer una nueva fecha y horario una vez enviado
const patchContact = async (req, res) => {
  try {

    // validar usuario existente
    const loggedUserId = req.body.id;
    let user = await UserRepository.getUserByIdUsuario(loggedUserId);
    if (user == null) {
      return res.status(400).jsonExtra({
        ok: false,
        message: "No se pudo encontrar el usuario loggeado. Sesion Expirada o el usuario no existe.",
      });
    }

    // validar existencia de contacto
    const contactId = req.body.contactId;
    let contact = await Contacto.findOne({
      where: {
        id: contactId
      }
    })

    if(contact == null) {
      return res.status(400).jsonExtra({
        ok: false,
        message: "El contacto no existe.",
      });
    }

    const newStatus = req.body.status;
    const newStatusMessage = req.body.statusMessage;

    const visitDate = req.body.visitDate;
    const visitTime = req.body.visitTime;

    // validar que si es una nueva propuesta de visita, se informe visitDate y visitTime
    if (contact.contactType == constants.ContactTypeEnum.VISIT
      && newStatus == constants.ContactTypeStateEnum.NEW_PROPOSAL) {

      if (visitTime == undefined || visitDate == undefined) {
        return res.status(400).jsonExtra({
          ok: false,
          message: "Debe informar fecha y hora de visita.",
        });
      }
     
      contact.visitTime = visitTime;
      contact.visitDate = visitDate;
    }

    contact.status = newStatus;
    contact.statusMessage = newStatusMessage;
    contact.update();
    contact.reload();

    return res.status(200).jsonExtra({
      ok: true,
      message: "Contacto actualizado.",
      data: contact
    });

  } catch (error) {
    return res.status(error.status ? error.status : 500).jsonExtra({
      ok: false,
      message: "Error inesperado al validar OTP y cambiar contraseña",
      error: error
    });
  }
};

module.exports = {
  getContacts,
  addContact,
  patchContact
};
