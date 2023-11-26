const { Router } = require("express");
const { check } = require("express-validator");
const { getContracts, addContract, patchContract } = require("../controllers/contracts.js");
const { validateField } = require("../middlewares/fieldValidator.js");

const constants = require('../common/constants.js')

const router = Router();
router.use(require("../middlewares/response.js").jsonExtra);

/*---------- Protected Routes ----------*/
router.use(require("../middlewares/auth.js").decodeUserFromToken);


router.get(
    "/",
    [
        check("propertyId", "propertyId debe ser un entero.").optional().isInt(),
        validateField,
    ],
    getContracts
);

router.post(
    "/", [
    check("contractTypeId", "contractTypeId es obligatorio").notEmpty(),
    validateField,
],
    addContract
);

router.patch(
    "/", [
        check("contractId", "contractId es obligatorio").notEmpty(),
        check("contractId", "contractId debe ser un entero").isInt(),

        check("newStatus", "El nuevo estado es obligatorio.").notEmpty(),
        check("newStatus", "El nuevo estado debe ser como minimo Reservado, Concretado o Cancelado.").isIn(Object.values(constants.ContractStatusEnum).filter(state => state != "Iniciado")),

        check("reservedAmount", "El monto de reserva debe ser un entero").optional().isInt(),

        check("review", "La review solo puede ser Positiva o Negativa.").optional().isIn(Object.values(constants.ReviewTypesEnum)),
        validateField,
    ],
    patchContract
);

module.exports = router;