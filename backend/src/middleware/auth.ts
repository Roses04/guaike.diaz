/**
 * MIDDLEWARE DE AUTENTICACIÓN Y AUTORIZACIÓN
 * 
 * Este archivo contiene las funciones que se interponen ("middlewares")
 * entre una petición HTTP (req) que hace el frontend y la respuesta del backend (res).
 * Se usan para verificar que el usuario esté logueado y tenga los permisos necesarios.
 */

import express from "express";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"; // Librería para crear y validar tokens JWT

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Interfaz que extiende el Request de Express para incluir los datos del usuario logueado
export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

/**
 * Middleware: authenticateToken
 * Verifica si la petición incluye un token JWT válido en los Headers.
 * Si es válido, extrae los datos del usuario y permite continuar (next).
 * Si no es válido, devuelve un error 401 (No autorizado) o 403 (Prohibido).
 */
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extrae el token (formato "Bearer <token>")

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Verifica el token contra nuestra clave secreta
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user; // Inyecta el usuario decodificado en la request
    next(); // Pasa el control a la siguiente función o controlador
  });
};

/**
 * Middleware: authorizeRole
 * Verifica si el usuario autenticado tiene uno de los roles requeridos para la ruta.
 * Se DEBE usar después de authenticateToken.
 * @param roles Array de roles permitidos (ej. ['admin', 'operador'])
 */
export const authorizeRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Si no hay usuario o el rol no está en la lista de permitidos, bloquea el acceso.
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }
    next(); // Permite el paso
  };
};
