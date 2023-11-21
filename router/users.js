const { Router } = require("express");
const { check } = require("express-validator");
const { signup, confirmSignup, getLoggedUser, getUser, updateUser, addFavorite, getFavorites, deleteFavorite  } = require("../controllers/users");
const { validateField } = require("../middlewares/fieldValidator");
const checkAuth  = require("../middlewares/auth.js").checkAuth;

const constants = require('../common/constants');


const router = Router();
router.use(require("../middlewares/response").jsonExtra);

router.post(
    "/", [
        check("firstName", "El nombre es obligatorio").notEmpty(),
        check("lastName", "El apellido es obligatorio").notEmpty(),
        check("userType", "El tipo de usuario es obligatorio").notEmpty(),
        check("userType", "El tipo de usuario debe ser Inmobiliaria o Usuario").isIn(Object.values(constants.UserTypeEnum)),
        check("password", "La contraseña es obligatorio").notEmpty(),
        check("repeatPassword", "El repetir contraseña es obligatorio").notEmpty(),
        check("mail", "El mail es obligatorio").notEmpty(),
        check("contactMail", "El mail de contacto es obligatorio").notEmpty(),
        check("contactMail", "El mail de contacto debe tener formato de mail").isEmail(),
        check("fantasyName", "El nombre de fantasía es obligatorio").notEmpty(),
        check("phone", "El teléfono es obligatorio").notEmpty(),
        check("phone", "El teléfono debe tener un formato de celular (e.g, +5491199999999).").isMobilePhone(),
        check("cuit", "El cuit es obligatorio").notEmpty(), // TODO! validar cuit format regex
        check("status", "El estado no se puede indicar en registro.").not().exists(),
       
        validateField,
    ],
    signup
);

router.get(
  "/confirm",
  confirmSignup
);

router.get(
  "/id/:id",
  getUser
);


/*---------- Protected Routes ----------*/
router.use(require("../middlewares/auth.js").decodeUserFromToken);

router.get(
  "/me",
  checkAuth,
  getLoggedUser
);

router.put(
  "/",
  [
        check("firstName", "El nombre es obligatorio").notEmpty(),
        check("lastName", "El apellido es obligatorio").notEmpty(),
        check("password", "La contraseña es obligatoria").notEmpty(),
        check("mail", "El mail es obligatorio").notEmpty(),
        check("mail", "El mail debe tener formato de mail (e.g, mail@outlook.com)").isEmail(),
        check("contactMail", "El mail de contacto debe tener formato de mail (e.g, mail@outlook.com)").optional().isEmail(),
        check("phone", "El teléfono es obligatorio").notEmpty(),
        check("phone", "El teléfono debe tener un formato de celular (e.g, +5491199999999).").isMobilePhone(),
        check("status", "El estado no se puede modificar por PUT, use PATCH.").not().exists(),
        check("photo", "La foto no se puede modificar por PUT, use PATCH.").not().exists(),
    validateField,
  ],
  checkAuth,
  updateUser
);

router.patch(
  "/",
  [
        check("mail", "El mail debe tener formato de mail (e.g, mail@outlook.com)").optional().isEmail(),
        check("contactMail", "El mail de contacto debe tener formato de mail (e.g, mail@outlook.com)").optional().isEmail(),
        check("phone", "El teléfono debe tener un formato de celular (e.g, +5491199999999).").optional().isMobilePhone(),
        // se puede pasar de deactivated a confirmed o viceversa
        check("status", "El estado debe ser Confirmed o Deactivated").optional().isIn(Object.values(constants.UserStateEnum).filter(state => state != "Initial")),
    validateField,
  ],
  checkAuth,
  updateUser
);

router.get(
  "/favs",
  checkAuth,
  getFavorites
);

router.post(
  "/favs",
  [
    check("propertyId", "El propertyId es obligatorio.").notEmpty(),
    validateField,
  ],
  checkAuth,
  addFavorite
);

router.delete(
  "/favs/:id",
  checkAuth,
  deleteFavorite
);

module.exports = router;