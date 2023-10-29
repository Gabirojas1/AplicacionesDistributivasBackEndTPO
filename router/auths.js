const { Router } = require("express");
const { check } = require("express-validator");
const { login, renew, forgotPassword, resetPassword } = require("../controllers/auths");
const { validateField } = require("../middlewares/fieldValidator");

const router = Router();
router.use(require("../middlewares/response").jsonExtra);

router.post(
    "/", [
    check("mail", "El mail es obligatorio").isEmail(),
    check("password", "La password es obligatoria").notEmpty(),
    validateField,
],
    login
);

router.post(
    "/forgotPassword", [
    check("mail", "mail es obligatorio").notEmpty(),
    check("mail", "mail debe tener formato de email (e.g, example@my.home)").isEmail(),
    validateField,
],
forgotPassword
);

router.post(
    "/resetPassword", [
    check("password", "password es obligatoria").notEmpty(),
    check("repeatPassword", "repeatPassword es obligatoria").notEmpty(),
    check("otp", "otp es obligatorio").notEmpty(),
    check("otp", "otp es un entero de 6 digitos").isInt(), // TODO! validar 6 digitos
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