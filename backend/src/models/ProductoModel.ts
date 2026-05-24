import pool from "../config/database.js";
import type { Producto } from "../types/database.types.js";

export class ProductoModel {
  public static async create(
    operadorId: number,
    nombre: string,
    descripcion: string,
    precio: number,
    urlImagen?: string
  ): Promise<Producto> {
    const result = await pool.query(
      `INSERT INTO productos (operador_id, nombre, descripcion, precio, url_imagen) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, operador_id, nombre, descripcion, precio, url_imagen, esta_disponible, fecha_creacion`,
      [operadorId, nombre, descripcion, precio, urlImagen || null]
    );
    return result.rows[0];
  }

  public static async delete(id: number, operadorId: number): Promise<boolean> {
    const result = await pool.query(
      "DELETE FROM productos WHERE id = $1 AND operador_id = $2 RETURNING id",
      [id, operadorId]
    );
    return result.rows.length > 0;
  }

  public static async updateDisponibilidad(id: number, operadorId: number, estaDisponible: boolean): Promise<boolean> {
    const result = await pool.query(
      "UPDATE productos SET esta_disponible = $1 WHERE id = $2 AND operador_id = $3 RETURNING id",
      [estaDisponible, id, operadorId]
    );
    return result.rows.length > 0;
  }
}
