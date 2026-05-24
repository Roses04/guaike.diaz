import type { Response } from "express";
import { StatsModel } from "../models/StatsModel.js";
import type { AuthRequest } from "../middleware/auth.js";

export class StatsController {
  public static async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await StatsModel.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error al obtener estadísticas del dashboard:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
}
