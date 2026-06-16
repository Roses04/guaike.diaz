/**
 * MODELO DE OPERADORES (Capa de Acceso a Datos)
 * 
 * Aquí se definen todas las consultas (Queries) directas a PostgreSQL 
 * relacionadas con la tabla 'operadores' y sus dependencias.
 * Utiliza PostGIS (ST_X, ST_Y, ST_MakePoint) para manejar datos geoespaciales.
 */

import pool, { executeWithRLS } from "../config/database.js";
import type { Operador, Producto, Resena, OpcionAccesibilidad, OperadorImagen } from "../types/database.types.js";

export class OperadorModel {
  /**
   * Encuentra todos los operadores verificados, aplicando filtros opcionales.
   * Utiliza funciones JSON de Postgres (json_agg) para devolver las accesibilidades anidadas.
   */
  public static async findVerified(filters?: { parroquiaId?: number; categoriaId?: number; query?: string }): Promise<any[]> {
    let sql = `
      SELECT o.id, o.nombre_taller, o.descripcion, o.telefono_whatsapp, o.es_verificado, o.qr_codigo_unico,
             c.nombre as categoria_nombre, p.nombre as parroquia_nombre,
             ST_X(o.ubicacion::geometry) as longitud,
             ST_Y(o.ubicacion::geometry) as latitud,
             (SELECT url_imagen FROM operador_imagenes WHERE operador_id = o.id AND es_principal = true LIMIT 1) as imagen_principal,
             COALESCE((
               SELECT json_agg(json_build_object('id', oa.id, 'etiqueta', oa.etiqueta, 'icono', oa.icono))
               FROM opciones_accesibilidad oa
               JOIN operador_accesibilidad oacc ON oa.id = oacc.accesibilidad_id
               WHERE oacc.operador_id = o.id
             ), '[]'::json) as accesibilidades
      FROM operadores o
      JOIN categorias c ON o.categoria_id = c.id
      JOIN parroquias p ON o.parroquia_id = p.id
      WHERE o.es_verificado = true
    `;

    const values: any[] = [];
    let placeholderIndex = 1;

    if (filters?.parroquiaId) {
      sql += ` AND o.parroquia_id = $${placeholderIndex}`;
      values.push(filters.parroquiaId);
      placeholderIndex++;
    }

    if (filters?.categoriaId) {
      sql += ` AND o.categoria_id = $${placeholderIndex}`;
      values.push(filters.categoriaId);
      placeholderIndex++;
    }

    if (filters?.query) {
      sql += ` AND (o.nombre_taller ILIKE $${placeholderIndex} OR o.descripcion ILIKE $${placeholderIndex})`;
      values.push(`%${filters.query}%`);
      placeholderIndex++;
    }

    sql += " ORDER BY o.fecha_creacion DESC";

    const result = await pool.query(sql, values);
    return result.rows;
  }

  /**
   * Obtiene la lista de operadores pendientes de revisión por un administrador.
   */
  public static async findPending(): Promise<any[]> {
    const sql = `
      SELECT o.id, o.nombre_taller, o.descripcion, o.telefono_whatsapp, o.es_verificado, o.direccion_detallada,
             c.nombre as categoria_nombre, p.nombre as parroquia_nombre, u.correo as usuario_correo,
             ST_X(o.ubicacion::geometry) as longitud,
             ST_Y(o.ubicacion::geometry) as latitud,
             (SELECT url_imagen FROM operador_imagenes WHERE operador_id = o.id AND es_principal = true LIMIT 1) as imagen_principal
      FROM operadores o
      JOIN categorias c ON o.categoria_id = c.id
      JOIN parroquias p ON o.parroquia_id = p.id
      JOIN usuarios u ON o.usuario_id = u.id
      WHERE o.es_verificado = false
      ORDER BY o.fecha_creacion DESC
    `;

    const result = await pool.query(sql);
    return result.rows;
  }

