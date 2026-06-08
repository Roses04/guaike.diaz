import { Link, useLocation } from "react-router-dom";
import { Home, Users, Map as MapIcon, Compass } from "lucide-react";

type TabItem = {
  to: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  isActive: (path: string) => boolean;
};

const MobileTabBar = () => {
  const location = useLocation();
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
  ];

  return (
    <nav
      className="md:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-[min(96%,420px)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-stone-200/80 dark:border-white/10 shadow-xl rounded-2xl"
      aria-label="Navegación principal"
    >
      <div
        className="flex items-center justify-around max-w-lg mx-auto h-17.5 px-3"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}
      >
        {tabs.map(({ to, icon: Icon, label, isActive }) => {
          const active = isActive(path);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 min-h-17.5 py-1 px-1 transition-colors duration-150 relative select-none
                ${active
                  ? "text-brand-blue dark:text-brand-light"
                  : "text-slate-500 dark:text-slate-400 active:text-brand-blue"
                }`}
            >
              <Icon size={24} strokeWidth={active ? 2.5 : 2} />
              <span className={`text-[11px] font-semibold leading-tight ${active ? "font-bold" : ""}`}>
                {label}
              </span>
              {active && (
                <span className="absolute -top-2 w-2 h-2 rounded-full bg-brand-blue dark:bg-brand-light shadow-md" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileTabBar;
