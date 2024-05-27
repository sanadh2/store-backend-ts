import { isValidObjectId } from "mongoose";
import { User } from "../models/userModel";
import {
  ReQuestWithFile,
  Request,
  RequestWithUser,
  RequestWithUserandFile,
  Response,
  NextFunction,
} from "../types/RequestWithuser";
import asyncWrapper from "../utils/asyncWrapper";
import { setError } from "../utils/customError";
import { Shoe, validateShoe } from "../models/models";

export const newProduct = asyncWrapper(
  async (req: RequestWithUserandFile, res: Response, next: NextFunction) => {
    const { name, price, gender, isInInventory, itemsLeft, category, brand } =
      req.body;
    const { userID } = req;
    const avatarFile = req.file;

    if (!name || !price || !category || !brand || !avatarFile) {
      return next(setError("Please provide all the details", 400));
    }
    const isValidProduct = validateShoe({
      name,
      price,
      gender,
      isInInventory,
      itemsLeft,
      category,
      brand,
    });

    if (!isValidObjectId(userID)) return next(setError("invalid user id", 400));

    const user = await User.findById(userID);
    const newShoe = new Shoe({
      name: name,
    });
    if (!user) {
      return next(setError("User not found", 404));
    }

    res.status(201).json({ success: true, data: newProduct });
  }
);
