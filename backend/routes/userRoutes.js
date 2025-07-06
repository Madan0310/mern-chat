const express = require("express");
const {
  registerUser,
  loginUser,
  allUsers,
} = require("../controllers/userControllers");
const userAuth = require("../middlewares/auth");

const router = express.Router();

router.route("/login").post(loginUser);
router.route("/").post(registerUser);
router.route("/").get(userAuth, allUsers);

module.exports = router;
