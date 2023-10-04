const jwt = require("jsonwebtoken");

const generateJWT = (uid) => {
  return new Promise((resolve, reject) => {
    const payload = { uid: uid };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) {
          throw new Error(err);
          reject(err);
        } else {
          resolve(token);
        }
      }
    );
  });
};

const verifyJWT = (token = "") =>  {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return {"err": false, "idUsuario": decoded.uid.idUsuario};
  } catch (error) {
    return {"err": true, "uid": null};
  }
};

module.exports = {
  generateJWT,
  verifyJWT,
};
