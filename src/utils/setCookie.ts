import { Response } from "express";
import JWT from "jsonwebtoken";

const setCookie = async (userID: string, res: Response) => {
  try {
    const token = getJwtToken(userID);
    if (!token) {
      throw new Error("Failed to generate JWT token.");
    }
    res.clearCookie("token");
    res.cookie("token", token, {
      expires: new Date(Date.now() + 1 * 60 * 60 * 1000),
      httpOnly: false,
    });
    return token;
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

function getJwtToken(userID: string) {
  const secretKey: string = process.env.JWT_SECRET_KEY!;

  return JWT.sign({ userID }, secretKey, {
    expiresIn: process.env.JWT_EXPIRES,
  });
}

export { setCookie };
