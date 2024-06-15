import { Router } from "express";
const router = Router();
import { upload } from "../utils/shoeMulter";
import {
  bestSellers,
  deleteProduct,
  filtershoes,
  getProductInfo,
  newProduct,
  updateProduct,
} from "../controllers/shoeController";
import Auth from "../middlewares/auth";

router.get("/filter", filtershoes);
router.get("/best-sellers", bestSellers);
router.get("/:productID", getProductInfo);
router.use(Auth.ensureAuthenticated);

router.use(Auth.ensureAdmin);
router.post("/", upload.single("image"), newProduct);
router.delete("/:productID", deleteProduct);
router.patch("/:productID", upload.single("image"), updateProduct);

export default router;
