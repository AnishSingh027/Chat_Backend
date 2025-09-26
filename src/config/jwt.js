const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRETKEY);
};

const retrievePayloadFromToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRETKEY);
};

module.exports = { generateToken, retrievePayloadFromToken };
