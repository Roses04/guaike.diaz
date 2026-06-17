import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import { useAuthStore } from "../store/useAuthStore";
import SEO from "../components/SEO";
import { 
  LogIn, Mail, Lock, UserPlus, Info, WifiOff, Phone, 
  FileText, ShieldCheck, HelpCircle, KeyRound, ChevronLeft, 
  ArrowRight, CheckCircle, Eye, EyeOff
} from "lucide-react";

const PREDEFINED_QUESTIONS = [
  "¿Cuál es el nombre de tu primera mascota?",
  "¿En qué ciudad nació tu madre?",
  "¿Cuál era el nombre de tu primera escuela?",
  "¿Cuál es tu comida favorita?"
];

const LoginView = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isForcePasswordChange, setIsForcePasswordChange] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [tempUser, setTempUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("turista");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  
  // Security Questions State (Registration)
  const [q1, setQ1] = useState("");
  const [ans1, setAns1] = useState("");
  const [q2, setQ2] = useState("");
  const [ans2, setAns2] = useState("");
  const [phoneCode, setPhoneCode] = useState("+58");

  const PHONE_CODES = [
    { label: "Venezuela +58", value: "+58" },
    { label: "Colombia +57", value: "+57" },
    { label: "México +52", value: "+52" },
    { label: "Estados Unidos +1", value: "+1" },
    { label: "España +34", value: "+34" },
  ];

  const handleForcePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!password || !confirmPassword) {
        setError("Las contraseñas son obligatorias.");
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden.");
        setLoading(false);
        return;
      }
      const pwError = validatePasswordStrength(password);
      if (pwError) {
        setError(pwError);
        setLoading(false);
        return;
      }

      // Llamada especial para cambiar la clave temporal. Se puede enviar con el token temporal en la cabecera.
      await api.post("/auth/reset-password", { email: tempUser.email, newPassword: password });

      setSuccess("Contraseña actualizada exitosamente. Iniciando sesión...");
      
      setTimeout(() => {
        setIsForcePasswordChange(false);
        localStorage.setItem("auth_user", JSON.stringify(tempUser));
        setAuth(tempUser, tempToken);
        navigate(tempUser.role === "admin" ? "/admin" : "/perfil");
      }, 1500);

    } catch (err: any) {
      setError(err.response?.data?.message || "Ocurrió un error al cambiar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  const normalizePhoneNumber = (value: string, countryCode: string) => {
    let digits = value.replace(/\D/g, "");
    const normalizedCode = countryCode.replace("+", "");

    if (digits.startsWith("00")) {
      digits = digits.slice(2);
    }

    if (digits.startsWith(normalizedCode)) {
      digits = digits.slice(normalizedCode.length);
    }

    if (digits.startsWith("0")) {
      digits = digits.slice(1);
    }

    if (!digits) {
      return "";
    }

    return `+${normalizedCode}${digits}`;
  };

  const formatPhoneInput = (value: string, countryCode: string) => {
    const normalizedValue = normalizePhoneNumber(value, countryCode);
    return normalizedValue;
  };

  // Forgot Password Recovery State
  const [recoveryStep, setRecoveryStep] = useState(1); // 1: Email & Method, 2: Questions/Code input, 3: New Password
  const [recoveryMethod, setRecoveryMethod] = useState("email_code"); // "email_code" | "questions"
  const [recoveredQuestions, setRecoveredQuestions] = useState<any[]>([]);
  const [recoveryAns1, setRecoveryAns1] = useState("");
  const [recoveryAns2, setRecoveryAns2] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const isOffline = !navigator.onLine;
  
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth, token } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("verified") === "true") {
      setSuccess("Se ha verificado tu cuenta exitosamente.");
      // Optional: Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location]);

  const validateEmail = (mail: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(mail);
  };

  const validatePasswordStrength = (pw: string) => {
    if (pw.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    if (!/[A-Z]/.test(pw)) return "La contraseña debe incluir al menos una letra mayúscula.";
    if (!/[a-z]/.test(pw)) return "La contraseña debe incluir al menos una letra minúscula.";
    if (!/[0-9]/.test(pw)) return "La contraseña debe incluir al menos un número.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pw)) return "La contraseña debe incluir al menos un carácter especial (ej. !, @, #, $, %).";
    return "";
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (isOffline) {
      const cachedUser = localStorage.getItem("auth_user");
      if (cachedUser && token) {
        const cached = JSON.parse(cachedUser);
        setAuth(cached, token);
        navigate(cached.role === "admin" ? "/admin" : "/perfil");
        setLoading(false);
        return;
      } else {
        setError("No hay conexión a internet y no existe una sesión guardada localmente.");
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

      if (!validateEmail(email)) {
        setError("Por favor introduce un formato de correo electrónico válido.");
        setLoading(false);
        return;
      }

      const response = await api.post("/auth/login", { email, password });
      
      if (response.data.forcePasswordChange) {
        setTempToken(response.data.token);
        setTempUser(response.data.user);
        setIsForcePasswordChange(true);
        return;
      }

      // Guardar sesión y redirigir
      localStorage.setItem("auth_user", JSON.stringify(response.data.user));
      setAuth(response.data.user, response.data.token);
      
      navigate(response.data.user.role === "admin" ? "/admin" : "/perfil");
    } catch (err: any) {
      setError(err.response?.data?.message || "Ocurrió un error inesperado al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // 1. Validaciones de Datos Obligatorios
      if (!email || !password || !confirmPassword || !name || !q1 || !ans1 || !q2 || !ans2) {
        setError("Por favor completa todos los campos obligatorios del registro.");
        setLoading(false);
        return;
      }

      if (!validateEmail(email)) {
        setError("El formato de correo electrónico ingresado no es válido.");
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden.");
        setLoading(false);
        return;
      }

      const pwError = validatePasswordStrength(password);
      if (pwError) {
        setError(pwError);
        setLoading(false);
        return;
      }

      if (q1 === q2) {
        setError("Por favor selecciona dos preguntas de seguridad diferentes.");
        setLoading(false);
        return;
      }

      let normalizedPhone = "";
      if (phone.trim()) {
        normalizedPhone = formatPhoneInput(phone, phoneCode);
        if (!/^[+][0-9]{6,15}$/.test(normalizedPhone)) {
          setError("Por favor ingresa un número de teléfono válido con el código de país correcto.");
          setLoading(false);
          return;
        }
      }

      const securityQuestions = [
        { question: q1, answer: ans1 },
        { question: q2, answer: ans2 }
      ];

      await api.post("/auth/register", {
        email,
        password,
        role,
        name,
        phone: normalizedPhone,
        securityQuestions
      });

      setSuccess("Registro exitoso. Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.");
      
      setIsLogin(true);
      setPassword("");
      setConfirmPassword("");
      setName("");
      setPhone("");
      setQ1("");
      setAns1("");
      setQ2("");
      setAns2("");
      setPhoneCode("+58");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al registrar la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  // ── Flujo de Recuperación de Contraseña ───────────────────────────────────
  const handleForgotPasswordNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!email) {
        setError("Por favor ingresa tu correo electrónico.");
        setLoading(false);
        return;
      }

      if (!validateEmail(email)) {
        setError("Por favor ingresa un correo electrónico válido.");
        setLoading(false);
        return;
      }

      if (recoveryStep === 1) {
        if (recoveryMethod === "questions") {
          // Obtener preguntas de seguridad del usuario
          const res = await api.post("/auth/recover-questions", { email });
          setRecoveredQuestions(res.data.questions);
          setRecoveryStep(2);
        } else {
          // Enviar código de recuperación por email
          await api.post("/auth/send-recovery-email", { email });
          setSuccess("Código de recuperación enviado a tu correo Gmail.");
          setRecoveryStep(2);
        }
      } else if (recoveryStep === 2) {
        if (recoveryMethod === "questions") {
          if (!recoveryAns1 || !recoveryAns2) {
            setError("Debes responder ambas preguntas de seguridad.");
            setLoading(false);
            return;
          }
          const answers = [
            { question: recoveredQuestions[0].question, answer: recoveryAns1 },
            { question: recoveredQuestions[1].question, answer: recoveryAns2 }
          ];
          await api.post("/auth/verify-questions", { email, answers });
          setSuccess("Respuestas verificadas correctamente.");
          setRecoveryStep(3);
        } else {
          if (!recoveryCode) {
            setError("Por favor introduce el código enviado.");
            setLoading(false);
            return;
          }
          await api.post("/auth/verify-recovery-code", { email, code: recoveryCode });
          setSuccess("Código verificado correctamente.");
          setRecoveryStep(3);
        }
      } else if (recoveryStep === 3) {
        if (!password || !confirmPassword) {
          setError("Por favor rellena ambos campos de contraseña.");
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError("Las contraseñas no coinciden.");
          setLoading(false);
          return;
        }

        const pwErr = validatePasswordStrength(password);
        if (pwErr) {
          setError(pwErr);
          setLoading(false);
          return;
        }

        await api.post("/auth/reset-password", { email, password });
        setSuccess("Contraseña restablecida con éxito. Redirigiendo a Login...");
        setTimeout(() => {
          setIsForgotPassword(false);
          setIsLogin(true);
          setRecoveryStep(1);
          setPassword("");
          setConfirmPassword("");
          setRecoveryAns1("");
          setRecoveryAns2("");
          setRecoveryCode("");
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Ocurrió un error en el proceso de recuperación.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (val.length > 8) val = val.substring(0, 8);
    if (val.length > 4) {
      setRecoveryCode(`${val.substring(0, 4)}-${val.substring(4)}`);
    } else {
      setRecoveryCode(val);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = rawValue.replace(/[^0-9+]/g, "");
    setPhone(formatted);
  };

  const resetRecoveryFlow = () => {
    setIsForgotPassword(false);
    setRecoveryStep(1);
    setError("");
    setSuccess("");
    setRecoveryAns1("");
    setRecoveryAns2("");
    setRecoveryCode("");
  };

  return (
    <>
      <SEO
        title={isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
        description={isLogin ? "Accede al Sistema Geoespacial de GUAIKE.DÍAZ para explorar talleres artesanales del Municipio Díaz." : "Regístrate en la plataforma del Municipio Díaz para descubrir artesanía y cultura."}
        canonical="/login"
      />
      <div className="login-mobile-bg w-full flex-grow flex items-center justify-center p-4 py-6 md:py-16 min-h-[calc(100vh-140px)] md:min-h-0">
      <div className="max-w-md w-full glass-panel p-5 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Glow border line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-blue via-brand-light to-brand-gold"></div>

        {/* --- 1. VISTA DE RECUPERACIÓN DE CONTRASEÑA --- */}
        {isForgotPassword ? (
          <div>
            <button 
              onClick={resetRecoveryFlow}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white text-xs font-bold mb-5 transition cursor-pointer"
            >
              <ChevronLeft size={16} /> Volver al Inicio
            </button>

            <div className="flex justify-center mb-4">
              <div className="bg-brand-gold/15 text-brand-gold p-4.5 rounded-full">
                <KeyRound size={32} />
              </div>
            </div>

            <h2 className="text-2xl font-display font-extrabold mb-1 text-center text-slate-800 dark:text-white">
              Recuperar Contraseña
            </h2>
            <p className="text-center text-slate-500 dark:text-slate-400 text-xs mb-6">
              {recoveryStep === 1 && "Ingresa tus datos y escoge un método de recuperación."}
              {recoveryStep === 2 && (recoveryMethod === "questions" ? "Responde las preguntas registradas en tu cuenta." : "Ingresa el código enviado a tu bandeja de entrada.")}
              {recoveryStep === 3 && "Escribe una nueva contraseña fuerte para tu cuenta."}
            </p>

            {error && (
              <div className="bg-red-500/10 dark:bg-red-950/20 border border-red-500/20 text-red-600 dark:text-red-400 p-3.5 rounded-2xl mb-5 text-xs flex items-start gap-2">
                <Info size={14} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-2xl mb-5 text-xs flex items-start gap-2">
                <CheckCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleForgotPasswordNext} className="space-y-4">
              {/* PASO 1: Ingreso de correo y método */}
              {recoveryStep === 1 && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 pl-1">Correo Electrónico</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <Mail size={18} />
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 rounded-2xl bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-slate-100"
                        placeholder="nombre@correo.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 pl-1">Método de Recuperación</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRecoveryMethod("email_code")}
                        className={`py-3 rounded-2xl text-xs font-bold border transition cursor-pointer flex flex-col items-center gap-1.5 ${
                          recoveryMethod === "email_code"
                            ? "bg-brand-blue/10 border-brand-blue/40 text-brand-blue dark:text-brand-light"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/5 text-slate-500"
                        }`}
                      >
                        <Mail size={16} /> Código a Email
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecoveryMethod("questions")}
                        className={`py-3 rounded-2xl text-xs font-bold border transition cursor-pointer flex flex-col items-center gap-1.5 ${
                          recoveryMethod === "questions"
                            ? "bg-brand-blue/10 border-brand-blue/40 text-brand-blue dark:text-brand-light"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/5 text-slate-500"
                        }`}
                      >
                        <HelpCircle size={16} /> Preguntas Seguras
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* PASO 2: Ingreso de Respuestas o Código */}
              {recoveryStep === 2 && (
                <>
                  {recoveryMethod === "questions" ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1 leading-snug">Pregunta 1: {recoveredQuestions[0]?.question}</label>
                        <input
                          type="text"
                          required
                          value={recoveryAns1}
                          onChange={(e) => setRecoveryAns1(e.target.value)}
                          className="block w-full px-4 py-2.5 rounded-xl bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-slate-100"
                          placeholder="Tu respuesta..."
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1 leading-snug">Pregunta 2: {recoveredQuestions[1]?.question}</label>
                        <input
                          type="text"
                          required
                          value={recoveryAns2}
                          onChange={(e) => setRecoveryAns2(e.target.value)}
                          className="block w-full px-4 py-2.5 rounded-xl bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-slate-100"
                          placeholder="Tu respuesta..."
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 text-center">Ingresa el código (XXXX-XXXX)</label>
                      <input
                        type="text"
                        required
                        value={recoveryCode}
                        onChange={handleCodeChange}
                        placeholder="CODE-TEMP"
                        className="block w-full text-center tracking-widest text-xl font-mono py-2.5 rounded-2xl bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 focus:outline-none text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  )}
                </>
              )}

              {/* PASO 3: Nueva contraseña */}
              {recoveryStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 pl-1">Nueva Contraseña</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                        <Lock size={18} />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-10 py-2.5 rounded-2xl bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-slate-100"
                        placeholder="Mínimo 8 caracteres"
                      />
                      <button
                        type="button"
                        onMouseDown={() => setShowPassword(true)}
                        onMouseUp={() => setShowPassword(false)}
                        onMouseLeave={() => setShowPassword(false)}
                        onTouchStart={() => setShowPassword(true)}
                        onTouchEnd={() => setShowPassword(false)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350 cursor-pointer select-none"
                      >
                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 pl-1">Confirmar Nueva Contraseña</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                        <Lock size={18} />
                      </span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full pl-10 pr-10 py-2.5 rounded-2xl bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-slate-100"
                        placeholder="Repite la contraseña"
                      />
                      <button
                        type="button"
                        onMouseDown={() => setShowConfirmPassword(true)}
                        onMouseUp={() => setShowConfirmPassword(false)}
                        onMouseLeave={() => setShowConfirmPassword(false)}
                        onTouchStart={() => setShowConfirmPassword(true)}
                        onTouchEnd={() => setShowConfirmPassword(false)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350 cursor-pointer select-none"
                      >
                        {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-blue dark:bg-brand-light text-white py-3 rounded-2xl font-bold hover:shadow-lg transition disabled:opacity-50 mt-4 cursor-pointer text-sm flex items-center justify-center gap-1.5"
              >
                {loading ? "Procesando..." : recoveryStep === 3 ? "Restablecer Contraseña" : "Siguiente"}
                {!loading && recoveryStep < 3 && <ArrowRight size={14} />}
              </button>
            </form>
          </div>
        ) : (
          /* --- 2. VISTAS DE LOGIN Y REGISTRO --- */
          <div>
            <div className="flex justify-center mb-4 md:mb-6">
              <div className="bg-brand-blue/10 dark:bg-brand-light/10 p-4 rounded-full text-brand-blue dark:text-brand-light">
                {isLogin ? <LogIn size={28} /> : <UserPlus size={28} />}
              </div>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-display font-extrabold mb-1 text-center text-slate-800 dark:text-white">
              {isLogin ? "Bienvenido" : "Crea tu Cuenta"}
            </h2>
            <p className="text-center text-slate-500 dark:text-slate-400 text-xs md:text-sm mb-5 md:mb-6 leading-tight">
              {isLogin ? "Accede al Sistema Geoespacial de GUAIKE.DÍAZ" : "Regístrate en la plataforma del Municipio Díaz"}
            </p>

            {isOffline && (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 p-3 rounded-2xl mb-5 text-xs flex items-center gap-2">
                <WifiOff size={14} className="flex-shrink-0" />
                <span>Sin conexión. Si iniciaste sesión antes, puedes ingresar localmente.</span>
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

            <form onSubmit={isLogin ? handleLoginSubmit : handleRegisterSubmit} className="space-y-4">
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
                <div className="flex justify-between items-center mb-1.5 pl-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Contraseña</label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-xs text-brand-blue dark:text-brand-light hover:underline font-bold cursor-pointer"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                    <Lock size={18} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 rounded-2xl bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 dark:focus:ring-brand-light/30 text-slate-800 dark:text-slate-100"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onMouseDown={() => setShowPassword(true)}
                    onMouseUp={() => setShowPassword(false)}
                    onMouseLeave={() => setShowPassword(false)}
                    onTouchStart={() => setShowPassword(true)}
                    onTouchEnd={() => setShowPassword(false)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350 cursor-pointer select-none"
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">Confirmar Contraseña</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                      <Lock size={18} />
                    </span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-3 rounded-2xl bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 dark:focus:ring-brand-light/30 text-slate-800 dark:text-slate-100"
                      placeholder="Repite tu contraseña"
                    />
                    <button
                      type="button"
                      onMouseDown={() => setShowConfirmPassword(true)}
                      onMouseUp={() => setShowConfirmPassword(false)}
                      onMouseLeave={() => setShowConfirmPassword(false)}
                      onTouchStart={() => setShowConfirmPassword(true)}
                      onTouchEnd={() => setShowConfirmPassword(false)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350 cursor-pointer select-none"
                    >
                      {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Campos extra de registro */}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">Teléfono de contacto (Opcional)</label>
                      <div className="grid grid-cols-3 gap-3">
                        <select
                          value={phoneCode}
                          onChange={(e) => setPhoneCode(e.target.value)}
                          className="col-span-1 rounded-2xl bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 text-sm px-3 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 dark:focus:ring-brand-light/30 text-slate-800 dark:text-slate-100 cursor-pointer"
                        >
                          {PHONE_CODES.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="relative col-span-2">
                          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                            <Phone size={18} />
                          </span>
                          <input
                            type="tel"
                            value={phone}
                            onChange={handlePhoneChange}
                            placeholder="Ej. 4121234567"
                            className="block w-full pl-11 pr-3 rounded-2xl bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 text-sm py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 dark:focus:ring-brand-light/30 text-slate-800 dark:text-slate-100"
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">El número se guardará con el formato internacional seleccionado.</p>
                    </div>
                  </div>

                  {/* SECCIÓN PREGUNTAS DE SEGURIDAD (Ciberseguridad Tope de Gama) */}
                  <div className="pt-2 border-t border-slate-200 dark:border-white/5 space-y-3">
                    <span className="text-xs font-bold text-brand-blue dark:text-brand-light flex items-center gap-1.5 pl-1">
                      <ShieldCheck size={16} /> Preguntas de Seguridad (Para Recuperación)
                    </span>

                    {/* Pregunta 1 */}
                    <div className="space-y-1">
                      <select
                        value={q1}
                        onChange={(e) => setQ1(e.target.value)}
                        required
                        className="block w-full px-3.5 py-2.5 rounded-xl bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 text-xs focus:outline-none text-slate-800 dark:text-slate-100"
                      >
                        <option value="">-- Selecciona Pregunta 1 --</option>
                        {PREDEFINED_QUESTIONS.map(q => (
                          <option key={q} value={q} disabled={q === q2}>{q}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        required
                        value={ans1}
                        onChange={(e) => setAns1(e.target.value)}
                        placeholder="Respuesta a la pregunta 1..."
                        className="block w-full px-4 py-2.5 rounded-xl bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-850 dark:text-slate-100"
                      />
                    </div>

                    {/* Pregunta 2 */}
                    <div className="space-y-1">
                      <select
                        value={q2}
                        onChange={(e) => setQ2(e.target.value)}
                        required
                        className="block w-full px-3.5 py-2.5 rounded-xl bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 text-xs focus:outline-none text-slate-800 dark:text-slate-100"
                      >
                        <option value="">-- Selecciona Pregunta 2 --</option>
                        {PREDEFINED_QUESTIONS.map(q => (
                          <option key={q} value={q} disabled={q === q1}>{q}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        required
                        value={ans2}
                        onChange={(e) => setAns2(e.target.value)}
                        placeholder="Respuesta a la pregunta 2..."
                        className="block w-full px-4 py-2.5 rounded-xl bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-850 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-brand-blue/5 dark:bg-brand-light/10 border border-brand-blue/20 dark:border-brand-light/20 p-4 text-xs text-slate-700 dark:text-slate-200 mt-2">
                    <div className="flex items-center gap-2 mb-1.5">
                      <FileText size={14} className="text-brand-blue dark:text-brand-light" />
                      <span className="font-semibold">Datos del rol</span>
                    </div>
                    <p>{role === "operador" ? "Como operador registrarás tu taller artesanal para aparecer en el directorio geoespacial." : "Como turista podrás calificar los talleres y realizar recorridos geo-optimizados."}</p>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-blue dark:bg-brand-light text-white py-3.5 rounded-2xl font-bold hover:shadow-lg hover:shadow-brand-blue/20 transition disabled:opacity-50 mt-2 cursor-pointer text-sm"
              >
                {loading ? "Procesando..." : isLogin ? "Entrar al Sistema" : "Registrarse"}
              </button>
            </form>
            
            <div className="mt-5 pt-5 md:mt-8 md:pt-6 border-t border-gray-200 dark:border-white/10 text-center">
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
        )}
      </div>

      {isForcePasswordChange && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl">
            <h3 className="text-xl font-display font-bold text-slate-800 dark:text-white mb-2">Cambio de Contraseña Requerido</h3>
            <p className="text-sm text-slate-500 mb-6">Por motivos de seguridad, debes actualizar tu contraseña temporal antes de continuar.</p>
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl text-sm mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleForcePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Nueva Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-blue"
                    placeholder="Mínimo 8 caracteres"
                    required
                  />
                  <button
                    type="button"
                    onMouseDown={() => setShowPassword(true)}
                    onMouseUp={() => setShowPassword(false)}
                    onMouseLeave={() => setShowPassword(false)}
                    onTouchStart={() => setShowPassword(true)}
                    onTouchEnd={() => setShowPassword(false)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350 cursor-pointer select-none"
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Confirmar Nueva Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-slate-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-blue"
                    placeholder="Repite la contraseña"
                    required
                  />
                  <button
                    type="button"
                    onMouseDown={() => setShowConfirmPassword(true)}
                    onMouseUp={() => setShowConfirmPassword(false)}
                    onMouseLeave={() => setShowConfirmPassword(false)}
                    onTouchStart={() => setShowConfirmPassword(true)}
                    onTouchEnd={() => setShowConfirmPassword(false)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350 cursor-pointer select-none"
                  >
                    {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-gold hover:bg-brand-gold/90 text-slate-900 font-bold py-3.5 rounded-2xl transition duration-300"
              >
                {loading ? "Actualizando..." : "Actualizar Contraseña y Entrar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default LoginView;
