const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const chats = require("./data/data");
const connectDB = require("./config/db");
const User = require("./models/userModel");
const userAuth = require("./middlewares/auth");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

const socketIo = require("socket.io");
const path = require("path");

const app = express();
dotenv.config();
// connectDB();
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`.yellow.bold);
    });
    const io = require("socket.io")(server, {
      pingTimeout: 60000,
      cors: {
        origin: "http://localhost:3000",
      },
    });

    io.on("connection", (socket) => {
      console.log("connected to socket.io", socket.id);

      socket.on("setup", (userData) => {
        socket.join(userData._id);
        console.log(`userData._id:: ${userData._id}`);
        socket.emit("connected");
      });

      socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room:: ", room);
      });

      socket.on("typing", (room) => socket.in(room).emit("typing"));
      socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

      socket.on("new message", (newMessageReceived) => {
        var chat = newMessageReceived.chat;

        if (!chat.users) return console.log("chat.users not defined");

        chat.users.forEach((user) => {
          if (user._id === newMessageReceived.sender._id) return;

          socket.in(user._id).emit("message received", newMessageReceived);
        });
      });

      socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
      });
    });
  })
  .catch((e) => {
    console.log(`Error:: ${e.message}`.red.bold);
    process.exit();
  });

app.use(express.json());
app.use(cookieParser());

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// ------------Deployment-------------

const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));
  // app.get("*", (req, res) => {
  //   res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"));
  // });
} else {
  app.get("/", (req, res) => {
    res.send("API is running successfully");
  });
}

// ------------Deployment-------------
/* app.post("/api/user/", async (req, res) => {
  try {
    const { name, password, email, pic } = req.body;
    const user = await User.findOne({ email: email });
    console.log(user);
    if (user) {
      throw new Error("This user already exist");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = await User.create({
      name,
      email,
      password: hashedPassword,
      ...(pic && { pic }),
    });

    res.status(200).json({
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      ...(userData.pic && { pic: userData.pic }),
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({
      message: error.message,
    });
  }
}); */

/* app.post("/api/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (user) {
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (isPasswordMatch) {
        const token = await jwt.sign(
          { _id: user._id },
          process.env.SECREAT_KEY,
          {
            expiresIn: "1d",
          }
        );
        console.log(`Token:: ${token}`);
        res.cookie("token", token, {
          expires: new Date(Date.now() + 86400 * 1000),
        });
        res.status(200).json({
          message: "Logged In Successfully",
          data: {
            name: user.name,
            email: user.email,
            pic: user.pic,
          },
        });
      } else {
        throw new Error("Invalid Credentials");
      }
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
}); */

/* app.get("/api/user", userAuth, async (req, res) => {
  try {
    const userData = res.user;
    console.log(`userData:: ${userData}`);
    const users = await User.find({});
    if (users.length > 0) {
      res.status(200).json({
        data: users,
      });
    } else {
      res.status(404).json({
        message: "Users not found",
      });
    }
  } catch (error) {
    res.status(400).send(`Error:: ${error.message}`);
  }
}); */

// app.get("/", (req, res) => {
//   res.send("This is our first API");
// });

/* app.get("/api/chat", (req, res) => {
  res.send(chats);
});

app.get("/api/chat/:id", (req, res) => {
  const { id } = req.params;
  const selectedChat = chats.find((chat) => chat._id === id);
  res.send(selectedChat);
}); */
