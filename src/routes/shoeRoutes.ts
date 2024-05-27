import { Router } from "express";
const router = Router();

router.post("/new");
router.get("filter");
router.delete("/:shoeID");
router.patch("/:shoeID");
router.get("/:shoeID");

export default router;
