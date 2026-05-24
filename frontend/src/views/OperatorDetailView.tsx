import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import { useAuthStore } from "../store/useAuthStore";
import { 
  MapPin, 
  Phone, 
  QrCode, 
  Star, 
  CheckCircle, 
  MessageSquare, 
  WifiOff, 
  Send, 
  ArrowLeft,
  ShoppingBag,
  Info,
  AlertTriangle,
  Award
} from "lucide-react";

interface Operator {
  id: number;
  nombre_taller: string;
  descripcion: string;
  direccion_detallada: string;
  telefono_whatsapp: string;
  es_verificado: boolean;
  qr_codigo_unico: string;
  categoria_nombre: string;
  parroquia_nombre: string;
  longitud: number;
  latitud: number;
  calificacion_promedio: number;
  total_resenas: number;
  imagenes: Array<{ id: number; url_imagen: string; es_principal: boolean }>;
  accesibilidades: Array<{ id: number; etiqueta: string; icono: string }>;
  productos: Array<{ id: number; nombre: string; descripcion: string; precio: string; url_imagen: string; esta_disponible: boolean }>;
  resenas: Array<{ id: number; puntuacion: number; comentario: string; qr_verificado: boolean; fecha_creacion: string; usuario_correo: string }>;
}

const OperatorDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { user } = useAuthStore();

  const [operator, setOperator] = useState<Operator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  // Check if QR verification is active (passed in state from scanner)
  const isQrVerified = routerLocation.state?.qrVerified === true;

  const loadOperatorDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/operators/${id}`);
      setOperator(res.data);
      localStorage.setItem(`cache_operator_${id}`, JSON.stringify(res.data));
      setIsOffline(false);
    } catch (err) {
      console.error("Error al cargar detalles:", err);
      setIsOffline(true);
      const cached = localStorage.getItem(`cache_operator_${id}`);
      if (cached) {
        setOperator(JSON.parse(cached));
      } else {
        setError("No pudimos cargar la información del taller en este momento.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOperatorDetail();

    const handleOnline = () => {
      setIsOffline(false);
      loadOperatorDetail();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [id]);

  // Offline review synchronization helper
  const saveReviewOffline = (newReview: any) => {
    const queue = JSON.parse(localStorage.getItem("offline_reviews_queue") || "[]");
    queue.push(newReview);
    localStorage.setItem("offline_reviews_queue", JSON.stringify(queue));
    
    // Simulate UI addition
    if (operator) {
      const updatedReviews = [
        {
          id: Date.now(), // temporary id
          puntuacion: newReview.puntuacion,
          comentario: newReview.comentario,
          qr_verificado: newReview.qr_verificado,
          fecha_creacion: new Date().toISOString(),
          usuario_correo: user?.email || "Tú (Offline)"
        },
        ...operator.resenas
      ];
      setOperator({
        ...operator,
        resenas: updatedReviews,
        total_resenas: operator.total_resenas + 1
      });
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError("");
    setReviewSuccess("");

    if (!user) {
      navigate("/login");
      return;
    }

    const reviewPayload = {
      operador_id: parseInt(id || "0"),
      puntuacion: rating,
      comentario: comment,
      qr_verificado: isQrVerified
    };

    if (isOffline) {
      saveReviewOffline(reviewPayload);
      setReviewSuccess("Tu reseña se ha guardado localmente y se sincronizará automáticamente cuando recuperes la conexión.");
      setComment("");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.post("/reviews", reviewPayload);
      setReviewSuccess(res.data.message || "¡Reseña publicada!");
      setComment("");
      // Reload detail to reflect new review
      loadOperatorDetail();
    } catch (err: any) {
      setReviewError(err.response?.data?.message || "Error al publicar la reseña.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-4xl space-y-6">
        <div className="w-16 h-16 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 animate-pulse font-semibold">Cargando detalles del taller artesanal...</p>
      </div>
    );
  }

  if (error || !operator) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <AlertTriangle size={48} className="mx-auto text-red-500 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold mb-2">Error de Carga</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{error || "Taller no encontrado."}</p>
        <Link to="/" className="bg-brand-blue text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg inline-flex items-center gap-1.5 cursor-pointer">
          <ArrowLeft size={16} /> Volver al Inicio
        </Link>
      </div>
    );
  }

  // Get active images
  const primaryImgUrl = operator.imagenes.find(img => img.es_principal)?.url_imagen || "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800";
  const gallery = operator.imagenes.filter(img => !img.es_principal);

  // WhatsApp Link
  const whatsAppNumber = operator.telefono_whatsapp ? operator.telefono_whatsapp.replace(/\+/g, "").replace(/\s/g, "") : "";
  const whatsAppLink = `https://wa.me/${whatsAppNumber}?text=Hola%20${encodeURIComponent(operator.nombre_taller)},%20vi%20tu%20taller%20en%20la%20plataforma%20GUAIKE.DÍAZ%20y%20me%20gustaría%20saber%20más%20de%20tus%20obras.`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      
      {/* Offline Alert Indicator */}
      {isOffline && (
        <div className="mb-6 bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-amber-600 dark:text-amber-400 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
          <WifiOff size={20} />
          <div className="text-sm font-semibold">
            Modo Sin Conexión activo. Estás viendo la información cacheada y cualquier reseña se guardará para sincronización posterior.
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <div className="mb-6 flex justify-between items-center">
        <Link to="/" className="text-sm font-bold text-slate-500 hover:text-brand-blue dark:hover:text-brand-light flex items-center gap-1">
          <ArrowLeft size={16} /> Volver al Directorio
        </Link>

        {operator.es_verificado && (
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-gold bg-brand-gold/15 px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
            <CheckCircle size={14} className="text-brand-gold" /> Patrimonio Verificado
          </span>
        )}
      </div>

      {/* Main Grid: Info & Carousel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Gallery Carousel Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl overflow-hidden aspect-video border border-gray-200 dark:border-white/10 shadow-2xl relative">
            <img src={primaryImgUrl} alt={operator.nombre_taller} className="w-full h-full object-cover" />
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-white text-xs font-bold capitalize">
              {operator.categoria_nombre}
            </div>
          </div>

          {gallery.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {gallery.slice(0, 4).map((img, idx) => (
                <div key={idx} className="rounded-2xl overflow-hidden aspect-square border border-gray-200 dark:border-white/10 shadow hover:opacity-90 transition cursor-pointer">
                  <img src={img.url_imagen} alt={`Taller ${idx}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Short details and stats */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400 dark:text-slate-500">
              Artesano del Municipio Díaz
            </span>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-800 dark:text-white leading-tight">
              {operator.nombre_taller}
            </h1>

            {/* Ratings */}
            <div className="flex items-center gap-1.5">
              <div className="flex text-brand-gold">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    size={16} 
                    fill={star <= Math.round(operator.calificacion_promedio) ? "currentColor" : "none"} 
                    className="text-brand-gold"
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {operator.calificacion_promedio.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400">
                ({operator.total_resenas} {operator.total_resenas === 1 ? "reseña" : "reseñas"})
              </span>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              {operator.descripcion || "Artesano tradicional verificado del Municipio Díaz, preservando la cultura típica venezolana."}
            </p>

            <div className="space-y-3 pt-3">
              <div className="flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                <MapPin size={16} className="text-brand-blue dark:text-brand-light flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 capitalize">{operator.parroquia_nombre}</p>
                  <p className="text-[11px] leading-tight mt-0.5">{operator.direccion_detallada}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Accesibilidades */}
          {operator.accesibilidades.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Facilidades del Taller</h3>
              <div className="flex flex-wrap gap-2">
                {operator.accesibilidades.map((acc) => (
                  <span 
                    key={acc.id}
                    className="text-xs font-semibold bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/20 flex items-center gap-1"
                  >
                    <Award size={12} /> {acc.etiqueta}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Core Interactive Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
            {/* WhatsApp Contact */}
            {operator.telefono_whatsapp && (
              <a 
                href={whatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-grow bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-6 rounded-2xl transition duration-200 shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 text-sm cursor-pointer text-center"
              >
                <Phone size={16} /> Contactar WhatsApp
              </a>
            )}

            {/* QR Scan physical visitation trigger */}
            <Link 
              to={`/operador/${operator.id}/escanear-qr`}
              className="flex-grow bg-brand-blue dark:bg-brand-light hover:bg-brand-blue/90 text-white font-bold py-3.5 px-6 rounded-2xl transition duration-200 shadow-lg shadow-brand-blue/10 flex items-center justify-center gap-2 text-sm cursor-pointer text-center"
            >
              <QrCode size={16} /> Validar Visita QR
            </Link>
          </div>
        </div>
      </div>

      {/* Catalog of Products / Works */}
      <section className="glass-panel p-6 sm:p-8 rounded-3xl mb-12 shadow-xl">
        <h2 className="text-2xl font-display font-extrabold text-slate-800 dark:text-white mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-white/5 pb-4">
          <ShoppingBag className="text-brand-blue dark:text-brand-light" size={24} />
          Catálogo del Taller
        </h2>

        {operator.productos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {operator.productos.map((prod) => (
              <div key={prod.id} className="bg-gray-50/50 dark:bg-slate-800/25 border border-gray-200/50 dark:border-white/5 rounded-2xl overflow-hidden shadow hover:shadow-md transition">
                <div className="h-44 bg-gray-200 dark:bg-slate-800 relative">
                  <img src={prod.url_imagen || "https://images.unsplash.com/photo-1595475207225-428b62bda831?q=80&w=400"} alt={prod.nombre} className="w-full h-full object-cover" />
                  {prod.precio && (
                    <div className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-xl text-brand-gold text-xs font-bold">
                      ${parseFloat(prod.precio).toFixed(2)}
                    </div>
                  )}
                </div>
                <div className="p-4.5 space-y-1.5">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{prod.nombre}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {prod.descripcion || "Creación tradicional tejida a mano."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500">
            <Info size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">El artesano no ha registrado productos en su catálogo digital aún.</p>
          </div>
        )}
      </section>

      {/* Reviews and Physical Visitors validation */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Write a Review Form */}
        <div className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-brand-blue"></div>
          <h2 className="text-xl font-display font-bold text-slate-800 dark:text-white mb-1.5 flex items-center gap-2">
            <MessageSquare size={20} className="text-brand-blue dark:text-brand-light" />
            Escribir Reseña
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Comparte tu opinión sobre este taller para guiar a futuros viajeros de Nueva Esparta.
          </p>

          {reviewError && (
            <div className="mb-4 bg-red-500/10 dark:bg-red-950/20 border border-red-500/30 text-red-600 dark:text-red-400 p-3.5 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle size={14} className="flex-shrink-0" />
              <span>{reviewError}</span>
            </div>
          )}

          {reviewSuccess && (
            <div className="mb-4 bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-xl text-xs">
              {reviewSuccess}
            </div>
          )}

          {isQrVerified && (
            <div className="mb-6 bg-brand-gold/10 dark:bg-brand-gold/15 border border-brand-gold/40 p-4 rounded-2xl flex items-center gap-3">
              <Award className="text-brand-gold animate-bounce" size={24} />
              <div>
                <p className="text-xs font-extrabold text-brand-gold uppercase tracking-wider">¡Felicidades!</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold leading-snug">Visita física comprobada. Tu reseña llevará el sello oficial dorado de veracidad.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 pl-1">Calificación</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-slate-300 hover:text-brand-gold dark:text-slate-700 dark:hover:text-brand-gold transition duration-150 cursor-pointer"
                  >
                    <Star 
                      size={28} 
                      fill={star <= rating ? "#F59E0B" : "none"} 
                      className={star <= rating ? "text-brand-gold" : "text-slate-300 dark:text-slate-600"} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">Tu Comentario</label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="¿Qué te pareció el taller, el trato y sus productos artesanales?..."
                className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 dark:bg-slate-800/30 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-slate-100"
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="w-full bg-brand-blue dark:bg-brand-light text-white py-3 rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer text-sm"
            >
              <Send size={14} /> {submittingReview ? "Enviando..." : "Publicar Reseña"}
            </button>
          </form>
        </div>

        {/* Reviews Feed Column */}
        <div className="lg:col-span-7 space-y-5">
          <h3 className="font-display font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2 pl-2">
            Reseñas e Historial de Visitas ({operator.resenas.length})
          </h3>

          {operator.resenas.length > 0 ? (
            <div className="space-y-4">
              {operator.resenas.map((rev) => (
                <div 
                  key={rev.id} 
                  className={`p-5 rounded-3xl shadow-sm border relative overflow-hidden ${
                    rev.qr_verificado 
                      ? "bg-brand-gold/5 dark:bg-brand-gold/10 border-brand-gold/30" 
                      : "bg-[#FAF9F5]/95 dark:bg-slate-900/95 border-gray-200/50 dark:border-white/5"
                  }`}
                >
                  {/* Glowing physical badge */}
                  {rev.qr_verificado && (
                    <span className="absolute top-3.5 right-4 text-[10px] uppercase tracking-widest font-extrabold text-brand-gold bg-brand-gold/15 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Award size={10} /> QR Verificado
                    </span>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex text-brand-gold">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={12} 
                            fill={star <= rev.puntuacion ? "currentColor" : "none"} 
                          />
                        ))}
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {rev.usuario_correo.split("@")[0]}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed pl-0.5">
                      {rev.comentario}
                    </p>

                    <div className="flex justify-between items-center pl-0.5 pt-1 text-[10px] text-slate-400">
                      <span>{new Date(rev.fecha_creacion).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel p-10 rounded-3xl text-center text-slate-400 dark:text-slate-500">
              <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aún no hay reseñas. ¡Sé el primero en calificar este taller artesanal!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default OperatorDetailView;
