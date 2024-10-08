const { response } = require("express");
const { generateJWT } = require("../helpers/jwt");
const UserRepository = require("../db/repository/UserRepository");
const {OAuth2Client} = require('google-auth-library');
const {  UserStateEnum, UserTypeEnum, auth, DEFAULT_PASSWORD, SALT_ROUNDS} = require('../common/constants.js');

const bcrypt = require("bcrypt");

const client = new OAuth2Client();

const authGoogle = async (req, res = response) => {

const token = req.headers.authorization

  if (!token) {
    return res.status(401).jsonExtra({
         error: 'Token no proporcionado' 
        })
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: auth.webClientId
    });

    const payload = ticket.getPayload();

    const pw = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
    
    const usuario = await UserRepository.findOrCreate(
        payload.given_name,
        payload.family_name, 
        UserTypeEnum.USUARIO,
        payload.email,
        payload.picture,
        pw,
        UserStateEnum.CONFIRMED
    );
    
    if (!usuario) {
      return res.status(400).jsonExtra({
        ok: false,
        message: "Credenciales invalidas.",
      });
    }

    // Generate JWT
    const tokenSend = await generateJWT(usuario.id);
    return res.status(200).jsonExtra({
      ok: true,
      tokenSend,
    });
  } catch (error) {
    return res.status(error.status ? error.status : 500).jsonExtra({
      ok: false,
      message: "Error: " + error,
    });
  }
};


module.exports = {
  authGoogle
};