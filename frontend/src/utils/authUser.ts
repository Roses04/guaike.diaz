/**
 * INTERFACE Y UTILIDAD DE NORMALIZACIÓN DE USUARIOS AUTENTICADOS
 * 
 * Este archivo centraliza la estructura del usuario en sesión (`AuthUser`) y 
 * proporciona una función robusta de normalización (`normalizeAuthUser`). Su objetivo
 * es unificar las respuestas provenientes de diferentes fuentes (Supabase Auth en memoria,
 * respuestas directas de la tabla de base de datos `usuarios` o cargas de caché local)
 * a un objeto estandarizado y tipado para su uso en toda la aplicación.
 */

export interface AuthUser {
  id: number;
  email: string;
  role: string;
  verificado?: boolean;
  full_name?: string;
  telefono?: string;
  fecha_creacion?: string;
  cedula_tipo?: string;
  cedula_numero?: string;
  fecha_nacimiento?: string;
  municipio_residencia?: string;
}

/**
 * Normaliza las respuestas crudas de la API y Supabase al formato estandarizado `AuthUser`.
 * Maneja equivalencias de campos en español e inglés (ej. `correo` vs `email`, `telefono` vs `phone`).
 * 
 * @param data Objeto crudo retornado por Supabase, local cache o endpoint de autenticación.
 * @returns Un objeto `AuthUser` estructurado, o null si los datos no son válidos.
 */
export function normalizeAuthUser(data: unknown): AuthUser | null {
  if (!data || typeof data !== "object") return null;

  const row = data as Record<string, unknown>;
  const id = row.id;
  if (id === undefined || id === null) return null;

  // Normalizar correo electrónico
  const email = (row.email ?? row.correo) as string | undefined;
  if (!email) return null;

  // Extraer el rol del usuario (soporta rol crudo, relaciones anidadas o lookup en español)
  let role: string | undefined;
  if (typeof row.role === "string") {
    role = row.role;
  } else if (typeof row.rol_nombre === "string") {
    role = row.rol_nombre;
  } else if (row.roles && typeof row.roles === "object") {
    const roles = row.roles as Record<string, unknown> | unknown[];
    role = Array.isArray(roles)
      ? (roles[0] as Record<string, unknown> | undefined)?.nombre as string | undefined
      : (roles as Record<string, unknown>).nombre as string | undefined;
  }

  // Mapear campos opcionales del perfil y verificar equivalencias de idioma/base de datos
  const verificado = row.verificado === undefined ? undefined : Boolean(row.verificado);
  const full_name = (row.full_name ?? row.name) as string | undefined;
  const telefono = (row.telefono ?? row.phone) as string | undefined;
  const fecha_creacion = (row.fecha_creacion ?? row.created_at) as string | undefined;
  const cedula_tipo = row.cedula_tipo as string | undefined;
  const cedula_numero = row.cedula_numero as string | undefined;
  const fecha_nacimiento = row.fecha_nacimiento as string | undefined;
  const municipio_residencia = row.municipio_residencia as string | undefined;

  return {
    id: Number(id),
    email,
    role: (role || "turista").toLowerCase(), // Por defecto el rol es turista
    verificado,
    full_name,
    telefono,
    fecha_creacion,
    cedula_tipo,
    cedula_numero,
    fecha_nacimiento,
    municipio_residencia,
  };
}
