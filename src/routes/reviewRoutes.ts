import { addReview, deleteReview } from "../controllers/reviewController";
import auth from "../middlewares/auth";
import { Shoe } from "../models/models";
import express from "express";
const router = express.Router();

router.use(auth.ensureAuthenticated);
router.post("/", addReview);
router.delete("/:reviewID", deleteReview);

export default router;
