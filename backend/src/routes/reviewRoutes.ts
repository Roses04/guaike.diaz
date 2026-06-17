import express from "express";
import { ReviewController } from "../controllers/reviewController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/validate-qr", ReviewController.validateQr);
router.post("/", authenticateToken as any, ReviewController.createReview as any);
router.get("/my-reviews", authenticateToken as any, ReviewController.getMyReviews as any);
router.get("/admin", authenticateToken as any, ReviewController.getAdminReviews as any);
router.put("/:id", authenticateToken as any, ReviewController.updateReview as any);
router.delete("/:id", authenticateToken as any, ReviewController.deleteReview as any);
router.post("/:id/reply", authenticateToken as any, ReviewController.replyToReview as any);

export default router;
