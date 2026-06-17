import pool from "../config/database.js";
import type { Resena } from "../types/database.types.js";

export class ResenaModel {
  public static async create(
    operadorId: number,
    usuarioId: number,
    puntuacion: number,
    comentario: string,
    qrVerificado: boolean = false
  ): Promise<Resena> {
    const result = await pool.query(
      `INSERT INTO resenas (operador_id, usuario_id, puntuacion, comentario, qr_verificado) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, operador_id, usuario_id, puntuacion, comentario, qr_verificado, fecha_creacion`,
      [operadorId, usuarioId, puntuacion, comentario, qrVerificado]
    );
    return result.rows[0];
  }

  public static async validateQr(qrUuid: string): Promise<number | null> {
    const result = await pool.query(
      "SELECT id FROM operadores WHERE qr_codigo_unico = $1",
      [qrUuid]
    );

    if (result.rows.length === 0) {
      return null;
    }
    return parseInt(result.rows[0].id);
  }

  public static async findByUsuarioId(usuarioId: number): Promise<any[]> {
    const result = await pool.query(
      `SELECT r.id, r.operador_id, r.puntuacion, r.comentario, r.qr_verificado, r.fecha_creacion,
              r.respuesta_operador, r.fecha_respuesta, o.nombre_taller
       FROM resenas r
       JOIN operadores o ON r.operador_id = o.id
       WHERE r.usuario_id = $1
       ORDER BY r.fecha_creacion DESC`,
      [usuarioId]
    );
    return result.rows;
  }

  public static async findAll(filters?: { rating?: number; query?: string }): Promise<any[]> {
    let sql = `
      SELECT r.id, r.operador_id, r.usuario_id, r.puntuacion, r.comentario, r.qr_verificado, r.fecha_creacion,
             r.respuesta_operador, r.fecha_respuesta, o.nombre_taller, u.correo as usuario_correo
      FROM resenas r
      JOIN operadores o ON r.operador_id = o.id
      JOIN usuarios u ON r.usuario_id = u.id
      WHERE 1=1
    `;
    const values: any[] = [];
    let paramIndex = 1;

    if (filters?.rating) {
      sql += ` AND r.puntuacion = $${paramIndex}`;
      values.push(filters.rating);
      paramIndex++;
    }

    if (filters?.query) {
      sql += ` AND (r.comentario ILIKE $${paramIndex} OR o.nombre_taller ILIKE $${paramIndex} OR u.correo ILIKE $${paramIndex})`;
      values.push(`%${filters.query}%`);
      paramIndex++;
    }

    sql += ` ORDER BY r.fecha_creacion DESC`;

    const result = await pool.query(sql, values);
    return result.rows;
  }

  public static async update(
    id: number,
    usuarioId: number,
    puntuacion: number,
    comentario: string
  ): Promise<Resena | null> {
    const result = await pool.query(
      `UPDATE resenas 
       SET puntuacion = $1, comentario = $2 
       WHERE id = $3 AND usuario_id = $4 
       RETURNING id, operador_id, usuario_id, puntuacion, comentario, qr_verificado, fecha_creacion`,
      [puntuacion, comentario, id, usuarioId]
    );

    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0];
  }

  public static async delete(id: number, usuarioId: number, isAdmin: boolean): Promise<boolean> {
    let result;
    if (isAdmin) {
      result = await pool.query("DELETE FROM resenas WHERE id = $1 RETURNING id", [id]);
    } else {
      result = await pool.query("DELETE FROM resenas WHERE id = $1 AND usuario_id = $2 RETURNING id", [id, usuarioId]);
    }
    return result.rows.length > 0;
  }

  public static async addReply(id: number, usuarioId: number, replyText: string): Promise<any | null> {
    // 1. Obtener el operador de este usuario
    const operatorRes = await pool.query("SELECT id FROM operadores WHERE usuario_id = $1", [usuarioId]);
    if (operatorRes.rows.length === 0) {
      throw new Error("El usuario no tiene un perfil de operador registrado");
    }
    const operadorId = parseInt(operatorRes.rows[0].id);

    // 2. Actualizar la reseña asegurando que corresponda a este operador
    const result = await pool.query(
      `UPDATE resenas 
       SET respuesta_operador = $1, fecha_respuesta = CURRENT_TIMESTAMP 
       WHERE id = $2 AND operador_id = $3 
       RETURNING id, operador_id, puntuacion, comentario, respuesta_operador, fecha_respuesta`,
      [replyText, id, operadorId]
    );

    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0];
  }
}