  /**
   * Obtiene el perfil completo de un operador, agrupando datos de varias tablas
   * (Galería, Accesibilidad, Productos, Reseñas).
   */
  public static async findById(id: number): Promise<any | null> {
    const operatorResult = await pool.query(
      `SELECT o.id, o.usuario_id, o.nombre_taller, o.descripcion, o.telefono_whatsapp, o.es_verificado, 
              o.qr_codigo_unico, o.direccion_detallada, o.categoria_id, o.parroquia_id,
              c.nombre as categoria_nombre, p.nombre as parroquia_nombre,
              ST_X(o.ubicacion::geometry) as longitud,
              ST_Y(o.ubicacion::geometry) as latitud
       FROM operadores o
       JOIN categorias c ON o.categoria_id = c.id
       JOIN parroquias p ON o.parroquia_id = p.id
       WHERE o.id = $1`,
      [id]
    );

    if (operatorResult.rows.length === 0) {
      return null;
    }

    const operator = operatorResult.rows[0];

    // Cargar galería de imágenes
    const imagesResult = await pool.query(
      "SELECT id, url_imagen, es_principal FROM operador_imagenes WHERE operador_id = $1 ORDER BY es_principal DESC, id ASC",
      [id]
    );
    operator.imagenes = imagesResult.rows;

    // Cargar etiquetas de accesibilidad
    const accessResult = await pool.query(
      `SELECT oa.id, oa.etiqueta, oa.icono 
       FROM opciones_accesibilidad oa
       JOIN operador_accesibilidad oacc ON oa.id = oacc.accesibilidad_id
       WHERE oacc.operador_id = $1`,
      [id]
    );
    operator.accesibilidades = accessResult.rows;

    // Cargar catálogo de productos activos
    const productsResult = await pool.query(
      "SELECT id, nombre, descripcion, precio, url_imagen, esta_disponible FROM productos WHERE operador_id = $1 AND esta_disponible = true ORDER BY id DESC",
      [id]
    );
    operator.productos = productsResult.rows;

    // Cargar reseñas verificadas
    const reviewsResult = await pool.query(
      `SELECT r.id, r.puntuacion, r.comentario, r.qr_verificado, r.fecha_creacion, u.correo as usuario_correo
       FROM resenas r
       JOIN usuarios u ON r.usuario_id = u.id
       WHERE r.operador_id = $1
       ORDER BY r.fecha_creacion DESC`,
      [id]
    );
    operator.resenas = reviewsResult.rows;

    // Calcular promedio de calificación
    const ratingResult = await pool.query(
      "SELECT AVG(puntuacion)::float as promedio, COUNT(*)::int as total FROM resenas WHERE operador_id = $1",
      [id]
    );
    operator.calificacion_promedio = ratingResult.rows[0].promedio || 0;
    operator.total_resenas = ratingResult.rows[0].total || 0;

    return operator;
  }

  /**
   * Busca un operador usando el ID de usuario autenticado (para verificar 
   * si el usuario logueado ya es un operador).
   */
  public static async findByUsuarioId(usuarioId: number): Promise<any | null> {
    const result = await pool.query("SELECT id FROM operadores WHERE usuario_id = $1", [usuarioId]);
    if (result.rows.length === 0) {
      return null;
    }
    return this.findById(result.rows[0].id);
  }

