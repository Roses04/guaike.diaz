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
} from "lucide-react";

const ROUTE_TITLES: Record<string, string> = {
  "/": "Inicio",
  "/directorio": "Directorio",
  "/mapa": "Mapa",
  "/itinerarios": "Rutas",
  "/login": "Ingresar",
  "/perfil": "Perfil",
  "/admin": "Administración",
  "/registro-operador": "Registro",
};

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const location = useLocation();

  const profileRoute = user ? "/perfil" : "/login";
  const isProfileActive = location.pathname === profileRoute;
  const isDirectoryActive =
    location.pathname === "/directorio" || location.pathname.startsWith("/operador/");

  const mobileTitle =
    ROUTE_TITLES[location.pathname] ||
    (location.pathname.startsWith("/operador/") ? "Artesano" : "GUAIKE");

  const NavLink = ({
    to,
    icon: Icon,
    label,
    isActive,
  }: {
    to: string;
    icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
    label: string;
    isActive: boolean;
  }) => (
    <Link
      to={to}
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

  const desktopNavLinks = (
    <>
      <NavLink to="/" icon={Home} label="Inicio" isActive={location.pathname === "/"} />
      <NavLink
        to="/directorio"
        icon={Users}
        label="Directorio"
        isActive={isDirectoryActive}
      />
      <NavLink to="/mapa" icon={MapIcon} label="Mapa" isActive={location.pathname === "/mapa"} />
      <NavLink
        to="/itinerarios"
        icon={Compass}
        label="Rutas"
        isActive={location.pathname === "/itinerarios"}
      />
      {user?.role === "admin" && (
        <NavLink
          to="/admin"
          icon={ShieldCheck}
          label="Admin"
          isActive={location.pathname === "/admin"}
        />
      )}
      <NavLink
        to={profileRoute}
        icon={User}
        label={user ? "Perfil" : "Ingresar"}
        isActive={isProfileActive}
      />
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-brand-dark/90 backdrop-blur-2xl border-b border-stone-200/90 dark:border-white/5 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-14 md:h-16 gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0 min-w-0">
            <img
              src="/images/logo.png"
              alt="Guaike Logo"
              className="h-8 md:h-9 w-auto dark:brightness-110 shrink-0"
            />
            <div className="hidden sm:block min-w-0">
              <div className="text-base md:text-lg font-display font-extrabold tracking-tight flex items-center gap-0.5 leading-none">
                <span className="text-primary dark:text-white">GUAIKE</span>
                <span className="text-brand-gold font-black">.</span>
              </div>
              <span className="text-[9px] md:text-[10px] font-bold text-brand-gold tracking-wider block">
                MUNICIPIO DÍAZ
              </span>
            </div>
            <span className="sm:hidden font-display font-bold text-sm text-primary dark:text-white truncate">
              {mobileTitle}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 flex-wrap justify-center">
            {desktopNavLinks}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-stone-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-700 transition border border-stone-200 dark:border-white/5"
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

            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="md:hidden p-2 rounded-xl bg-brand-blue/10 text-brand-blue dark:text-brand-light border border-brand-blue/20"
                aria-label="Administración"
              >
                <ShieldCheck size={18} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
