import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuthStore } from "../store/useAuthStore";
import { LogIn, Mail, Lock, UserPlus, Info, WifiOff, Phone, FileText } from "lucide-react";

const LoginView = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("turista");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const isOffline = !navigator.onLine;
  
  const navigate = useNavigate();
  const { setAuth, token } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // ── Modo offline: permitir acceso si ya hay sesión guardada ──────────
    if (isOffline && isLogin) {
      const cachedUser = localStorage.getItem("auth_user");
      if (cachedUser && token) {
        const user = JSON.parse(cachedUser);
        setAuth(user, token);
        navigate(user.role === "admin" ? "/admin" : "/perfil");
        setLoading(false);
        return;
      } else {
        setError("No hay conexión a internet y no existe una sesión guardada localmente. Conéctate para iniciar sesión por primera vez.");
        setLoading(false);
        return;
      }
    }

    try {
      if (!email || !password) {
        setError("El correo y la contraseña son obligatorios.");
        setLoading(false);
        return;
      }

      if (!isLogin && !name) {
        setError("Por favor ingresa tu nombre completo para registrarte.");
        setLoading(false);
        return;
      }

      if (isLogin) {
        // Log in
        const response = await api.post("/auth/login", { email, password });
        localStorage.setItem("auth_user", JSON.stringify(response.data.user));
        setAuth(response.data.user, response.data.token);
        if (response.data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/perfil");
        }
      } else {
        // Register
        await api.post("/auth/register", {
          email,
          password,
          role,
          name,
          phone,
        });
        setSuccess("Registro exitoso. ¡Ahora puedes iniciar sesión!");
        setIsLogin(true);
        setName("");
        setPhone("");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex-grow flex items-center justify-center">
      <div className="max-w-md w-full glass-panel p-4 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Glow border line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-blue via-brand-light to-brand-gold"></div>

        <div className="flex justify-center mb-6">
          <div className="bg-brand-blue/10 dark:bg-brand-light/10 p-4.5 rounded-full text-brand-blue dark:text-brand-light">
            {isLogin ? <LogIn size={32} /> : <UserPlus size={32} />}
          </div>
        </div>
        
        <h2 className="text-3xl font-display font-extrabold mb-1 text-center text-slate-800 dark:text-white">
          {isLogin ? "Bienvenido" : "Crea tu Cuenta"}
        </h2>
        <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-6">
          {isLogin ? "Accede al Sistema Geoespacial de GUAIKE.DÍAZ" : "Regístrate en la plataforma del Municipio Díaz"}
        </p>

        {/* Offline mode notice */}
        {isOffline && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 p-3 rounded-2xl mb-5 text-xs flex items-center gap-2">
            <WifiOff size={14} className="flex-shrink-0" />
            <span>Sin conexión. Si iniciaste sesión antes, puedes continuar sin internet.</span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-500/10 dark:bg-red-950/20 border border-red-500/30 text-red-600 dark:text-red-400 p-4 rounded-2xl mb-6 text-sm flex items-start gap-2">
            <Info size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl mb-6 text-sm flex items-start gap-2">
            <Info size={16} className="mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">Correo Electrónico</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 rounded-2xl bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 dark:focus:ring-brand-light/30 text-slate-800 dark:text-slate-100"
                placeholder="nombre@correo.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">Contraseña</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                <Lock size={18} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 rounded-2xl bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 dark:focus:ring-brand-light/30 text-slate-800 dark:text-slate-100"
                placeholder="••••••••"
              />
            </div>
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">Tipo de Usuario</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="block w-full px-3.5 py-3 rounded-2xl bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 dark:focus:ring-brand-light/30 text-slate-800 dark:text-slate-100 cursor-pointer"
                >
                  <option value="turista">Turista (Visitar y calificar)</option>
                  <option value="operador">Operador (Artesano / Guía)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">Nombre Completo</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                      <UserPlus size={18} />
                    </span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 rounded-2xl bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 dark:focus:ring-brand-light/30 text-slate-800 dark:text-slate-100"
                      placeholder="Ej. María Pérez"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">Teléfono de contacto</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                      <Phone size={18} />
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 rounded-2xl bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 dark:focus:ring-brand-light/30 text-slate-800 dark:text-slate-100"
                      placeholder="Ej. +584121234567"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-brand-blue/5 dark:bg-brand-light/10 border border-brand-blue/20 dark:border-brand-light/20 p-4 text-sm text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={16} className="text-brand-blue dark:text-brand-light" />
                  <span className="font-semibold">Datos requeridos según tu rol</span>
                </div>
                <p>{role === "operador" ? "Como operador podrás registrar tu taller y aparecer en el directorio municipal." : "Como turista podrás explorar los talleres y dejar reseñas."}</p>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-blue dark:bg-brand-light text-white py-3 rounded-2xl font-bold hover:shadow-lg hover:shadow-brand-blue/20 transition disabled:opacity-50 mt-2 cursor-pointer text-sm"
          >
            {loading ? "Procesando..." : isLogin ? "Entrar al Sistema" : "Registrarse"}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/10 text-center">
          {isLogin ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              ¿No tienes cuenta?{" "}
              <button 
                onClick={() => { setIsLogin(false); setError(""); }}
                className="text-brand-blue dark:text-brand-light font-bold cursor-pointer hover:underline"
              >
                Crea una aquí
              </button>
            </p>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              ¿Ya tienes cuenta?{" "}
              <button 
                onClick={() => { setIsLogin(true); setError(""); }}
                className="text-brand-blue dark:text-brand-light font-bold cursor-pointer hover:underline"
              >
                Inicia sesión aquí
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginView;
