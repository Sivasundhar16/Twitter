import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/token.js";

export const signup = async (req, res) => {
  const { email, password, username, fullName } = req.body;
  try {
    if (!email || !password || !username || !fullName) {
      return res.status(500).json({ message: "Enter the valid details" });
    }

    const emailvalidate = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailvalidate.test(email)) {
      return res.status(501).json({ message: "Enter a valid mail id" });
    }

    const existingEmail = await User.findOne({ email }); //user name a vachum check panalam
    const existUsername = await User.findOne({ username });
    if (existUsername || existingEmail) {
      return res.status(400).json({ message: "User already exist" });
    }
    if (password.length < 6) {
      return res.status(501).json({ message: "Password atleast 6 character" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      fullName,
      password: hashedPassword,
    });

    try {
      await newUser.save();
      await generateToken(newUser._id, res);
    } catch (error) {
      console.log(error);
    }

    res.status(200).json({
      message: "User Created Successfully",
    });
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      return res.status(400).json({ message: "Enter All the fields" });
    }

    const existUser = await User.findOne({ username });
    if (!existUser) {
      return res.status(400).json({ message: "User Not found. Please Login" });
    }

    const ispassword = await bcrypt.compare(password, existUser.password);
    if (!ispassword) {
      return res.status(401).json({ message: "Wrong Password" });
    }

    try {
      await generateToken(existUser._id, res);
      res.status(200).json({ message: "Login successfully" });
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  res.send("server is logout");
};
