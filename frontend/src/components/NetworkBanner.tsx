import React, { useEffect, useState, useRef } from "react";
import { useNetworkStore } from "../store/useNetwork";
import { Wifi, WifiOff, X } from "lucide-react";

export const NetworkBanner: React.FC = () => {
  const isOnline = useNetworkStore((state) => state.isOnline);
  const [shouldShow, setShouldShow] = useState(false);
  const [statusType, setStatusType] = useState<"online" | "offline">("online");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Al iniciar, si el usuario está offline, mostrar de inmediato.
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
      // Si pasa de offline a online, mostrar indicador de éxito temporalmente
      if (statusType === "offline") {
        setStatusType("online");
        setShouldShow(true);
        setIsPopoverOpen(false); // Cerrar popover si estaba abierto
        const timer = setTimeout(() => {
          setShouldShow(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isOnline]);

  // Cerrar popover si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsPopoverOpen(false);
      }
    };
    if (isPopoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPopoverOpen]);

  if (!shouldShow) return null;

  return (
    <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-[9999] flex flex-col items-end gap-2 font-sans select-none">
      {/* Popover con mensaje detallado */}
      {statusType === "offline" && isPopoverOpen && (
        <div
          ref={popoverRef}
          className="bg-slate-900/95 dark:bg-slate-950/95 border border-slate-700/50 dark:border-slate-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.3)] text-slate-100 w-72 mb-2 mr-1 transform transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
        >
          <div className="flex items-start justify-between mb-1">
            <h4 className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
              <WifiOff className="w-4 h-4" /> Modo sin conexión
            </h4>
            <button
              onClick={() => setIsPopoverOpen(false)}
              className="text-slate-400 hover:text-slate-200 p-0.5 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Estás operando de forma offline. Todos tus cambios e itinerarios se guardan localmente y se sincronizarán al volver la señal.
          </p>
        </div>
      )}

      {/* Botón Flotante / Indicador */}
      {statusType === "offline" ? (
        <button
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          aria-label="Ver estado de red (Sin conexión)"
          className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 cursor-pointer focus:outline-none shadow-lg active:scale-95
            ${isPopoverOpen 
              ? "bg-amber-500 text-slate-950 scale-105 border border-amber-400 ring-4 ring-amber-500/20" 
              : "bg-amber-500/20 dark:bg-amber-500/10 border border-amber-500/30 text-amber-500 hover:bg-amber-500/30 shadow-[0_8px_32px_rgba(245,158,11,0.25)] hover:scale-105"
            }`}
        >
          <WifiOff className={`w-5 h-5 ${isPopoverOpen ? "" : "animate-pulse"}`} />
        </button>
      ) : (
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-500/20 dark:bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 backdrop-blur-md shadow-[0_8px_32px_rgba(16,185,129,0.25)] animate-in fade-in zoom-in duration-300 animate-out fade-out duration-1000 delay-2000"
        >
          <Wifi className="w-5 h-5 animate-bounce" />
        </div>
      )}
    </div>
  );
};
