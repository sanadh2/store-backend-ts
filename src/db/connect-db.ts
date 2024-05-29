import mongoose from "mongoose";
import { initialsedRedisClient } from "../utils/redisClient";

const connectDataBase = (PORT: number) => {
  const mongoDbURI = process.env.MONGO_DB_URL as string;
  mongoose
    .connect(mongoDbURI, {})
    .then(() => {
      console.log("MongoDB Connection Succeeded.");
    })
    .then(() => {
      initialsedRedisClient();
    })
    .then(() => {
      console.log(`server is on http://localhost:${PORT}/`);
    })
    .catch((error) => {
      console.log("Error in DB connection: " + error);
    });
};

export default connectDataBase;
