const { response } = require("express");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const { generateJWT } = require("../helpers/jwt");
const UserRepository = require("../db/repository/UserRepository");

var constants = require("../common/constants");

const mailHelper = require("../helpers/mail")

const login = async (req, res = response) => {
  const { mail, password } = req.body;

  console.log("login received");

  try {
    const usuario = await UserRepository.getUserByMailIncludePasswordField(mail);

    if (!usuario) {
      return res.status(400).jsonExtra({
        ok: false,
        message: "Credenciales invalidas.",
      });
    }

    const validPassword = bcrypt.compareSync(password, usuario.password);
    if (!validPassword) {
      return res.status(401).jsonExtra({
        ok: false,
        message: "Credenciales invalidas.",
      });
    }

    if (usuario.status === constants.UserStateEnum.DEACTIVATED) {
      return res.status(401).jsonExtra({
       ok: false,
       message: "Tu usuario fue desactivado. Para reactivarlo, recupera tu contraseña. ",
      });
    }


    if(!process.env.DEV_ENV) {
      if (usuario.status === constants.UserStateEnum.INITIAL) {
        return res.status(401).jsonExtra({
         ok: false,
         message: "Tu usuario está en proceso de confirmación, revisa tu email. ",
        });
      }
    }
    

    // Generate JWT
    const token = await generateJWT(usuario.id);
    return res.jsonExtra({
      ok: true,
      token,
    });
  } catch (error) {
    return res.status(error.status ? error.status : 500).jsonExtra({
      ok: false,
      message: "Unexpected error",
      error: error
    });
  }
};

const renew = async (req, res = response) => {
  const uid = req.body.id;
  const token = await generateJWT(uid);
  return res.jsonExtra({
    ok: true,
    token,
  });
};

// Metodo que envia un OTP al mail indicado si es que existe una cuenta con dicho mail.
// Con dicho otp se puede utilizar el endpoint /resetPassword para actualizar contraseña
const forgotPassword = async (req, res) => {
  try {

    let foundUser = await UserRepository.getUserByMail(req.body.mail);
    if (foundUser) {

      let otp = otpGenerator.generate(constants.OTP_LENGTH, {
        upperCaseAlphabets: false,
        specialChars: false,
        digits: true,
        lowerCaseAlphabets: false,
      });

      await UserRepository.genOTP(foundUser, otp);

      let text = `Hola! Te escribimos de myHome! \n
        Éste es el código para cambiar tu contraseña: ` + otp;
      await mailHelper.sendMail(req.body.mail, text);
    }

    return res.status(200).jsonExtra({
      ok: true,
      message: "Si el mail existe, enviamos un OTP.",
    });

  } catch(error) {
    return res.status(error.status ? error.status : 500).jsonExtra({
      ok: false,
      message: "Error inesperado al enviar el OTP",
      error: error
    });
  }
};

// Metodo especifico para cambiar contraseña validadando a traves de un OTP de 6 digitos
// El otp se obtiene a través de /forgotPassword enviandose un mail
const resetPassword = async (req, res) => {
  try {

    let foundUser = await UserRepository.getUserByMailIncludePasswordField(req.body.mail);
    if (foundUser) {

      // validate Otp & repeatPassword
      if (foundUser.otp == req.body.otp 
        && req.body.password == req.body.repeatPassword) {

        // Reactivar usuario si fue desactivado.
        if (foundUser.status === constants.UserStateEnum.DEACTIVATED) {
          foundUser.status = constants.UserStateEnum.CONFIRMED;
        }

        // change password
        let hashPassword = await bcrypt.hash(req.body.password, 10);
        await UserRepository.updateUser(foundUser, {password: hashPassword, otp: ""})
        return res.status(200).jsonExtra({
          ok: true,
          message: "Cambio realizado exitosamente.",
        });
      }
    }

    return res.status(400).jsonExtra({
      ok: false,
      message: "Credenciales invalidas: otp invalido, el usuario no existe o las contraseñas no coinciden.",
    });

  } catch (error) {
    return res.status(error.status ? error.status : 500).jsonExtra({
      ok: false,
      message: "Error inesperado al validar OTP y cambiar contraseña",
      error: error
    });
  }
};

module.exports = {
  login,
  renew,
  forgotPassword,
  resetPassword,
};
