import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import api from "../services/api";
import {
  User,
  ShieldCheck,
  CheckCircle,
  Home,
  Info,
  ArrowRight,
  WifiOff,
} from "lucide-react";

const ProfileView = () => {
  const { user, token, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const storedUser = localStorage.getItem("auth_user");
    if (!user && storedUser) {
      try {
        setProfile(JSON.parse(storedUser));
      } catch {
        setProfile(null);
      }
    }

    const loadProfile = async () => {
      setLoading(true);
      setError("");
      if (!navigator.onLine) {
        setIsOffline(true);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/profile");
        setProfile(response.data);
        setAuth(response.data, token);
        setIsOffline(false);
      } catch (err: any) {
        console.error("Error al cargar perfil:", err);
        setError("No se pudo actualizar la información. Mostrando datos en caché.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();

    const handleOnline = () => {
      setIsOffline(false);
      loadProfile();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [token, user, navigate, setAuth]);

  if (!token) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-4 border-brand-blue border-t-transparent animate-spin mx-auto mb-6"></div>
        <p className="text-slate-600 dark:text-slate-400">Cargando tu perfil...</p>
      </div>
    );
  }

  const userRole = profile?.role || user?.role || "turista";
  const email = profile?.email || user?.email || "-";
  const createdAt = profile?.fecha_creacion || profile?.created_at || "-";

  const getRoleDescription = () => {
    switch (userRole) {
      case "admin":
        return "Tienes acceso completo a la administración de operadores, eventos y estadísticas del municipio.";
      case "operador":
        return "Puedes registrar tu taller artesanal y gestionar tu presencia en el directorio.";
      default:
        return "Puedes explorar los talleres artesanales, dejar reseñas y participar en los recorridos culturales.";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="glass-panel rounded-3xl p-8 shadow-2xl border border-slate-200/70 dark:border-white/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand-gold font-bold mb-2">Perfil de Usuario</p>
            <h1 className="text-4xl font-display font-extrabold text-slate-900 dark:text-white">Hola, {email}</h1>
            <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-2xl">{getRoleDescription()}</p>
          </div>
          <div className="rounded-3xl bg-brand-blue/10 dark:bg-brand-light/10 p-5 border border-brand-blue/20 dark:border-brand-light/20">
            <div className="flex items-center gap-3 text-brand-blue dark:text-brand-light">
              <User size={28} />
              <div>
                <p className="text-xs uppercase tracking-[0.3em] font-semibold">Rol Actual</p>
                <p className="text-xl font-bold capitalize">{userRole}</p>
              </div>
            </div>
          </div>
        </div>

        {isOffline && (
          <div className="mb-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-200 p-4">
            <div className="flex items-start gap-3">
              <WifiOff size={20} />
              <div>
                <p className="font-bold">Modo sin conexión</p>
                <p className="text-sm text-slate-700 dark:text-slate-200">Estás viendo datos guardados localmente. Se actualizarán cuando vuelvas a conectarte.</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-3xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-200 p-4">
            <div className="flex items-start gap-3">
              <Info size={20} />
              <div>
                <p className="font-bold">Atención</p>
                <p className="text-sm text-slate-700 dark:text-slate-200">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="rounded-3xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-white/10 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-semibold mb-4">Correo</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white break-words">{email}</p>
          </div>
          <div className="rounded-3xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-white/10 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-semibold mb-4">Miembro desde</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{createdAt !== "-" ? createdAt : "No disponible"}</p>
          </div>
          <div className="rounded-3xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-white/10 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-semibold mb-4">Acceso</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{userRole === "admin" ? "Administrador" : userRole === "operador" ? "Operador" : "Turista"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {userRole === "admin" && (
            <Link
              to="/admin"
              className="rounded-3xl border border-brand-blue/20 bg-brand-blue/5 dark:bg-brand-blue/10 p-6 flex flex-col gap-4 hover:border-brand-blue dark:hover:border-brand-light transition"
            >
              <div className="flex items-center justify-between">
                <ShieldCheck size={28} className="text-brand-blue" />
                <ArrowRight size={20} className="text-brand-blue" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">Ir al Panel Admin</span>
              <p className="text-sm text-slate-500 dark:text-slate-400">Gestiona operadores, eventos y estadísticas.</p>
            </Link>
          )}

          {userRole === "operador" && (
            <Link
              to="/registro-operador"
              className="rounded-3xl border border-brand-gold/20 bg-brand-gold/5 dark:bg-brand-gold/10 p-6 flex flex-col gap-4 hover:border-brand-gold dark:hover:border-brand-light transition"
            >
              <div className="flex items-center justify-between">
                <CheckCircle size={28} className="text-brand-gold" />
                <ArrowRight size={20} className="text-brand-gold" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">Gestionar Taller</span>
              <p className="text-sm text-slate-500 dark:text-slate-400">Registra o actualiza tu perfil como artesano.</p>
            </Link>
          )}

          {userRole !== "admin" && (
            <Link
              to="/"
              className="rounded-3xl border border-brand-green/20 bg-brand-green/5 dark:bg-brand-green/10 p-6 flex flex-col gap-4 hover:border-brand-green dark:hover:border-brand-light transition"
            >
              <div className="flex items-center justify-between">
                <Home size={28} className="text-brand-green" />
                <ArrowRight size={20} className="text-brand-green" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">Explorar Talleres</span>
              <p className="text-sm text-slate-500 dark:text-slate-400">Busca, filtra y visita los talleres artesanales verificados.</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
