export interface AuthUser {
  id: number;
  email: string;
  role: string;
  verificado?: boolean;
}

/** Normaliza respuestas de login, profile o caché al formato del store. */
export function normalizeAuthUser(data: unknown): AuthUser | null {
  if (!data || typeof data !== "object") return null;

  const row = data as Record<string, unknown>;
  const id = row.id;
  if (id === undefined || id === null) return null;

  const email = (row.email ?? row.correo) as string | undefined;
  if (!email) return null;

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

  const verificado = row.verificado === undefined ? undefined : Boolean(row.verificado);

  return {
    id: Number(id),
    email,
    role: (role || "turista").toLowerCase(),
    verificado,
  };
}
