const { validationResult } = require("express-validator");

const validateField = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).jsonExtra({
      ok: false,
      errors: errors.mapped(),
    });
  }
  next();
};

module.exports = {
  validateField,
};
