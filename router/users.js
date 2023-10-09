const { Router } = require("express");
const { check } = require("express-validator");
const { createUser  } = require("../controllers/users");
const { validateField } = require("../middlewares/fieldValidator");

const decodeUserFromToken =
  require("../middlewares/auth.js").decodeUserFromToken;

const router = Router();

router.post(
    "/", [
        // check("nickname", "El nickname es obligatorio").not().isEmpty(),
        // check("mail", "El mail es obligatorio").not().isEmpty(),
        // check("tipo_usuario", "tipo_usuario es obligatorio").not().isEmpty(),
        // check("password", "password es obligatorio").not().isEmpty(),
        // check("repeatPassword", "El repetir contraseña es obligatorio").not().isEmpty(),
        validateField,
    ],
    createUser
);


/*---------- Protected Routes ----------*/
router.use(decodeUserFromToken);

module.exports = router;