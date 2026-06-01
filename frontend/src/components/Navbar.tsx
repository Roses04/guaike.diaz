import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import {
  User,
  ShieldCheck,
  LogOut,
  Map as MapIcon,
  Home,
  Sun,
  Moon,
  Compass,
  Users,
  Menu,
  X,
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const profileRoute = user ? "/perfil" : "/login";
  const isProfileActive = location.pathname === profileRoute;
  const isDirectoryActive =
    location.pathname === "/directorio" || location.pathname.startsWith("/operador/");

  const closeMobile = () => setMobileOpen(false);

  const NavLink = ({
    to,
    icon: Icon,
    label,
    isActive,
    onNavigate,
  }: {
    to: string;
    icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
    label: string;
    isActive: boolean;
    onNavigate?: () => void;
  }) => (
    <Link
      to={to}
      onClick={onNavigate}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-150
        ${isActive
          ? "text-white bg-gradient-to-br from-brand-blue to-brand-light dark:from-brand-light dark:to-brand-blue shadow-md shadow-brand-blue/20"
          : "text-slate-600 dark:text-slate-300 hover:text-brand-blue dark:hover:text-brand-light hover:bg-brand-blue/10 dark:hover:bg-brand-light/10"
        }`}
    >
      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
      <span>{label}</span>
    </Link>
  );

  const navLinks = (
    <>
      <NavLink to="/" icon={Home} label="Inicio" isActive={location.pathname === "/"} onNavigate={closeMobile} />
      <NavLink
        to="/directorio"
        icon={Users}
        label="Directorio"
        isActive={isDirectoryActive}
        onNavigate={closeMobile}
      />
      <NavLink to="/mapa" icon={MapIcon} label="Mapa" isActive={location.pathname === "/mapa"} onNavigate={closeMobile} />
      <NavLink
        to="/itinerarios"
        icon={Compass}
        label="Rutas"
        isActive={location.pathname === "/itinerarios"}
        onNavigate={closeMobile}
      />
      {user?.role === "admin" && (
        <NavLink
          to="/admin"
          icon={ShieldCheck}
          label="Admin"
          isActive={location.pathname === "/admin"}
          onNavigate={closeMobile}
        />
      )}
      <NavLink
        to={profileRoute}
        icon={User}
        label={user ? "Perfil" : "Ingresar"}
        isActive={isProfileActive}
        onNavigate={closeMobile}
      />
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-surface-90 dark:bg-brand-dark/90 backdrop-blur-2xl border-b border-stone-200/90 dark:border-white/5 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-14 md:h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={closeMobile}>
            <img
              src="/images/logo.png"
              alt="Guaike Logo"
              className="h-8 md:h-9 w-auto dark:brightness-110"
            />
            <div className="hidden sm:block">
              <div className="text-base md:text-lg font-display font-extrabold tracking-tight flex items-center gap-0.5 leading-none">
                <span className="text-primary dark:text-white">GUAIKE</span>
                <span className="text-brand-gold font-black">.</span>
              </div>
              <span className="text-[9px] md:text-[10px] font-bold text-brand-gold tracking-wider block">
                MUNICIPIO DÍAZ
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-wrap justify-center">
            {navLinks}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-700 transition border border-stone-200 dark:border-white/5"
              aria-label={isDarkMode ? "Modo claro" : "Modo oscuro"}
            >
              {isDarkMode ? <Sun size={18} className="text-brand-gold" /> : <Moon size={18} />}
            </button>

            {user && (
              <button
                type="button"
                onClick={logout}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition text-sm font-bold"
              >
                <LogOut size={18} />
                <span className="hidden lg:inline">Salir</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden p-2 rounded-xl bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 border border-stone-200 dark:border-white/5"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-stone-200/80 dark:border-white/10 py-4 flex flex-col gap-1 animate-in slide-in-from-top-2 fade-in duration-200">
            {navLinks}
            {user && (
              <div className="mt-3 pt-3 border-t border-stone-200 dark:border-white/10 px-4">
                <span className="text-[10px] text-brand-gold font-bold uppercase tracking-wider block mb-1">
                  {user.role}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 break-words block mb-3">
                  {user.email}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    closeMobile();
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-500 hover:text-white font-bold text-sm transition"
                >
                  <LogOut size={18} />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
