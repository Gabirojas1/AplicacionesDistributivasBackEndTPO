const { response } = require("express");
const bcrypt = require("bcrypt");
const { generateJWT } = require("../helpers/jwt");
const UserRepository = require("../db/repository/UserRepository");

const { Op } = require('sequelize');

const PropertiesRepository = require("../db/repository/PropertiesRepository");

var constants = require("../common/constants");

const mailHelper = require("../helpers/mail");
const Contacto = require("../models/Contacto");
const Property = require("../models/User");
const ContractType = require("../models/ContractType");
const Contract = require("../models/Contract");


// Obtiene contactos de inmobiliaria o usuario loggeado.
// Inmobiliaria: obtiene los contactos que recibieron todas sus propiedades.
// Usuario: obtiene todos los contactos que envio a inmobiliarias.
const getContracts = async (req, res = response) => {
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

// Metodo para iniciar un contrato en estado "Iniciado" 
const addContract = async (req, res) => {
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
    const contractTypeId = req.body.contractTypeId;

    let contractType = await ContractType.findOne({
      where: {
        id: contractTypeId
      }
    });

    if (contractType == null) {
      return res.status(400).jsonExtra({
        ok: false,
        message: "No existe el tipo de contrato de la propiedad indicado. Id: " + contractTypeId,
      });
    }

    let result = await Contract.findOne({
      where: {
        userId: loggedUserId,
        contractTypeId: contractTypeId,
        status: {
          [Op.in]: [
            constants.ContractStatusEnum.RESERVED,
            constants.ContractStatusEnum.INITIALIZED,
            constants.ContractStatusEnum.CONCRETIZED,
          ]
        },
      }
    });

    // No existe ningun contrato vigente
    if (result == null) {

      await Contract.create({
        userId: loggedUserId,
        contractTypeId: contractTypeId,
      })
        .then(async created => {
          await created.reload();
          await created.update();
          return res.status(201).jsonExtra({
            ok: true,
            message: "Se genero el contrato.",
            data: created,
          });
        })
        .catch((error) => {
          error.status = 500;
          error.message = error;
          throw error;
        });
    } else {
      // Existe un contrato vigente
      return res.status(200).jsonExtra({
        ok: true,
        message: "Ya existe un contrato vigente.",
        data: result,
      });
    }
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
const patchContract = async (req, res) => {
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
  getContracts,
  addContract,
  patchContract
};
