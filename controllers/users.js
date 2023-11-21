
const { response } = require("express");
const bcrypt = require("bcrypt");
const { generateJWT, verifyJWT } = require("../helpers/jwt");
const UserRepository = require("../db/repository/UserRepository");

var constants = require("../common/constants");

const path = require("path");

const mailHelper = require("../helpers/mail");


const multimediaHelper = require("../helpers/multimedia");



const signup = async (req, res = response) => {

  let user = null;
  try {
    const { firstName, lastName, userType, password, repeatPassword, mail, contactMail, fantasyName, phone, cuit } = req.body;

    if (userType != "Inmobiliaria") {
      return res
        .status(400)
        .jsonExtra({
          status: "error",
          message: `'${userType} no es un tipo de usuario valido para registrarse a traves de este endpoint. Utilize Google Auth para registrarse como usuario.'`,
        });
    }

    // buscamos por mail
    user = await UserRepository.getUserByMail(mail);
    if (user != null) {
      return res.status(400).jsonExtra({
        ok: false,
        message: "El usuario ya existe",
      });
    }

    // password y repeatPassword Validation
    if (!password || !repeatPassword
      || password != repeatPassword) {
      return res.status(400).jsonExtra({
        ok: false,
        message: "Las contraseñas no coinciden.",
      });
    }

    // cloudinary (photo upload
    let photo = req.files && req.files["photo"] && req.files["photo"].path;
    if (photo) {
      photo = await multimediaHelper.uploadImage(photo);
    }

    let hash = await bcrypt.hash(password, constants.SALT_ROUNDS);
    user = await UserRepository.signup(
      firstName, lastName, userType, hash, mail, contactMail, fantasyName, phone, cuit, photo
    );

    // TODO axel: hacer que sea un token de un solo uso -- cargar en la db, agregar marca de registro completo, volar de la db.
    const token = await generateJWT({ id: user.id });
    const mailOptions = {
      ...constants.mailoptions,
      from: "myHome",
      to: req.body.mail,
      text:
        `Hola! Te escribimos de myHome! \n
        Has registrado una cuenta con este mail, si no fuiste tu, ignoralo. \n
        Sigue este link: http://localhost:8080/v1/users/confirm?token=` + token,
    };

    const result = await mailHelper.sendMail(mailOptions);
    if (result.accepted.length > 0) {
      return res
        .status(200)
        .jsonExtra({
          result: "ok",
          message: "Revisa tu correo para completar el registro",
        });
    }

    return res.status(500).jsonExtra({ ok: false, status: "error", message: result.response });

  } catch (error) {

    if (user != null) {
        user.destroy();
    }

    return res.status(error.status ? error.status : 500).jsonExtra({
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
    return res.status(error.status ? error.status : 500).jsonExtra({
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
    return res.status(error.status ? error.status : 500).jsonExtra({
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
    return res.status(error.status ? error.status : 500).jsonExtra({
      ok: false,
      message: "Unexpected error",
      stack: error.stack,
    });
  }
};

// Actualiza usuario existente
const updateUser = async (req, res) => {
  const body = req.body;

  try {

    // Obtener el usuario loggeado
    let user = await UserRepository.getUserByIdUsuario(body.id);
    if (!user) {
      return res.status(401).jsonExtra({
        status: "error",
        message: "No autorizado. Usuario no existe, no esta logeado o sesion expirada",
      });
    }

    // validar existencia del mail a insertar
    if (body.mail) {

      // si existe ya un usuario con ese mail y no es el que se intenta actualizar
      let aux = await UserRepository.getUserByMail(body.mail);
      if (aux && aux.id != user.id) {
        return res.status(400).jsonExtra({
          status: "error",
          message: "El mail indicado ya se encuentra en uso."
        });
      }
    }

     // cloudinary (photo upload)
     let photo = req.files && req.files["photo"];
     if (photo) {
      body.photo = await multimediaHelper.uploadImage(photo.path);
     }

    // password hash replacement
    if (body.password) {
      let hash = await bcrypt.hash(body.password, constants.SALT_ROUNDS);
      body.password = hash;
    }

    // TODO! agregar confirmacion por mail antes de insertar nuevos mail y password confirmUpdateUser method.
    // update base user
    let result = await UserRepository.updateUser(user, body);
    if (!result) {
      return res.status(500).jsonExtra({
        status: "error",
        message: "unexpected error at updateUser"
      });
    }

    return res.status(200).jsonExtra({
      status: "ok",
      message: "usuario actualizado",
      data: result,
    });
  } catch (e) {
    return res
      .status(e.status ? e.status : 500)
      .jsonExtra({ status: e.status ? e.status : 500, message: e.message });
  }
};

module.exports = {
  signup,
  confirmSignup,
  getLoggedUser,
  getUser,
  updateUser
};
