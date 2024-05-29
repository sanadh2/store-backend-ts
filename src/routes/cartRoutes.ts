import { Router } from "express";
import { setCache } from "../middlewares/cacheMiddleware";
const router = Router();

router.get("/me", setCache);
