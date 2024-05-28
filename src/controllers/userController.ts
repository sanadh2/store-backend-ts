import { User, validateUser, Address, AddressType } from "../models/models";
import {
  NextFunction,
  RequestWithUser,
  Response,
  Request,
  RequestWithUserandFile,
} from "../types/RequestWithuser";
import { setError } from "../utils/customError";
import asyncWrapper from "../utils/asyncWrapper";
import { isValidObjectId } from "mongoose";
import deleteImage from "../utils/deleteImage";
import path from "path";

export const user = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userID } = req.params;
    if (!isValidObjectId(userID)) next(setError("invalid user id", 400));
    const user = await User.findById(userID).select("-password");
    return res.status(200).json({ success: true, user, message: "user found" });
  }
);

export const getUser = asyncWrapper(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const userID = req.userID;
    if (!userID) {
      return next(setError("something went wrong", 400));
    }
    const user = await User.findById(userID).select("-password");
    if (!user) {
      return next(setError("User not found", 404));
    }
    return res
      .status(200)
      .json({ success: false, user, messgage: "user found" });
  }
);

export const updateUser = asyncWrapper(
  async (req: RequestWithUserandFile, res: Response, next: NextFunction) => {
    const userID = req.userID;
    const avatarFile = req.file;
    if (!userID) {
      if (avatarFile) deleteImage(avatarFile.filename);
      return next(setError("something is fishy", 400));
    }
    const {
      name,
      email,
      oldPassword,
      newPassword,
      gender,
      phoneNumber,
      address1,
      address2,
      address3,
    } = req.body;
    if (!isValidObjectId(userID)) {
      if (avatarFile) deleteImage(avatarFile.filename);
      return next(setError("invalid ID", 401));
    }
    const user = await User.findById(userID);
    if (!user) {
      return next(setError("user not found", 404));
    }
    if (name) user.name = name;
    if (email) user.email = email;
    if (gender) user.gender = gender;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (oldPassword && newPassword) {
      const isMatch = await user.comparePassword(oldPassword);
      if (!isMatch) {
        return next(setError("Password is incorrect", 401));
      }
      user.password = newPassword;
    }
    if (address1)
      try {
        const address = updateAddress(user.address1, address1);
        const newAddress = new Address({
          ...address,
        });
        user.address1 = newAddress;
      } catch (error) {
        if (avatarFile) deleteImage(avatarFile.filename);

        return next(setError("Invalid address1", 400));
      }
    if (address2)
      try {
        const address = updateAddress(user.address2, address2);
        const newAddress = new Address({
          ...address,
        });
        user.address2 = newAddress;
      } catch (error) {
        if (avatarFile) deleteImage(avatarFile.filename);

        return next(setError("Invalid address2", 400));
      }

    if (address3)
      try {
        const address = updateAddress(user.address3, address3);
        const newAddress = new Address({
          ...address,
        });
        user.address3 = newAddress;
      } catch (error) {
        if (avatarFile) deleteImage(avatarFile.filename);
        return next(setError("Invalid address3", 400));
      }

    if (avatarFile) {
      const fileUrl = path.join(avatarFile.filename);
      user.avatar = fileUrl;
    }
    await user.save();
    return res.status(200).json({ success: true, message: "user updated" });
  }
);

const updateAddress = (
  existingAddress: AddressType | undefined,
  newAddress: AddressType | undefined
) => {
  if (!newAddress) throw new Error("No new address provided");
  if (!existingAddress) {
    const requiredFields = [
      "city",
      "country",
      "houseNumber",
      "phoneNumber",
      "state",
      "street",
      "zipCode",
    ];
    const missingFields = requiredFields.filter(
      (field) => !(field in newAddress)
    );

    if (missingFields.length > 0) {
      throw new Error("Invalid address: Missing required fields");
    }
  }
  const address: AddressType = {
    city: newAddress.city,
    country: newAddress.country,
    houseNumber: newAddress.houseNumber,
    phoneNumber: newAddress.phoneNumber,
    state: newAddress.state,
    street: newAddress.street,
    zipCode: newAddress.zipCode,
  };
  return address;
};
