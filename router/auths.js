const { Router } = require("express");
const { check } = require("express-validator");
const { login, renew, sendOTP, validateOTP, resetPassword } = require("../controllers/auths");
const { validateField } = require("../middlewares/fieldValidator");

const router = Router();
router.use(require("../middlewares/response").jsonExtra);

router.post(
    "/", [
    check("mail", "El mail es obligatorio").isEmail(),
    check("password", "La password es obligatoria").not().isEmpty(),
    validateField,
],
    login
);

/*---------- Protected Routes ----------*/
router.use(require("../middlewares/auth.js").decodeUserFromToken);
router.put(
    "/",
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