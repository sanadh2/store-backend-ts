import fs from "fs";
import path from "path";

export default function deleteAvatar(fileName: string) {
  fs.unlink(`uploads/${path.join(fileName)}`, (unlinkErr) => {
    if (unlinkErr) {
      console.log(unlinkErr);
    }
  });
}
