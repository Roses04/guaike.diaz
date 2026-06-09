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
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-[24px] border-t border-stone-200/50 dark:border-white/5 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.3)]"
      aria-label="Navegación principal"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {/* Decorative premium top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-brand-blue via-brand-light to-brand-gold opacity-80"></div>
      
      <div className="flex items-center justify-around w-full h-[64px] px-2 relative pt-0.5">
        {tabs.map(({ to, icon: Icon, label, isActive }) => {
          const active = isActive(path);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-1 flex-col items-center justify-center h-full transition-all duration-300 relative select-none
                ${active
                  ? "text-brand-blue dark:text-brand-light"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
            >
              {/* Active pill background */}
              <div className={`flex flex-col items-center justify-center w-[68px] py-1.5 rounded-2xl transition-all duration-300 ${
                active ? "bg-brand-blue/10 dark:bg-brand-light/15 scale-105" : "bg-transparent scale-100"
              }`}>
                <div className="relative mb-0.5">
                  <Icon size={22} strokeWidth={active ? 2.5 : 2} className={`transition-transform duration-300 ${active ? '-translate-y-0.5' : ''}`} />
                  {/* Active glowing dot */}
                  {active && (
                    <span className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-brand-blue dark:bg-brand-light shadow-[0_0_8px_currentColor]"></span>
                  )}
                </div>
                <span className={`text-[10px] tracking-tight transition-all duration-300 ${active ? "font-bold opacity-100" : "font-medium opacity-80"}`}>
                  {label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileTabBar;
