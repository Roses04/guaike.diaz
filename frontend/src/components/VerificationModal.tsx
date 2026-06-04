import { useState, useEffect } from "react";
import { ShieldAlert, CheckCircle, RefreshCw, X, Info } from "lucide-react";
import api from "../services/api";
import { useAuthStore } from "../store/useAuthStore";

const VerificationModal = () => {
  const { user, token, setAuth } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Check if we should open the modal
  useEffect(() => {
    if (user && user.verificado === false && !sessionStorage.getItem("verification_modal_dismissed")) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [user]);

  // Handle resend code timer cooldown
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  if (!isOpen || !user) return null;

  // Format code input to XXXX-XXXX (alphanumeric, uppercase)
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    let val = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (val.length > 8) val = val.substring(0, 8);
    
    if (val.length > 4) {
      setCode(`${val.substring(0, 4)}-${val.substring(4)}`);
    } else {
      setCode(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (code.length !== 9) { // 8 characters + 1 hyphen
      setError("El código debe tener exactamente 8 caracteres (formato XXXX-XXXX).");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/verify-code", {
        email: user.email,
        code,
      });

      setSuccess("¡Cuenta verificada exitosamente!");
      
      // Update local storage and auth store
      const updatedUser = { ...user, verificado: true };
      localStorage.setItem("auth_user", JSON.stringify(updatedUser));
      
      setTimeout(() => {
        setAuth(updatedUser, token || "");
        setIsOpen(false);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Código inválido o expirado. Por favor, reintente.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/auth/resend-code", { email: user.email });
      setSuccess("Código de verificación reenviado a tu correo.");
      setCooldown(60); // 60 seconds cooldown
    } catch (err: any) {
      setError(err.response?.data?.message || "No se pudo reenviar el código.");
    } finally {
      setResending(false);
    }
  };

  const handleClose = () => {
    sessionStorage.setItem("verification_modal_dismissed", "true");
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Dark Overlay backdrop */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={handleClose}></div>
      
      {/* Modal Box */}
      <div className="relative max-w-md w-full glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl border border-stone-200/80 dark:border-white/10 overflow-hidden bg-white/95 dark:bg-slate-900/95">
        {/* Glow accent top bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-blue via-brand-light to-brand-gold"></div>

        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          title="Verificar más tarde"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-amber-500/10 text-amber-500 p-4 rounded-full">
            <ShieldAlert size={36} />
          </div>

          <h3 className="text-2xl font-display font-extrabold text-slate-800 dark:text-white">
            Verifica tu Cuenta
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Hemos enviado un código alfanumérico de 8 dígitos a tu correo <strong className="text-slate-700 dark:text-slate-300">{user.email}</strong>. Por favor, introdúcelo a continuación para validar que eres real.
          </p>

          {error && (
            <div className="w-full bg-red-500/10 dark:bg-red-950/20 border border-red-500/20 text-red-600 dark:text-red-400 p-3.5 rounded-2xl text-xs text-left flex items-start gap-2">
              <Info size={14} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="w-full bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-2xl text-xs text-left flex items-start gap-2">
              <CheckCircle size={14} className="mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Código de Verificación
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={handleCodeChange}
                placeholder="XXXX-XXXX"
                className="block w-full text-center tracking-widest text-2xl font-mono py-3 rounded-2xl bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-slate-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-blue dark:bg-brand-light text-white py-3.5 rounded-2xl font-bold hover:shadow-lg hover:shadow-brand-blue/20 transition disabled:opacity-50 cursor-pointer text-sm flex items-center justify-center gap-1"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Verificando...
                </>
              ) : (
                "Confirmar Código"
              )}
            </button>
          </form>

          <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 flex flex-col gap-2 items-center">
            <span>¿No recibiste el correo? Revisa tu carpeta de spam.</span>
            <button
              type="button"
              disabled={cooldown > 0 || resending}
              onClick={handleResend}
              className={`font-bold transition text-brand-blue dark:text-brand-light cursor-pointer hover:underline disabled:opacity-50 disabled:no-underline`}
            >
              {cooldown > 0 ? `Reenviar código en ${cooldown}s` : "Reenviar Código por Gmail"}
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="mt-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium cursor-pointer"
            >
              Verificar más tarde (entrar sin impedimento)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
