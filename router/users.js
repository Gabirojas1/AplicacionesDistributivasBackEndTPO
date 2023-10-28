const { Router } = require("express");
const { check } = require("express-validator");
const { signup, confirmSignup, getLoggedUser, getUser  } = require("../controllers/users");
const { validateField } = require("../middlewares/fieldValidator");

const router = Router();
router.use(require("../middlewares/response").jsonExtra);

router.post(
    "/", [
        // check("nickname", "El nickname es obligatorio").not().isEmpty(),
        // check("mail", "El mail es obligatorio").not().isEmpty(),
        // check("tipo_usuario", "tipo_usuario es obligatorio").not().isEmpty(),
        // check("password", "password es obligatorio").not().isEmpty(),
        // check("repeatPassword", "El repetir contraseña es obligatorio").not().isEmpty(),
        validateField,
    ],
    signup
);

router.get(
  "/confirm", [
      // check("nickname", "El nickname es obligatorio").not().isEmpty(),
      // check("mail", "El mail es obligatorio").not().isEmpty(),
      // check("tipo_usuario", "tipo_usuario es obligatorio").not().isEmpty(),
      // check("password", "password es obligatorio").not().isEmpty(),
      // check("repeatPassword", "El repetir contraseña es obligatorio").not().isEmpty(),
      validateField,
  ],
  confirmSignup
);

router.get(
  "/id/:id", [
      validateField,
  ],
  getUser
);


/*---------- Protected Routes ----------*/
router.use(require("../middlewares/auth.js").decodeUserFromToken);

router.get(
  "/me", [
      validateField,
  ],
  getLoggedUser
);

module.exports = router;