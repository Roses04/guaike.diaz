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
}
