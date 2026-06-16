/**
 * ESTADO GLOBAL DE AUTENTICACIÓN (Zustand)
 * 
 * Este archivo crea un "store" global que guarda si el usuario ha iniciado sesión.
 * Cualquier componente de React puede leer 'user' o 'token' desde aquí sin
 * necesidad de pasarlo por "props" (ej. const { user } = useAuthStore()).
 * También maneja el guardado del token en localStorage para que la sesión 
 * no se pierda al recargar la página.
 */

import { create } from "zustand";
import { normalizeAuthUser, type AuthUser } from "../utils/authUser";

type User = AuthUser;

// Define qué datos y funciones estarán disponibles globalmente
interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void; // Función para hacer Login
  logout: () => void; // Función para cerrar sesión
}

// 1. Intenta cargar el usuario desde localStorage al inicio (Persistencia)
let storedUser: User | null = null;
try {
  const rawUser = localStorage.getItem("auth_user");
  storedUser = rawUser ? normalizeAuthUser(JSON.parse(rawUser)) : null;
} catch {
  storedUser = null;
}

// 2. Crea el "store" usando Zustand
export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser,
  token: localStorage.getItem("token"),
  
  // Guardar sesión (Actualiza estado de React y LocalStorage simultáneamente)
  setAuth: (user, token) => {
    const normalized = normalizeAuthUser(user) ?? user;
    localStorage.setItem("token", token);
    localStorage.setItem("auth_user", JSON.stringify(normalized));
    set({ user: normalized, token });
  },
  
  // Cerrar sesión (Borra datos de React y LocalStorage)
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth_user");
    set({ user: null, token: null });
    try {
      // Redirige al login forzando la recarga para limpiar cualquier estado
      if (typeof window !== "undefined") window.location.replace("/login");
    } catch (e) {
      // ignore
    }
  },
}));
