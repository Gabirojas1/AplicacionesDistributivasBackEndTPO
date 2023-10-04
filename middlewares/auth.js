const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;

exports.decodeUserFromToken = async function decodeUserFromToken(
  req,
  res,
  next
) {
  let token = req.get("Authorization") || req.query.token || req.body.token;
  if (token) {
    token = token.replace("Bearer ", "");

    if (!token || token.length < 5 || token == null) {
      return res.status(401).json({ status: "error", message:  "Not Authorized: token is empty." });
    }

    jwt.verify(token, SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({status: "error", message: err});
      } else {
        req.idUsuario = decoded.uid;
        next();
      }
    });
  } else {
    return res.status(401).json({ status: "error", message:  "Not Authorized: token is empty." });
  }
};

exports.checkAuth = async function checkAuth(req, res, next) {
  return req.idUsuario ? next() : res.status(401).json({ msg: "Not Authorized" });
};
