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

  public static async getMyReviews(req: AuthRequest, res: Response): Promise<void> {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      res.status(401).json({ message: "No autorizado" });
      return;
    }

    try {
      const reviews = await ResenaModel.findByUsuarioId(usuarioId);
      res.json(reviews);
    } catch (error) {
      console.error("Error al obtener mis reseñas:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  public static async getAdminReviews(req: AuthRequest, res: Response): Promise<void> {
    const isAdmin = req.user?.role === "admin";
    if (!isAdmin) {
      res.status(403).json({ message: "Acceso denegado. Se requieren permisos de administrador." });
      return;
    }

    const { rating, q } = req.query;
    const filters: { rating?: number; query?: string } = {};
    if (rating) filters.rating = parseInt(rating as string);
    if (q) filters.query = q as string;

    try {
      const reviews = await ResenaModel.findAll(filters);
      res.json(reviews);
    } catch (error) {
      console.error("Error al obtener reseñas de administración:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  public static async updateReview(req: AuthRequest, res: Response): Promise<void> {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      res.status(401).json({ message: "No autorizado" });
      return;
    }

    const { id } = req.params;
    const { puntuacion, comentario } = req.body;

    if (!puntuacion) {
      res.status(400).json({ message: "La puntuación es obligatoria" });
      return;
    }

    const rating = parseInt(puntuacion);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      res.status(400).json({ message: "La puntuación debe ser un número entero entre 1 y 5" });
      return;
    }

    try {
      const updated = await ResenaModel.update(parseInt(id as string), usuarioId, rating, comentario || "");
      if (!updated) {
        res.status(404).json({ message: "Reseña no encontrada o no pertenece al usuario autenticado" });
        return;
      }

      res.json({
        message: "Reseña actualizada con éxito.",
        review: updated,
      });
    } catch (error) {
      console.error("Error al actualizar reseña:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  public static async deleteReview(req: AuthRequest, res: Response): Promise<void> {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      res.status(401).json({ message: "No autorizado" });
      return;
    }

    const { id } = req.params;
    const isAdmin = req.user?.role === "admin";

    try {
      const deleted = await ResenaModel.delete(parseInt(id as string), usuarioId, isAdmin);
      if (!deleted) {
        res.status(404).json({ message: "Reseña no encontrada o no tienes permisos para eliminarla" });
        return;
      }

      res.json({ message: "Reseña eliminada con éxito." });
    } catch (error) {
      console.error("Error al eliminar reseña:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  public static async replyToReview(req: AuthRequest, res: Response): Promise<void> {
    const usuarioId = req.user?.id;
    const isOperator = req.user?.role === "operador";

    if (!usuarioId || !isOperator) {
      res.status(403).json({ message: "Acceso denegado. Se requiere perfil de operador para responder reseñas." });
      return;
    }

    const { id } = req.params;
    const { respuesta } = req.body;

    if (!respuesta || !respuesta.trim()) {
      res.status(400).json({ message: "El texto de la respuesta es obligatorio" });
      return;
    }

    try {
      const updated = await ResenaModel.addReply(parseInt(id as string), usuarioId, respuesta.trim());
      if (!updated) {
        res.status(404).json({ message: "Reseña no encontrada o no pertenece a tu taller artesanal" });
        return;
      }

      res.json({
        message: "Respuesta publicada con éxito.",
        review: updated,
      });
    } catch (error: any) {
      console.error("Error al responder reseña:", error);
      res.status(500).json({ message: error.message || "Error interno del servidor" });
    }
  }
}
