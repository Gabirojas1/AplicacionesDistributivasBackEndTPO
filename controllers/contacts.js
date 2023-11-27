const { response } = require("express");
const UserRepository = require("../db/repository/UserRepository");
const PropertiesRepository = require("../db/repository/PropertiesRepository");
var constants = require("../common/constants");
const Contacto = require("../models/Contacto");
const { Op } = require('sequelize');
const User = require("../models/User");

const mailHelper = require('../helpers/mail');

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

    // Primero Enviado / Nuevas_Propuesta
    let orderStatement = ['status', 'ASC']

    // usuario
    if (loggedUser.userType == constants.UserTypeEnum.USUARIO) {
      contacts = await Contacto.findAll({
        where: {
          userId: loggedUserId
        },
        order: [orderStatement],
      })
    }
    // inmobiliaria
    else {
      contacts = await Contacto.findAll({
        where: {
          inmobiliariaId: loggedUserId
        },
        order: [orderStatement],
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
    let property = await PropertiesRepository.getPropertyById(propertyId);

    if (property == null) {
      return res.status(404).jsonExtra({
        ok: false,
        message: "No se encontro la propiedad.",
      });
    }

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

    let contact = await Contacto.findOne({
      where: {
        userId: loggedUserId,
        propertyId: property.id,
        status: {
          [Op.in]: [
            constants.ContactStateEnum.SENT,
            constants.ContactStateEnum.NEW_PROPOSAL
          ]
        },
      }
    });

    if (contact != null) {
      return res
        .status(400)
        .jsonExtra({
          ok: true,
          message: "Ya enviaste un contacto para esta propiedad. Para generar uno nuevo, descarta el anterior y envia otro.",
          data: contact,
        });
    }

    contact = await Contacto.create({
      userId: loggedUserId,
      inmobiliariaId: property.ownerUserId,
      propertyId: property.id,
      contactType: contactType,
      visitDate: visitDate ? visitDate : null,
      visitTime: visitTime ? visitTime : null,
      statusMessage: statusMessage
    });

    await loggedUser.addContact(contact);
    await property.addContact(contact);

    // Notificar inmobiliaria
    let text = `Hola! Te escribimos de myHome! \n
    Te informamos que se recibió un contacto para su inmobiliaria.`;
    mailHelper.sendMail(property.user.contactMail, text);
    
    return res
      .status(201)
      .jsonExtra({
        ok: true,
        data: contact
      });
  } catch (error) {
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
      },
      include: [{
        model: User,
        required: true,
      } 
      ]
    })

    if(contact == null) {
      return res.status(400).jsonExtra({
        ok: false,
        message: "El contacto no existe.",
      });
    }

    const newStatus = req.body.status;
    const oldStatus = contact.status;
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

    
     // validar que si es pregunta, no se pueda poner nueva propuesta
     if (contact.contactType == constants.ContactTypeEnum.QUESTION
      && newStatus === constants.ContactStateEnum.NEW_PROPOSAL) {
      return res.status(400).jsonExtra({
        ok: false,
        message: "Nueva propuesta no es un estado válido para una pregunta. Solo se puede utilizar para visitas.",
      });
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
      && (newStatus == constants.ContactStateEnum.ACCEPTED || newStatus == constants.ContactStateEnum.NEW_PROPOSAL)
      && loggedUser.id != contact.inmobiliariaId) {
        return res.status(401).jsonExtra({
          ok: false,
          message: "Solo la inmobiliaria puede aceptar o proponer una nueva fecha/horario para el contacto en estado Enviado.",
        });
    }

    // Validar que si el estado anterior es Nueva_Propuesta, solo pueda ser aceptado por el usuario.
    if (oldStatus == constants.ContactStateEnum.NEW_PROPOSAL
      && (newStatus == constants.ContactStateEnum.ACCEPTED)
      && loggedUser.id != contact.userId) {
        return res.status(401).jsonExtra({
          ok: false,
          message: "Solo la usuario puede aceptar el contacto en estado Nueva_Propuesta.",
        });
    }

    // Validar que si es nueva propuesta, no se pueda proponer otra fecha.
    if (oldStatus == constants.ContactStateEnum.NEW_PROPOSAL
      && (newStatus == constants.ContactStateEnum.NEW_PROPOSAL)) {
        return res.status(401).jsonExtra({
          ok: false,
          message: "Solo la inmobiliaria puede proponer una fecha y por unica vez, se debe descartar y crear otro contacto.",
        });
    }

     // Fin de camino en estado
     if (oldStatus == constants.ContactStateEnum.ACCEPTED
      || oldStatus == constants.ContactStateEnum.DISCARDED) {
        return res.status(401).jsonExtra({
          ok: false,
          message: "No es posible modificar un contacto ya aceptado o descartado.",
          data: contact,
        });
    }

    // Informar a la parte involucrada mediante estado
    let mail = "";
    let text = "";

    let inmobiliaria = await UserRepository.getUserByIdUsuario(contact.inmobiliariaId);
    let mailInmobiliaria = inmobiliaria.contactMail;
    switch (newStatus) {
      case constants.ContactStateEnum.ACCEPTED:
        text = `Hola! Te escribimos de myHome! \n
        Te informamos que se ha respondido y aceptado un contacto que te pertenece. `;

        if(oldStatus == constants.ContactStateEnum.SENT) {
          mail = contact.user.mail;
        }

        if(oldStatus == constants.ContactStateEnum.NEW_PROPOSAL) {
          mail = mailInmobiliaria;
        }
        break;

      case constants.ContactStateEnum.DISCARDED:
        text = `Hola! Te escribimos de myHome! \n
        Te informamos que se ha respondido y descartado un contacto que te pertenece. `;

        if(oldStatus == constants.ContactStateEnum.SENT) {
          if (contact.user.id != loggedUserId) {
            mail = contact.user.mail;
          } 
        }

        if(oldStatus == constants.ContactStateEnum.NEW_PROPOSAL) {
          mail = mailInmobiliaria;
        }
        break;

      case constants.ContactStateEnum.NEW_PROPOSAL:
          text = `Hola! Te escribimos de myHome! \n
          Te informamos que se ha respondido y propuesto una nueva fecha para una visita que te pertenece. `;
  
          if(oldStatus == constants.ContactStateEnum.SENT) {
            mail = contact.user.mail;
          }

          break;
    
      default:
        break;
    }

    if(mail != "" && text != "") {
      mailHelper.sendMail(mail, text);
    }
   
    contact.status = newStatus;

    const newStatusMessage = req.body.statusMessage;
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
