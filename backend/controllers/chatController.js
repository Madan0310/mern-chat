const Chat = require("../models/chatModel");
const User = require("../models/userModel");

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      console.log("UserId param not sent with request");
      throw new Error("UserId param not sent with request");
    }

    var isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    // console.log(`first isChat:: ${isChat }`);

    // isChat = await User.populate(isChat, {
    //   path: "latestMessage.sender",
    //   select: "name pic email",
    // });

    console.log(`isChat:: ${isChat}`);

    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      var chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };

      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

//@description     fetch All Chats
//@route           GET /api/chat/
//@access          Protected
const fetchAllChats = async (req, res) => {
  try {
    const allchats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });
    if (allchats.length < 1) {
      res.status(404);
      throw new Error("No Chats data found");
    }
    res.status(200).json({
      data: allchats,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/group
//@access          Protected
const createGroupChat = async (req, res) => {
  try {
    let { name, users } = req.body;
    if (!name || !users) {
      throw new Error("Please fill all the fields");
    }

    users = JSON.parse(users);
    if (users.length < 2) {
      throw new Error("Please select 2 users to proceed");
    }
    users.push(req.user);
    const chatData = await Chat.create({
      chatName: name,
      isGroupChat: true,
      users: users,
      groupAdmin: req.user,
    });
    const fullGroupChat = await Chat.findOne({ _id: chatData._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    console.log(`chatData:: ${fullGroupChat}`);
    res.status(200).json(fullGroupChat);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
const renameGroup = async (req, res) => {
  try {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        chatName: chatName,
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      res.status(404);
      throw new Error("Chat Not Found");
    } else {
      res.json(updatedChat);
    }
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
};

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected
const removeFromGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    // check if the requester is admin
    const chat = await Chat.findById({ _id: chatId }).populate(
      "groupAdmin",
      "-password"
    );
    if (!chat) {
      res.status(404);
      throw new Error("Chat Not Found");
    }
    if (chat.groupAdmin._id == userId) {
      res.status(400);
      throw new Error("you can not remove admin from the group");
    }

    const removed = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!removed) {
      res.status(404);
      throw new Error("Chat Not Found");
    } else {
      res.json(removed);
    }
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
};

// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected
const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
};

const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.body;
    const deleteChat = await Chat.findByIdAndDelete({ _id: chatId });
    if (!deleteChat) {
      res.status(404);
      throw new Error("Chat not found");
    }
    console.log(`deleteChat:: ${deleteChat}`);
    res.status(200).send({
      message: "Chat deleted Successfully",
    });
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
};

module.exports = {
  accessChat,
  createGroupChat,
  fetchAllChats,
  renameGroup,
  removeFromGroup,
  addToGroup,
  deleteChat,
};
