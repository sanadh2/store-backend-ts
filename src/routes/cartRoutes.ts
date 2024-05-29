import { Router } from "express";
import {
  invalidateCacheMiddleware,
  setCache,
} from "../middlewares/cacheMiddleware";
import {
  addToCart,
  deleteFromCart,
  getCart,
  updateQuantity,
} from "../controllers/cartController";
import auth from "../middlewares/auth";
const router = Router();

router.use(auth.ensureAuthenticated);
router.get("/me", setCache(), getCart);
router.post("/", invalidateCacheMiddleware, addToCart);
router.delete("/:productID", invalidateCacheMiddleware, deleteFromCart);
router.patch("/:productID", invalidateCacheMiddleware, updateQuantity);

export default router;
