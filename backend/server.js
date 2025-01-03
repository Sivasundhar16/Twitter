import express from "express";

import connectDb from "./db/connectdb.js";
import dotenv from "dotenv";
import authroute from "../backend/routes/auth.route.js";
dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use("/api/auth", authroute);

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
