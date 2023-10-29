const { Router } = require("express");
const { check } = require("express-validator");
const { signup, confirmSignup, getLoggedUser, getUser, updateUser  } = require("../controllers/users");
const { validateField } = require("../middlewares/fieldValidator");
const checkAuth  = require("../middlewares/auth.js").checkAuth;

const constants = require('../common/constants');


const router = Router();
router.use(require("../middlewares/response").jsonExtra);

router.post(
    "/", [
        check("firstName", "firstName es obligatorio").notEmpty(),
        check("lastName", "lastName es obligatorio").notEmpty(),
        check("userType", "userType es obligatorio").notEmpty(),
        check("userType", "userType debe ser Inmobiliaria o Usuario").isIn(Object.values(constants.UserTypeEnum)),
        check("password", "password es obligatorio").notEmpty(),
        check("repeatPassword", "El repetir contraseña es obligatorio").notEmpty(),
        check("mail", "mail es obligatorio").notEmpty(),
        check("contactMail", "contactMail es obligatorio").notEmpty(),
        check("contactMail", "contactMail debe tener formato de mail").isEmail(),
        check("fantasyName", "fantasyName es obligatorio").notEmpty(),
        check("phone", "phone es obligatorio").notEmpty(),
        check("phone", "phone es debe tener un formato de celular (e.g, +5491199999999).").isMobilePhone(),
        check("cuit", "cuit es obligatorio").notEmpty(), // TODO! validar cuit format regex
        check("status", "status no se puede indicar en registro.").not().exists(),
       
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
        check("firstName", "firstName es obligatorio").notEmpty(),
        check("lastName", "lastName es obligatorio").notEmpty(),
        check("password", "password es obligatorio").notEmpty(),
        check("mail", "mail es obligatorio").notEmpty(),
        check("mail", "mail debe tener formato de mail").isEmail(),
        check("contactMail", "contactMail debe tener formato de mail (e.g, mail@outlook.com)").optional().isEmail(),
        check("phone", "phone es obligatorio").notEmpty(),
        check("phone", "phone es debe tener un formato de celular (e.g, +5491199999999).").isMobilePhone(),
        check("status", "status no se puede modificar por PUT, use PATCH.").not().exists(),
        check("photo", "photo no se puede modificar por PUT, use PATCH.").not().exists(),
    validateField,
  ],
  checkAuth,
  updateUser
);

router.patch(
  "/",
  [
        check("mail", "mail debe tener formato de mail").optional().isEmail(),
        check("contactMail", "contactMail debe tener formato de mail (e.g, mail@outlook.com)").optional().isEmail(),
        check("phone", "phone es debe tener un formato de celular (e.g, +5491199999999).").optional().isMobilePhone(),
        // se puede pasar de deactivated a confirmed o viceversa
        check("status", "status debe ser Confirmed o Deactivated").optional().isIn(Object.values(constants.UserStateEnum).filter(state => state != "Initial")),
    validateField,
  ],
  checkAuth,
  updateUser
);

module.exports = router;