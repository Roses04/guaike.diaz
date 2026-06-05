import pool from "../config/database.js";
import type { Usuario } from "../types/database.types.js";

export class UsuarioModel {
  public static async findByCorreo(correo: string): Promise<any | null> {
    const result = await pool.query(
      `SELECT u.*, r.nombre as rol_nombre 
       FROM usuarios u 
       JOIN roles r ON u.rol_id = r.id 
       WHERE u.correo = $1`,
      [correo]
    );

    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0];
  }

  public static async findById(id: number): Promise<any | null> {
    const result = await pool.query(
      `SELECT u.id, u.correo, u.rol_id, r.nombre as rol_nombre, u.fecha_creacion
       FROM usuarios u
       JOIN roles r ON u.rol_id = r.id
       WHERE u.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0];
  }

  public static async create(correo: string, contrasenaHasheada: string, rolNombre: string = "turista"): Promise<Usuario> {
    // Get role id
    const roleResult = await pool.query("SELECT id FROM roles WHERE nombre = $1", [rolNombre]);
    if (roleResult.rows.length === 0) {
      throw new Error(`Rol '${rolNombre}' no es válido`);
    }
    const rolId = roleResult.rows[0].id;

    const result = await pool.query(
      `INSERT INTO usuarios (correo, contrasena, rol_id) 
       VALUES ($1, $2, $3) 
       RETURNING id, correo, rol_id, fecha_creacion, fecha_actualizacion`,
      [correo, contrasenaHasheada, rolId]
    );

    return result.rows[0];
  }

  public static async updateUltimoAcceso(id: number): Promise<void> {
    await pool.query(
      "UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = $1",
      [id]
    );
  }
  public static async actualizarCodigoVerificacion(usuarioId: number, codigo: string): Promise<void> {
    await pool.query(
      `UPDATE usuarios SET codigo_verificacion = $1 WHERE id = $2`,
      [codigo, usuarioId]
    );
  }

  public static async confirmarVerificacion(usuarioId: number): Promise<void> {
    await pool.query(
      `UPDATE usuarios SET verificado = TRUE, codigo_verificacion = NULL WHERE id = $1`,
      [usuarioId]
    );
  }
}
