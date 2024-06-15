import { Router } from "express";
import {
  activateAccount,
  signIn,
  signOut,
  signUp,
  refreshToken,
} from "../controllers/authController";
import { upload } from "../utils/avatar-multer";
import auth from "../middlewares/auth";
const router = Router();

router.post("/sign-in", signIn);
router.post("/sign-up", upload.single("avatar"), signUp);
router.get("/activate/:token", activateAccount);
router.delete("/sign-out", signOut);
router.use(auth.ensureAuthenticated);
router.get("/refresh-token", refreshToken);
export default router;
