import React, { useEffect, useState } from "react";
import { useNetworkStore } from "../store/useNetwork";
import { Wifi, WifiOff, AlertCircle, CheckCircle } from "lucide-react";

export const NetworkBanner: React.FC = () => {
  const isOnline = useNetworkStore((state) => state.isOnline);
  const [shouldShow, setShouldShow] = useState(false);
  const [statusType, setStatusType] = useState<"online" | "offline">("online");

  useEffect(() => {
    // Al iniciar, si el usuario está offline, mostrar el banner de inmediato.
    if (!isOnline) {
      setShouldShow(true);
      setStatusType("offline");
    }
  }, []);

  useEffect(() => {
    if (!isOnline) {
      setStatusType("offline");
      setShouldShow(true);
    } else {
      // Si pasa de offline a online, mostrar el banner de éxito temporalmente
      if (statusType === "offline") {
        setStatusType("online");
        setShouldShow(true);
        const timer = setTimeout(() => {
          setShouldShow(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isOnline]);

  if (!shouldShow) return null;

  return (
    <div className="fixed mobile-banner-top md:top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md animate-in fade-in slide-in-from-top duration-300">
      {statusType === "offline" ? (
        <div className="bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-500/30 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-3 shadow-[0_8px_32px_0_rgba(245,158,11,0.15)] text-amber-900 dark:text-amber-200">
          <div className="bg-amber-200/80 dark:bg-amber-500/20 p-2 rounded-xl text-amber-700 dark:text-amber-400">
            <WifiOff className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm">Modo sin conexión</h4>
            <p className="text-xs text-amber-700/90 dark:text-amber-300/80">
              Operando con base de datos local. Los cambios se sincronizarán al volver.
            </p>
          </div>
          <AlertCircle className="w-4 h-4 text-amber-600/80 dark:text-amber-400/60 flex-shrink-0" />
        </div>
      ) : (
        <div className="bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-500/30 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-3 shadow-[0_8px_32px_0_rgba(16,185,129,0.15)] text-emerald-900 dark:text-emerald-200 animate-out fade-out slide-out-to-top duration-500 delay-2500">
          <div className="bg-emerald-200/80 dark:bg-emerald-500/20 p-2 rounded-xl text-emerald-700 dark:text-emerald-400">
            <Wifi className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm">Conexión restablecida</h4>
            <p className="text-xs text-emerald-700/90 dark:text-emerald-300/80">
              Sincronizando datos con el servidor de forma segura...
            </p>
          </div>
          <CheckCircle className="w-4 h-4 text-emerald-600/80 dark:text-emerald-400/60 flex-shrink-0" />
        </div>
      )}
    </div>
  );
};
