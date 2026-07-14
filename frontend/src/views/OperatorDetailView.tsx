/**
 * VISTA: DETALLE DE OPERADOR (Ficha del Artesano)
 * 
 * Se muestra cuando un turista hace clic en un artesano desde el Directorio o Mapa.
 * Contiene:
 * - Carrusel de imágenes (Galería).
 * - Detalles completos (Dirección, Descripción, etc).
 * - Botón para contactar por WhatsApp.
 * - Catálogo de productos.
 * - Sistema de Reseñas y Puntuación.
 * - Soporte OFFLINE (Carga el operador guardado en caché si no hay internet y encola reseñas).
 */

import { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import api from "../services/api";
import { useAuthStore } from "../store/useAuthStore";
import SEO from "../components/SEO";
import { 
  MapPin, Phone, QrCode, Star, CheckCircle, MessageSquare, 
  WifiOff, Send, ArrowLeft, ShoppingBag, Info, AlertTriangle, Award
} from "lucide-react";

interface Operator {
  id: number;
  usuario_id: number;
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
  resenas: Array<{ id: number; puntuacion: number; comentario: string; qr_verificado: boolean; fecha_creacion: string; usuario_correo: string; respuesta_operador?: string; fecha_respuesta?: string }>;
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

  // Estados de reseña
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  // Estados de respuesta del operador
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  // Comprueba si la visita física fue validada previamente mediante escaneo QR (enviado en el estado del router)
  const isQrVerified = routerLocation.state?.qrVerified === true;

  /**
   * Carga los detalles del operador desde la base de datos.
   * Cuenta con soporte PWA Offline: guarda la respuesta en el LocalStorage.
   * Si la petición falla por falta de internet, lee y renderiza los datos cacheados.
   */
  const loadOperatorDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/operators/${id}`);
      setOperator(res.data);
      // Guardar en caché local para acceso sin conexión
      try {
        localStorage.setItem(`cache_operator_${id}`, JSON.stringify(res.data));
      } catch (storageErr) {
        console.warn("No se pudo guardar el taller en caché local (límite de almacenamiento excedido):", storageErr);
      }
      setIsOffline(false);
    } catch (err) {
      console.error("Error al cargar detalles del taller:", err);
      setIsOffline(true);
      try {
        const cached = localStorage.getItem(`cache_operator_${id}`);
        if (cached) {
          setOperator(JSON.parse(cached));
        } else {
          setError("No pudimos cargar la información del taller en este momento. Verifica tu conexión a internet.");
        }
      } catch (parseErr) {
        console.error("Error al parsear el caché del operador:", parseErr);
        setError("La información local de este taller está dañada. Por favor, conéctate a internet para recargar los datos.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOperatorDetail();

    // Listeners para detectar cambios de conectividad y sincronizar
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

  /**
   * Encola la reseña de forma offline en la cola central de LocalStorage.
   * Implementa una actualización optimista de la interfaz de usuario (Optimistic UI Update)
   * inyectando la reseña directamente en memoria para que el turista tenga feedback instantáneo.
   */
  const saveReviewOffline = (newReview: any) => {
    // Registra la llamada en la cola offline central
    api.queueOffline("/reviews", newReview);

    // Simular agregación en la UI en memoria
    if (operator) {
      const updatedReviews = [
        {
          id: Date.now(), // ID temporal
          puntuacion: newReview.puntuacion,
          comentario: newReview.comentario,
          qr_verificado: newReview.qr_verificado,
          fecha_creacion: new Date().toISOString(),
          respuesta_operador: "",
          fecha_respuesta: "",
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

  /**
   * Procesa la publicación de una reseña.
   * Si el dispositivo está sin conexión, delega en `saveReviewOffline`.
   * En caso contrario, la envía inmediatamente al servidor.
   */
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
      qr_verificado: isQrVerified // Asigna si la visita fue validada físicamente por QR
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
      loadOperatorDetail();
    } catch (err: any) {
      setReviewError(err.response?.data?.message || "Error al publicar la reseña.");
    } finally {
      setSubmittingReview(false);
    }
  };

  /**
   * Permite al operador (dueño del taller) guardar o editar una respuesta oficial a una reseña.
   */
  const handleReplySubmit = async (reviewId: number) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      await api.post(`/reviews/${reviewId}/reply`, { respuesta: replyText.trim() });
      setReplyingToId(null);
      setReplyText("");
      loadOperatorDetail();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al enviar la respuesta.");
    } finally {
      setSubmittingReply(false);
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
      <div className="container mx-auto px-4 py-16 text-center max-w-md flex-grow flex flex-col justify-center min-h-[50vh]">
        <div className="glass-panel p-8 rounded-3xl border border-red-500/20 dark:border-red-500/10 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-500"></div>
          
          <div className="w-16 h-16 bg-red-500/10 dark:bg-red-500/25 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-md">
            <AlertTriangle size={32} />
          </div>
          
          <div>
            <h2 className="text-xl font-display font-black text-slate-805 dark:text-white mb-2">
              Taller No Disponible
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
              {error || "El taller que deseas consultar no se encuentra disponible o no existe."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button 
              onClick={() => { setError(""); setLoading(true); loadOperatorDetail(); }}
              className="flex-grow bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 py-3 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Reintentar Carga
            </button>
            <Link 
              to="/directorio" 
              className="flex-grow bg-brand-blue dark:bg-brand-light text-white dark:text-slate-900 py-3 rounded-xl text-xs font-bold hover:shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} /> Volver al Directorio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get active images and make it completely crash-safe
  const primaryImgUrl = operator.imagenes?.find(img => img.es_principal)?.url_imagen || "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800";
  const gallery = operator.imagenes?.filter(img => !img.es_principal) || [];

  // WhatsApp Link
  const whatsAppNumber = operator.telefono_whatsapp ? operator.telefono_whatsapp.replace(/\+/g, "").replace(/\s/g, "") : "";
  const whatsAppLink = `https://wa.me/${whatsAppNumber}?text=Hola%20${encodeURIComponent(operator.nombre_taller || "Artesano")},%20vi%20tu%20taller%20en%20la%20plataforma%20GUAIKE.DÍAZ%20y%20me%20gustaría%20saber%20más%20de%20tus%20obras.`;

  const isOwner = user && String(user.id) === String(operator.usuario_id) && user.role === "operador";

  // Safe properties fallback to prevent crashes if database fields are missing or corrupt
  const calificacionPromedio = typeof operator.calificacion_promedio === "number" ? operator.calificacion_promedio : 0;
  const totalResenas = typeof operator.total_resenas === "number" ? operator.total_resenas : 0;
  const accesibilidades = operator.accesibilidades || [];
  const productos = operator.productos || [];
  const resenas = operator.resenas || [];

  return (
    <>
      <SEO
        title={operator?.nombre_taller || "Taller Artesanal"}
        description={operator?.descripcion || "Artesano tradicional verificado del Municipio Díaz, preservando la cultura típica venezolana."}
        canonical={`/operador/${id}`}
        image={operator?.imagenes?.find(img => img.es_principal)?.url_imagen || "https://guaike.diaz.vercel.app/images/san_juan_valle.webp"}
      />
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
        <Link to="/directorio" className="text-sm font-bold text-slate-500 hover:text-brand-blue dark:hover:text-brand-light flex items-center gap-1">
          <ArrowLeft size={16} /> Volver al Directorio
        </Link>

        {operator.es_verificado && (
          <span className="text-xs font-extrabold uppercase tracking-widest chip-gold px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
            <CheckCircle size={14} className="text-accent-gold" /> Patrimonio Verificado
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
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
                    fill={star <= Math.round(calificacionPromedio) ? "currentColor" : "none"} 
                    className="text-brand-gold"
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {calificacionPromedio.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400">
                ({totalResenas} {totalResenas === 1 ? "reseña" : "reseñas"})
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
          {accesibilidades.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Facilidades del Taller</h3>
              <div className="flex flex-wrap gap-2">
                {accesibilidades.map((acc) => (
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

            {/* QR Scan physical visitation trigger (only for tourists, not for the owner) */}
            {!isOwner && (
              <Link 
                to={`/operador/${operator.id}/escanear-qr`}
                className="flex-grow bg-brand-blue dark:bg-brand-light hover:bg-brand-blue/90 text-white font-bold py-3.5 px-6 rounded-2xl transition duration-200 shadow-lg shadow-brand-blue/10 flex items-center justify-center gap-2 text-sm cursor-pointer text-center"
              >
                <QrCode size={16} /> Validar Visita QR
              </Link>
            )}
          </div>

          {/* QR Code display panel — only visible to the owner operator */}
          {isOwner && operator.qr_codigo_unico && (
            <QrOwnerPanel qrValue={operator.qr_codigo_unico} workshopName={operator.nombre_taller} />
          )}
        </div>
      </div>

      {/* Catalog of Products / Works */}
      <section className="glass-panel p-6 sm:p-8 rounded-3xl mb-12 shadow-xl">
        <h2 className="text-2xl font-display font-extrabold text-slate-800 dark:text-white mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-white/5 pb-4">
          <ShoppingBag className="text-brand-blue dark:text-brand-light" size={24} />
          Catálogo del Taller
        </h2>

        {productos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {productos.map((prod) => (
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

          {isQrVerified ? (
            <>
              <div className="mb-6 chip-gold border border-brand-gold/40 dark:border-brand-gold/30 p-4 rounded-2xl flex items-center gap-3">
                <Award className="text-brand-gold animate-bounce" size={24} />
                <div>
                  <p className="text-xs font-extrabold text-brand-gold uppercase tracking-wider">¡Felicidades!</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold leading-snug">Visita física comprobada. Tu reseña llevará el sello oficial dorado de veracidad.</p>
                </div>
              </div>

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
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-brand-blue/5 border border-brand-blue/15 dark:border-white/5 p-5 rounded-2xl flex flex-col items-center text-center space-y-3">
                <div className="bg-brand-blue/10 text-brand-blue dark:bg-brand-light/10 dark:text-brand-light p-3 rounded-full">
                  <QrCode size={32} />
                </div>
                <h3 className="font-bold text-sm text-slate-850 dark:text-slate-100">Validación por QR Requerida</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
                  Para publicar una opinión debes haber visitado físicamente el taller y escaneado su código QR único.
                </p>
                <Link
                  to={`/operador/${operator.id}/escanear-qr`}
                  className="w-full bg-brand-blue dark:bg-brand-light text-white py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer text-sm mt-2"
                >
                  <QrCode size={16} /> Escanear Código QR para Reseñar
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Reviews Feed Column */}
        <div className="lg:col-span-7 space-y-5">
          <h3 className="font-display font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2 pl-2">
            Reseñas e Historial de Visitas ({resenas.length})
          </h3>

          {resenas.length > 0 ? (
            <div className="space-y-4">
              {resenas.map((rev) => (
                <div 
                  key={rev.id} 
                  className={`p-5 rounded-3xl shadow-sm border relative overflow-hidden ${
                    rev.qr_verificado 
                      ? "bg-brand-gold/5 dark:bg-brand-gold/10 border-brand-gold/30" 
                      : "bg-surface-95 dark:bg-slate-900/95 border-gray-200/50 dark:border-white/5"
                  }`}
                >
                  {/* Glowing physical badge */}
                  {rev.qr_verificado && (
                    <span className="absolute top-3.5 right-4 text-[10px] uppercase tracking-widest chip-gold px-2.5 py-1 rounded-full flex items-center gap-1">
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

                    {/* Respuesta del Operador */}
                    {rev.respuesta_operador && (
                      <div className="mt-4 ml-4 p-4 rounded-2xl bg-brand-blue/5 dark:bg-brand-light/5 border border-brand-blue/10 dark:border-brand-light/10 space-y-1.5">
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
                        <p className="text-slate-700 dark:text-slate-200 text-xs sm:text-sm leading-relaxed pl-0.5">
                          {rev.respuesta_operador}
                        </p>
                      </div>
                    )}

                    {/* Botón/Acción para Responder por el Operador */}
                    {isOwner && (
                      <div className="mt-3 pl-1">
                        {replyingToId === rev.id ? (
                          <div className="mt-2 space-y-2">
                            <textarea
                              rows={2}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Escribe tu respuesta como artesano..."
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-gray-200/70 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-brand-blue text-slate-800 dark:text-slate-100"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleReplySubmit(rev.id)}
                                disabled={submittingReply}
                                className="bg-brand-blue dark:bg-brand-light text-white font-bold px-3 py-1.5 rounded-lg text-[10px] hover:shadow-md cursor-pointer disabled:opacity-50"
                              >
                                {submittingReply ? "Enviando..." : "Guardar Respuesta"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyingToId(null);
                                  setReplyText("");
                                }}
                                className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-3 py-1.5 rounded-lg text-[10px] hover:bg-slate-300 transition cursor-pointer"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingToId(rev.id);
                              setReplyText(rev.respuesta_operador || "");
                            }}
                            className="text-xs font-bold text-brand-blue dark:text-brand-light hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                          >
                            {rev.respuesta_operador ? "Editar Respuesta" : "Responder Reseña"}
                          </button>
                        )}
                      </div>
                    )}
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
    </>
  );
};


interface QrOwnerPanelProps {
  qrValue: string;
  workshopName: string;
}

const QrOwnerPanel: React.FC<QrOwnerPanelProps> = ({ qrValue, workshopName }) => {
  const qrRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const qrDataUrl = canvas.toDataURL("image/png");

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>Código QR - ${workshopName}</title>
        <style>body{font-family:sans-serif;text-align:center;padding:20px;} h2{margin-bottom:4px;} p{color:#666;font-size:12px;margin:4px 0;} img{margin:12px auto;display:block;} .uuid{font-size:9px;color:#999;font-family:monospace;word-break:break-all;margin-top:8px;}</style>
        </head><body>
        <h2>${workshopName}</h2>
        <p>Escanea para verificar tu visita en GUAIKE.DÍAZ</p>
        <img src="${qrDataUrl}" width="280" height="280" />
        <p class="uuid">${qrValue}</p>
        </body></html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  return (
    <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-brand-blue/5 to-brand-light/5 border border-brand-blue/20 dark:border-white/10 space-y-3">
      <div className="flex items-center gap-2">
        <QrCode size={18} className="text-brand-blue dark:text-brand-light flex-shrink-0" />
        <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Tu Código QR de Visita</h3>
      </div>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
        Imprime este código y colócalo en tu taller para que los visitantes puedan escanearlo y dejar reseñas verificadas.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div ref={qrRef} className="bg-white rounded-2xl p-3 shadow-lg border border-gray-100 flex-shrink-0">
          <div className="hidden">
            <QRCodeCanvas value={qrValue} size={280} level="H" />
          </div>
          <QRCodeSVG value={qrValue} size={140} level="H" className="sm:w-[160px] sm:h-[160px]" />
        </div>
        <div className="space-y-2 w-full">
          <p className="text-[10px] font-mono text-slate-400 break-all select-all bg-slate-100 dark:bg-slate-800/50 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10">
            {qrValue}
          </p>
          <button
            type="button"
            onClick={handlePrint}
            className="w-full py-2.5 rounded-xl bg-brand-blue dark:bg-brand-light text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition cursor-pointer"
          >
            <QrCode size={13} /> Imprimir Código QR
          </button>
        </div>
      </div>
    </div>
  );
};

export default OperatorDetailView;

