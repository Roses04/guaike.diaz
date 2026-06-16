import type { Request, Response } from "express";
import { EventoModel } from "../models/EventoModel.js";
import type { AuthRequest } from "../middleware/auth.js";

export class EventController {
  public static async getEvents(req: Request, res: Response): Promise<void> {
    try {
      const events = await EventoModel.findAllActive();
      res.json(events);
    } catch (error) {
      console.error("Error al obtener eventos:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  public static async createEvent(req: AuthRequest, res: Response): Promise<void> {
    const { titulo, descripcion, longitud, latitud, fecha_inicio, fecha_fin, url_imagen } = req.body;
    const user = req.user;

    if (!titulo || !longitud || !latitud || !fecha_inicio || !fecha_fin) {
      res.status(400).json({
        message: "Los campos titulo, longitud, latitud, fecha_inicio y fecha_fin son obligatorios",
      });
      return;
    }

    try {
      const event = await EventoModel.create(
        user,
        titulo,
        descripcion || "",
        parseFloat(longitud),
        parseFloat(latitud),
        fecha_inicio,
        fecha_fin,
        url_imagen || ""
      );

      res.status(201).json({
        message: "Evento publicado exitosamente sobre el mapa.",
        event,
      });
    } catch (error: any) {
      console.error("Error al crear evento:", error);
      if (error.code === '42501') {
        res.status(403).json({ message: "No tienes permisos suficientes (RLS) para crear eventos" });
      } else {
        res.status(500).json({ message: "Error interno del servidor" });
      }
    }
  }

  public static async deleteEvent(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const user = req.user;

    try {
      const deleted = await EventoModel.delete(user, parseInt(id as string));
      if (!deleted) {
        res.status(404).json({ message: "Evento no encontrado" });
        return;
      }
      res.json({ message: "Evento eliminado con éxito." });
    } catch (error) {
      console.error("Error al eliminar evento:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
}
