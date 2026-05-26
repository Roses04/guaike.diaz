import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { User, ShieldCheck, LogOut, Map as MapIcon, Home, Sun, Moon, Compass } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const location = useLocation();

  const NavItem = ({ to, icon: Icon, label, isActive }: { to: string, icon: any, label: string, isActive: boolean }) => (
    <Link 
      to={to} 
      className={`flex flex-col md:flex-row items-center md:justify-start gap-1.5 md:gap-4 md:px-6 md:py-3.5 md:rounded-2xl transition-all duration-150 relative group
        ${isActive 
          ? "text-brand-blue dark:text-brand-light md:bg-gradient-to-br md:from-brand-blue md:to-brand-light md:dark:from-brand-light md:dark:to-brand-blue md:text-white md:shadow-lg md:shadow-brand-blue/20" 
          : "text-slate-500 dark:text-slate-400 hover:text-brand-blue dark:hover:text-brand-light md:hover:bg-brand-blue/10 md:dark:hover:bg-brand-light/10"
        }`}
    >
      <div className={`relative transition-transform duration-150 ${isActive ? "md:scale-100 -translate-y-1 md:-translate-y-0" : "md:group-hover:translate-x-1"}`}>
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "md:text-white" : ""} />
      </div>
      <span className={`text-[10px] md:text-sm font-semibold md:font-bold ${isActive ? "md:text-white" : ""}`}>{label}</span>
      
      {/* Mobile Active Indicator Dot */}
      <div className={`absolute -bottom-1.5 md:hidden w-1.5 h-1.5 rounded-full bg-brand-blue dark:bg-brand-light transition-all duration-150 ${isActive ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}></div>
    </Link>
  );

  const profileRoute = user ? "/perfil" : "/login";
  const isProfileActive = location.pathname === profileRoute;

  return (
    <>
      {/* MOBILE TOP HEADER */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-surface-85 dark:bg-brand-dark/85 backdrop-blur-xl border-b border-stone-200/50 dark:border-white/5 py-3.5 px-6 flex justify-between items-center transition-colors duration-150">
        <Link to="/" className="text-xl font-display font-extrabold tracking-tight flex items-center gap-1">
          <span className="text-primary dark:text-white">GUAIKE</span>
          <span className="text-brand-gold font-black">.</span>
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
      <nav className="fixed bottom-0 left-0 right-0 md:sticky md:top-8 md:h-[calc(100vh-64px)] z-50 bg-surface-90 dark:bg-brand-dark/90 md:bg-surface-60 md:dark:bg-slate-900/40 backdrop-blur-2xl border-t md:border border-stone-200/90 dark:border-white/5 rounded-t-[32px] md:rounded-[40px] shadow-[0_-10px_40px_-10px_rgba(15,76,129,0.08)] md:shadow-2xl flex md:flex-col justify-around md:justify-start px-6 pt-4 pb-8 md:p-6 transition-all duration-150 md:gap-3 w-full md:w-[260px]">
        
        {/* Desktop Logo */}
        <div className="hidden md:block mb-10 text-center mt-2">
          <Link to="/" className="text-[2rem] font-display font-extrabold tracking-tight flex items-center justify-center gap-1">
            <span className="text-primary dark:text-white">GUAIKE</span>
            <span className="text-brand-gold font-black">.</span>
          </Link>
          <span className="text-[11px] font-semibold text-slate-400 mt-1 block tracking-wider">NUEVA ESPARTA</span>
        </div>

        <NavItem to="/" icon={Home} label="Inicio" isActive={location.pathname === "/"} />
        <NavItem to="/mapa" icon={MapIcon} label="Mapa" isActive={location.pathname === "/mapa"} />
        <NavItem to="/itinerarios" icon={Compass} label="Rutas" isActive={location.pathname === "/itinerarios"} />
        {user?.role === "admin" && (
          <NavItem to="/admin" icon={ShieldCheck} label="Admin" isActive={location.pathname === "/admin"} />
        )}
        <NavItem to={profileRoute} icon={User} label={user ? "Perfil" : "Ingresar"} isActive={isProfileActive} />
        
        {/* Desktop Footer Actions */}
        <div className="hidden md:flex flex-col mt-auto gap-3 pt-6 border-t border-stone-200 dark:border-white/10">
          {user && (
            <div className="mb-2 px-2">
              <span className="text-[11px] text-brand-gold font-bold uppercase tracking-wider block mb-1">{user.role}</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate block">{user.email}</span>
            </div>
          )}

          <button 
            onClick={toggleTheme}
            className="flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-brand-blue dark:hover:text-brand-light hover:bg-brand-blue/10 dark:hover:bg-brand-light/10 transition-all font-bold text-sm"
          >
            {isDarkMode ? <Sun size={20} className="text-brand-gold" /> : <Moon size={20} />}
            <span>{isDarkMode ? "Modo Claro" : "Modo Oscuro"}</span>
          </button>

          {user && (
            <button 
              onClick={logout}
              className="flex items-center gap-4 px-4 py-3 rounded-2xl text-red-500 hover:text-white hover:bg-red-500 transition-all font-bold text-sm group"
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
