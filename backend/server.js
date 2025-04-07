import express from "express";
import cors from "cors";
import connectDb from "./db/connectdb.js";
import dotenv from "dotenv";
import authroute from "../backend/routes/auth.route.js";
import userroute from "../backend/routes/user.route.js";
import cookieParser from "cookie-parser";
import postroute from "../backend/routes/post.route.js";
import notificationroute from "../backend/routes/notification.route.js";
import cloudinary from "cloudinary";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ credentials: true }));
app.use(cookieParser());
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

const PORT = process.env.PORT || 5000;

app.use("/auth", authroute);
app.use("/user", userroute);
app.use("/post", postroute);
app.use("/notification", notificationroute);

const connection = async () => {
  try {
    await connectDb();
    app.listen(PORT, () => {
      console.log("server is running on " + PORT);
    });
  } catch (error) {
    console.log(error);
  }
};

connection();
