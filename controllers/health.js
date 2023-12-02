const { response } = require("express");
const { sq } = require('../db/database.js');


const healtCheck = async (req, res = response) => {

  try {
    // Validate Sequelize
    await sq.authenticate();
    return res.status(200).jsonExtra({
      ok: true,
      message: "All OK!",
    });
  } catch (error) {
    return res.status(error.status ? error.status : 500).jsonExtra({
      ok: false,
      message: "Error: " + error,
    });
  }
};


module.exports = {
  healtCheck
};