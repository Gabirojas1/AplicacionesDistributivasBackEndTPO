const { Router } = require("express");
const { check } = require("express-validator");
const { authGoogle  } = require("../controllers/authGoogle");
const { validateField } = require("../middlewares/fieldValidator");

const router = Router();

router.post(
    "/",
    authGoogle
);

module.exports = router;