import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET_KEY as string;

import {
  RequestWithUser,
  NextFunction,
  Response,
} from "../types/RequestWithuser";
import { setError } from "../utils/customError";
import asyncWrapper from "../utils/asyncWrapper";

const ensureAuthenticated = asyncWrapper(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const token = req.cookies.token;
    if (!token) {
      next(setError("Please log in and try again", 401));
    }
    try {
      const decode = jwt.verify(token, SECRET_KEY) as {
        userID: string;
        userRole: string;
      };
      req.userID = decode.userID;
      req.userRole = decode.userRole;
      next();
    } catch (error: any) {
      if (error instanceof TokenExpiredError) {
        return res.status(401).json({
          message: "Session Expired",
          error: error.message,
        });
      }
      if (error instanceof JsonWebTokenError) {
        return res.status(401).json({
          message: "Invalid Token",
          error: error.message,
        });
      }
      res.status(500).json({
        message: "Internal server Error",
        error: error.message,
        stack: error.stack,
      });
    }
  }
);
const ensureAdmin = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};
export { ensureAuthenticated, ensureAdmin };

export default { ensureAuthenticated, ensureAdmin };
