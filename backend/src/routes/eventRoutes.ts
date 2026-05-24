import express from "express";
import { EventController } from "../controllers/eventController.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", EventController.getEvents);
router.post("/", authenticateToken as any, authorizeRole(["admin"]) as any, EventController.createEvent as any);
router.delete("/:id", authenticateToken as any, authorizeRole(["admin"]) as any, EventController.deleteEvent as any);

export default router;
