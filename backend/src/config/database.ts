/**
 * CONFIGURACIÓN DE LA BASE DE DATOS (PostgreSQL / Supabase)
 * 
 * Este archivo establece la conexión (Pool) entre el backend y la base de datos PostgreSQL.
 * Utiliza la librería 'pg' para manejar las conexiones.
 */

import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// 1. Lógica para encontrar el archivo .env sin importar desde dónde se inicie el script
const rootEnvPath = path.resolve(process.cwd(), ".env");
const parentEnvPath = path.resolve(process.cwd(), "..", ".env");
const backendEnvPath = path.resolve(process.cwd(), "backend", ".env");
const envPath = [rootEnvPath, parentEnvPath, backendEnvPath].find((p) => fs.existsSync(p));

if (envPath) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

// 2. Obtener la cadena de conexión desde las variables de entorno
const connectionString = process.env.DATABASE_URL;

// 3. Crear el "Pool" de conexiones
// Un Pool maneja múltiples conexiones simultáneas a la BD de forma eficiente.
// Soporta conexión directa por URL (ideal para Supabase) o por parámetros individuales.
const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false, // Necesario para conexiones seguras a Supabase
      },
    })
  : new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT || "5433"),
    });

/**
 * Ejecuta una función de base de datos dentro de una transacción
 * configurando los parámetros locales de sesión requeridos por las 
 * políticas RLS (Row Level Security) de Supabase.
 * 
 * @param user Objeto de usuario autenticado (con id/sub y role)
 * @param queryFn Función que recibe el cliente pg para hacer queries
 */
export const executeWithRLS = async <T>(
  user: any,
  queryFn: (client: any) => Promise<T>
): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    // Inyectar contexto de Supabase Auth
    if (user) {
      // Configuramos el rol a 'authenticated' o el que tenga el usuario
      const pgRole = user.role === 'admin' ? 'authenticated' : 'authenticated'; // RLS base usa authenticated
      await client.query(`SET LOCAL role TO '${pgRole}'`);
      
      // Inyectar el payload del JWT (Supabase usa auth.uid() buscando el 'sub')
      const claims = {
        sub: user.id || user.sub,
        role: user.role,
        email: user.email || user.correo
      };
      await client.query(`SET LOCAL "request.jwt.claims" TO '${JSON.stringify(claims)}'`);
    } else {
      await client.query(`SET LOCAL role TO 'anon'`);
    }

    const result = await queryFn(client);
    
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export default pool;
