var nodemailer = require("nodemailer");
const { google } = require("googleapis");
const { response } = require("express");
const bcrypt = require("bcrypt");
const { generateJWT, verifyJWT } = require("../helpers/jwt");
const UserRepository = require("../db/repository/UserRepository");

var constants = require("../common/constants");

const path = require("path");

const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_API_KEY,
  process.env.GMAIL_API_SECRET,
  process.env.GMAIL_API_REDIRECT_URI
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GMAIL_API_REFRESH_TOKEN,
});

const signup = async (req, res = response) => {
  try {
    const { firstName, lastName, userType, password, repeatPassword, mail, contactMail, fantasyName, phone, cuit } = req.body;

    if (!constants.RoleEnum.includes(userType)) {
      return res
        .status(400)
        .jsonExtra({
          status: "error",
          message: `'${userType} no es un tipo de usuario valido'`,
        });
    }

    // buscamos por mail
    let user = await UserRepository.getUserByMail(mail);
    if (user != null) {
      return res.status(400).jsonExtra({
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
    const token = await generateJWT({ id: user.id });

    const mailOptions = {
      ...constants.mailoptions,
      from: "myHome",
      to: req.body.mail,
      text:
        `Hola! Te escribimos de myHome. \n
        has registrado una cuenta con este mail, si no fuiste tu, ignoralo. \n
        Sigue este link: http://localhost:8080/v1/users/confirm?token=` + token,
    };

    try {
      const result = await transport.sendMail(mailOptions);

      if (result.accepted.length > 0) {
        return res
          .status(200)
          .jsonExtra({
            result: "ok",
            message: "Revisa tu correo para completar el registro",
          });
      }

      return res.status(500).jsonExtra({ status: "error", message: result.response });
    } catch (error) {
      console.log(error);
      return json.send(error);
    }
  } catch (error) {
    return res.status(500).jsonExtra({
      ok: false,
      message: "Unexpected error",
      stack: error.stack,
    });
  }
};

const confirmSignup = async (req, res = response) => {
  try {
    const token = req.query.token;

    let decoded = await verifyJWT(token);
    if (decoded.err) {
      return res.status(401).jsonExtra({ err: "error decrypt token" });
    }

    UserRepository.getUserByIdUsuario(decoded.id).then(async (user) => {
      if (!user) {
        /* return res
                    .status(401)
                    .jsonExtra({ err: "no existe el usuario" }); */
        return res.sendFile(
          path.resolve("public/signup-complete-fail-02.html")
        );
      }

      let bret = await UserRepository.confirmSignup(decoded.id);
      if (!bret) {
        return res.sendFile(
          path.resolve("public/signup-complete-fail-03.html")
        );
      }

      // const token = await generateJWT({ "idusuario": decoded.idusuario });
      return res.sendFile(path.resolve("public/signup-complete-success.html"));
    });
  } catch (error) {
    return res.status(500).jsonExtra({
      ok: false,
      message: "Unexpected error",
    });
  }
};

// Metodo especifico para obtener cualquier usuario con su Id
const getUser = async (req, res) => {
  try {

    const userId = req.params.id;
    let user = await UserRepository.getUserByIdUsuario(userId);
    if (user == null) {
      return res.status(400).jsonExtra({
        ok: false,
        message: "No se pudo encontrar el usuario.",
      });
    }

    return res
      .status(200)
      .jsonExtra({
        result: "ok",
        data: user
      });

  } catch (error) {
    return res.status(500).jsonExtra({
      ok: false,
      message: "Unexpected error",
      stack: error.stack,
    });
  }
};

// Metodo especifico para obtener el usuario loggeado
const getLoggedUser = async (req, res) => {
  try {

    const userId = req.body.id;
    let user = await UserRepository.getUserByIdUsuario(userId);
    if (user == null) {
      return res.status(400).jsonExtra({
        ok: false,
        message: "No se pudo encontrar el usuario loggeado. Sesion Expirada o el usuario no existe.",
      });
    }

    return res
      .status(200)
      .jsonExtra({
        result: "ok",
        data: user
      });

  } catch (error) {
    return res.status(500).jsonExtra({
      ok: false,
      message: "Unexpected error",
      stack: error.stack,
    });
  }
};

module.exports = {
  signup,
  confirmSignup,
  getLoggedUser,
  getUser
};
