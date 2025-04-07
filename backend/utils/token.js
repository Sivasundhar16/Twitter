import jwt from "jsonwebtoken";

export const generateToken = async (userId, res) => {
  const token = await jwt.sign({ userId }, process.env.SECRET_KEY, {
    expiresIn: "30d",
  });

  res.cookie("jwt-x", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};
