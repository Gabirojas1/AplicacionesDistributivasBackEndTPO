
const { response } = require("express");
const bcrypt = require("bcrypt");
const { generateJWT, verifyJWT } = require("../helpers/jwt");
const UserRepository = require("../db/repository/UserRepository");
const PropertiesRepository = require("../db/repository/PropertiesRepository");

var constants = require("../common/constants");

const path = require("path");

const mailHelper = require("../helpers/mail");


const multimediaHelper = require("../helpers/multimedia");
const Favorite = require("../models/Favorite");
const Property = require("../models/Property");



const signup = async (req, res = response) => {

  let user = null;
  try {
    const { firstName, lastName, userType, password, repeatPassword, mail, contactMail, fantasyName, phone, cuit } = req.body;

    if (!process.env.DEV_ENV) {
      if (userType != constants.UserTypeEnum.INMOBILIARIA) {
        return res
          .status(400)
          .jsonExtra({
            status: "error",
            message: `'${userType} no es un tipo de usuario valido para registrarse a traves de este endpoint. Utilize Google Auth para registrarse como usuario.'`,
          });
      }
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

    let text = `Hola! Te escribimos de myHome! \n
      Has registrado una cuenta con este mail, si no fuiste tu, ignoralo. \n
      Sigue este link: ` + process.env.BACKEND_URI + `/v1/users/confirm?token=` + token;

    const result = await mailHelper.sendMail(req.body.mail, text);
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
      return res.sendFile(
        path.resolve("public/signup-complete-fail-01.html")
      );
    }

    UserRepository.getUserByIdUsuario(decoded.id).then(async (user) => {
      if (!user) {
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
        message: "No autorizado. El usuario no existe, no esta logeado o sesion expirada",
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

// obtiene favoritos del usuario loggeado
const getFavorites = async (req, res) => {
  try {

    const loggedUserId = req.body.id;
    let loggedUser = await UserRepository.getUserByIdUsuario(loggedUserId);
    if (loggedUser == null) {
      return res.status(400).jsonExtra({
        ok: false,
        message: "No se pudo encontrar el usuario loggeado. Sesion Expirada o el usuario no existe.",
      });
    }

    if (loggedUser.userType != constants.UserTypeEnum.USUARIO) {
      return res.status(401).jsonExtra({
        ok: false,
        message: "No autorizado. Solo los usuarios no inmobiliarias pueden tener favoritos.",
      });
    }

    let favorites = await Favorite.findAll({
      where: {userId: loggedUserId},
      include: [{all: true, nested: true}]
    })

    return res
      .status(200)
      .jsonExtra({
        ok: true,
        data: favorites
      });
    
  } catch (error) {
    return res.status(error.status ? error.status : 500).jsonExtra({
      ok: false,
      message: error.message ? error.message : "Error inespetado",
      stack: error.stack,
    });
  }
};

// Agrega property en favoritos de usuario
const addFavorite = async (req, res) => {
  try {

    const loggedUserId = req.body.id;
    let loggedUser = await UserRepository.getUserByIdUsuario(loggedUserId);
    if (loggedUser == null) {
      return res.status(400).jsonExtra({
        ok: false,
        message: "No se pudo encontrar el usuario loggeado. Sesion Expirada o el usuario no existe.",
      });
    }

    if (loggedUser.userType != constants.UserTypeEnum.USUARIO) {
      return res.status(401).jsonExtra({
        ok: false,
        message: "No autorizado. Solo los usuarios no inmobiliarias pueden guardar propiedades en favorito.",
      });
    }

    let property = await PropertiesRepository.getPropertyById(req.body.propertyId);
    if (property == null) {
      return res.status(404).jsonExtra({
        ok: false,
        message: "No se encontro la propiedad.",
      });
    }

    if (property.status != constants.PropertyStateEnum.PUBLICADA) {
      return res.status(400).jsonExtra({
        ok: false,
        message: "No se puede guardar en favoritos una publicacion que no este publicada. Estado actual: " + property.status,
      });
    }

    let fav = await Favorite.findOrCreate({
      where: { userId: loggedUserId, propertyId: property.id },
      defaults: {
        userId: loggedUserId, propertyId: property.id
      },
      include: [{all: true, nested: true}]
    });

    if(fav[0] != null) {
    
      if (fav[1]) {
        await loggedUser.addFavorite(fav[0]);

        return res
        .status(201)
        .jsonExtra({
          ok: true,
          data: fav[0]
        });
      } else {
        return res
        .status(200)
        .jsonExtra({
          ok: true,
          message: "Ya posees la propiedad en favoritos.",
          data: fav[0],
        });
      } 
    }

    return res
      .status(500)
      .jsonExtra({
        ok: false,
        message: "No se pudo agregar a favoritos. Ya existia o error inesperado al crear la relación."
      });
    
  } catch (error) {
    return res.status(error.status ? error.status : 500).jsonExtra({
      ok: false,
      message: error.message ? error.message : "Error inespetado",
      stack: error.stack,
    });
  }
};

// Elimina property de favoritos de usuario
const deleteFavorite = async (req, res) => {
  try {

    const favoriteId = req.body.favoriteId;
    let favorite = await Favorite.findOne({
      where: {favoriteId: favoriteId}
    });

    if (favorite == null) {
      return res
      .status(404)
      .jsonExtra({
        ok: false,
        message: "No existe un favorito con esa id:  " + favoriteId
      });
    }

    // El favorito no le pertenece al usuario loggeado
    if (favorite.userId != req.body.id) {
      return res
      .status(401)
      .jsonExtra({
        ok: false,
        message: "No autorizado: El favorito no te pertenece."
      });
    }

    await favorite.destroy();
    
    return res
      .status(200)
      .jsonExtra({
        ok: true,
        message: "Favorito eliminado!"
      });
  } catch (error) {
    return res.status(error.status ? error.status : 500).jsonExtra({
      ok: false,
      message: error.message ? error.message : "Error inespetado",
      stack: error.stack,
    });
  }
};

module.exports = {
  signup,
  confirmSignup,
  getLoggedUser,
  getUser,
  updateUser,
  getFavorites,
  addFavorite,
  deleteFavorite
};
