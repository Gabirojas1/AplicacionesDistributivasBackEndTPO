const { response } = require("express");
const UserRepository = require("../db/repository/UserRepository");
const { Sequelize, Op } = require('sequelize');
var constants = require("../common/constants");
const Property = require("../models/Property");
const ContractType = require("../models/ContractType");
const Contract = require("../models/Contract");

// Obtiene los contratos de inmobiliaria o usuario loggeado.
// inmobiliaria: obtiene los contratos que recibieron todas sus propiedades.
// usuario: obtiene todos los contratos que envio a inmobiliarias.
const getContracts = async (req, res = response) => {

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

    let contracts = [];

    // usuario
    if (loggedUser.userType == constants.UserTypeEnum.USUARIO) {

      // el usuario contratante debe ser el usuario loggeado
      let findStatement = {
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
              required: true,
            }
            ],
          },
        ]
      };

      // Si se informa propertyId, obtener el contrato perteneciente al usuario y para esa propiedad
      let propertyId = req.query.propertyId;
      if (propertyId) {
        findStatement.include[0].include[0].where = {
          id: propertyId
        };
      }

      contracts = await Contract.findAll(findStatement)
    }
    // inmobiliaria
    else {

      // Obtener todos los contratos que le corresponden a la inmobiliaria loggeada.
      // SELECT c.*, ct.id, p.id FROM contracts c 
      // INNER JOIN contract_types ct ON ct.id = c.contractTypeId
      // INNER JOIN properties p ON p.id = ct.propertyId
      // WHERE p.userId = {loggedUserId};
      let findStatement = {
        include: [
          {
            model: ContractType,
            attributes: ['id'], // Solo mostrar el id del contract_type
            required: true,
            include: [{
              model: Property,
              attributes: ['id'],  // Solo mostrar el id de la propiedad
              required: true,
              where: {
                userId: loggedUserId
              },
            }
            ],
          },
        ]
      };

      // Si se informa propertyId, obtener todos los contratos de la propiedad
      let propertyId = req.query.propertyId;
      if (propertyId) {
        findStatement.include[0].include[0].where["id"] = propertyId;
      }

      contracts = await Contract.findAll(findStatement)
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

// Metodo para iniciar un contrato usuario->propiedad en estado "Reservado".
// Solo puede ser usada por usuarios, no inmobiliarias.
const addContract = async (req, res) => {
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
    const contractTypeId = req.body.contractTypeId;

    let contractType = await ContractType.findOne({
      where: {
        id: contractTypeId
      },
      include: [
        {
          model: Property,
          required: true,
        },
      ]
    });

    if (contractType == null) {
      return res.status(400).jsonExtra({
        ok: false,
        message: "No existe el tipo de contrato de la propiedad indicado. Id: " + contractTypeId,
      });
    }

    // Validar estado de propiedad -> Publicada
    if (contractType.property.status != constants.PropertyStateEnum.PUBLICADA) {
      return res.status(400).jsonExtra({
        ok: false,
        message: "Solo se pueden reservar propiedades en estado PUBLICADA. Su estado es: " + contractType.property.status,
      });
    }

    let result = await Contract.findOne({
      where: {
        contractorUserId: loggedUserId,
        contractTypeId: contractTypeId,
      }
    });

    // No existe ningun contrato vigente
    // TODO! enviar email a inmobiliaria avisandole
    if (result == null) {

      
      // TODO! crear review si se recibe comment y review
      let comment = req.body.comment;
      let review = req.body.review;
      if(comment) {
        
      }
      
      await Contract.create({
        contractorUserId: loggedUserId,
        contractTypeId: contractTypeId,
        reservedAmount: contractType.price*0.1,
      })
        .then(async created => {
          
          await created.update();
          await created.reload();

          contractType.property.status = constants.PropertyStateEnum.RESERVADA;
          await contractType.property.save();
          await contractType.property.reload();




          return res.status(201).jsonExtra({
            ok: true,
            message: "Se reservó la propiedad.",
            data: created,
          });
        });
    } else {
      // Existe un contrato vigente
      return res.status(200).jsonExtra({
        ok: true,
        message: "Ya existe una reserva para esta propiedad..",
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

module.exports = {
  getContracts,
  addContract
};
