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

// Metodo para iniciar un contrato usuario->propiedad en estado "Iniciado".
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

       // TODO! validar estado de propiedad -> Publicada

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


// TODO! pattern para contratos, cuando se guarde si es estado reservado la propiedad deberia pasar de "Publicada" a "Reservada"
// TODO! pattern para contratos, cuando se guarde si es estado concretado la propiedad deberia pasar de "Reservada" a "Vendida/Alquilada"
// TODO ! al momento de reservar se pueden recibir calificacion y comentario para la inmobiliaria. (opcional) >> reviews
// Metodo para transicionar el estado de Contratos
// Iniciado -> Reservado
// Iniciado -> Cancelado
// Reservado -> Cancelado
// Reservado -> Concretado
const patchContract = async (req, res) => {
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

    const isInmobiliariaType = (loggedUser.userType===constants.UserTypeEnum.INMOBILIARIA)

    // Validar que el contrato existe
    const contractId = req.body.contractId;
    let contract = await Contract.findOne({
      where: { contractId: contractId },
      include: [
        {
          model: ContractType,
          required: true,
        }
      ]
    });

    if(contract == null) {
      return res.status(400).jsonExtra({
        ok: false,
        message: "No se pudo encontrar el contrato para el contractId("+ contractId + ") indicado.",
      });
    }

    // Validar que el usuario loggeado sea una de las partes involucradas en el contrado
    // La inmobiliaria que publico la propiedad que se esta contratando, o el usuario contratante.
    let authorized = false;
    if (!isInmobiliariaType) {
      authorized = (loggedUserId===contract.contractorUserId);
    } else {

      let findStatement = {
        where: {
          id: contract.contractTypeId
        },
        include: [
          {
            model: Property,
            required: true,
            where: {
              userId: loggedUserId
            }
          },
        ]
      };


      let contractType = await ContractType.findOne(findStatement);
      authorized = (contractType!=null);
    }

    if (!authorized) {
      return res.status(401).jsonExtra({
        ok: false,
        message: "El contrato no te pertenece..",
      });
    }

    // Validacion segun estado, TODO!: mover a state pattern
    let newStatus = req.body.newStatus;
    let oldStatus = contract.status;
    let invalidParameters = false;
    let resMsg = "";
    let canCreateReview = false;
    switch (newStatus) {

      // Si el nuevo estado es Reservado, validar que el estado anterior sea Iniciado y que el usuario loggeado sea el usuario.
      case constants.ContractStatusEnum.RESERVED:
        if (isInmobiliariaType || oldStatus != constants.ContractStatusEnum.INITIALIZED) {
          invalidParameters = true;
          resMsg = "Error al transicionar: solo el usuario puede reservar; y el contrato debe estar en estado iniciado."
        }
        canCreateReview = true;

        // Monto reservado igual al 10% del valor de la propiedad
        contract.reservedAmount = (contract.contract_type.price*0.1);
        break;

      // Si el nuevo estado es Concretado, validar que el estado anterior sea Reservado y que el usuario loggeado sea la inmobiliaria.
      case constants.ContractStatusEnum.CONCRETIZED:
        if (!isInmobiliariaType || oldStatus != constants.ContractStatusEnum.RESERVED) {
          invalidParameters = true;
          resMsg = "Error al transicionar: solo la inmobiliaria puede concretar; y el contrato debe estar en estado reservado."
        }
        break;

      // Si el nuevo estado es Cancelado, validar que no este ya cancelado.
      case constants.ContractStatusEnum.CANCELLED:
        if (oldStatus == constants.ContractStatusEnum.CANCELLED || oldStatus == constants.ContractStatusEnum.CONCRETIZED) {
          invalidParameters = true;
          resMsg = "Error al transicionar: el contrato ya se encuentra cancelado o se intenta cancelar un contrato ya concretado, lo cual no es posible."
        }

        if (oldStatus == constants.ContractStatusEnum.RESERVED
          || oldStatus == constants.ContractStatusEnum.CONCRETIZED) {
            canCreateReview = true;
        }

        break;

      default:
        invalidParameters = true;
        resMsg = "Error al transicionar: el nuevo estado indicado (" + newStatus + ") no es válido."
        break;
    }

    if(invalidParameters) {
      return res.status(400).jsonExtra({
        ok: false,
        message: resMsg
      });
    }

    // TODO! Crear review si se informo review y/o comment
    // TODO! Las reviews solo pueden ser creadas si el nuevo estado es Reservado, Concretado; o Cancelado y el estado anterior era Reservado.
    // TODO! Calcular reservedAmount y guardarlo en base al 10% del precio de la propiedad. 
    if (canCreateReview) {
      
      let comment = req.body.comment;
      let review = req.body.review;

      if(comment) {
        // TODO! create review
      }
    }

    // TODO! validar estado de propiedad -> Publicada

    contract.status = newStatus;
    contract.save();
    contract.reload();

    // TODO! si el nuevo estado es Reservado, la propiedad debe actualizarse a Reservada
    // TODO! si el nuevo estado es Concretado, la propiedad debe actualizarse a Vendida/Alquilada
    // TODO! si el nuevo estado es Cancelado y la propiedad esta en Reservada, actualizarla a Publicada.
    
    var contractClone = JSON.parse(JSON.stringify(contract));
    delete contractClone.contract_type;
    return res.status(200).jsonExtra({
      ok: true,
      message: "Contrato transicionado.",
      oldStatus: oldStatus,
      newStatus: newStatus,
      data: contractClone
    });

  } catch (error) {
    return res.status(error.status ? error.status : 500).jsonExtra({
      ok: false,
      message: "Error inesperado al transicionar contrato.",
      error: error
    });
  }
};

module.exports = {
  getContracts,
  addContract,
  patchContract
};
