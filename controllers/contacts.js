const { response } = require("express");
const UserRepository = require("../db/repository/UserRepository");
const PropertiesRepository = require("../db/repository/PropertiesRepository");
var constants = require("../common/constants");
const Contacto = require("../models/Contacto");

// Obtiene contactos de inmobiliaria o usuario loggeado.
// inmobiliaria: obtiene los contactos que recibieron todas sus propiedades.
// usuario: obtiene todos los contactos que envio a inmobiliarias.
const getContacts = async (req, res = response) => {
  const uid = req.body.id;
  try {

    // validar usuario existente
    const loggedUserId = req.body.id;
    let loggedUser = await UserRepository.getUserByIdUsuario(loggedUserId);
    if (loggedUser == null) {
      return res.status(400).jsonExtra({
        ok: false,
        message: "No se pudo encontrar el usuario loggeado. Sesion Expirada o el usuario no existe.",
      });
    }

    let contacts = [];

    // usuario
    if (loggedUser.userType == constants.UserTypeEnum.USUARIO) {
      contacts = await Contacto.findAll({
        where: {
          userId: loggedUserId
        }
      })
    }
    // inmobiliaria
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
    let loggedUser = await UserRepository.getUserByIdUsuario(loggedUserId);
    if (loggedUser == null) {
      return res.status(400).jsonExtra({
        ok: false,
        message: "No se pudo encontrar el usuario loggeado. Sesion Expirada o el usuario no existe.",
      });
    }

    // validar tipo de usuario
    if (loggedUser.userType != constants.UserTypeEnum.USUARIO) {
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

        await loggedUser.addContact(contact[0]);
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
    let loggedUser = await UserRepository.getUserByIdUsuario(loggedUserId);
    if (loggedUser == null) {
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
    const oldStatus = contact.status;
    const newStatusMessage = req.body.statusMessage;
    const isInmobiliariaUserType = (loggedUser.userType==constants.UserTypeEnum.INMOBILIARIA);

    const visitDate = req.body.visitDate;
    const visitTime = req.body.visitTime;

    // validar que si es una nueva propuesta de visita, se informe visitDate y visitTime
    if (contact.contactType == constants.ContactTypeEnum.VISIT
      && newStatus == constants.ContactStateEnum.NEW_PROPOSAL) {

      if (visitTime == undefined || visitDate == undefined) {
        return res.status(400).jsonExtra({
          ok: false,
          message: "Debe informar fecha y hora de visita.",
        });
      }
     
      contact.visitTime = visitTime;
      contact.visitDate = visitDate;
    }
    
    // Validar que el contacto le pertenece como usuario o inmobiliaria al loggedUser
    let authorized = isInmobiliariaUserType ? contact.inmobiliariaId===loggedUserId : contact.userId===loggedUserId;
    if (!authorized) {
      return res.status(401).jsonExtra({
        ok: false,
        message: "El contacto no te pertenece.",
      });
    }

    // Validar que si el estado anterior es enviado, solo pueda ser aceptado solo por la inmobiliaria
    if (oldStatus == constants.ContactStateEnum.SENT
      && newStatus == constants.ContactStateEnum.ACCEPTED
      && loggedUser.id != contact.inmobiliariaId) {
        return res.status(401).jsonExtra({
          ok: false,
          message: "Solo la inmobiliaria puede aceptar el contacto en estado Enviado.",
        });
    }

    //Validar que la nueva propuesta se pueda hacer solo si esta en estado enviado
    if (newStatus == constants.ContactStateEnum.NEW_PROPOSAL
      && (oldStatus == constants.ContactStateEnum.ACCEPTED || oldStatus == constants.ContactStateEnum.REJECTED)
      && loggedUser.id != contact.inmobiliariaId) {
        return res.status(400).jsonExtra({
          ok: false,
          message: "Solo se puede proponer una nueva fecha si esta en estado Enviado o Nueva_Propuesta.",
        });
    }

     // Fin de camino en estado
     if (oldStatus == constants.ContactStateEnum.ACCEPTED
      || newStatus == constants.ContactStateEnum.REJECTED) {
        return res.status(401).jsonExtra({
          ok: false,
          message: "No es posible modificar un contacto ya aceptado o rechazado.",
          data: contact,
        });
    }

    // TODO!: enviar mails notificando cambios de estado
    contact.status = newStatus;
    contact.statusMessage = newStatusMessage;
    contact.save();
    contact.reload();

    return res.status(200).jsonExtra({
      ok: true,
      message: "Contacto actualizado.",
      oldStatus: oldStatus,
      newStatus: newStatus,
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
