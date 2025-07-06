const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");

const allMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name pic emailid")
      .populate("chat");
    res.json(messages);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { content, chatId } = req.body;
    console.log("content:: ", content);
    if (!content || !chatId) {
      throw new Error("Invalid data passed into request");
    }

    var newMessage = {
      sender: req.user._id,
      content: content,
      chat: chatId,
    };

    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });

    res.json(message);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = { sendMessage, allMessages };
