import { useState, useEffect } from "react";
import { Download, X, Share } from "lucide-react";

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isAppStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
    setIsStandalone(isAppStandalone);

    if (isAppStandalone) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    if (isIosDevice) {
      // iOS doesn't support beforeinstallprompt, so we just show the banner occasionally or persistently until dismissed
      const hasDismissed = localStorage.getItem("pwa_install_dismissed");
      if (!hasDismissed) {
        setShowInstallBanner(true);
      }
    }

    // Listen for Chrome/Edge/Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      const hasDismissed = localStorage.getItem("pwa_install_dismissed");
      if (!hasDismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    localStorage.setItem("pwa_install_dismissed", "true");
  };

  if (isStandalone || !showInstallBanner) return null;

  return (
    <div className="fixed top-20 md:top-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-[100] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-stone-200/80 dark:border-white/10 shadow-2xl rounded-3xl p-4 flex flex-col gap-3 transition-all duration-500">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-light flex items-center justify-center text-white shadow-lg shrink-0">
            <span className="font-display font-bold text-lg">G.</span>
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-slate-800 dark:text-white leading-tight">Instalar GUAIKE.DÍAZ</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Acceso rápido y offline</p>
          </div>
        </div>
        <button 
          onClick={handleDismiss}
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full transition"
        >
          <X size={14} />
        </button>
      </div>

      <div className="pt-1">
        {isIOS ? (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 text-xs text-slate-600 dark:text-slate-300">
            Para instalar: toca el botón <Share size={12} className="inline mx-0.5" /> <strong>Compartir</strong> en la barra inferior y selecciona <strong>"Añadir a la pantalla de inicio"</strong>.
          </div>
        ) : (
          <button 
            onClick={handleInstallClick}
            className="w-full bg-brand-blue dark:bg-brand-light hover:bg-brand-blue/90 dark:hover:bg-brand-light/90 text-white font-bold text-sm py-2.5 rounded-2xl flex items-center justify-center gap-2 transition shadow-lg shadow-brand-blue/20"
          >
            <Download size={16} /> Instalar Aplicación
          </button>
        )}
      </div>
    </div>
  );
};

export default InstallPWA;
