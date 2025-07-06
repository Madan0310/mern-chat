const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      throw new Error("Invalid Session!!!");
    }
    const decodedObj = await jwt.verify(token, process.env.SECREAT_KEY);
    const { _id } = decodedObj;
    const user = await User.findOne({ _id: _id }).select("-password");
    req.user = user;
    next();
  } catch (error) {
    res.status(400).send(`Error:: ${error.message}`);
  }
};

module.exports = userAuth;
