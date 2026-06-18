import pool from "../config/database.js";
import fs from "fs";
import path from "path";

export interface BackupData {
  timestamp: string;
  version: string;
  tables: {
    [tableName: string]: any[];
  };
}

const ORDERED_TABLES = [
  "roles",
  "categorias",
  "parroquias",
  "opciones_accesibilidad",
  "usuarios",
  "operadores",
  "operador_imagenes",
  "operador_accesibilidad",
  "productos",
  "resenas",
  "eventos",
  "registros_busqueda"
];

export class BackupService {
  private static backupDir = path.resolve(process.cwd(), "backups");

  private static ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  public static async createBackup(): Promise<{ filename: string; data: BackupData }> {
    this.ensureBackupDir();
    const backupData: BackupData = {
      timestamp: new Date().toISOString(),
      version: "1.0",
      tables: {}
    };

    const client = await pool.connect();
    try {
      for (const table of ORDERED_TABLES) {
        let queryText = `SELECT * FROM ${table}`;
        
        // Handle PostGIS geometry fields specifically to serialize them to simple floats
        if (table === "operadores") {
          queryText = `
            SELECT id, usuario_id, parroquia_id, categoria_id, nombre_taller, descripcion, 
                   ST_X(ubicacion::geometry) as longitud, ST_Y(ubicacion::geometry) as latitud, 
                   direccion_detallada, telefono_whatsapp, es_verificado, qr_codigo_unico, 
                   fecha_creacion, fecha_actualizacion 
            FROM operadores
          `;
        } else if (table === "eventos") {
          queryText = `
            SELECT id, titulo, descripcion, 
                   ST_X(ubicacion::geometry) as longitud, ST_Y(ubicacion::geometry) as latitud, 
                   fecha_inicio, fecha_fin, url_imagen, fecha_creacion 
            FROM eventos
          `;
        }

        const result = await client.query(queryText);
        backupData.tables[table] = result.rows;
      }

      // Save file locally
      const safeDate = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `backup-${safeDate}.json`;
      const filePath = path.join(this.backupDir, filename);
      fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), "utf8");

      return { filename, data: backupData };
    } finally {
      client.release();
    }
  }

  public static async listBackups(): Promise<Array<{ filename: string; size: number; date: string }>> {
    this.ensureBackupDir();
    const files = fs.readdirSync(this.backupDir);
    const backups = files
      .filter((file) => file.startsWith("backup-") && file.endsWith(".json"))
      .map((file) => {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          size: stats.size,
          date: stats.mtime.toISOString()
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date)); // Newest first

    return backups;
  }

  public static getBackupFilePath(filename: string): string {
    this.ensureBackupDir();
    const safeFilename = path.basename(filename);
    return path.join(this.backupDir, safeFilename);
  }

  public static async restoreBackup(backupData: BackupData): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 1. Truncate all tables in cascade to clear old data
      const truncateQuery = `TRUNCATE ${ORDERED_TABLES.join(", ")} CASCADE;`;
      await client.query(truncateQuery);

      // 2. Insert data in order of foreign key dependency
      for (const table of ORDERED_TABLES) {
        const rows = backupData.tables[table];
        if (!rows || rows.length === 0) continue;

        for (const row of rows) {
          const keys = Object.keys(row);
          
          if (table === "operadores") {
            // Reconstruct PostGIS Point from lat/lng
            const filteredKeys = keys.filter(k => k !== "longitud" && k !== "latitud");
            filteredKeys.push("ubicacion");

            const values = filteredKeys.map((key) => {
              if (key === "ubicacion") {
                // If coordinates are valid, return the PostGIS construction SQL
                if (row.longitud !== null && row.latitud !== null) {
                  return `ST_SetSRID(ST_MakePoint(${row.longitud}, ${row.latitud}), 4326)`;
                }
                return "NULL";
              }
              const val = row[key];
              return val === null ? "NULL" : `'${String(val).replace(/'/g, "''")}'`;
            });

            const insertText = `INSERT INTO operadores (${filteredKeys.join(", ")}) VALUES (${values.join(", ")});`;
            await client.query(insertText);
          } 
          else if (table === "eventos") {
            // Reconstruct PostGIS Point for events
            const filteredKeys = keys.filter(k => k !== "longitud" && k !== "latitud");
            filteredKeys.push("ubicacion");

            const values = filteredKeys.map((key) => {
              if (key === "ubicacion") {
                if (row.longitud !== null && row.latitud !== null) {
                  return `ST_SetSRID(ST_MakePoint(${row.longitud}, ${row.latitud}), 4326)`;
                }
                return "NULL";
              }
              const val = row[key];
              if (val instanceof Date || key === "fecha_inicio" || key === "fecha_fin" || key === "fecha_creacion") {
                return val === null ? "NULL" : `'${new Date(val).toISOString()}'`;
              }
              return val === null ? "NULL" : `'${String(val).replace(/'/g, "''")}'`;
            });

            const insertText = `INSERT INTO eventos (${filteredKeys.join(", ")}) VALUES (${values.join(", ")});`;
            await client.query(insertText);
          } 
          else {
            // Standard generic insert for other tables
            const placeholders = keys.map((_, idx) => `$${idx + 1}`);
            const queryText = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders.join(", ")})`;
            const values = keys.map(key => {
              const val = row[key];
              // Format JSON values correctly
              if (val !== null && typeof val === "object") {
                return JSON.stringify(val);
              }
              return val;
            });
            await client.query(queryText, values);
          }
        }

        // 3. Reset primary key autoincrement sequence (except for relational junction tables)
        if (table !== "operador_accesibilidad") {
          const resetSeqQuery = `
            SELECT setval(
              pg_get_serial_sequence('${table}', 'id'), 
              COALESCE((SELECT MAX(id) FROM ${table}), 1), 
              (SELECT MAX(id) FROM ${table}) IS NOT NULL
            );
          `;
          await client.query(resetSeqQuery);
        }
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error during restoreBackup database transaction:", error);
      throw error;
    } finally {
      client.release();
    }
  }
}
