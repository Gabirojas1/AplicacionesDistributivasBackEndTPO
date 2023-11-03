const { response } = require("express");
const { generateJWT } = require("../helpers/jwt");
const UserRepository = require("../db/repository/UserRepository");
const {OAuth2Client} = require('google-auth-library');
const {  UserStateEnum, RoleEnum, auth, DEFAULT_PASSWORD} = require('../common/constants.js');

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
    
    const usuario = await UserRepository.findOrCreate(
        payload.given_name,
        payload.family_name, 
        RoleEnum[0],
        payload.email,
        payload.picture,
        DEFAULT_PASSWORD,
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
    return res.status(500).jsonExtra({
      ok: false,
      message: "Error: " + error,
    });
  }
};


module.exports = {
  authGoogle
};