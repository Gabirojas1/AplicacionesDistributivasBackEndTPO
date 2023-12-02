const { Router } = require("express");
const { healtCheck  } = require("../controllers/health.js");

const router = Router();
router.use(require("../middlewares/response").jsonExtra);

router.get(
    "/",
    healtCheck
);


module.exports = router;