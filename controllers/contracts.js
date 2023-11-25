const { response } = require("express");
const UserRepository = require("../db/repository/UserRepository");
const { Sequelize, Op } = require('sequelize');
var constants = require("../common/constants");
const Contacto = require("../models/Contacto");
const Property = require("../models/Property");
const ContractType = require("../models/ContractType");
const Contract = require("../models/Contract");

// Obtiene los contratos de inmobiliaria o usuario loggeado.
// Inmobiliaria: obtiene los contratos que recibieron todas sus propiedades.
// Usuario: obtiene todos los contratos que envio a inmobiliarias.
const getContracts = async (req, res = response) => {

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

    let contracts = [];

    // Usuario
    if (user.userType == "Usuario") {

      // el usuario contratante debe ser el usuario loggeado
      let findStatement = {
        where: {
          contractorUserId: loggedUserId
        }
      };

      // Si se informa propertyId, obtener el contrato perteneciente al usuario y para esa propiedad
      let propertyId = req.query.propertyId;
      if(propertyId) {

        findStatement = {
          where: {
            contractorUserId: loggedUserId
          },
          include: [
            {
              model: ContractType,
              attributes: ['id'],  // Solo mostrar el id del contract type
              required: true,
              include: [{
                model: Property,
                attributes: ['id'],  // Solo mostrar el id de la propiedad
                where: {
                  id: propertyId
                },
                required: true,
              }
              ],
            },
          ]
        };

      }

      contracts = await Contract.findAll(findStatement)
    }
    // Inmobiliaria
    else {

      // TODO! filtro por propertyId

      // Obtener todos los contratos que le corresponden a la inmobiliaria loggeada.
      // SELECT c.*, ct.id, p.id FROM contracts c 
      // INNER JOIN contract_types ct ON ct.id = c.contractTypeId
      // INNER JOIN properties p ON p.id = ct.propertyId
      // WHERE p.userId = {loggedUserId};
      contracts = await Contract.findAll({
        include: [
          {
            model: ContractType,
            attributes: ['id'], // Solo mostrar el id del contract_type
            include: [{
              model: Property,
              attributes: ['id'],  // Solo mostrar el id de la propiedad
              where: {
                userId: loggedUserId
              },
            }
            ],
            required: false,
          },
        ]
      })
    }

    if (contracts.length < 1) {
      return res.status(404).jsonExtra({
        ok: true,
        message: "No se encontraron resultados",
        data: contracts
      });
    }

    return res.status(200).jsonExtra({
      ok: true,
      data: contracts
    });

  } catch(error) {
    return res.status(error.status ? error.status : 500).jsonExtra({
      ok: false,
      message: error.message ? error.message : "Error inesperado al obtener  los contactos",
      error: error
    });
  }
};

// Obtiene contrato por Id, solo puede ser obtenido por usuarios loggeados
// y solo si son alguna de las dos partes involucradas en el contrato (Inmobiliaria o Usuario)
const getContractsById = async (req, res = response) => {
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

// Metodo para iniciar un contrato usuario->propiedad en estado "Iniciado".
// Solo puede ser usada por usuarios, no inmobiliarias.
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
        contractorUserId: loggedUserId,
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
    // TODO! enviar email a inmobiliaria avisandole
    if (result == null) {

      await Contract.create({
        contractorUserId: loggedUserId,
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
      message: error.message ? error.message : "Error inesperado al dar de alta el contrato.",
      error: error
    });
  }
};

// Metodo 
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
  getContractsById,
  addContract,
  patchContract
};
