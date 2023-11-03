const moment = require('moment');

exports.jsonExtra = async function jsonExtra(
  req,
  res,
  next
) {
  res.jsonExtra = function(obj) {
      obj.timestamp = moment().unix();
      res.json(obj);    
  }
  next();
}

