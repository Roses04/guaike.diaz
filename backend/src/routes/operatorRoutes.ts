import express from "express";
import { OperatorController } from "../controllers/operatorController.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", OperatorController.getOperators);
router.get("/static-data", OperatorController.getStaticData);
router.get("/pending", authenticateToken as any, authorizeRole(["admin"]) as any, OperatorController.getPendingOperators as any);
router.get("/:id", OperatorController.getOperatorById);
router.post("/", authenticateToken as any, OperatorController.createOperator as any);
router.patch("/:id/verify", authenticateToken as any, authorizeRole(["admin"]) as any, OperatorController.verifyOperator as any);

export default router;
