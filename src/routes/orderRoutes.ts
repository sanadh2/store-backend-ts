import { Router } from "express";
import auth from "../middlewares/auth";
import {
  deleteOrder,
  getOrders,
  newOrder,
} from "../controllers/orderController";
const router = Router();

router.use(auth.ensureAuthenticated);

router.post("/", newOrder);
router.get("/me", getOrders);
router.delete("/:orderID", deleteOrder);

export default router;
