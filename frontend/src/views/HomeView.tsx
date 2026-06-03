import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { WifiOff, ZoomIn } from "lucide-react";
import ContentModal, { type ContentModalItem } from "../components/ui/ContentModal";
import RevealOnScroll from "../components/ui/RevealOnScroll";

const HERO_BG_IMAGE = "/images/San_Juan_Valley.jpg";

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

const STAGGER_CLASS = ["", "anim-delay-150", "anim-delay-300"] as const;

const heroCardClass =
  "group img-anim card-anim absolute inset-0 text-left rounded-2xl overflow-hidden border border-stone-200/80 dark:border-white/10 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900";

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
 /* const heroCollage = [sanJuan, sombrero, fuentidueno];*/
  /*const heroLabels = ["San Juan", "Sombreros", "Fuentidueño"];*/

  const tesorosItems = CULTURAL_HIGHLIGHTS.filter((h) =>
    ["/images/Sombrero_de_cogollo.JPG", "/images/Piñonate.jpg", "/images/Pozas_de_San_Juan_Bautísta.jpg", "/images/Fuentidueño.jpg"].includes(h.image)
  );

  const renderHeroCard = (item: ContentModalItem, label: string) => (
    <button
      type="button"
      onClick={() => openModal(item)}
      className={heroCardClass}
      aria-label={`Ver más sobre ${item.title}`}
    >
      <img
        src={item.image}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent group-hover:via-slate-900/10 transition-colors duration-300" />
      <div className="absolute bottom-0 inset-x-0 p-3 flex items-end justify-between gap-2">
        <span className="text-[11px] font-bold text-white drop-shadow-sm">{label}</span>
        <span className="shrink-0 bg-white/20 backdrop-blur-md p-1.5 rounded-full text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
          <ZoomIn size={14} />
        </span>
      </div>
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

      <header className="relative rounded-[32px] overflow-hidden mb-6 p-4 sm:p-8 lg:p-12 border border-stone-200/80 dark:border-white/10 shadow-2xl text-left flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
        <div
          className="absolute inset-0 bg-cover bg-center animate-hero-bg hero-bg-visible pointer-events-none"
          style={{ backgroundImage: `url('${HERO_BG_IMAGE}')` }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/40 to-transparent dark:from-slate-900/60 dark:via-slate-900/40 dark:to-transparent pointer-events-none"
          aria-hidden
        />
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-brand-blue/10 dark:bg-brand-blue/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-brand-gold/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex-grow max-w-2xl w-full">
          <span className="text-[10px] uppercase tracking-widest text-brand-gold font-extrabold px-3 py-1.5 bg-brand-gold/15 border border-brand-gold/30 rounded-full mb-5 inline-block animate-fade-in-up">
            Guía Cultural Oficial del Municipio Díaz
          </span>
          <h1 className="hero-title text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-slate-800 dark:text-white tracking-tight mb-5 leading-[1.1] animate-fade-in-up anim-delay-100 drop-shadow-sm dark:drop-shadow-none">
            Guardianes de la{" "}
            <span className="gradient-text title-bg">
              Tradición Viva
            </span>
          </h1>
          <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base lg:text-lg font-normal leading-relaxed mb-6 animate-fade-in-up anim-delay-200">
            Te damos la bienvenida al Municipio Díaz, el corazón artesanal de la Isla de Margarita. Un santuario de
            palmeras datileras, tejedores sabios y sabores criollos que trascienden generaciones.
          </p>
          <div className="flex gap-3 flex-row flex-wrap animate-fade-in-up anim-delay-300">
            <Link
              to="/directorio"
              className="btn-interactive px-5 py-3 rounded-2xl bg-brand-blue hover:bg-brand-light text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-blue/30"
            >
              Explorar Artesanos
            </Link>
            <Link
              to="/mapa"
              className="btn-interactive px-5 py-3 rounded-2xl bg-white/90 hover:bg-white dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white border border-stone-200/80 dark:border-white/20 font-bold text-xs sm:text-sm shadow-sm"
            >
              Ver Mapa Interactivo
            </Link>
          </div>
        </div>

        <div className="relative z-10 w-full md:hidden carousel-scroll-fade">
          {/*<div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1 no-scrollbar">
            {heroCollage.map((item, i) => (
              <div
                key={item.image}
                className={`snap-center shrink-0 w-[78%] max-w-[280px] aspect-[4/3] relative animate-scale-in ${STAGGER_CLASS[i] ?? "anim-delay-450"}`}
              >
                {renderHeroCard(item, heroLabels[i])}
              </div>
            ))}
          </div>*/}
        </div>

        {/*<div className="relative z-10 hidden md:block w-full lg:w-[min(100%,28rem)] shrink-0">
          <div className="grid grid-cols-2 grid-rows-2 gap-3 h-[280px] lg:h-[320px]">
            <div className={`row-span-2 min-h-0 relative animate-scale-in ${STAGGER_CLASS[0]}`}>
              {renderHeroCard(sanJuan, "San Juan")}
            </div>
            <div className={`min-h-0 relative animate-scale-in ${STAGGER_CLASS[1]}`}>
              {renderHeroCard(sombrero, "Sombreros")}
            </div>
            <div className={`min-h-0 relative animate-scale-in ${STAGGER_CLASS[2]}`}>
              {renderHeroCard(fuentidueno, "Fuentidueño")}
            </div>
          </div>
        </div>*/}
      </header>

      <section className="mb-12">
        <RevealOnScroll className="flex flex-col items-center text-center max-w-2xl mx-auto mb-10">
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
        </RevealOnScroll>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tesorosItems.map((item, index) => (
            <RevealOnScroll key={item.image} stagger={((index % 4) + 1) as 1 | 2 | 3 | 4}>
              <button
                type="button"
                onClick={() => openModal(item)}
                className="group img-anim card-anim relative rounded-3xl overflow-hidden glass-panel h-80 flex flex-col justify-end p-5 shadow-lg border border-slate-100 dark:border-white/5 hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                aria-label={`Ver información de ${item.title}`}
              >
                <div className="absolute inset-0 overflow-hidden">
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
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {events && events.length > 0 && (
        <section className="mb-12">
          <RevealOnScroll className="flex flex-col items-center text-center max-w-2xl mx-auto mb-10">
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
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((ev: { id: number; titulo: string; descripcion: string; url_imagen?: string; fecha_inicio: string; fecha_fin: string; latitud: number; longitud: number; coordsValidas?: boolean }, index: number) => {
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
                <RevealOnScroll key={`ev-${ev.id}`} stagger={((index % 4) + 1) as 1 | 2 | 3 | 4}>
                  <div className="glass-panel rounded-3xl overflow-hidden shadow-lg border border-slate-100 dark:border-white/5 flex flex-col hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 h-full">
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
                      <span className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 bg-black/50 p-1.5 rounded-full text-white">
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
                </RevealOnScroll>
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
