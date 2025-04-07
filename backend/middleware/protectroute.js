import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

//  const token = await jwt.sign({ userId }, process.env.SECRET_KEY, {
//     expiresIn: "30d",
//   });

//   res.cookie("jwt-x", token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
//   });
//user.findOne ({}) ithu ulla irukura argrment la first field : value. es6 la field and value same ah irukurathu naala name na verum name matum tharom . but actual ah {name:name } nu irukanum
// {_id:user.id} ithu taan correct format
export const protectroute = async (req, res, next) => {
  try {
    const { "jwt-x": jwtToken } = req.cookies; // cookies ulla irunthu token ah thaniya edikanum.token la userid and secret key irukum . atha vachu check pananaum
    if (!jwtToken) {
      return res.status(400).json({ message: "Token not found" });
    }

    const decoded = jwt.verify(jwtToken, process.env.SECRET_KEY);
    if (!decoded) {
      console.log("Invalid token");
      return res.status(400).json({ message: "Invalid token" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
