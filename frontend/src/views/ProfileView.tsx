import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import api from "../services/api";
import SEO from "../components/SEO";
import {
  User,
  ShieldCheck,
  CheckCircle,
  Home,
  Info,
  ArrowRight,
  WifiOff,
  Star,
  Trash2,
  Edit,
  MessageSquare,
  Award,
} from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";

const ProfileView = () => {
  const { user, token, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Reviews states
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const loadReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await api.get("/reviews/my-reviews");
      setReviews(res.data);
    } catch (err) {
      console.error("Error al cargar reseñas:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta reseña?")) return;
    try {
      await api.delete(`/reviews/${id}`);
      setReviews(reviews.filter((r) => r.id !== id));
    } catch (err) {
      alert("Error al eliminar la reseña.");
    }
  };

  const handleEditSubmit = async (id: number) => {
    if (!editRating) return;
    setSubmittingEdit(true);
    try {
      await api.put(`/reviews/${id}`, { puntuacion: editRating, comentario: editComment });
      setEditingReviewId(null);
      loadReviews();
    } catch (err) {
      alert("Error al actualizar la reseña.");
    } finally {
      setSubmittingEdit(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const storedUser = localStorage.getItem("auth_user");
    if (!user && storedUser) {
      try {
        setProfile(JSON.parse(storedUser));
      } catch {
        setProfile(null);
      }
    }

    const loadProfile = async () => {
      setLoading(true);
      setError("");
      if (!navigator.onLine) {
        setIsOffline(true);
        setLoading(false);
        // Load reviews offline check
        const stored = localStorage.getItem("auth_user");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.role === "turista") {
              loadReviews();
            }
          } catch {}
        }
        return;
      }

      try {
        const response = await api.get("/auth/profile");
        setProfile(response.data);
        setAuth(response.data, token);
        setIsOffline(false);
        if (response.data.role === "turista") {
          loadReviews();
        }
      } catch (err: any) {
        console.error("Error al cargar perfil:", err);
        setError("No se pudo actualizar la información. Mostrando datos en caché.");
        const stored = localStorage.getItem("auth_user");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.role === "turista") {
              loadReviews();
            }
          } catch {}
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();

    const handleOnline = () => {
      setIsOffline(false);
      loadProfile();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [token, navigate, setAuth]);

  if (!token) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-4 border-brand-blue border-t-transparent animate-spin mx-auto mb-6"></div>
        <p className="text-slate-600 dark:text-slate-400">Cargando tu perfil...</p>
      </div>
    );
  }

  const userRole = profile?.role || user?.role || "turista";
  const email = profile?.email || user?.email || "-";
  const userName = profile?.full_name || profile?.name || email.split("@")[0] || "Usuario";
  const createdAt = profile?.fecha_creacion || profile?.created_at || "-";

  const getRoleDescription = () => {
    switch (userRole) {
      case "admin":
        return "Tienes acceso completo a la administración de operadores, eventos y estadísticas del municipio.";
      case "operador":
        return "Puedes registrar tu taller artesanal y gestionar tu presencia en el directorio.";
      default:
        return "Puedes explorar los talleres artesanales, dejar reseñas y participar en los recorridos culturales.";
    }
  };

  return (
    <>
      <SEO
        title="Mi Perfil"
        description="Gestiona tu perfil en GUAIKE.DÍAZ. Explora talleres artesanales, deja reseñas y participa en recorridos culturales."
        canonical="/perfil"
      />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
      <PageHeader
        align="left"
        badge="Perfil de Usuario"
        title={`Hola, ${userName}`}
        description={getRoleDescription()}
        icon={User}
        actions={
          <div className="rounded-3xl bg-brand-blue/10 dark:bg-brand-light/10 p-5 border border-brand-blue/20 dark:border-brand-light/20">
            <div className="flex items-center gap-3 text-brand-blue dark:text-brand-light">
              <ShieldCheck size={24} />
              <div>
                <p className="text-xs uppercase tracking-[0.3em] font-semibold">Rol Actual</p>
                <p className="text-xl font-bold capitalize">{userRole}</p>
              </div>
            </div>
          </div>
        }
      />
      <div className="glass-panel rounded-3xl p-4 sm:p-8 shadow-2xl border border-slate-200/70 dark:border-white/10">

        {isOffline && (
          <div className="mb-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-200 p-4">
            <div className="flex items-start gap-3">
              <WifiOff size={20} />
              <div>
                <p className="font-bold">Modo sin conexión</p>
                <p className="text-sm text-slate-700 dark:text-slate-200">Estás viendo datos guardados localmente. Se actualizarán cuando vuelvas a conectarte.</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-3xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-200 p-4">
            <div className="flex items-start gap-3">
              <Info size={20} />
              <div>
                <p className="font-bold">Atención</p>
                <p className="text-sm text-slate-700 dark:text-slate-200">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="rounded-3xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-white/10 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-semibold mb-4">Correo</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white break-words">{email}</p>
          </div>
          <div className="rounded-3xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-white/10 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-semibold mb-4">Miembro desde</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{createdAt !== "-" ? createdAt : "No disponible"}</p>
          </div>
          <div className="rounded-3xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-white/10 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-semibold mb-4">Acceso</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{userRole === "admin" ? "Administrador" : userRole === "operador" ? "Operador" : "Turista"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {userRole === "admin" && (
            <Link
              to="/admin"
              className="rounded-3xl border border-brand-blue/20 bg-brand-blue/5 dark:bg-brand-blue/10 p-6 flex flex-col gap-4 hover:border-brand-blue dark:hover:border-brand-light transition"
            >
              <div className="flex items-center justify-between">
                <ShieldCheck size={28} className="text-brand-blue" />
                <ArrowRight size={20} className="text-brand-blue" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">Ir al Panel Admin</span>
              <p className="text-sm text-slate-500 dark:text-slate-400">Gestiona operadores, eventos y estadísticas.</p>
            </Link>
          )}

          {userRole === "operador" && (
            <Link
              to="/registro-operador"
              className="rounded-3xl border border-brand-gold/20 bg-brand-gold/5 dark:bg-brand-gold/10 p-6 flex flex-col gap-4 hover:border-brand-gold dark:hover:border-brand-light transition"
            >
              <div className="flex items-center justify-between">
                <CheckCircle size={28} className="text-brand-gold" />
                <ArrowRight size={20} className="text-brand-gold" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">Gestionar Taller</span>
              <p className="text-sm text-slate-500 dark:text-slate-400">Registra o actualiza tu perfil como artesano.</p>
            </Link>
          )}

          {userRole !== "admin" && (
            <Link
              to="/"
              className="rounded-3xl border border-brand-green/20 bg-brand-green/5 dark:bg-brand-green/10 p-6 flex flex-col gap-4 hover:border-brand-green dark:hover:border-brand-light transition"
            >
              <div className="flex items-center justify-between">
                <Home size={28} className="text-brand-green" />
                <ArrowRight size={20} className="text-brand-green" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">Explorar Talleres</span>
              <p className="text-sm text-slate-500 dark:text-slate-400">Busca, filtra y visita los talleres artesanales verificados.</p>
            </Link>
          )}
        </div>

        {/* Mis Reseñas Section */}
        {userRole === "turista" && (
          <section className="mt-12">
            <h2 className="text-2xl font-display font-extrabold text-slate-800 dark:text-white mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-white/5 pb-4">
              <MessageSquare className="text-brand-blue dark:text-brand-light" size={24} />
              Mis Reseñas Publicadas
            </h2>

            {loadingReviews ? (
              <div className="text-center py-8">
                <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs text-slate-500">Cargando tus reseñas...</p>
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-6 rounded-3xl border shadow-sm relative overflow-hidden transition bg-white dark:bg-slate-900/95 border-gray-200/60 dark:border-white/5"
                  >
                    {/* QR Badge */}
                    {rev.qr_verificado && (
                      <span className="absolute top-4 right-4 text-[10px] uppercase tracking-widest chip-gold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Award size={10} /> Visita QR
                      </span>
                    )}

                    {editingReviewId === rev.id ? (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 pl-1">Calificación</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setEditRating(star)}
                                className="p-1 text-slate-300 hover:text-brand-gold dark:text-slate-700 dark:hover:text-brand-gold transition duration-150 cursor-pointer"
                              >
                                <Star
                                  size={24}
                                  fill={star <= editRating ? "#F59E0B" : "none"}
                                  className={star <= editRating ? "text-brand-gold" : "text-slate-300 dark:text-slate-600"}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 pl-1">Comentario</label>
                          <textarea
                            rows={3}
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 dark:bg-slate-800/30 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-slate-100"
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => handleEditSubmit(rev.id)}
                            disabled={submittingEdit}
                            className="bg-brand-blue dark:bg-brand-light text-white font-bold px-4 py-2 rounded-xl text-xs hover:shadow-lg transition cursor-pointer disabled:opacity-50"
                          >
                            {submittingEdit ? "Guardando..." : "Guardar Cambios"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingReviewId(null)}
                            className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-4 py-2 rounded-xl text-xs hover:bg-slate-300 transition cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <Link to={`/operador/${rev.operador_id}`} className="font-bold text-slate-800 dark:text-slate-100 hover:text-brand-blue dark:hover:text-brand-light transition text-base">
                              {rev.nombre_taller}
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex text-brand-gold">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={12}
                                    fill={star <= rev.puntuacion ? "currentColor" : "none"}
                                    className="text-brand-gold"
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-slate-400">
                                {new Date(rev.fecha_creacion).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingReviewId(rev.id);
                                setEditRating(rev.puntuacion);
                                setEditComment(rev.comentario || "");
                              }}
                              className="p-2 text-slate-400 hover:text-brand-blue dark:hover:text-brand-light rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                              title="Editar reseña"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(rev.id)}
                              className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                              title="Eliminar reseña"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <p className="text-slate-600 dark:text-slate-300 text-sm pl-0.5">
                          {rev.comentario || "Sin comentario escrito."}
                        </p>

                        {/* Respuesta del artesano */}
                        {rev.respuesta_operador && (
                          <div className="mt-4 p-4 rounded-2xl bg-brand-blue/5 dark:bg-brand-light/5 border border-brand-blue/10 dark:border-brand-light/10 space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-brand-blue dark:text-brand-light flex items-center gap-1">
                                <Award size={12} /> Respuesta del Artesano (Dueño)
                              </span>
                              {rev.fecha_respuesta && (
                                <span className="text-[10px] text-slate-400">
                                  {new Date(rev.fecha_respuesta).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                                </span>
                              )}
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed pl-0.5">
                              {rev.respuesta_operador}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel p-10 rounded-3xl text-center text-slate-400 dark:text-slate-500">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aún no has publicado ninguna reseña. ¡Visita los talleres y comparte tu experiencia!</p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
    </>
  );
};

export default ProfileView;
