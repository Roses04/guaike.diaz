import { create } from "zustand";

const resolveIsDark = (): boolean => {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem("theme");
  if (stored === "light") return false;
  if (stored === "dark") return true;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDarkMode: resolveIsDark(),
  toggleTheme: () => {
    const nextDark = !get().isDarkMode;
    localStorage.setItem("theme", nextDark ? "dark" : "light");
    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    set({ isDarkMode: nextDark });
  },
  initializeTheme: () => {
    const isDark = resolveIsDark();
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    if (!localStorage.getItem("theme")) {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    }
    set({ isDarkMode: isDark });
  },
}));
