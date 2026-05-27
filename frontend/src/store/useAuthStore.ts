import { create } from "zustand";
import { normalizeAuthUser, type AuthUser } from "../utils/authUser";

type User = AuthUser;

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

let storedUser: User | null = null;
try {
  const rawUser = localStorage.getItem("auth_user");
  storedUser = rawUser ? normalizeAuthUser(JSON.parse(rawUser)) : null;
} catch {
  storedUser = null;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser,
  token: localStorage.getItem("token"),
  setAuth: (user, token) => {
    const normalized = normalizeAuthUser(user) ?? user;
    localStorage.setItem("token", token);
    localStorage.setItem("auth_user", JSON.stringify(normalized));
    set({ user: normalized, token });
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth_user");
    set({ user: null, token: null });
  },
}));
