import pool, { executeWithRLS } from "../config/database.js";
import type { Evento } from "../types/database.types.js";

export class EventoModel {
  public static async create(
    user: any,
    titulo: string,
    descripcion: string,
    longitud: number,
    latitud: number,
    fechaInicio: Date | string,
    fechaFin: Date | string,
    urlImagen?: string
  ): Promise<Evento> {
    return executeWithRLS(user, async (client) => {
      const result = await client.query(
        `INSERT INTO eventos (titulo, descripcion, ubicacion, fecha_inicio, fecha_fin, url_imagen) 
         VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5, $6, $7) 
         RETURNING id, titulo, descripcion, ST_AsGeoJSON(ubicacion)::json as ubicacion, fecha_inicio, fecha_fin, url_imagen, fecha_creacion`,
        [titulo, descripcion, longitud, latitud, fechaInicio, fechaFin, urlImagen || null]
      );

      const event = result.rows[0];
      event.longitud = longitud;
      event.latitud = latitud;
      return event;
    });
  }

  public static async findAllActive(): Promise<any[]> {
    // Lectura pública, no requiere RLS estricto o puede usar el rol anónimo/por defecto
    const result = await pool.query(
      `SELECT id, titulo, descripcion, url_imagen, fecha_inicio, fecha_fin,
              ST_X(ubicacion::geometry) as longitud,
              ST_Y(ubicacion::geometry) as latitud
       FROM eventos
       WHERE fecha_fin >= CURRENT_TIMESTAMP - INTERVAL '1 day'
       ORDER BY fecha_inicio ASC`
    );
    return result.rows;
  }

  public static async delete(user: any, id: number): Promise<boolean> {
    return executeWithRLS(user, async (client) => {
      const result = await client.query("DELETE FROM eventos WHERE id = $1 RETURNING id", [id]);
      return result.rows.length > 0;
    });
  }
}
