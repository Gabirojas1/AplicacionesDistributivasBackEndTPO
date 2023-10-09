var nodemailer = require("nodemailer");
const { google } = require("googleapis");
const { response } = require("express");
const bcrypt = require("bcrypt");
const { generateJWT } = require("../helpers/jwt");
const UserRepository = require("../db/repository/UserRepository");

var constants = require("../common/constants");

const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_API_KEY,
  process.env.GMAIL_API_SECRET,
  process.env.GMAIL_API_REDIRECT_URI
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GMAIL_API_REFRESH_TOKEN,
});

const createUser = async (req, res = response) => {
  try {
    const { firstName, lastName, userType, password, repeatPassword, mail, contactMail, fantasyName, phone, cuit } =  req.body;

    if (!constants.RoleEnum.includes(userType)) {
      return res
        .status(400)
        .json({
          status: "error",
          message: `'${userType} no es un tipo de usuario valido'`,
        });
    }

    // buscamos por mail
    let user = await UserRepository.getUserByMail(mail);
    if (user != null) {
        return res.status(400).json({
            ok: false,
            message: "El usuario ya existe",
        });
    }

    // TODO validate repeatPassword

    let hash = await bcrypt.hash(password, constants.SALT_ROUNDS);
    user = await UserRepository.signup(
      firstName, lastName, userType, hash, mail, contactMail, fantasyName, phone, cuit
    );

    const accessToken = await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        ...constants.auth,
        accessToken: accessToken,
      },
    });

    // TODO axel: hacer que sea un token de un solo uso -- cargar en la db, agregar marca de registro completo, volar de la db.
    const token = await generateJWT({ idUsuario: user.idUsuario });

    const mailOptions = {
      ...constants.mailoptions,
      from: "myHome",
      to: req.body.mail,
      text:
        `Hola! Te escribimos de myHome. \n
        has registrado una cuenta con este mail, si no fuiste tu, ignoralo. \n
        Sigue este link: http://localhost:8080/auth/complete?token=` + token,
    };

    try {
      const result = await transport.sendMail(mailOptions);

      if (result.accepted.length > 0) {
        return res
          .status(200)
          .json({
            result: "ok",
            message: "Revisa tu correo para completar el registro",
          });
      }

      return res.status(500).json({ status: "error", message: result.response });
    } catch (error) {
      console.log(error);
      return json.send(error);
    }
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Unexpected error",
      stack: error.stack,
    });
  }
};


module.exports = {
  createUser
};
