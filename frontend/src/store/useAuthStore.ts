import { create } from "zustand";

interface User {
  id: number;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

let storedUser: User | null = null;
try {
  const rawUser = localStorage.getItem("auth_user");
  storedUser = rawUser ? JSON.parse(rawUser) : null;
} catch {
  storedUser = null;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser,
  token: localStorage.getItem("token"),
  setAuth: (user, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("auth_user", JSON.stringify(user));
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth_user");
    set({ user: null, token: null });
  },
}));
