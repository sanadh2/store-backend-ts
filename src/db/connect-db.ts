import mongoose from "mongoose";
import { initialsedRedisClient } from "../utils/redisClient";

const connectDataBase = async (PORT: number) => {
  try {
    const mongoDbURI = process.env.MONGO_DB_URL as string;
    await mongoose.connect(mongoDbURI, {});
    console.log("MongoDB Connection Succeeded.");

    await initialsedRedisClient();
    console.log(`server is on http://localhost:${PORT}/`);
  } catch (error) {
    console.log("error in mongoose\t\t\t", error);
  }
};

export default connectDataBase;
