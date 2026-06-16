/**
 * PUNTO DE ENTRADA PRINCIPAL DEL BACKEND (SERVIDOR EXPRESS)
 * 
 * Este archivo inicializa el servidor web usando Express.
 * Aquí se configuran los middlewares globales (seguridad, CORS, parseo de JSON)
 * y se registran todas las rutas principales de la API (auth, operadores, reseñas, etc.).
 */

import "./env.js"; // Carga las variables de entorno desde los archivos .env
import express from "express";
import type { Request, Response } from "express";
import cors from "cors"; // Permite peticiones desde otros dominios (el frontend)
import helmet from "helmet"; // Añade cabeceras HTTP de seguridad automáticamente

// Importación de las rutas de cada módulo
import authRoutes from "./routes/authRoutes.js"; // Rutas de autenticación y registro
import operatorRoutes from "./routes/operatorRoutes.js"; // Rutas para gestionar artesanos/operadores
import reviewRoutes from "./routes/reviewRoutes.js"; // Rutas para reseñas y escaneo QR
import eventRoutes from "./routes/eventRoutes.js"; // Rutas para eventos y ferias
import statsRoutes from "./routes/statsRoutes.js"; // Rutas de estadísticas para el dashboard admin

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares globales
app.use(helmet()); // Seguridad
app.use(cors()); // CORS (Crucial para que el frontend local/Vercel pueda comunicarse)
app.use(express.json()); // Parsea el body de las peticiones a JSON (req.body)

// Ruta de prueba (Healthcheck) para verificar que el servidor está vivo
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to GUAIKE.DÍAZ API" });
});

// Registro de Rutas (Asignación de URLs base a cada módulo)
app.use("/api/auth", authRoutes);
app.use("/api/operators", operatorRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/stats", statsRoutes);

// Iniciar el servidor escuchando en el puerto definido
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
