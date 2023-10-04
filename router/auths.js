const { Router } = require("express");
const { check } = require("express-validator");
const { login, renew, sendOTP, validateOTP, resetPassword  } = require("../controllers/auths");
const { validateField } = require("../middlewares/fieldValidator");

const decodeUserFromToken =
  require("../middlewares/auth.js").decodeUserFromToken;

const router = Router();

router.post(
    "/", [
        check("mail", "El mail es obligatorio").isEmail(),
        check("password", "La password es obligatoria").not().isEmpty(),
        validateField,
    ],
    login
);

/*---------- Protected Routes ----------*/
router.use(decodeUserFromToken);
router.get(
  "/renew",
  renew
);

router.post(
    "/sendOTP", [
        check("mail", "El mail es obligatorio").isEmail(),
        validateField,
    ],
    sendOTP
);

//validar con lucas
router.post(
    "/validateOTP", [
        check("recoverCode", "El codigo es obligatorio").isEmail(),
        validateField,
    ],
    validateOTP
);

router.post(
    "/resetPassword", [
        check("password", "La password es obligatoria").not().isEmpty(),
        validateField,
    ],
    resetPassword
);

module.exports = router;