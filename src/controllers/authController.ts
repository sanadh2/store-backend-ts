import asyncWrapper from "../utils/asyncWrapper";
import {
  NextFunction,
  ReQuestWithFile,
  Request,
  RequestWithUser,
  Response,
} from "../types/RequestWithuser";
import { setError } from "../utils/customError";
import { User, validateUser } from "../models/models";
import {
  incrementFailedLoginAttempts,
  isAccountLocked,
} from "../utils/authHelpers";
import { setCookie } from "../utils/setCookie";
import fs from "fs";
import sendMail from "../utils/sendMail";
import isDisposableEmail from "../utils/isDisposibleEmail";
import path from "path";
import JWT from "jsonwebtoken";
import mongoose from "mongoose";
import deleteAvatar from "../utils/deleteImage";
import { newUserValidator } from "../validators/userValidator";

export const signIn = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!email || !password)
      return next(setError("Please provide email and password", 400));
    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return next(
        setError("User with this email does not exist. Try signing up", 400)
      );

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      incrementFailedLoginAttempts(user);
      return next(setError("Invalid password", 400));
    }

    if (isAccountLocked(user)) {
      return next(setError("Account locked. Please try again later", 400));
    }
    user.failedLoginAttempts = 0;
    await user.save();

    const token = await setCookie(
      { userID: user._id.toString(), userRole: user.role },
      res
    );
    res
      .status(200)
      .json({ success: true, token, message: `${user.name} logged in` });
  }
);

export const signUp = asyncWrapper(
  async (req: ReQuestWithFile, res: Response, next: NextFunction) => {
    const avatarFile = req.file;
    const isValidUser = newUserValidator({
      ...req.body,
      avatar: avatarFile?.filename,
    });

    if (isValidUser.error) {
      if (avatarFile) {
        deleteAvatar(avatarFile.filename);
      }

      return next(setError(isValidUser.error.message, 400));
    }
    console.log("isValid User", isValidUser);

    const isUserExist = await User.findOne({
      $or: [
        {
          email: req.body.email,
        },
        { phoneNumber: req.body.phoneNumber },
      ],
    });

    if (isUserExist) {
      const userID = isUserExist._id?.toString();
      if (avatarFile) {
        deleteAvatar(avatarFile.filename);
      }

      if (isUserExist.active === true) {
        return next(setError("User already exists. Try logging in...", 400));
      }
      const activationToken = createActivationToken(userID);
      const activationURL = `${process.env.CLIENT_URL}/auth/activate/${activationToken}/`;
      await sendMail(
        isUserExist.email,
        "Please Activate Your Account",
        activationURL
      );

      return next(setError("Please activate your account", 400));
    }
    const isDisposable = await isDisposableEmail(req.body.email);
    if (isDisposable) {
      return next(setError("Please provide a valid email", 400));
    }

    const userCreated = new User({
      avatar: avatarFile ? path.join(avatarFile.filename) : undefined,
      ...req.body,
    });

    const userID = userCreated._id.toString();

    const activationToken = createActivationToken(userID);
    const activationURL = `${process.env.CLIENT_URL}/auth/activate/${activationToken}/`;
    await sendMail(
      req.body.email,
      "Please Activate Your Account",
      activationURL
    );
    await userCreated.save();
    return res.status(200).json({
      success: true,
      message: "Please check your e-mail to activate your account",
    });
  }
);

const createActivationToken = (userID: string) => {
  const activationSecret = process.env.ACTIVATION_SECRET as string;
  return JWT.sign({ userID }, activationSecret, {
    expiresIn: "1h",
  });
};

export const activateAccount = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.params.token;
    if (!token) return next(setError("Invalid or expired token", 400));
    const activationSecret = process.env.ACTIVATION_SECRET as string;

    const { userID } = JWT.verify(token, activationSecret) as {
      userID: string;
    };

    if (!userID) return next(setError("Invalid or expired token", 400));
    if (!mongoose.isValidObjectId(userID)) {
      return next(setError("Invalid or expired token", 400));
    }

    const user = await User.findById(userID);

    if (!user) return next(setError("User not found", 400));
    if (user.active) return next(setError("User already activated", 400));

    user.active = true;
    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "Account activated successfully" });
  }
);

export const signOut = asyncWrapper(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    res.clearCookie("token");
    return res.status(204).end();
  }
);

export const refreshToken = asyncWrapper(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const userID = String(req.userID);
    const userRole = String(req.userRole) === "admin" ? "admin" : "user";
    if (!userID) return next(setError("something went wrong", 400));
    const token = await setCookie({ userID, userRole }, res);
    return res
      .status(200)
      .json({ success: true, message: "refresh token updated", token });
  }
);
