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
    // 1. General Metrics from Data Mart Dimensions and Facts
    const verifiedResult = await pool.query("SELECT COUNT(*)::int as total FROM dim_artesano WHERE esta_verificado = true AND id_operador_sistema > 0");
    const pendingResult = await pool.query("SELECT COUNT(*)::int as total FROM dim_artesano WHERE esta_verificado = false AND id_operador_sistema > 0");
    const reviewsResult = await pool.query(
      `SELECT 
         COALESCE(SUM(CASE WHEN tipo_actividad IN ('visita_qr_verificada', 'opinion_enviada') THEN cantidad ELSE 0 END), 0)::int as total,
         COALESCE(SUM(CASE WHEN tipo_actividad = 'visita_qr_verificada' THEN cantidad ELSE 0 END), 0)::int as qr_total
       FROM hechos_actividad_turistica`
    );
    const usersResult = await pool.query("SELECT COUNT(*)::int as total FROM dim_turista WHERE id_usuario_sistema > 0");

    // 2. Searches by Category from Data Mart (join with dim_artesano)
    const categoryStats = await pool.query(
      `SELECT a.categoria_nombre, SUM(h.cantidad)::int as cantidad
       FROM hechos_actividad_turistica h
       JOIN dim_artesano a ON h.sk_artesano = a.sk_artesano
       WHERE h.tipo_actividad = 'busqueda_directorio' AND a.sk_artesano > 0
       GROUP BY a.categoria_nombre
       ORDER BY cantidad DESC`
    );

    // 3. Searches by Parroquia from Data Mart (join with dim_ubicacion)
    const parroquiaStats = await pool.query(
      `SELECT u.parroquia_nombre, SUM(h.cantidad)::int as cantidad
       FROM hechos_actividad_turistica h
       JOIN dim_ubicacion u ON h.sk_ubicacion = u.sk_ubicacion
       WHERE h.tipo_actividad = 'busqueda_directorio' AND u.sk_ubicacion > 0
       GROUP BY u.parroquia_nombre
       ORDER BY cantidad DESC`
    );

    // 4. Searches timeline (last 7 days) from Data Mart (join with dim_tiempo)
    const timelineStats = await pool.query(
      `SELECT TO_CHAR(t.fecha, 'YYYY-MM-DD') as fecha, SUM(h.cantidad)::int as cantidad
       FROM hechos_actividad_turistica h
       JOIN dim_tiempo t ON h.sk_tiempo = t.sk_tiempo
       WHERE h.tipo_actividad = 'busqueda_directorio'
         AND t.fecha >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY t.fecha
       ORDER BY t.fecha ASC`
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
