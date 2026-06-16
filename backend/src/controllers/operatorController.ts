/**
 * CONTROLADOR DE OPERADORES (ARTESANOS)
 * 
 * Contiene la lógica de negocio para procesar las peticiones relacionadas
 * con los artesanos, proveedores de turismo y sus perfiles.
 * Toma los datos de la petición (req), llama al Modelo de base de datos,
 * y devuelve la respuesta (res) al frontend.
 */

import type { Request, Response } from "express";
import { OperadorModel } from "../models/OperadorModel.js";
import { StatsModel } from "../models/StatsModel.js";
import type { AuthRequest } from "../middleware/auth.js";

export class OperatorController {
  
  /**
   * Obtiene la lista de operadores (solo los verificados por la alcaldía).
   * Soporta filtros por parroquia, categoría o término de búsqueda.
   */
  public static async getOperators(req: Request, res: Response): Promise<void> {
    const { parroquia_id, categoria_id, q } = req.query;

    try {
      const filters: { parroquiaId?: number; categoriaId?: number; query?: string } = {};

      if (parroquia_id) filters.parroquiaId = parseInt(parroquia_id as string);
      if (categoria_id) filters.categoriaId = parseInt(categoria_id as string);
      if (q) filters.query = q as string;

      const operators = await OperadorModel.findVerified(filters);

      // Log para el panel de estadísticas del admin: 
      // Registra qué categorías y parroquias se están buscando más.
      if (filters.categoriaId || filters.parroquiaId) {
        // Se ejecuta en segundo plano (sin await) para no retrasar la respuesta al usuario.
        StatsModel.logSearch(
          (req as any).user?.id || null,
          filters.categoriaId || null,
          filters.parroquiaId || null
        ).catch((err) => console.error("Error logging search:", err));
      }

      res.json(operators);
    } catch (error) {
      console.error("Error al obtener operadores:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  /**
   * Obtiene todos los detalles de un operador específico (incluyendo galería, productos y reseñas).
   */
  public static async getOperatorById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
      const operator = await OperadorModel.findById(parseInt(id as string));
      if (!operator) {
        res.status(404).json({ message: "Operador no encontrado" });
        return;
      }
      res.json(operator);
    } catch (error) {
      console.error("Error al obtener detalle del operador:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  /**
   * Crea un nuevo perfil de operador (Se crea en estado "Pendiente de verificación").
   * Requiere autenticación.
   */
  public static async createOperator(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id; // ID del usuario extraído del JWT
    if (!userId) {
      res.status(401).json({ message: "No autorizado" });
      return;
    }

    const {
      parroquia_id,
      categoria_id,
      nombre_taller,
      descripcion,
      longitud,
      latitud,
      direccion_detallada,
      telefono_whatsapp,
      imagen_principal,
      galeria,
      accesibilidad_ids,
    } = req.body;

    // Validación básica de campos requeridos
    if (!parroquia_id || !categoria_id || !nombre_taller || !longitud || !latitud) {
      res.status(400).json({
        message: "Los campos parroquia_id, categoria_id, nombre_taller, longitud y latitud son obligatorios",
      });
      return;
    }

    try {
      // Verificar si el usuario ya tiene un perfil de operador (Relación 1 a 1)
      const existingOperator = await OperadorModel.findByUsuarioId(userId);
      if (existingOperator) {
        res.status(400).json({ message: "Este usuario ya tiene un perfil de operador" });
        return;
      }

      const operadorId = await OperadorModel.create(
        req.user,
        userId,
        parseInt(parroquia_id),
        parseInt(categoria_id),
        nombre_taller,
        descripcion || "",
        parseFloat(longitud),
        parseFloat(latitud),
        direccion_detallada || "",
        telefono_whatsapp || "",
        imagen_principal || "",
        galeria || [],
        accesibilidad_ids ? accesibilidad_ids.map((id: any) => parseInt(id)) : []
      );

      res.status(201).json({
        message: "Registro del operador exitoso. Pendiente de verificación por la alcaldía.",
        operadorId,
      });
    } catch (error: any) {
      console.error("Error al crear operador:", error);
      res.status(500).json({ message: error.message || "Error interno del servidor" });
    }
  }

  /**
   * Obtiene los catálogos estáticos (Categorías, Parroquias, Accesibilidades)
   * Útil para llenar los Selects (Combobox) en el frontend.
   */
  public static async getStaticData(req: Request, res: Response): Promise<void> {
    try {
      const data = await OperadorModel.getStaticData();
      res.json(data);
    } catch (error) {
      console.error("Error al obtener datos estáticos:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  /**
   * Obtiene la lista de operadores que aún no han sido aprobados.
   * [ADMIN ONLY]
   */
  public static async getPendingOperators(req: AuthRequest, res: Response): Promise<void> {
    try {
      const pending = await OperadorModel.findPending();
      res.json(pending);
    } catch (error) {
      console.error("Error al obtener operadores pendientes:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  /**
   * Cambia el estado de verificación de un operador (lo aprueba para que sea visible en el directorio).
   * [ADMIN ONLY]
   */
  public static async verifyOperator(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { es_verificado } = req.body;

    if (es_verificado === undefined) {
      res.status(400).json({ message: "El campo es_verificado es obligatorio" });
      return;
    }

    try {
      await OperadorModel.verify(req.user, parseInt(id as string), !!es_verificado);
      res.json({
        message: `Operador ${!!es_verificado ? "verificado" : "desverificado"} con éxito.`,
      });
    } catch (error: any) {
      console.error("Error al verificar operador:", error);
      if (error.code === '42501') {
        res.status(403).json({ message: "No tienes permisos suficientes (RLS) para verificar operadores" });
      } else {
        res.status(500).json({ message: "Error interno del servidor" });
      }
    }
  }
}
