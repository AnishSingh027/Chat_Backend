const { retrievePayloadFromToken } = require("../config/jwt");

const userAuth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(400).json({ error: "Please login" });

  const user = retrievePayloadFromToken(token);

  req.user = user;
  next();
};

module.exports = { userAuth };
