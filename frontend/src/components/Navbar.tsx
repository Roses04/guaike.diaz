import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
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
  MoreVertical,
  Search,
} from "lucide-react";
import ConfirmModal from "./ui/ConfirmModal";

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
  const isHomePage = location.pathname === "/";

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mobileSearch, setMobileSearch] = useState("");

  useEffect(() => {
    if (location.pathname === "/directorio") {
      setMobileSearch(searchParams.get("q") || "");
    }
  }, [location.pathname, searchParams]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = mobileSearch.trim();
    const destination = trimmed ? `/directorio?q=${encodeURIComponent(trimmed)}` : "/directorio";
    navigate(destination);
  };

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
      className={`nav-item-anim flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-150 border-2
        ${isActive
          ? "text-white bg-linear-to-br from-brand-blue to-brand-light dark:from-brand-light dark:to-brand-blue shadow-md shadow-brand-blue/20 border-transparent"
          : "text-slate-700 dark:text-slate-200 hover:text-brand-blue dark:hover:text-brand-light hover:bg-brand-blue/5 dark:hover:bg-brand-light/5 border-transparent hover:border-brand-blue/70 dark:hover:border-brand-light/70"
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
    <header className="sticky top-0 md:static z-50 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-b border-stone-200/90 dark:border-white/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-14 md:h-16 gap-2">

          {/* Left: profile (mobile) and logo (desktop) */}
          <div className="flex items-center gap-2 shrink-0 min-w-0">
            <Link to={profileRoute} className="md:hidden p-2 rounded-full bg-stone-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-stone-200 dark:border-white/5">
              <User size={20} />
            </Link>

            <Link to="/" className="hidden md:flex items-center gap-2 shrink-0 min-w-0">
              <img
                src="/images/logo.png"
                alt="Guaike Logo"
                className="h-8 md:h-9 w-auto dark:brightness-110 shrink-0"
              />
              <div className="hidden md:block min-w-0">
                <div className="text-base md:text-lg font-display font-extrabold tracking-tight flex items-center gap-0.5 leading-none">
                  <span className="text-slate-800 dark:text-slate-100">GUAIKE</span>
                  <span className="text-brand-gold font-black">.</span>
                </div>
                <span className="text-[9px] md:text-[10px] font-bold text-brand-gold tracking-wider block">
                  MUNICIPIO DÍAZ
                </span>
              </div>
            </Link>

            {/* Mobile title (small screens) */}
            <span className="md:hidden font-display font-extrabold text-sm tracking-tight truncate flex items-center gap-0.5">
              <span className="text-brand-blue">{isHomePage ? "GUAIKE" : mobileTitle}</span>
              {isHomePage && <span className="text-brand-gold">.</span>}
            </span>
          </div>

          {/* Mobile search (center) */}
          <form onSubmit={handleSearchSubmit} className="md:hidden flex-1 mx-3">
            <label htmlFor="mobile-directory-search" className="sr-only">Buscar en directorio</label>
            <div className="flex items-center gap-2 bg-stone-100 dark:bg-slate-800/70 rounded-full px-4 py-2 text-slate-500 dark:text-slate-300 text-sm">
              <Search size={16} className="text-slate-500 dark:text-slate-300" />
              <input
                id="mobile-directory-search"
                type="search"
                value={mobileSearch}
                onChange={(e) => setMobileSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
              />
            </div>
          </form>

          {/* Desktop nav: shown only at lg+ to prevent wrapping at medium widths */}
          <nav className="hidden md:flex items-center gap-0.5 flex-nowrap overflow-hidden">
            {desktopNavLinks}
          </nav>

          <div className="flex items-center gap-2 shrink-0 relative">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-stone-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-700 transition border border-stone-200 dark:border-white/5"
              aria-label={isDarkMode ? "Modo claro" : "Modo oscuro"}
            >
              {isDarkMode ? <Sun size={18} className="text-brand-gold" /> : <Moon size={18} />}
            </button>

            {/* Mobile menu button */}
            {user && (
              <button
                type="button"
                onClick={() => setMenuOpen((s) => !s)}
                className="md:hidden p-2 rounded-xl bg-stone-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-stone-200 dark:border-white/5"
                aria-label="Opciones"
              >
                <MoreVertical size={18} />
              </button>
            )}

            {user && (
              <>
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition text-sm font-bold"
                >
                  <LogOut size={18} />
                  <span className="hidden xl:inline">Salir</span>
                </button>
                <ConfirmModal
                  open={showLogoutConfirm}
                  title="Cerrar sesión"
                  username={user?.email || user?.role || null}
                  description="¿Estás seguro que deseas cerrar sesión?"
                  confirmLabel="Sí, cerrar sesión"
                  cancelLabel="Cancelar"
                  onClose={() => setShowLogoutConfirm(false)}
                  onConfirm={() => { setShowLogoutConfirm(false); logout(); }}
                />
              </>
            )}

            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="lg:hidden p-2 rounded-xl bg-brand-blue/10 text-brand-blue dark:text-brand-light border border-brand-blue/20"
                aria-label="Administración"
              >
                <ShieldCheck size={18} />
              </Link>
            )}

            {/* Mobile dropdown menu */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-stone-200 dark:border-white/10 overflow-hidden z-50">
                <ul className="py-1">
                  <li>
                    <Link to="/" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-700">Inicio</Link>
                  </li>
                  <li>
                    <Link to="/directorio" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-700">Directorio</Link>
                  </li>
                  <li>
                    <Link to="/mapa" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-700">Mapa</Link>
                  </li>
                  {user ? (
                    <>
                      <li>
                        <Link to={profileRoute} onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-700">Perfil</Link>
                      </li>
                      <li>
                        <button onClick={() => { setMenuOpen(false); setShowLogoutConfirm(true); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-stone-100 dark:hover:bg-slate-700">Cerrar sesión</button>
                      </li>
                    </>
                  ) : (
                    <li>
                      <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-700">Ingresar</Link>
                    </li>
                  )}
                </ul>
              </div>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
