const { check } = require("express-validator");
const { validateField } = require("../middlewares/fieldValidator.js");
const checkAuth  = require("../middlewares/auth.js").checkAuth;
const propertiesCtrl = require("../controllers/properties.js");

const { Router } = require("express");

const constants = require("../common/constants.js");

const router = Router();
router.use(require("../middlewares/response").jsonExtra);




/*---------- Public Routes ----------*/

// obtener properties
router.get("/", propertiesCtrl.getProperties);


/*---------- Protected Routes ----------*/
router.use(require("../middlewares/auth.js").decodeUserFromToken);

// obtener properties
router.get("/owned", propertiesCtrl.getOwnedProperties);

// agregar property
router.post("/", 
[
   check("title", "title es obligatorio").notEmpty(),
   check("description", "description es obligatoria").notEmpty(),
   check("propertyType", "propertyType es obligatorio ").notEmpty(),
   check("propertyType", "propertyType debe ser Casa, Departamento, PH, Terreno o Local Comrecial").isIn(Object.values(constants.PropertyTypeEnum)),
   check("position", "position debe ser Frente, Contrafrente, Interno o Lateral").optional().isIn(Object.values(constants.PositionEnum)),
   check("orientation", "orientation debe ser N, S, E, O, SE, SO, NO, o NE").optional().isIn(Object.values(constants.OrientationEnum)),
   check("antiquity", "antiquity debe ser un entero").isInt(),
   check("mtsCovered", "mtsCovered debe ser un entero").isInt(),
   check("mtsHalfCovered", "mtsHalfCovered debe ser un entero").isInt(),
   check("mtsUncovered", "mtsUncovered debe ser un entero").isInt(),
   check("numEnvironments", "numEnvironments debe ser un entero").isInt(),
   check("numRooms", "numRooms debe ser un entero").isInt(),
   check("numBathrooms", "numBathrooms debe ser un entero").isInt(),
   check("numCars", "numCars debe ser un entero").isInt(),

   // Validacion contract_types array
   check("contract_types", "contract_types debe ser un array de objetos").optional().isArray(),

   check("contract_types.*.contractType", "contractType es obligatorio para dar de alta un tipo de contrato de propiedad.").notEmpty(),
   check("contract_types.*.contractType", "contractType debe ser un tipo valido (e.g, Venta, Alquiler, Temporada).").isIn(Object.values(constants.ContractTypeEnum)),

   

   check("contract_types.*.price", "price es obligatorio para dar de alta un tipo de contrato de propiedad.").notEmpty(),
   check("contract_types.*.price", "price debe ser un valor de coma flotante.").isFloat(),

   check("contract_types.*.expPrice", "expPrice es obligatorio para dar de alta un tipo de contrato de propiedad.").notEmpty(),
   check("contract_types.*.expPrice", "expPrice debe ser un valor de coma flotante.").isFloat(),

   check("contract_types.*.currency", "currency es obligatorio para dar de alta un tipo de contrato de propiedad.").notEmpty(),
   check("contract_types.*.currency", "currency debe ser un tipo valido (e.g, AR$, US$).").isIn(Object.values(constants.CurrencyTypeEnum)),


  validateField,
],
checkAuth,
propertiesCtrl.addProperty);


// actualizar property
router.patch("/", 
[

  check("propertyType", "propertyType debe ser Casa, Departamento, PH, Terreno o Local Comrecial").optional().isIn(Object.values(constants.PropertyTypeEnum)),
  check("position", "position debe ser Frente, Contrafrente, Interno o Lateral").optional().isIn(Object.values(constants.PositionEnum)),
  check("orientation", "orientation debe ser N, S, E, O, SE, SO, NO, o NE").optional().isIn(Object.values(constants.OrientationEnum)),
  check("antiquity", "antiquity debe ser un entero").isInt(),
  check("mtsCovered", "mtsCovered debe ser un entero").isInt(),
  check("mtsHalfCovered", "mtsHalfCovered debe ser un entero").isInt(),
  check("mtsUncovered", "mtsUncovered debe ser un entero").isInt(),
  check("numEnvironments", "numEnvironments debe ser un entero").isInt(),
  check("numRooms", "numRooms debe ser un entero").isInt(),
  check("numBathrooms", "numBathrooms debe ser un entero").isInt(),
  check("numCars", "numCars debe ser un entero").isInt(),

  // Validacion contract_types array
  check("contract_types", "contract_types debe ser un array de objetos").optional().isArray(),

  check("contract_types.*.contractType", "contractType es obligatorio para dar de alta un tipo de contrato de propiedad.").notEmpty(),
  check("contract_types.*.contractType", "contractType debe ser un tipo valido (e.g, Venta, Alquiler, Temporada).").isIn(Object.values(constants.ContractTypeEnum)),

  check("contract_types.*.price", "price es obligatorio para dar de alta un tipo de contrato de propiedad.").notEmpty(),
  check("contract_types.*.price", "price debe ser un valor de coma flotante.").isFloat(),

  check("contract_types.*.expPrice", "expPrice es obligatorio para dar de alta un tipo de contrato de propiedad.").notEmpty(),
  check("contract_types.*.expPrice", "expPrice debe ser un valor de coma flotante.").isFloat(),

  check("contract_types.*.currency", "currency es obligatorio para dar de alta un tipo de contrato de propiedad.").notEmpty(),
  check("contract_types.*.currency", "currency debe ser un tipo valido (e.g, AR$, US$).").isIn(Object.values(constants.CurrencyTypeEnum)),

  validateField,
],
checkAuth,
propertiesCtrl.updateProperty);


// eliminar property
router.delete("/", 
[
  check("propertyId", "El propertyId es obligatorio").not().isEmpty(),
  validateField,
],
checkAuth,
propertiesCtrl.deleteProperty);

module.exports = router;
