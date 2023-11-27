const { Router } = require("express");
const { check } = require("express-validator");
const { getContracts, addContract } = require("../controllers/contracts.js");
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
    check("review", "La review solo puede ser Positiva o Negativa.").optional().isIn(Object.values(constants.ReviewTypesEnum)),
    validateField,
],
    addContract
);

module.exports = router;