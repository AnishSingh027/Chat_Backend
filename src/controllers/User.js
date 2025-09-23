const userSignup = async (req, res) => {
  const { data } = req.body;

  return res.status(201).send({ message: "User created successfully" });
};

module.exports = { userSignup };