  /**
   * Inserta un nuevo operador en la base de datos de manera transaccional.
   * Si algo falla, revierte (ROLLBACK) todo el proceso para no dejar datos huérfanos.
   */
  public static async create(
    user: any,
    usuarioId: number,
    parroquiaId: number,
    categoriaId: number,
    nombreTaller: string,
    descripcion: string,
    longitud: number,
    latitud: number,
    direccionDetallada: string,
    telefonoWhatsapp: string,
    imagenPrincipalUrl: string,
    galeriaUrls: string[],
    accesibilidadIds: number[]
  ): Promise<number> {
    return executeWithRLS(user, async (client) => {
      await client.query("BEGIN"); // Iniciar transacción

      // Insertar el perfil base usando un Punto de PostGIS
      const operatorInsert = await client.query(
        `INSERT INTO operadores 
         (usuario_id, parroquia_id, categoria_id, nombre_taller, descripcion, ubicacion, direccion_detallada, telefono_whatsapp)
         VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326), $8, $9)
         RETURNING id`,
        [usuarioId, parroquiaId, categoriaId, nombreTaller, descripcion, longitud, latitud, direccionDetallada, telefonoWhatsapp]
      );

      const operadorId = operatorInsert.rows[0].id;

      // Insertar imagen principal
      if (imagenPrincipalUrl) {
        await client.query(
          `INSERT INTO operador_imagenes (operador_id, url_imagen, es_principal, subido_por_usuario_id) 
           VALUES ($1, $2, true, $3)`,
          [operadorId, imagenPrincipalUrl, usuarioId]
        );
      }

      // Insertar galería adicional
      if (galeriaUrls && galeriaUrls.length > 0) {
        for (const url of galeriaUrls) {
          await client.query(
            `INSERT INTO operador_imagenes (operador_id, url_imagen, es_principal, subido_por_usuario_id) 
             VALUES ($1, $2, false, $3)`,
            [operadorId, url, usuarioId]
          );
        }
      }

      // Insertar etiquetas de accesibilidad
      if (accesibilidadIds && accesibilidadIds.length > 0) {
        for (const accId of accesibilidadIds) {
          await client.query(
            `INSERT INTO operador_accesibilidad (operador_id, accesibilidad_id) 
             VALUES ($1, $2)`,
            [operadorId, accId]
          );
        }
      }

      await client.query("COMMIT"); // Confirmar transacción
      return operadorId;
    });
  }

  public static async update(
    user: any,
    id: number,
    parroquiaId: number,
    categoriaId: number,
    nombreTaller: string,
    descripcion: string,
    longitud: number,
    latitud: number,
    direccionDetallada: string,
    telefonoWhatsapp: string,
    accesibilidadIds: number[]
  ): Promise<void> {
    return executeWithRLS(user, async (client) => {

      // Actualizar perfil base
      await client.query(
        `UPDATE operadores 
         SET parroquia_id = $1, categoria_id = $2, nombre_taller = $3, descripcion = $4,
             ubicacion = ST_SetSRID(ST_MakePoint($5, $6), 4326), direccion_detallada = $7,
             telefono_whatsapp = $8, fecha_actualizacion = CURRENT_TIMESTAMP
         WHERE id = $9`,
        [parroquiaId, categoriaId, nombreTaller, descripcion, longitud, latitud, direccionDetallada, telefonoWhatsapp, id]
      );

      // Re-insertar etiquetas de accesibilidad
      await client.query("DELETE FROM operador_accesibilidad WHERE operador_id = $1", [id]);
      if (accesibilidadIds && accesibilidadIds.length > 0) {
        for (const accId of accesibilidadIds) {
          await client.query(
            `INSERT INTO operador_accesibilidad (operador_id, accesibilidad_id) 
             VALUES ($1, $2)`,
            [id, accId]
          );
        }
      }
    });
  }

  /**
   * Cambia el estatus de un operador (Aprobado/Rechazado)
   */
  public static async verify(user: any, id: number, esVerificado: boolean): Promise<void> {
    return executeWithRLS(user, async (client) => {
      await client.query(
        "UPDATE operadores SET es_verificado = $1, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = $2",
        [esVerificado, id]
      );
    });
  }

  /**
   * Obtiene los datos estáticos que no cambian a menudo.
   */
  public static async getStaticData(): Promise<{ categorias: any[]; parroquias: any[]; accesibilidades: any[] }> {
    const cats = await pool.query("SELECT id, nombre, descripcion FROM categorias ORDER BY nombre ASC");
    const parrs = await pool.query("SELECT id, nombre FROM parroquias ORDER BY nombre ASC");
    const accs = await pool.query("SELECT id, etiqueta, icono FROM opciones_accesibilidad ORDER BY etiqueta ASC");

    return {
      categorias: cats.rows,
      parroquias: parrs.rows,
      accesibilidades: accs.rows,
    };
  }
}
