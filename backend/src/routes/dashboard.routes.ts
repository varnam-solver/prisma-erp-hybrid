import { Router } from "express";
import { getDashboardData } from "../controllers/dashboard.controller";
import { protect } from "../middleware/auth.middleware"; // <-- import protect

const router = Router();

router.get("/", protect, getDashboardData); // <-- add protect here

export default router;