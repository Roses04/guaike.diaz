import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { WifiOff, ZoomIn } from "lucide-react";
import ContentModal, { type ContentModalItem } from "../components/ui/ContentModal";

const CULTURAL_HIGHLIGHTS: ContentModalItem[] = [
  {
    title: "San Juan Bautista",
    image: "/images/SanJuan.jpg",
    description:
      "Parroquia histórica del Municipio Díaz, cuna de tradiciones, ferias artesanales y paisajes que definen la identidad margariteña.",
    category: "Patrimonio",
  },
  {
    title: "Tejido de Cogollo",
    image: "/images/Sombrero_de_cogollo.JPG",
    description:
      "El tejido de sombreros con cogollo de dátil es símbolo de la laboriosidad y de la identidad ancestral de San Juan.",
    category: "Artesanía",
  },
  {
    title: "Valle de Fuentidueño",
    image: "/images/Fuentidueño.jpg",
    description:
      "Edén de palmeras datileras, manantiales naturales y paz inigualable, cuna de tejedores y agricultores tradicionales.",
    category: "Naturaleza",
  },
  {
    title: "Dulce de Piñonate",
    image: "/images/Piñonate.jpg",
    description:
      "Manjar tradicional elaborado artesanalmente a base de papaya, naranja silvestre y amor, envuelto en hojas secas de plátano.",
    category: "Gastronomía",
  },
  {
    title: "Pozas de San Juan",
    image: "/images/Pozas_de_San_Juan_Bautísta.jpg",
    description:
      "Piscinas naturales talladas en piedra en las faldas de la montaña, un refrescante paraíso rodeado de vegetación tropical.",
    category: "Ecoturismo",
  },
];

const highlightByImage = (image: string) =>
  CULTURAL_HIGHLIGHTS.find((h) => h.image === image);

const imageButtonClass =
  "group relative w-full h-full text-left rounded-2xl overflow-hidden border border-stone-200/80 dark:border-white/10 shadow-lg transition-all duration-300 hover:rotate-0 hover:z-20 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900";

