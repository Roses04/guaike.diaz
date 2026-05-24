import type { Request, Response } from "express";
import { ResenaModel } from "../models/ResenaModel.js";
import type { AuthRequest } from "../middleware/auth.js";

export class ReviewController {
  public static async validateQr(req: Request, res: Response): Promise<void> {
    const { qr_uuid } = req.body;

    if (!qr_uuid) {
      res.status(400).json({ message: "El código QR (UUID) es requerido" });
      return;
    }

    try {
      const operadorId = await ResenaModel.validateQr(qr_uuid);

      if (!operadorId) {
        res.status(404).json({
          valido: false,
          message: "Código QR inválido. No pertenece a ningún taller verificado.",
        });
        return;
      }

      res.json({
        valido: true,
        operador_id: operadorId,
        message: "Visita física validada. Formulario de reseña desbloqueado.",
      });
    } catch (error) {
      console.error("Error al validar QR:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  public static async createReview(req: AuthRequest, res: Response): Promise<void> {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      res.status(401).json({ message: "No autorizado" });
      return;
    }

    const { operador_id, puntuacion, comentario, qr_verificado } = req.body;

    if (!operador_id || !puntuacion) {
      res.status(400).json({ message: "El operador_id y la puntuación son obligatorios" });
      return;
    }

    const rating = parseInt(puntuacion);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      res.status(400).json({ message: "La puntuación debe ser un número entero entre 1 y 5" });
      return;
    }

    try {
      const review = await ResenaModel.create(
        parseInt(operador_id),
        usuarioId,
        rating,
        comentario || "",
        !!qr_verificado
      );

      res.status(201).json({
        message: "Reseña publicada con éxito.",
        review,
      });
    } catch (error) {
      console.error("Error al crear reseña:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
}
