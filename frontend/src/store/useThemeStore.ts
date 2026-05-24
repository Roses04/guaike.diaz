import { create } from "zustand";

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDarkMode: localStorage.getItem("theme") === "dark",
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
    const isDark = localStorage.getItem("theme") === "dark" || 
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    
    if (isDark) {
      document.documentElement.classList.add("dark");
      set({ isDarkMode: true });
    } else {
      document.documentElement.classList.remove("dark");
      set({ isDarkMode: false });
    }
  }
}));
