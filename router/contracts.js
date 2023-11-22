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
    getContracts
);

router.post(
    "/", [
    check("contractTypeId", "El ID del tipo de contrato de la propiedad es obligatorio").notEmpty(),
    validateField,
],
    addContract
);

router.patch(
    "/", [


    validateField,
],
    patchContract
);

module.exports = router;