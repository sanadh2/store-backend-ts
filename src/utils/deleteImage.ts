import fs from "fs";
import path from "path";

export default function deleteImage(
  fileName: string,
  type: "shoes" | "users" = "users"
) {
  if (!fileName) return;
  if (type === "users")
    fs.unlink(`uploads/${path.join(fileName)}`, (unlinkErr) => {
      if (unlinkErr) {
        console.log(unlinkErr);
      }
    });
  else
    fs.unlink(`uploads/shoes/${path.join(fileName)}`, (unlinkErr) => {
      if (unlinkErr) {
        console.log(unlinkErr);
      }
    });
}
