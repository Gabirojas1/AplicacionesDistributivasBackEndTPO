const { Router } = require("express");
const { check } = require("express-validator");
const { login, renew, forgotPassword, resetPassword } = require("../controllers/auths");
const { validateField } = require("../middlewares/fieldValidator");

const router = Router();
router.use(require("../middlewares/response").jsonExtra);

router.post(
    "/", [
    check("mail", "El mail es obligatorio").isEmail(),
    check("password", "La contraseña es obligatoria").notEmpty(),
    validateField,
],
    login
);

router.post(
    "/forgotPassword", [
    check("mail", "El mail es obligatorio").notEmpty(),
    check("mail", "El mail debe tener formato de email (e.g, example@my.home)").isEmail(),
    validateField,
],
forgotPassword
);

router.post(
    "/resetPassword", [
    check("password", "La contraseña es obligatoria").notEmpty(),
    check("repeatPassword", "El repetir contraseña es obligatorio").notEmpty(),
    check("otp", "El otp es obligatorio").notEmpty(),
    check("otp", "El otp debe ser un entero de 6 digitos").isInt(), // TODO! validar 6 digitos
    validateField,
],
    resetPassword
);

/*---------- Protected Routes ----------*/
router.use(require("../middlewares/auth.js").decodeUserFromToken);
router.put(
    "/",
    renew
);

module.exports = router;