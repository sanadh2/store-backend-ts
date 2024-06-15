import { Router } from "express";
const router = Router();
import {
  allUsers,
  getUser,
  updateUser,
  user,
} from "../controllers/userController";
import Auth from "../middlewares/auth";
import { upload } from "../utils/avatar-multer";

import Cache from "../middlewares/cacheMiddleware";

router.use(Auth.ensureAuthenticated);
router.get("/", Auth.ensureAdmin, allUsers);
router.get("/me", Auth.ensureAuthenticated, getUser);
router.get("/:userID", user);
router.patch(
  "/update-user/",
  Cache.invalidateCacheMiddleware,
  upload.single("avatar"),
  updateUser
);
export default router;
