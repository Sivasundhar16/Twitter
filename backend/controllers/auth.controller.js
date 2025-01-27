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
  try {
    const { username, password } = req.body;
    const existUser = await User.findOne({ username });
    if (!existUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const passwordCorrect = await bcrypt.compare(password, existUser.password);
    if (!passwordCorrect) {
      return res.status(400).json({ message: "Password is Wrong" });
    }
    try {
      await generateToken(existUser._id, res);
      return res.status(200).json({ message: "logged in successfully" });
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "Something went wrong" });
  }
};

export const logout = async (req, res) => {
  try {
    //res.cookie("jwt-x", "", { maxAge: 0 });
    res.clearCookie("jwt-x"); //other method res.cookie('jwt-x','',{maxAge:0}) cookie ah remove panalam or new empty cookie set panalam. ena panalum cookie remove aakirum
    return res.status(200).json({ message: "Loggedout Successfully" });
  } catch (error) {
    console.log("Something went wrong", error);
    res.status(404).json({ message: "Something went wrong" });
  }
};

export const profile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: "User not avialable" });
    }
    res.status(200).json(req.user);
  } catch (error) {
    console.log(error);
    res.json({ message: "Something went wrong" });
  }
};

//git branch (name)                for creating new branch
//git branch                       show all branch
//git checkout (branch name)       switch branch

//master branch ku poi
// git merge (brach name )         wanted mergin branch name

//for deleting
//master branch ku poi delete pananaum
//git branch -d (branch name)     normal delete
//git branch -D (branch name)     forcely delete
//1:36
