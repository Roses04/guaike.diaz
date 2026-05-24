import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

const rootEnvPath = path.resolve(process.cwd(), ".env");
const parentEnvPath = path.resolve(process.cwd(), "..", ".env");
const backendEnvPath = path.resolve(process.cwd(), "backend", ".env");
const envPath = [rootEnvPath, parentEnvPath, backendEnvPath].find((p) => fs.existsSync(p));

if (envPath) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const connectionString = process.env.DATABASE_URL;

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    })
  : new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT || "5433"),
    });

export default pool;
