const { check } = require("express-validator");
const { validateField } = require("../middlewares/fieldValidator.js");
const decodeUserFromToken =  require("../middlewares/auth.js").decodeUserFromToken;
const checkAuth  = require("../middlewares/auth.js").checkAuth;

const { Router } = require("express");

const router = Router();

const propertiesCtrl = require("../controllers/properties.js");


/*---------- Public Routes ----------*/

// obtener properties
router.get("/", propertiesCtrl.getProperties);


/*---------- Protected Routes ----------*/
router.use(decodeUserFromToken);

// obtener properties
router.get("/owned", propertiesCtrl.getOwnedProperties);

// agregar property
router.post("/", 
[
  // check("nombre", "El nombre es obligatorio").not().isEmpty(),
  // check("descripcion", "La descripcion es obligatorio").not().isEmpty(),
  // check("tipo", "El tipo es obligatorio").not().isEmpty(),
  validateField,
],
checkAuth,
propertiesCtrl.addProperty);


// actualizar property
router.patch("/", 
[
  // check("propertyId", "El propertyId es obligatorio").not().isEmpty(),
  // check("nombre", "El nombre es obligatorio").not().isEmpty(),
  // check("descripcion", "La descripcion es obligatorio").not().isEmpty(),
  // check("tipo", "El tipo es obligatorio").not().isEmpty(),
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
