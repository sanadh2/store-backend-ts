import multer from "multer";
import { Express, Request } from "express";
type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;

const storage = multer.diskStorage({
  destination: function (
    req: Request,
    file: Express.Multer.File,
    callback: DestinationCallback
  ) {
    callback(null, "uploads/shoes");
  },
  filename: function (
    req: Request,
    file: Express.Multer.File,
    callback: FileNameCallback
  ) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileName = file.originalname.split(".")[0];
    callback(null, fileName + "-" + uniqueSuffix + ".png");
  },
});

const fileFilter = (
  request: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
): void => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });
export { upload };
