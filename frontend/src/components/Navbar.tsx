import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { User, ShieldCheck, LogOut, Map as MapIcon, Home, Sun, Moon, Compass, Search } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();

  const NavItem = ({ to, icon: Icon, label, isActive }: { to: string, icon: any, label: string, isActive: boolean }) => (
    <Link
      to={to}
      className={`flex flex-col md:flex-row items-center md:justify-start gap-1.5 md:gap-4 md:px-6 md:py-3.5 md:rounded-2xl transition-all duration-150 relative group w-full
        ${isActive
          ? "text-brand-blue dark:text-brand-light md:bg-gradient-to-br md:from-brand-blue md:to-brand-light md:dark:from-brand-light md:dark:to-brand-blue md:text-white md:shadow-lg md:shadow-brand-blue/20"
          : "text-slate-500 dark:text-slate-300 hover:text-brand-blue dark:hover:text-brand-light md:hover:bg-brand-blue/10 md:dark:hover:bg-brand-light/10"
        }`}
    >
      <div className={`relative transition-transform duration-150 ${isActive ? "md:scale-100 -translate-y-1 md:-translate-y-0" : "md:group-hover:translate-x-1"}`}>
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "md:text-white" : ""} />
      </div>
      <span className={`text-[9px] md:text-sm font-semibold md:font-bold ${isActive ? "md:text-white" : ""}`}>{label}</span>

      {/* Mobile Active Indicator Dot */}
      <div className={`absolute -bottom-1.5 md:hidden w-1.5 h-1.5 rounded-full bg-brand-blue dark:bg-brand-light transition-all duration-150 ${isActive ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}></div>
    </Link>
  );

  const profileRoute = user ? "/perfil" : "/login";
  const isProfileActive = location.pathname === profileRoute;

  const handleSearch = () => {
    if (location.pathname !== "/") {
      navigate("/#global-search");
      return;
    }
    const el = document.getElementById("global-search");
    el?.focus();
    window.scrollTo({
      top: el ? el.getBoundingClientRect().top + window.scrollY - 100 : 0,
      behavior: "smooth",
    });
  };

  const SearchNavItem = ({ isActive }: { isActive: boolean }) => (
    <button
      type="button"
      onClick={handleSearch}
      className={`flex flex-col md:hidden items-center gap-1.5 transition-all duration-150 relative group
        ${isActive
          ? "text-brand-blue dark:text-brand-light"
          : "text-slate-500 dark:text-slate-300 hover:text-brand-blue dark:hover:text-brand-light"
        }`}
    >
      <Search size={24} strokeWidth={isActive ? 2.5 : 2} />
      <span className="text-[9px] font-semibold">Buscar</span>
      <div className={`absolute -bottom-1.5 w-1.5 h-1.5 rounded-full bg-brand-blue dark:bg-brand-light transition-all duration-150 ${isActive ? "opacity-100 scale-100" : "opacity-0 scale-0"}`} />
    </button>
  );

  return (
    <>
      {/* MOBILE TOP HEADER */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-surface-85 dark:bg-brand-dark/85 backdrop-blur-xl border-b border-stone-200/50 dark:border-white/5 py-2 px-6 flex justify-between items-center transition-colors duration-150">
        <Link to="/" className="flex items-center gap-2">
          <img src="/images/logo.png" alt="Guaike Logo" className="h-8 w-auto dark:brightness-110" />
          <div className="text-lg font-display font-extrabold tracking-tight flex items-center gap-0.5">
            <span className="text-primary dark:text-white">GUAIKE</span>
            <span className="text-brand-gold font-black">.</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-[14px] bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-700 transition shadow-sm border border-stone-200 dark:border-white/5 backdrop-blur-md"
          >
            {isDarkMode ? <Sun size={18} className="text-brand-gold" /> : <Moon size={18} />}
          </button>

          <Link to={profileRoute} className="w-10 h-10 rounded-[16px] bg-gradient-to-br from-brand-gold to-amber-500 flex items-center justify-center text-white shadow-lg shadow-brand-gold/20 border-2 border-surface dark:border-brand-dark -rotate-3 hover:rotate-0 transition-transform">
            <User size={20} strokeWidth={2.5} />
          </Link>
        </div>
      </header>

      {/* DESKTOP SIDEBAR & MOBILE BOTTOM NAV */}
      {/* CAMBIO: Se añadió 'md:overflow-y-auto' y la clase personalizada 'scrollbar-none' para asegurar contención absoluta de los elementos */}
      <nav className="fixed bottom-0 left-0 right-0 md:sticky md:top-8 md:h-[calc(100vh-64px)] md:overflow-y-auto z-50 bg-surface-90 dark:bg-brand-dark/90 md:bg-surface-60 md:dark:bg-slate-900/40 backdrop-blur-2xl border-t md:border border-stone-200/90 dark:border-white/5 rounded-t-[32px] md:rounded-[40px] shadow-[0_-10px_40px_-10px_rgba(15,76,129,0.08)] md:shadow-2xl flex md:flex-col justify-around md:justify-start px-3 sm:px-6 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] md:p-6 transition-all duration-150 md:gap-3 w-full md:w-[260px] scrollbar-none">

        {/* Desktop Logo */}
        <div className="hidden md:flex flex-col items-center mb-10 text-center mt-2 w-full flex-shrink-0">
          <Link to="/" className="flex flex-col items-center gap-2">
            <img src="/images/logo.png" alt="Guaike Logo" className="h-16 w-auto drop-shadow-md dark:brightness-110" />
            <div className="text-[1.8rem] font-display font-extrabold tracking-tight flex items-center gap-0.5 leading-none mt-1">
              <span className="text-primary dark:text-white">GUAIKE</span>
              <span className="text-brand-gold font-black">.</span>
            </div>
          </Link>
          <span className="text-[11px] font-bold text-brand-gold dark:text-brand-gold mt-1 block tracking-wider">MUNICIPIO DÍAZ</span>
        </div>

        {/* Enlaces de navegación */}
        <NavItem to="/" icon={Home} label="Inicio" isActive={location.pathname === "/"} />
        <SearchNavItem isActive={location.pathname === "/" && typeof window !== "undefined" && window.location.hash === "#global-search"} />
        <NavItem to="/mapa" icon={MapIcon} label="Mapa" isActive={location.pathname === "/mapa"} />
        <NavItem to="/itinerarios" icon={Compass} label="Rutas" isActive={location.pathname === "/itinerarios"} />
        {user?.role === "admin" && (
          <NavItem to="/admin" icon={ShieldCheck} label="Admin" isActive={location.pathname === "/admin"} />
        )}
        <NavItem to={profileRoute} icon={User} label={user ? "Perfil" : "Ingresar"} isActive={isProfileActive} />

        {/* Desktop Footer Actions */}
        {/* CAMBIO: Se añadió 'flex-shrink-0', 'w-full' y 'overflow-hidden' para que la info de sesión encaje perfectamente y respete el ancho */}
        <div className="hidden md:flex flex-col mt-auto gap-3 pt-6 border-t border-stone-200 dark:border-white/10 w-full flex-shrink-0 overflow-hidden">
          {user && (
            <div className="mb-2 px-2 w-full overflow-hidden">
              <span className="text-[11px] text-brand-gold font-bold uppercase tracking-wider block mb-1">{user.role}</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate block w-full" title={user.email}>
                {user.email}
              </span>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-brand-blue dark:hover:text-brand-light hover:bg-brand-blue/10 dark:hover:bg-brand-light/10 transition-all font-bold text-sm w-full"
          >
            {isDarkMode ? <Sun size={20} className="text-brand-gold" /> : <Moon size={20} />}
            <span>{isDarkMode ? "Modo Claro" : "Modo Oscuro"}</span>
          </button>

          {user && (
            <button
              onClick={logout}
              className="flex items-center gap-4 px-4 py-3 rounded-2xl text-red-500 hover:text-white hover:bg-red-500 transition-all font-bold text-sm group w-full"
            >
              <LogOut size={20} className="group-hover:text-white" />
              <span>Cerrar Sesión</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;