import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ArrowRight, ShieldCheck, KeyRound, Check, X } from "lucide-react";
import { supabase } from "../services/supabase";
import SEO from "../components/SEO";
import { PageHeader } from "../components/ui/PageHeader";

type Flow = "confirm" | "recovery" | "other";

const EmailConfirmationView = () => {
  const navigate = useNavigate();
  const [flow, setFlow] = useState<Flow>("confirm");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    // Detect Supabase redirect parameters in search or hash
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const hash = window.location.hash.replace(/^#/, "");
      const hashParams = new URLSearchParams(hash);
      const t1 = searchParams.get("type");
      const t2 = hashParams.get("type");
      const type = (t1 || t2 || "").toLowerCase();
      if (type === "recovery") {
        setFlow("recovery");
        // Attempt to read session — Supabase SDK should have stored it automatically
        (async () => {
          const { data } = await supabase.auth.getSession();
          if (!data.session) {
            // No session — inform the user to re-open the link in same browser or use the recovery form
            setMessage("Hemos detectado un intento de recuperación. Si el enlace no inició sesión automáticamente, introduce la nueva contraseña abajo.");
          } else {
            setMessage("Introduce una nueva contraseña para completar el restablecimiento.");
          }
        })();
      } else {
        setFlow("confirm");
        navigate("/login?verified=true", { replace: true });
      }
    } catch (e) {
      setFlow("other");
    }
  }, []);

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const allConditionsMet = hasMinLength && hasUppercase && hasNumber && hasSpecialChar;

  const handleReset = async () => {
    if (!hasMinLength || !hasUppercase || !hasNumber || !hasSpecialChar) {
      setMessage("La contraseña no cumple con todos los requisitos de seguridad.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setMessage(`No se pudo actualizar la contraseña: ${error.message}`);
      } else {
        setMessage("Contraseña actualizada correctamente. Serás redirigido a iniciar sesión...");
        setTimeout(() => navigate("/login", { replace: true }), 1400);
      }
    } catch (err: any) {
      setMessage(`Error: ${err?.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Confirmación de correo"
        description="Confirma tu correo electrónico para acceder al Sistema de Información Turístico-Artesanal GUAIKE.DÍAZ."
        canonical="/confirmacion-correo"
      />
      <div className="container mx-auto px-4 py-16 min-h-[calc(100vh-240px)] flex items-center justify-center">
        <div className="max-w-xl w-full rounded-4xl border border-slate-200/70 bg-white/95 dark:bg-slate-900/95 shadow-2xl p-10 text-center">
          {flow === "confirm" && (
            <>
              <PageHeader
                align="center"
                title="Correo confirmado"
                description="Gracias por confirmar tu correo electrónico. Tu cuenta ya está lista para iniciar sesión. Si no ves la página correcta, regresa al inicio y vuelve a intentar con tu correo."
                icon={CheckCircle}
              />
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 rounded-2xl bg-brand-blue px-6 py-3 text-white font-semibold shadow-lg shadow-brand-blue/10 hover:bg-brand-light transition mt-4"
              >
                Ir a Iniciar Sesión
                <ArrowRight size={18} />
              </button>
            </>
          )}

          {flow === "recovery" && (
            <>
              <PageHeader
                align="center"
                title="Restablecer contraseña"
                description={message || "Introduce una nueva contraseña para completar el restablecimiento de acceso."}
                icon={KeyRound}
              />
              <div className="space-y-4 mt-6">
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-sm"
                />
                
                <input
                  type="password"
                  placeholder="Confirmar nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-sm"
                />

                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/5 text-left text-xs space-y-3 shadow-inner">
                  <p className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-[10px]">Requisitos de Seguridad de Contraseña</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-slate-600 dark:text-slate-350">
                      {hasMinLength ? (
                        <Check className="text-emerald-500 flex-shrink-0" size={14} />
                      ) : (
                        <X className="text-red-500 flex-shrink-0" size={14} />
                      )}
                      <span className={hasMinLength ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}>Mínimo 8 caracteres</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-600 dark:text-slate-350">
                      {hasUppercase ? (
                        <Check className="text-emerald-500 flex-shrink-0" size={14} />
                      ) : (
                        <X className="text-red-500 flex-shrink-0" size={14} />
                      )}
                      <span className={hasUppercase ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}>Al menos una letra mayúscula (A-Z)</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-600 dark:text-slate-350">
                      {hasNumber ? (
                        <Check className="text-emerald-500 flex-shrink-0" size={14} />
                      ) : (
                        <X className="text-red-500 flex-shrink-0" size={14} />
                      )}
                      <span className={hasNumber ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}>Al menos un número (0-9)</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-600 dark:text-slate-350">
                      {hasSpecialChar ? (
                        <Check className="text-emerald-500 flex-shrink-0" size={14} />
                      ) : (
                        <X className="text-red-500 flex-shrink-0" size={14} />
                      )}
                      <span className={hasSpecialChar ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}>Al menos un carácter especial (ej. !, @, #, $, %)</span>
                    </li>
                  </ul>
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    disabled={loading || !allConditionsMet}
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 rounded-2xl bg-brand-blue px-6 py-3 text-white font-semibold shadow-lg hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {loading ? "Procesando..." : "Actualizar contraseña"}
                  </button>
                </div>
              </div>
            </>
          )}

          {flow === "other" && (
            <>
              <PageHeader
                align="center"
                title="Acción requerida"
                description="Se procesó una acción de confirmación. Si necesitas restablecer la contraseña, usa el formulario de recuperación desde la aplicación."
                icon={ShieldCheck}
              />
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 rounded-2xl bg-brand-blue px-6 py-3 text-white font-semibold shadow-lg shadow-brand-blue/10 hover:bg-brand-light transition mt-4"
              >
                Ir a Iniciar Sesión
                <ArrowRight size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default EmailConfirmationView;
