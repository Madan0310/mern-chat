const express = require("express");
const userAuth = require("../middlewares/auth");
const {
  accessChat,
  createGroupChat,
  fetchAllChats,
  renameGroup,
  removeFromGroup,
  addToGroup,
  deleteChat,
} = require("../controllers/chatController");

const router = express.Router();

router.route("/").post(userAuth, accessChat);
router.route("/").get(userAuth, fetchAllChats);
router.route("/group").post(userAuth, createGroupChat);
router.route("/rename").put(userAuth, renameGroup);
router.route("/groupremove").put(userAuth, removeFromGroup);
router.route("/groupadd").put(userAuth, addToGroup);
router.route("/").delete(userAuth, deleteChat);

module.exports = router;
