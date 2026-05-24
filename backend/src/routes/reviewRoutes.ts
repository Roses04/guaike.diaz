import express from "express";
import { ReviewController } from "../controllers/reviewController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/validate-qr", ReviewController.validateQr);
router.post("/", authenticateToken as any, ReviewController.createReview as any);

export default router;
