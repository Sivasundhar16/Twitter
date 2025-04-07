import mongoose from "mongoose";

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("mongo db connect");
  } catch (error) {
    console.log(error.message);
    process.exit(1); // 1 means true
  }
};

export default connectDb;
