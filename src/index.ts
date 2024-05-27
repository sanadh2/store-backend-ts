import app from "./app";
const port = Number(process.env.PORT) || 3000;

import connectDB from "./db/connect-db";

process.on("uncaughtException", (err) => {
  console.log("error", err);
  console.log("shutting down the server for handling uncaught exeption");
});

process.on("unhandledRejection", (err: Error) => {
  console.log(`shutting down server for : ${err.message}`);
});

app.listen(port, () => {
  connectDB(port);
});
