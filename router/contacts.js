const { Router } = require("express");
const { check } = require("express-validator");
const { getContacts, addContact, patchContact } = require("../controllers/contacts.js");
const { validateField } = require("../middlewares/fieldValidator.js");

const constants = require('../common/constants.js')

const router = Router();
router.use(require("../middlewares/response.js").jsonExtra);

/*---------- Protected Routes ----------*/
router.use(require("../middlewares/auth.js").decodeUserFromToken);


router.get(
    "/",
    getContacts
);

router.post(
    "/", [
    check("propertyId", "El propertyId es obligatorio").notEmpty(),
    check("statusMessage", "El statusMessage es obligatorio").notEmpty(),
    check("contactType", "El contactType es obligatorio").notEmpty(),
    check("contactType", "El contactType debe ser Visita o Pregunta.").isIn(Object.values(constants.ContactTypeEnum)),

    check("visitDate", "El visitDate debe ser una fecha (e.g, 2023-12-25).").optional().isDate(),

    // TODO! fix validacion
   // check('visitDate', 'La fecha de visita debe estar en el futuro.').optional().isAfter(new Date().toUTCString().toLocaleString().split(',')[0]),


    check("visitTime", "El visitTime debe ser AM o PM.").optional().isIn(Object.values(constants.ContactTimeTypesEnum)),
    validateField,
],
    addContact
);

router.patch(
    "/", [
    check("contactId", "El ID del contacto obligatorio").notEmpty(),
    check("statusMessage", "Debes dejar un mensaje para actualizar el contacto.").notEmpty(),
    check("status", "Debes indicar un nuevo estado.").notEmpty(),
    check("status", "El nuevo estado debe ser valido. (Aceptado, Rechazado, Nueva_Propuesta).")
        .isIn(Object.values(constants.ContactStateEnum).filter(state => state != "Enviado")),

        
 // TODO! fix validacion
    check("visitDate", "El visitDate debe ser una fecha (e.g, 2023-12-25).").optional().isDate(),
    //check('visitDate', 'La fecha de visita debe estar en el futuro.').optional().isAfter(Date.now()),

    check('visitTime', 'El tiempo de visita debe ser AM o PM.').optional().isIn(Object.values(constants.ContactTimeTypesEnum)),

    // TODO! si el estado es Nueva_Propuesta, debe informar VisitDate y visitTime
    validateField,
],
    patchContact
);

module.exports = router;