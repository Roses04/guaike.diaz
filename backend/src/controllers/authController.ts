import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UsuarioModel } from "../models/UsuarioModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    const { email, password, role } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "El correo y la contraseña son obligatorios" });
      return;
    }

    try {
      // Check if user exists
      const userExists = await UsuarioModel.findByCorreo(email);
      if (userExists) {
        res.status(400).json({ message: "El usuario ya está registrado" });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      const normalizedRole = typeof role === "string" && ["admin", "operador", "turista"].includes(role)
        ? role
        : "turista";

      // Create user with a validated role
      const newUser = await UsuarioModel.create(email, hashedPassword, normalizedRole);

      res.status(201).json({
        message: "Usuario registrado exitosamente",
        user: { id: newUser.id, email: newUser.correo, role: normalizedRole },
      });
    } catch (error: any) {
      console.error("Error en registro:", error);
      res.status(500).json({ message: error.message || "Error interno del servidor" });
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "El correo y la contraseña son requeridos" });
      return;
    }

    try {
      const user = await UsuarioModel.findByCorreo(email);
      if (!user) {
        res.status(400).json({ message: "Credenciales inválidas" });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.contrasena);
      if (!isMatch) {
        res.status(400).json({ message: "Credenciales inválidas" });
        return;
      }

      // Update last access
      await UsuarioModel.updateUltimoAcceso(user.id);

      const token = jwt.sign(
        { id: user.id, role: user.rol_nombre },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        token,
        user: { id: user.id, email: user.correo, role: user.rol_nombre },
      });
    } catch (error) {
      console.error("Error en login:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  public static async getProfile(req: any, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "No autorizado" });
      return;
    }

    try {
      const user = await UsuarioModel.findById(userId);
      if (!user) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }
      res.json(user);
    } catch (error) {
      console.error("Error al obtener perfil:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
}
