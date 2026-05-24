const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

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

const seed = async () => {
  try {
    console.log("Seeding data...");

    // 1. Create a test operator user
    const hashedPass = await bcrypt.hash("password123", 12);
    
    // Check if role exists
    const roleRes = await pool.query("SELECT id FROM roles WHERE name = 'operator'");
    if (roleRes.rows.length === 0) {
        throw new Error("Role 'operator' not found. Run migrations first.");
    }
    const roleId = roleRes.rows[0].id;

    const userRes = await pool.query(
      "INSERT INTO users (email, password, role_id) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING RETURNING id",
      ["artesano@test.com", hashedPass, roleId]
    );

    let userId;
    if (userRes.rows.length > 0) {
      userId = userRes.rows[0].id;
    } else {
      const existing = await pool.query("SELECT id FROM users WHERE email = $1", ["artesano@test.com"]);
      userId = existing.rows[0].id;
    }

    // 2. Create some operators
    const operators = [
      {
        name: "Tejeduría San Juan",
        description: "Tradición en hamacas y chinchorros de hilos de algodón. Maestras tejedoras con más de 40 años de experiencia.",
        category: "Textil",
        lng: -63.949,
        lat: 11.018,
        images: ["https://images.unsplash.com/photo-1528460033278-a6ba57020470?auto=format&fit=crop&w=800"]
      },
      {
        name: "Cestería El Espinal",
        description: "Elaboración de cestas, sombreros y alfombras utilizando la palma datilera propia de la zona.",
        category: "Palma",
        lng: -63.925,
        lat: 11.005,
        images: ["https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=800"]
      },
      {
        name: "Dulcería Tradicional María",
        description: "Dulces de dátil, piñonate y conservas tradicionales del Municipio Díaz.",
        category: "Gastronomía",
        lng: -63.955,
        lat: 11.025,
        images: ["https://images.unsplash.com/photo-1559181567-c3190ca9959b?auto=format&fit=crop&w=800"]
      }
    ];

    for (const op of operators) {
      await pool.query(
        `INSERT INTO operators (user_id, name, description, category, location, images, is_verified) 
         VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326), $7, true)
         ON CONFLICT DO NOTHING`,
        [userId, op.name, op.description, op.category, op.lng, op.lat, op.images]
      );
    }

    console.log("Seed successful!");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seed();
