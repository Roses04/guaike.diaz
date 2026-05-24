import express from "express";
import { StatsController } from "../controllers/statsController.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/admin", authenticateToken as any, authorizeRole(["admin"]) as any, StatsController.getStats as any);

export default router;
