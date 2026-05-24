import { create } from "zustand";

interface NetworkState {
  isOnline: boolean;
  setOnline: (status: boolean) => void;
}

export const useNetworkStore = create<NetworkState>((set) => {
  // Inicializar listeners nativos del navegador
  if (typeof window !== "undefined") {
    window.addEventListener("online", () => set({ isOnline: true }));
    window.addEventListener("offline", () => set({ isOnline: false }));
  }

  return {
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    setOnline: (status) => set({ isOnline: status }),
  };
});
