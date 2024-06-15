import dotenv from "dotenv";
dotenv.config({ path: "./config/.env" });
import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";
import {
  userRouter,
  authRouter,
  shoeRouter,
  reviewRouter,
  cartRouter,
  orderRouter,
} from "./routes/routes";
import { errorHandler } from "./middlewares/ErrorHandler";
import notFound from "./middlewares/notFound";
import { initialsedRedisClient } from "./utils/redisClient";
const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://192.168.195.28:5173",
      "https://store-ten-phi.vercel.app",
    ],
    credentials: true,
  })
);

app.use((req, res, next) => {
  // Set the header based on your requirements
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"); // or 'same-site' if needed
  next();
});

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/v1/", express.static("uploads"));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("<h1 align='center'>Welcome to my Server</h1>");
});

app.use("/api/v1/users/", userRouter);
app.use("/api/v1/auth/", authRouter);
app.use("/api/v1/products/", shoeRouter);
app.use("/api/v1/reviews/", reviewRouter);
app.use("/api/v1/carts/", cartRouter);
app.use("/api/v1/orders/", orderRouter);
app.use(errorHandler);
app.use(notFound);
export default app;
