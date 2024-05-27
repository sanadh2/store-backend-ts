import { Router } from "express";
const router = Router();
import { getUser, updateUser, user } from "../controllers/userController";
import Auth from "../middlewares/auth";
import { upload } from "../utils/avatar-multer";

router.use(Auth.ensureAuthenticated);

router.get("/me", getUser);
router.get("/:userID", user);
router.patch("/update-user/", upload.single("avatar"), updateUser);
export default router;
