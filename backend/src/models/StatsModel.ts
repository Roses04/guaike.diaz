import pool from "../config/database.js";

export class StatsModel {
  public static async logSearch(
    usuarioId?: number | null,
    categoriaId?: number | null,
    parroquiaId?: number | null
  ): Promise<void> {
    await pool.query(
      `INSERT INTO registros_busqueda (usuario_id, categoria_id, parroquia_id) 
       VALUES ($1, $2, $3)`,
      [usuarioId || null, categoriaId || null, parroquiaId || null]
    );
  }

  public static async getDashboardStats(): Promise<any> {
    // 1. General Metrics
    const verifiedResult = await pool.query("SELECT COUNT(*)::int as total FROM operadores WHERE es_verificado = true");
    const pendingResult = await pool.query("SELECT COUNT(*)::int as total FROM operadores WHERE es_verificado = false");
    const reviewsResult = await pool.query("SELECT COUNT(*)::int as total, SUM(CASE WHEN qr_verificado THEN 1 ELSE 0 END)::int as qr_total FROM resenas");
    const usersResult = await pool.query("SELECT COUNT(*)::int as total FROM usuarios");

    // 2. Searches by Category (join with categorias)
    const categoryStats = await pool.query(
      `SELECT c.nombre as categoria_nombre, COUNT(r.id)::int as cantidad
       FROM registros_busqueda r
       JOIN categorias c ON r.categoria_id = c.id
       GROUP BY c.nombre
       ORDER BY cantidad DESC`
    );

    // 3. Searches by Parroquia
    const parroquiaStats = await pool.query(
      `SELECT p.nombre as parroquia_nombre, COUNT(r.id)::int as cantidad
       FROM registros_busqueda r
       JOIN parroquias p ON r.parroquia_id = p.id
       GROUP BY p.nombre
       ORDER BY cantidad DESC`
    );

    // 4. Searches timeline (last 7 days)
    const timelineStats = await pool.query(
      `SELECT TO_CHAR(fecha_busqueda, 'YYYY-MM-DD') as fecha, COUNT(*)::int as cantidad
       FROM registros_busqueda
       WHERE fecha_busqueda >= CURRENT_TIMESTAMP - INTERVAL '7 days'
       GROUP BY TO_CHAR(fecha_busqueda, 'YYYY-MM-DD')
       ORDER BY fecha ASC`
    );

    return {
      metricas: {
        operadores_verificados: verifiedResult.rows[0].total,
        operadores_pendientes: pendingResult.rows[0].total,
        total_resenas: reviewsResult.rows[0].total,
        resenas_verificadas_qr: reviewsResult.rows[0].qr_total || 0,
        total_usuarios: usersResult.rows[0].total,
      },
      busquedas_por_categoria: categoryStats.rows,
      busquedas_por_parroquia: parroquiaStats.rows,
      busquedas_linea_tiempo: timelineStats.rows,
    };
  }
}