const HomeView = () => {
  const [events, setEvents] = useState([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [modalItem, setModalItem] = useState<ContentModalItem | null>(null);

  const openModal = useCallback((item: ContentModalItem) => {
    setModalItem(item);
  }, []);

  const closeModal = useCallback(() => {
    setModalItem(null);
  }, []);

  const loadData = async () => {
    try {
      const eventsRes = await api.get("/events");
      setEvents(eventsRes.data || []);
      localStorage.setItem("cache_eventos", JSON.stringify(eventsRes.data || []));
      setIsOffline(false);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setIsOffline(true);
      const cachedEvents = localStorage.getItem("cache_eventos");
      if (cachedEvents) setEvents(JSON.parse(cachedEvents));
    }
  };

  useEffect(() => {
    loadData();

    const handleOnline = () => {
      setIsOffline(false);
      loadData();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const sanJuan = highlightByImage("/images/SanJuan.jpg")!;
  const sombrero = highlightByImage("/images/Sombrero_de_cogollo.JPG")!;
  const fuentidueno = highlightByImage("/images/Fuentidueño.jpg")!;
  const heroCollage = [sanJuan, sombrero, fuentidueno];
  const heroLabels = ["San Juan", "Sombreros", "Fuentidueño"];

  const renderHeroCard = (item: ContentModalItem, label: string, className = "") => (
    <button
      type="button"
      onClick={() => openModal(item)}
      className={`${imageButtonClass} ${className}`}
      aria-label={`Ver más sobre ${item.title}`}
    >
      <img
        src={item.image}
        alt={item.title}
        className="w-full h-full object-cover group-hover:brightness-105 transition-all duration-300"
      />
      <div className="absolute inset-0 bg-slate-900/20 dark:bg-slate-900/30 group-hover:bg-slate-900/10 transition-colors" />
      <div className="absolute bottom-2 left-2 text-[9px] font-bold text-white bg-slate-900/70 dark:bg-slate-950/70 px-2 py-0.5 rounded backdrop-blur-sm">
        {label}
      </div>
      <span className="absolute top-2 right-2 opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-black/50 p-1 rounded-full text-white">
        <ZoomIn size={14} />
      </span>
    </button>
  );

  return (
    <div className="w-full px-4 py-6 md:px-6">
      {isOffline && (
        <div className="mb-6 bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-amber-600 dark:text-amber-400 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
          <WifiOff size={20} />
          <div className="text-sm font-semibold">
            Modo Sin Conexión activo. Estás visualizando la información guardada localmente.
          </div>
        </div>
      )}

      <header className="relative rounded-[32px] overflow-hidden mb-6 p-4 sm:p-8 lg:p-12 bg-gradient-to-br from-slate-50 via-white to-brand-blue/10 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-brand-dark/95 border border-stone-200/80 dark:border-white/10 shadow-2xl text-left flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-brand-blue/15 dark:bg-brand-blue/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-brand-gold/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex-grow max-w-2xl w-full">
          <span className="text-[10px] uppercase tracking-widest text-brand-gold font-extrabold px-3 py-1.5 bg-brand-gold/15 border border-brand-gold/30 rounded-full mb-5 inline-block">
            Guía Cultural Oficial del Municipio Díaz
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-slate-800 dark:text-white tracking-tight mb-5 leading-[1.1]">
            Guardianes de la{" "}
            <span className="bg-gradient-to-r from-brand-blue to-brand-gold dark:from-brand-light dark:to-brand-gold bg-clip-text text-transparent">
              Tradición Viva
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base lg:text-lg font-normal leading-relaxed mb-6">
            Te damos la bienvenida al Municipio Díaz, el corazón artesanal de la Isla de Margarita. Un santuario de
            palmeras datileras, tejedores sabios y sabores criollos que trascienden generaciones.
          </p>
          <div className="flex gap-3 flex-row flex-wrap">
            <Link
              to="/directorio"
              className="px-5 py-3 rounded-2xl bg-brand-blue hover:bg-brand-light text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-blue/30 hover:scale-[1.02] active:scale-[0.98] transition"
            >
              Explorar Artesanos
            </Link>
            <Link
              to="/mapa"
              className="px-5 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white border border-stone-200 dark:border-white/20 font-bold text-xs sm:text-sm hover:scale-[1.02] active:scale-[0.98] transition"
            >
              Ver Mapa Interactivo
            </Link>
          </div>
        </div>

        {/* Móvil: carrusel horizontal */}
        <div className="relative z-10 w-full md:hidden">
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1 no-scrollbar">
            {heroCollage.map((item, i) => (
              <div
                key={item.image}
                className="snap-center shrink-0 w-[85%] max-w-[300px] aspect-[16/10] first:ml-0"
              >
                {renderHeroCard(item, heroLabels[i], "h-full w-full")}
              </div>
            ))}
          </div>
        </div>

        {/* Escritorio: collage superpuesto */}
        <div className="relative z-10 shrink-0 w-full lg:w-[520px] h-[320px] sm:h-[360px] lg:h-[420px] hidden md:flex items-center justify-center">
          {renderHeroCard(sanJuan, "San Juan", "absolute w-[180px] h-[140px] -rotate-12 -translate-x-16 -translate-y-8")}
          {renderHeroCard(sombrero, "Sombreros", "absolute w-[180px] h-[140px] rotate-6 translate-x-16 translate-y-12")}
          {renderHeroCard(fuentidueno, "Fuentidueño", "absolute w-[190px] h-[150px] -rotate-3 -translate-y-2 border-2 border-white dark:border-white")}
        </div>
      </header>

      <section className="mb-12">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-10">
          <span className="text-[10px] uppercase tracking-widest text-brand-gold font-bold px-3 py-1 bg-brand-gold/10 rounded-full mb-3">
            Riqueza Ecoturística y Artesanal
          </span>
          <h2 className="text-3xl font-display font-extrabold text-slate-800 dark:text-white tracking-tight mb-3">
            Tesoros y Saberes de Díaz
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Municipio bendecido por la naturaleza y la creatividad de su gente. Conoce los pilares que dan identidad y
            orgullo a nuestro territorio.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CULTURAL_HIGHLIGHTS.filter((h) =>
            ["/images/Sombrero_de_cogollo.JPG", "/images/Piñonate.jpg", "/images/Pozas_de_San_Juan_Bautísta.jpg", "/images/Fuentidueño.jpg"].includes(h.image)
          ).map((item) => (
            <button
              key={item.image}
              type="button"
              onClick={() => openModal(item)}
              className="group relative rounded-3xl overflow-hidden glass-panel h-80 flex flex-col justify-end p-5 shadow-lg border border-slate-100 dark:border-white/5 hover:-translate-y-1.5 transition-all duration-300 text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
              aria-label={`Ver información de ${item.title}`}
            >
              <div className="absolute inset-0">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
              </div>
              <div className="relative z-10">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-brand-gold bg-brand-gold/10 backdrop-blur-md px-2 py-0.5 rounded-md mb-2 inline-block">
                  {item.category}
                </span>
                <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">{item.description}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {events && events.length > 0 && (
        <section className="mb-12">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-10">
            <span className="text-[10px] uppercase tracking-widest text-brand-blue dark:text-brand-light font-bold px-3 py-1 bg-brand-blue/10 dark:bg-brand-light/10 rounded-full mb-3">
              Agenda Municipal en Vivo
            </span>
            <h2 className="text-3xl font-display font-extrabold text-slate-800 dark:text-white tracking-tight mb-3">
              Próximas Ferias y Eventos Especiales
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              ¡No te pierdas de nada! Vive de cerca la cultura, exposiciones artísticas y ferias de emprendedores
              organizadas en nuestro municipio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((ev: { id: number; titulo: string; descripcion: string; url_imagen?: string; fecha_inicio: string; fecha_fin: string; latitud: number; longitud: number; coordsValidas?: boolean }) => {
              const eventImage = ev.url_imagen || "/images/SanJuan.jpg";
              const startDate = new Date(ev.fecha_inicio).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "short",
              });
              const endDate = new Date(ev.fecha_fin).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              const dateMeta = `📅 ${startDate} - ${endDate} · 📍 Municipio Díaz`;

              return (
                <div
                  key={`ev-${ev.id}`}
                  className="glass-panel rounded-3xl overflow-hidden shadow-lg border border-slate-100 dark:border-white/5 flex flex-col hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
                >
                  <button
                    type="button"
                    onClick={() =>
                      openModal({
                        title: ev.titulo,
                        image: eventImage,
                        description: ev.descripcion,
                        category: "Feria / Evento",
                        meta: dateMeta,
                      })
                    }
                    className="group relative h-48 w-full overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-inset"
                    aria-label={`Ver detalles de ${ev.titulo}`}
                  >
                    <img
                      src={eventImage}
                      alt={ev.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-brand-gold text-slate-900 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                        Feria / Evento
                      </span>
                    </div>
                    <span className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-1.5 rounded-full text-white">
                      <ZoomIn size={16} />
                    </span>
                  </button>

                  <div className="p-6 flex-grow flex flex-col">
                    <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wide">
                      {dateMeta}
                    </div>
                    <h3 className="font-display font-bold text-xl text-slate-800 dark:text-white mb-2 leading-snug">
                      {ev.titulo}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-5 flex-grow">
                      {ev.descripcion}
                    </p>

                    <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-end items-center text-xs">
                      {ev.coordsValidas ? (
                        <Link to="/mapa" state={{ center: [ev.latitud, ev.longitud] }} className="municipal-cta shrink-0">
                          Ver en el Mapa
                          <span>&rarr;</span>
                        </Link>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 text-[11px] font-semibold">
                          Ubicación pendiente en mapa
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {modalItem && <ContentModal item={modalItem} onClose={closeModal} />}
    </div>
  );
};

export default HomeView;
