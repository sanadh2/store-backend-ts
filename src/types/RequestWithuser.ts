import { Request, Response, NextFunction, Express } from "express";
import { JwtPayload } from "jsonwebtoken";

interface RequestWithUser extends Request {
  userID?: string | JwtPayload;
  userRole?: string | JwtPayload;
}

interface ReQuestWithFile extends Request {
  file?: Express.Multer.File;
}
interface RequestWithUserandFile extends Request {
  userID?: string;
  file?: Express.Multer.File;
}
export {
  Request,
  Response,
  NextFunction,
  RequestWithUser,
  ReQuestWithFile,
  RequestWithUserandFile,
};
