import jwt from "jsonwebtoken";

export const generateToken = async (userId, res) => {
  const token = await jwt.sign({ userId }, process.env.SECRET_KEY, {
    expiresIn: "30d",
  });

  res.cookie("jwt-x", token, {
    maxAge: 30 * 24 * 60 * 60 * 1000, //30 days,24 hours,60 minuts , 10000 milly seconds
    httpOnly: true, //xss attack
    sameSite: "strict", //csrf attack
    secure: process.env.NODE_ENV !== "development", //production la taan true ah irukum   //development la false ah irukum
  });
};
