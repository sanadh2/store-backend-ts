import { Response } from "express";
import JWT from "jsonwebtoken";
const setCookie = async (
  data: { userID: string; userRole: "user" | "admin" },
  res: Response
) => {
  try {
    const token = getJwtToken(data);
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
    return res.status(500).json({ success: false, msg: "Server Error" });
  }
};

function getJwtToken(data: { userID: string; userRole: "user" | "admin" }) {
  const SECRET_KEY = process.env.JWT_SECRET_KEY as string;

  return JWT.sign(
    { userID: data.userID, userRole: data.userRole },
    SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRES,
    }
  );
}

export { setCookie };
