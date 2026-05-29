import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomeView from "./views/HomeView";
import MapView from "./views/MapView";
import LoginView from "./views/LoginView";
import RegisterOperatorView from "./views/RegisterOperatorView";
import OperatorDetailView from "./views/OperatorDetailView";
import QRScannerView from "./views/QRScannerView";
import AdminDashboardView from "./views/AdminDashboardView";
import ItineraryView from "./views/ItineraryView";
import ProfileView from "./views/ProfileView";
import { useThemeStore } from "./store/useThemeStore";
import api, { syncOfflineQueue } from "./services/api";
import InstallPWA from "./components/InstallPWA";
import { NetworkBanner } from "./components/NetworkBanner";
import { useAuthStore } from "./store/useAuthStore";
import { normalizeAuthUser } from "./utils/authUser";

function App() {
  const { initializeTheme } = useThemeStore();
  const { token, user, setAuth } = useAuthStore();

  useEffect(() => {
    initializeTheme();

    // Restaurar sesión si hay token guardado pero no usuario en memoria
    if (token && !user) {
      api.get("/auth/profile")
        .then((res) => {
          const normalized = normalizeAuthUser(res.data);
          if (normalized) {
            setAuth(normalized, token);
          }
        })
        .catch(() => {
          const cachedUser = localStorage.getItem("auth_user");
          if (cachedUser) {
            try {
              const normalized = normalizeAuthUser(JSON.parse(cachedUser));
              if (normalized) {
                setAuth(normalized, token);
                return;
              }
            } catch {
              // continue to logout if cache is invalid
            }
          }
          useAuthStore.getState().logout();
        });
    }

    // Sincronizar cola pendiente si hay conexión al iniciar
    if (navigator.onLine) {
      syncOfflineQueue();
    }

    const handleOnline = () => syncOfflineQueue();
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [initializeTheme]);

  return (
    <Router>
      {/* CAMBIO 1: Se añade 'md:h-screen md:overflow-hidden' para fijar el viewport 
        en resoluciones de escritorio y evitar que la barra de scroll general del navegador aparezca.
      */}
      <div className="min-h-screen md:min-h-0 md:h-screen md:overflow-hidden transition-colors duration-200 relative overflow-x-hidden">
        {/* Ambient Aurora Glow Background */}
        <div className="aurora-bg">
          <div className="aurora-glow-1"></div>
          <div className="aurora-glow-2"></div>
        </div>

        {/* Global PWA Install Banner */}
        <InstallPWA />

        {/* Global Network Conectivity Banner */}
        <NetworkBanner />

        {/* Global Layout Container */}
        {/* CAMBIO 2: Cambiamos 'md:min-h-screen' por 'md:h-full' para que el Grid 
          se acople milimétricamente al contenedor padre de pantalla completa.
        */}
        <div className="md:grid md:grid-cols-[260px_1fr] md:gap-8 md:max-w-7xl md:mx-auto md:p-6 md:h-full w-full">
          <Navbar />

          {/* CAMBIO 3: Añadimos 'md:h-full md:overflow-y-auto' a la caja translúcida.
            Esto hace que la columna derecha actúe como un panel independiente, encapsulando el scroll 
            de modo que las vistas (como el mapa) y el footer se deslicen de forma interna y fluida.
          */}
          <div className="flex flex-col min-h-screen md:min-h-0 md:h-full md:overflow-y-auto md:bg-white/40 md:dark:bg-slate-900/40 md:backdrop-blur-2xl md:border md:border-stone-200/90 md:dark:border-white/5 md:shadow-2xl md:rounded-[40px] md:relative pb-[var(--mobile-chrome-bottom)] pt-[var(--mobile-chrome-top)] md:pb-0 md:pt-0 transition-all duration-200 z-10">
            <main className="flex-grow flex flex-col w-full h-full">
              <Routes>
                <Route path="/" element={<HomeView />} />
                <Route path="/mapa" element={<MapView />} />
                <Route path="/login" element={<LoginView />} />
                <Route path="/perfil" element={<ProfileView />} />
                <Route path="/registro-operador" element={<RegisterOperatorView />} />
                <Route path="/operador/:id" element={<OperatorDetailView />} />
                <Route path="/operador/:id/escanear-qr" element={<QRScannerView />} />
                <Route path="/admin" element={<AdminDashboardView />} />
                <Route path="/itinerarios" element={<ItineraryView />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;