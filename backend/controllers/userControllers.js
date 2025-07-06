const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const registerUser = async (req, res) => {
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
};

const loginUser = async (req, res) => {
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
        // console.log(`Token:: ${token}`);
        res.cookie("token", token, {
          expires: new Date(Date.now() + 86400 * 1000),
        });
        res.status(200).json({
          message: "Logged In Successfully",
          data: {
            name: user.name,
            email: user.email,
            pic: user.pic,
            _id: user._id,
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
};

const allUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(keyword).find({
      _id: { $ne: req.user._id },
    });
    res.send(users).json({
      message: "User data fetched successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = { registerUser, loginUser, allUsers };
