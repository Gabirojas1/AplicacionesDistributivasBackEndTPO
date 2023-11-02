const { Router } = require("express");
const { check } = require("express-validator");
const { authGoogle  } = require("../controllers/authGoogle");
const { validateField } = require("../middlewares/fieldValidator");

const router = Router();

router.post(
    "/", [
        check("mail", "El mail es obligatorio").isEmail(),
        validateField,
    ],
    authGoogle
);

module.exports = router;