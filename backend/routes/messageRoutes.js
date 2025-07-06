const express = require("express");
const userAuth = require("../middlewares/auth");
const {
  sendMessage,
  allMessages,
} = require("../controllers/messageController");

const router = express.Router();

router.route("/").post(userAuth, sendMessage);
router.route("/:chatId").get(userAuth, allMessages);

module.exports = router;
