import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Home, Users, Map as MapIcon, Compass, User } from "lucide-react";

type TabItem = {
  to: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  isActive: (path: string) => boolean;
};

const MobileTabBar = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const profileRoute = user ? "/perfil" : "/login";
  const path = location.pathname;

  const tabs: TabItem[] = [
    { to: "/", icon: Home, label: "Inicio", isActive: (p) => p === "/" },
    {
      to: "/directorio",
      icon: Users,
      label: "Directorio",
      isActive: (p) => p === "/directorio" || p.startsWith("/operador/"),
    },
    { to: "/mapa", icon: MapIcon, label: "Mapa", isActive: (p) => p === "/mapa" },
    { to: "/itinerarios", icon: Compass, label: "Rutas", isActive: (p) => p === "/itinerarios" },
    {
      to: profileRoute,
      icon: User,
      label: user ? "Perfil" : "Ingresar",
      isActive: (p) => p === profileRoute || p === "/login",
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-stone-200/90 dark:border-white/10 shadow-[0_-4px_24px_rgba(15,76,129,0.08)]"
      aria-label="Navegación principal"
    >
      <div
        className="flex items-stretch justify-around max-w-lg mx-auto"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {tabs.map(({ to, icon: Icon, label, isActive }) => {
          const active = isActive(path);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 min-h-[52px] py-2 px-1 transition-colors duration-150 relative
                ${active
                  ? "text-brand-blue dark:text-brand-light"
                  : "text-slate-500 dark:text-slate-400 active:text-brand-blue"
                }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className={`text-[10px] font-semibold leading-tight ${active ? "font-bold" : ""}`}>
                {label}
              </span>
              {active && (
                <span className="absolute top-1 w-1 h-1 rounded-full bg-brand-blue dark:bg-brand-light" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileTabBar;
