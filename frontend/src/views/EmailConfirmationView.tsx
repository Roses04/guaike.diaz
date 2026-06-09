import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";

const EmailConfirmationView = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Confirmación de correo - GUAIKE.DÍAZ";
  }, []);

  return (
    <div className="container mx-auto px-4 py-16 min-h-[calc(100vh-240px)] flex items-center justify-center">
      <div className="max-w-xl w-full rounded-4xl border border-slate-200/70 bg-white/95 shadow-2xl p-10 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle size={36} />
        </div>
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
      </div>
    </div>
  );
};

export default EmailConfirmationView;
