import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectroute = async (req, res, next) => {
  console.log("Request cookies:", req.cookies); // Debug cookies

  try {
    const { "jwt-x": jwtToken } = req.cookies; // Retrieve the token
    if (!jwtToken) {
      console.log("Token not found in cookies");
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
    console.log("Authenticated User:", user);
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
