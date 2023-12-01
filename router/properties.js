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
   check("title", "El título es obligatorio").notEmpty(),
   check("description", "La descripción es obligatoria").notEmpty(),
   check("propertyType", "El tipo de propiedad es obligatorio ").notEmpty(),
   check("propertyType", "El tipo de propiedad debe ser Casa, Departamento, PH, Terreno o Local Comrecial").isIn(Object.values(constants.PropertyTypeEnum)),
   check("position", "La posición debe ser Frente, Contrafrente, Interno o Lateral").optional().isIn(Object.values(constants.PositionEnum)),
   check("orientation", "La orientación debe ser N, S, E, O, SE, SO, NO, o NE").optional().isIn(Object.values(constants.OrientationEnum)),
   check("antiquity", "La antiguedad debe ser un entero").optional().isInt(),
   check("mtsCovered", "Los metros cubiertos debe ser un entero").optional().isInt(),
   check("mtsHalfCovered", "Los metros semicubiertos debe ser un entero").optional().isInt(),
   check("mtsUncovered", "Los metros descubiertos debe ser un entero").optional().isInt(),
   check("numEnvironments", "El número de ambientes debe ser un entero").optional().isInt(),
   check("numRooms", "El número de habitaciones debe ser un entero").optional().isInt(),
   check("numBathrooms", "El número de baños debe ser un entero").optional().isInt(),
   check("numCars", "El número de cocheras debe ser un entero").optional().isInt(),

   // Validacion contract_types array
   check("contract_types", "Los tipos de contrato deben  ser un array de objetos").optional().isArray(),

   check("contract_types.*.contractType", "El tipo de contrato es obligatorio para dar de alta un tipo de contrato de propiedad.").notEmpty(),
   check("contract_types.*.contractType", "El tipo de contrato debe ser un tipo valido (e.g, Venta, Alquiler, Temporada).").isIn(Object.values(constants.ContractTypeEnum)),

   

   check("contract_types.*.price", "El precio es obligatorio para dar de alta un tipo de contrato de propiedad.").notEmpty(),
   check("contract_types.*.price", "El precio debe ser un valor de coma flotante.").isFloat(),

   check("contract_types.*.expPrice", "Las expensas son obligatorias para dar de alta un tipo de contrato de propiedad.").notEmpty(),
   check("contract_types.*.expPrice", "Las expensas deben ser un valor de coma flotante.").isFloat(),

   check("contract_types.*.currency", "La moneda es obligatoria para dar de alta un tipo de contrato de propiedad.").notEmpty(),
   check("contract_types.*.currency", "La moneda debe ser un tipo valido (e.g, AR$, US$).").isIn(Object.values(constants.CurrencyTypeEnum)),


  validateField,
],
checkAuth,
propertiesCtrl.addProperty);


// actualizar property
router.patch("/", 
[

  check("propertyType", "El tipo de propiedad debe ser Casa, Departamento, PH, Terreno o Local Comrecial").optional().isIn(Object.values(constants.PropertyTypeEnum)),
  check("position", "La posición debe ser Frente, Contrafrente, Interno o Lateral").optional().isIn(Object.values(constants.PositionEnum)),
  check("orientation", "La orientación debe ser N, S, E, O, SE, SO, NO, o NE").optional().isIn(Object.values(constants.OrientationEnum)),
  check("antiquity", "La antiguedad debe ser un entero").optional().isInt(),
  check("mtsCovered", "Los metros cubiertos debe ser un entero").optional().isInt(),
  check("mtsHalfCovered", "Los metros semicubiertos debe ser un entero").optional().isInt(),
  check("mtsUncovered", "Los metros descubiertos debe ser un entero").optional().isInt(),
  check("numEnvironments", "El número de ambientes debe ser un entero").optional().isInt(),
  check("numRooms", "El número de habitaciones debe ser un entero").optional().isInt(),
  check("numBathrooms", "El número de baños debe ser un entero").optional().isInt(),
  check("numCars", "El número de cocheras debe ser un entero").optional().isInt(),

  check("status", "El nuevo estado solo puede ser Publicada. Para despublicar, utilize DELETE /v1/properties y para reservarla utilice /v1/contracts como usuario.")
  .optional().equals(constants.PropertyStateEnum.PUBLICADA),

  // Validacion contract_types array
  check("contract_types", "Los tipos de contrato deben ser un array de objetos").optional().isArray(),

  check("contract_types.*.contractType", "El tipo de contrato es obligatorio para dar de alta un contrato de propiedad.").notEmpty(),
  check("contract_types.*.contractType", "El tipo de contrato debe ser un tipo valido (e.g, Venta, Alquiler, Temporada).").isIn(Object.values(constants.ContractTypeEnum)),

  check("contract_types.*.price", "El precio es obligatorio para dar de alta un tipo de contrato de propiedad.").notEmpty(),
  check("contract_types.*.price", "El precio debe ser un valor de coma flotante.").isFloat(),

  check("contract_types.*.expPrice", "Las expensas son obligatorias para dar de alta un tipo de contrato de propiedad.").notEmpty(),
  check("contract_types.*.expPrice", "Las expensas deben ser un valor de coma flotante.").isFloat(),

  check("contract_types.*.currency", "La moneda es obligatoria para dar de alta un tipo de contrato de propiedad.").notEmpty(),
  check("contract_types.*.currency", "La moneda debe ser un tipo valido (e.g, AR$, US$).").isIn(Object.values(constants.CurrencyTypeEnum)),

  validateField,
],
checkAuth,
propertiesCtrl.updateProperty);

