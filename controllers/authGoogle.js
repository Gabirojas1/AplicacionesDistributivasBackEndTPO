const { response } = require("express");
const { generateJWT } = require("../helpers/jwt");
const UserRepository = require("../db/repository/UserRepository");
const {OAuth2Client} = require('google-auth-library');

var constants = require("../common/constants");

const client = new OAuth2Client();

const authGoogle = async (req, res = response) => {

const token = req.headers.authorization

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' })
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: constants.auth.clientId
    });
    const payload = ticket.getPayload();

    const usuario = await UserRepository.findOrCreate(
        payload[given_name],
        payload[family_name], 
        constants.RoleEnum.User,
        payload[email],
        payload[picture]
    );
    
    if (!usuario) {
      return res.status(400).json({
        ok: false,
        message: "Credenciales invalidas.",
      });
    }

    // Generate JWT
    const tokenSend = await generateJWT(usuario.id);
    return res.json({
      ok: true,
      tokenSend,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error: " + error,
    });
  }
};


module.exports = {
  authGoogle
};