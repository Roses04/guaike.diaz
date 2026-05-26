import { Link } from "react-router-dom";
import { Home, Search, Map, Compass, User } from "lucide-react";

const BottomBar = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-stone-200/60 dark:border-white/5 py-2 px-4 flex items-center justify-between">
      <Link to="/" className="flex flex-col items-center gap-0.5 text-slate-700 dark:text-slate-200 text-xs">
        <Home size={20} />
        <span>Inicio</span>
      </Link>

      <a href="#global-search" onClick={(e) => { e.preventDefault(); const el = document.getElementById('global-search'); el?.focus(); window.scrollTo({ top: el ? el.getBoundingClientRect().top + window.scrollY - 100 : 0, behavior: 'smooth' }); }} className="flex flex-col items-center gap-0.5 text-slate-700 dark:text-slate-200 text-xs">
        <Search size={20} />
        <span>Buscar</span>
      </a>

      <Link to="/mapa" className="flex flex-col items-center gap-0.5 text-slate-700 dark:text-slate-200 text-xs">
        <Map size={20} />
        <span>Mapa</span>
      </Link>

      <Link to="/itinerarios" className="flex flex-col items-center gap-0.5 text-slate-700 dark:text-slate-200 text-xs">
        <Compass size={20} />
        <span>Rutas</span>
      </Link>

      <Link to="/perfil" className="flex flex-col items-center gap-0.5 text-slate-700 dark:text-slate-200 text-xs">
        <User size={20} />
        <span>Perfil</span>
      </Link>
    </nav>
  );
};

export default BottomBar;
