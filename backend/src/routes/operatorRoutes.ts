/**
 * RUTAS DEL MÓDULO OPERADORES (Artesanos)
 * 
 * Este archivo mapea las URLs que recibe el servidor a las funciones 
 * que deben ejecutarse (Controladores).
 * También aplica middlewares (seguridad) a las rutas que lo requieren.
 */

import express from "express";
import { OperatorController } from "../controllers/operatorController.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";

const router = express.Router();

// --- RUTAS PÚBLICAS (Cualquiera puede acceder) ---
// Obtener lista de operadores verificados (Directorio)
router.get("/", OperatorController.getOperators);

// Obtener categorías, parroquias y opciones de accesibilidad
router.get("/static-data", OperatorController.getStaticData);

// Obtener detalles de un operador específico por su ID
router.get("/:id", OperatorController.getOperatorById);

// --- RUTAS PROTEGIDAS (Requieren estar logueado) ---
// Crear un nuevo perfil de operador (Artesano registrándose a sí mismo)
router.post("/", authenticateToken as any, OperatorController.createOperator as any);

// --- RUTAS DE ADMINISTRADOR ---
// Obtener operadores pendientes de verificación
router.get("/pending", authenticateToken as any, authorizeRole(["admin"]) as any, OperatorController.getPendingOperators as any);

// Aprobar o rechazar (verificar) a un operador
router.patch("/:id/verify", authenticateToken as any, authorizeRole(["admin"]) as any, OperatorController.verifyOperator as any);

export default router;
