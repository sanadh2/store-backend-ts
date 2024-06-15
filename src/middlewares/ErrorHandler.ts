import { CustomError } from "../utils/customError";
import { Request, Response, NextFunction } from "express";
import { Error } from "mongoose";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("error name: ", err.name);

  if (err instanceof CustomError)
    return res
      .status(err.statusCode)
      .json({ success: false, message: err.message });
  if (err instanceof Error.ValidationError) {
    console.log("validationerrors", JSON.stringify(err.message));
    const errors = err.message;
    return res
      .status(400)
      .json({ success: false, message: "Validation Error" });
  }
  if (err instanceof Error.CastError) {
    console.log("CastError errors", JSON.stringify(err));

    return res.status(400).json({
      success: false,
      message: `${err.path} is not a valid ${err.kind}`,
    });
  }

  console.log(err);
  return res.status(500).json({ success: false, msg: "Something Fishy" });
};