// actualizar property
router.put("/", 
[

  check("propertyType", "El tipo de propiedad debe ser Casa, Departamento, PH, Terreno o Local Comrecial").optional().isIn(Object.values(constants.PropertyTypeEnum)),
  check("position", "La posición debe ser Frente, Contrafrente, Interno o Lateral").optional().isIn(Object.values(constants.PositionEnum)),
  check("orientation", "La orientación debe ser N, S, E, O, SE, SO, NO, o NE").optional().isIn(Object.values(constants.OrientationEnum)),
  check("antiquity", "La antiguedad debe ser un entero").optional().isInt(),
  check("mtsCovered", "Los metros cubiertos debe ser un entero").optional().isInt(),
  check("mtsHalfCovered", "Los metros semicubiertos debe ser un entero").optional().isInt(),
  check("mtsUncovered", "Los metros descubiertos debe ser un entero").optional().isInt(),
  check("numEnvironments", "El número de ambientes debe ser un entero").optional().isInt(),
  check("numRooms", "El número de habitaciones debe ser un entero").optional().isInt(),
  check("numBathrooms", "El número de baños debe ser un entero").optional().isInt(),
  check("numCars", "El número de cocheras debe ser un entero").optional().isInt(),

  // Validacion contract_types array
  check("contract_types", "Los tipos de contrato deben ser un array de objetos").optional().isArray(),

  check("contract_types.*.contractType", "El tipo de contrato es obligatorio para dar de alta un contrato de propiedad.").notEmpty(),
  check("contract_types.*.contractType", "El tipo de contrato debe ser un tipo valido (e.g, Venta, Alquiler, Temporada).").isIn(Object.values(constants.ContractTypeEnum)),

  check("contract_types.*.price", "El precio es obligatorio para dar de alta un tipo de contrato de propiedad.").notEmpty(),
  check("contract_types.*.price", "El precio debe ser un valor de coma flotante.").isFloat(),

  check("contract_types.*.expPrice", "Las expensas son obligatorias para dar de alta un tipo de contrato de propiedad.").notEmpty(),
  check("contract_types.*.expPrice", "Las expensas deben ser un valor de coma flotante.").isFloat(),

  check("contract_types.*.currency", "La moneda es obligatoria para dar de alta un tipo de contrato de propiedad.").notEmpty(),
  check("contract_types.*.currency", "La moneda debe ser un tipo valido (e.g, AR$, US$).").isIn(Object.values(constants.CurrencyTypeEnum)),

  validateField,
],
checkAuth,
propertiesCtrl.updateProperty);


// eliminar property
router.delete("/", 
[
  check("propertyId", "El id de la propiedad es obligatorio").not().isEmpty(),
  validateField,
],
checkAuth,
propertiesCtrl.deleteProperty);

module.exports = router;
