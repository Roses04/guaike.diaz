import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import MobileTabBar from "./components/MobileTabBar";
import Footer from "./components/Footer";
import HomeView from "./views/HomeView";
import DirectoryView from "./views/DirectoryView";
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
      <div className="min-h-screen bg-surface transition-colors duration-200 relative overflow-x-hidden flex flex-col">
        {/* Ambient Aurora Glow Background */}
        <div className="aurora-bg">
          <div className="aurora-glow-1"></div>
          <div className="aurora-glow-2"></div>
        </div>

        {/* Global PWA Install Banner */}
        <InstallPWA />

        {/* Global Network Connectivity Banner */}
        <NetworkBanner />

        <Navbar />

        <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 pb-[var(--mobile-chrome-bottom)] pt-[var(--mobile-chrome-top)] md:pt-4 transition-all duration-200 z-10">
          <main className="w-full flex flex-col bg-white/80 dark:bg-slate-900/40 backdrop-blur-sm md:backdrop-blur-2xl md:border md:border-stone-200/90 md:dark:border-white/5 md:shadow-2xl md:rounded-[40px] md:overflow-hidden">
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/directorio" element={<DirectoryView />} />
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

        <MobileTabBar />
      </div>
    </Router>
  );
}

export default App;