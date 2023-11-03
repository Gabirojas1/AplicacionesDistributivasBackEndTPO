const { Router } = require("express");
const { authGoogle  } = require("../controllers/authGoogle");

const router = Router();
router.use(require("../middlewares/response").jsonExtra);

router.post(
    "/",
    authGoogle
);

module.exports = router;