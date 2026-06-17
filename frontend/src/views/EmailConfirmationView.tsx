import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";
import { supabase } from "../services/supabase";
import SEO from "../components/SEO";

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

  const handleReset = async () => {
    if (!password || password.length < 8) {
      setMessage("La contraseña debe tener al menos 8 caracteres.");
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
        <div className="max-w-xl w-full rounded-4xl border border-slate-200/70 bg-white/95 shadow-2xl p-10 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle size={36} />
          </div>
          {flow === "confirm" && (
            <>
              <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Correo confirmado</h1>
              <p className="text-slate-600 mb-8 leading-7">
                Gracias por confirmar tu correo electrónico. Tu cuenta ya está lista para iniciar sesión.
                Si no ves la página correcta, regresa al inicio y vuelve a intentar con tu correo.
              </p>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 rounded-2xl bg-brand-blue px-6 py-3 text-white font-semibold shadow-lg shadow-brand-blue/10 hover:bg-brand-light transition"
              >
                Ir a Iniciar Sesión
                <ArrowRight size={18} />
              </button>
            </>
          )}

          {flow === "recovery" && (
            <>
              <h1 className="text-2xl font-bold text-slate-900 mb-4">Restablecer contraseña</h1>
              {message && <p className="text-slate-600 mb-4">{message}</p>}
              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg"
                />
                <input
                  type="password"
                  placeholder="Confirmar nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg"
                />
                <div className="flex justify-center">
                  <button
                    disabled={loading}
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 rounded-2xl bg-brand-blue px-6 py-3 text-white font-semibold shadow-lg hover:opacity-95 transition"
                  >
                    {loading ? "Procesando..." : "Actualizar contraseña"}
                  </button>
                </div>
              </div>
            </>
          )}

          {flow === "other" && (
            <>
              <h1 className="text-2xl font-bold text-slate-900 mb-4">Acción requerida</h1>
              <p className="text-slate-600 mb-6">Se procesó una acción de confirmación. Si necesitas restablecer la contraseña, usa el formulario de recuperación desde la aplicación.</p>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 rounded-2xl bg-brand-blue px-6 py-3 text-white font-semibold shadow-lg shadow-brand-blue/10 hover:bg-brand-light transition"
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
