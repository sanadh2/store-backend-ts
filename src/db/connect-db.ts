import mongoose from "mongoose";

const connectDataBase = (PORT: number) => {
  const mongoDbURI = process.env.MONGO_DB_URL as string;
  mongoose
    .connect(mongoDbURI, {})
    .then(() => {
      console.log("MongoDB Connection Succeeded.");
      console.log(`server is on http://localhost:${PORT}/`);
    })
    .catch((error) => {
      console.log("Error in DB connection: " + error);
    });
};

export default connectDataBase;
