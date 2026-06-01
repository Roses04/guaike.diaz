import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import CardArtesano from "../components/CardArtesano";
import { RefreshCw, WifiOff } from "lucide-react";

const HomeView = () => {
  const [operators, setOperators] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Modal for viewing images/descriptions
  const [modalItem, setModalItem] = useState<any | null>(null);


  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch operators and events
      const opsRes = await api.get("/operators");
      setOperators(opsRes.data || []);

      const eventsRes = await api.get("/events");
      setEvents(eventsRes.data || []);

      // Cache verified data list
      localStorage.setItem("cache_operadores", JSON.stringify(opsRes.data || []));
      localStorage.setItem("cache_eventos", JSON.stringify(eventsRes.data || []));
      setIsOffline(false);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setIsOffline(true);
      
      // Load from cache if offline
      const cachedOps = localStorage.getItem("cache_operadores");
      const cachedEvents = localStorage.getItem("cache_eventos");

      if (cachedOps) setOperators(JSON.parse(cachedOps));
      if (cachedEvents) setEvents(JSON.parse(cachedEvents));
    } finally {
      setLoading(false);
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
  }, []); // initial load

  const openModal = (item: any) => {
    setModalItem(item);
    try { document.body.style.overflow = 'hidden'; } catch {}
  };

  const closeModal = () => {
    setModalItem(null);
    try { document.body.style.overflow = ''; } catch {}
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Offline Alert Indicator */}
      {isOffline && (
        <div className="mb-6 bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-amber-600 dark:text-amber-400 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
          <WifiOff size={20} />
          <div className="text-sm font-semibold">
            Modo Sin Conexión activo. Estás visualizando la información guardada localmente.
          </div>
        </div>
      )}

      {/* Hero Section Redesigned */}
      <header className="relative rounded-[32px] overflow-hidden mb-8 p-6 sm:p-10 lg:p-14 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-brand-dark/95 border border-white/10 shadow-2xl text-left flex flex-col lg:flex-row items-center gap-8">
        {/* Glow ambient effects */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-brand-blue/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-brand-gold/10 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Content column */}
        <div className="relative z-10 flex-grow max-w-2xl">
          <span className="text-[10px] uppercase tracking-widest text-brand-gold font-extrabold px-3 py-1.5 bg-brand-gold/15 border border-brand-gold/30 rounded-full mb-5 inline-block">
            Guía y Directorio Cultural Oficial
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-white tracking-tight mb-5 leading-[1.1]">
            Guardianes de la <span className="bg-gradient-to-r from-brand-light to-brand-gold bg-clip-text text-transparent">Tradición Viva</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base lg:text-lg font-normal leading-relaxed mb-6">
            Te damos la bienvenida al Municipio Díaz, el corazón artesanal de la Isla de Margarita. Un santuario de palmeras datileras, tejedores sabios y sabores criollos que trascienden generaciones.
          </p>
          <div className="flex gap-3 flex-wrap lg:flex-nowrap">
            <a 
              href="#director-artesanal"
              className="px-5 py-3 rounded-2xl bg-brand-blue hover:bg-brand-light text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-blue/30 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
            >
              Explorar Artesanos
            </a>
            <Link 
              to="/mapa"
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-xs sm:text-sm hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
            >
              Ver Mapa Interactivo
            </Link>
          </div>
        </div>

        {/* Floating Collage Column */}
        <div className="relative z-10 shrink-0 w-full lg:w-[520px] h-[320px] sm:h-[360px] lg:h-[420px] flex items-center justify-center">
          {/* Back Card: San Juan */}
          <div className="absolute w-[180px] h-[140px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl -rotate-12 -translate-x-16 -translate-y-8 hover:rotate-0 hover:z-20 hover:scale-105 transition-all duration-300 cursor-pointer">
            <img src="/images/SanJuan.jpg" alt="San Juan" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-slate-900/30" />
            <div className="absolute bottom-2 left-2 text-[9px] font-bold text-white bg-slate-950/70 px-2 py-0.5 rounded backdrop-blur-sm">San Juan</div>
          </div>
          
          {/* Middle Card: Sombrero */}
          <div className="absolute w-[180px] h-[140px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl rotate-6 translate-x-16 translate-y-12 hover:rotate-0 hover:z-20 hover:scale-105 transition-all duration-300 cursor-pointer">
            <img src="/images/Sombrero_de_cogollo.JPG" alt="Cogollo" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-slate-900/30" />
            <div className="absolute bottom-2 left-2 text-[9px] font-bold text-white bg-slate-950/70 px-2 py-0.5 rounded backdrop-blur-sm">Sombreros</div>
          </div>

          {/* Front Card: Fuentidueño */}
          <div className="absolute w-[190px] h-[150px] rounded-2xl overflow-hidden border-2 border-white shadow-2xl -rotate-3 -translate-y-2 hover:rotate-0 hover:z-20 hover:scale-105 transition-all duration-300 cursor-pointer">
            <img src="/images/Fuentidueño.jpg" alt="Fuentidueño" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-slate-900/20" />
            <div className="absolute bottom-2.5 left-2.5 text-[9px] font-bold text-white bg-slate-950/70 px-2 py-0.5 rounded backdrop-blur-sm">Fuentidueño</div>
          </div>
        </div>
      </header>

      {/* Sección Especial: Tesoros de Díaz */}
      <section className="mb-12">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-10">
          <span className="text-[10px] uppercase tracking-widest text-brand-gold font-bold px-3 py-1 bg-brand-gold/10 rounded-full mb-3">
            Riqueza Ecoturística y Artesanal
          </span>
          <h2 className="text-3xl font-display font-extrabold text-slate-800 dark:text-white tracking-tight mb-3">
            Tesoros y Saberes de Díaz
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Municipio bendecido por la naturaleza y la creatividad de su gente. Conoce los pilares que dan identidad y orgullo a nuestro territorio.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Sombrero */}
          <div onClick={() => openModal({title: 'Tejido de Cogollo', image: '/images/Sombrero_de_cogollo.JPG', description: 'El tejido de sombreros con cogollo de dátil es símbolo de la laboriosidad y de la identidad ancestral de San Juan.'})} role="button" tabIndex={0} className="group relative rounded-3xl overflow-hidden glass-panel h-80 flex flex-col justify-end p-5 shadow-lg border border-slate-100 dark:border-white/5 hover:-translate-y-1.5 transition-all duration-300">
            <div className="absolute inset-0">
              <img src="/images/Sombrero_de_cogollo.JPG" alt="Sombrero de Cogollo" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
            </div>
            <div className="relative z-10">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-brand-gold bg-brand-gold/10 backdrop-blur-md px-2 py-0.5 rounded-md mb-2 inline-block">Artesanía</span>
              <h3 className="text-lg font-bold text-white mb-1">Tejido de Cogollo</h3>
              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                El tejido de sombreros con cogollo de dátil es símbolo de la laboriosidad y de la identidad ancestral de San Juan.
              </p>
            </div>
          </div>

          {/* Card 2: Piñonate */}
          <div onClick={() => openModal({title: 'Dulce de Piñonate', image: '/images/Piñonate.jpg', description: 'Manjar tradicional elaborado artesanalmente a base de papaya, naranja silvestre y amor, envuelto en hojas secas de plátano.'})} role="button" tabIndex={0} className="group relative rounded-3xl overflow-hidden glass-panel h-80 flex flex-col justify-end p-5 shadow-lg border border-slate-100 dark:border-white/5 hover:-translate-y-1.5 transition-all duration-300">
            <div className="absolute inset-0">
              <img src="/images/Piñonate.jpg" alt="Dulce Piñonate" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
            </div>
            <div className="relative z-10">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-brand-gold bg-brand-gold/10 backdrop-blur-md px-2 py-0.5 rounded-md mb-2 inline-block">Gastronomía</span>
              <h3 className="text-lg font-bold text-white mb-1">Dulce de Piñonate</h3>
              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                Manjar tradicional elaborado artesanalmente a base de papaya, naranja silvestre y amor, envuelto en hojas secas de plátano.
              </p>
            </div>
          </div>

          {/* Card 3: Pozas */}
          <div onClick={() => openModal({title: 'Pozas de San Juan', image: '/images/Pozas_de_San_Juan_Bautísta.jpg', description: 'Piscinas naturales talladas en piedra en las faldas de la montaña, un refrescante paraíso rodeado de vegetación tropical.'})} role="button" tabIndex={0} className="group relative rounded-3xl overflow-hidden glass-panel h-80 flex flex-col justify-end p-5 shadow-lg border border-slate-100 dark:border-white/5 hover:-translate-y-1.5 transition-all duration-300">
            <div className="absolute inset-0">
              <img src="/images/Pozas_de_San_Juan_Bautísta.jpg" alt="Pozas de San Juan" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
            </div>
            <div className="relative z-10">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-brand-gold bg-brand-gold/10 backdrop-blur-md px-2 py-0.5 rounded-md mb-2 inline-block">Ecoturismo</span>
              <h3 className="text-lg font-bold text-white mb-1">Pozas de San Juan</h3>
              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                Piscinas naturales talladas en piedra en las faldas de la montaña, un refrescante paraíso rodeado de vegetación tropical.
              </p>
            </div>
          </div>

          {/* Card 4: Fuentidueño */}
          <div onClick={() => openModal({title: 'Valle de Fuentidueño', image: '/images/Fuentidueño.jpg', description: 'Edén de palmeras datileras, manantiales naturales y paz inigualable, cuna de tejedores y agricultores tradicionales.'})} role="button" tabIndex={0} className="group relative rounded-3xl overflow-hidden glass-panel h-80 flex flex-col justify-end p-5 shadow-lg border border-slate-100 dark:border-white/5 hover:-translate-y-1.5 transition-all duration-300">
            <div className="absolute inset-0">
              <img src="/images/Fuentidueño.jpg" alt="Fuentidueño Valle" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
            </div>
            <div className="relative z-10">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-brand-gold bg-brand-gold/10 backdrop-blur-md px-2 py-0.5 rounded-md mb-2 inline-block">Naturaleza</span>
              <h3 className="text-lg font-bold text-white mb-1">Valle de Fuentidueño</h3>
              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                Edén de palmeras datileras, manantiales naturales y paz inigualable, cuna de tejedores y agricultores tradicionales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Agenda Cultural: Ferias y Eventos */}
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
              ¡No te pierdas de nada! Vive de cerca la cultura, exposiciones artísticas y ferias de emprendedores organizadas en nuestro municipio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((ev: any) => {
              const eventImage = ev.url_imagen || "/images/SanJuan.jpg";
              const startDate = new Date(ev.fecha_inicio).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
              const endDate = new Date(ev.fecha_fin).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
              
              return (
                <div key={`ev-${ev.id}`} className="glass-panel rounded-3xl overflow-hidden shadow-lg border border-slate-100 dark:border-white/5 flex flex-col hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
                  <div onClick={() => openModal({title: ev.titulo, image: eventImage, description: ev.descripcion})} role="button" tabIndex={0} className="relative h-48 w-full overflow-hidden">
                    <img 
                      src={eventImage} 
                      alt={ev.titulo} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-brand-gold text-slate-900 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                        Feria / Evento
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 flex-grow flex flex-col">
                    <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wide">
                      📅 {startDate} - {endDate}
                    </div>
                    <h3 className="font-display font-bold text-xl text-slate-800 dark:text-white mb-2 leading-snug">
                      {ev.titulo}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-5 flex-grow">
                      {ev.descripcion}
                    </p>
                    
                    <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        📍 Municipio Díaz
                      </span>
                      <Link 
                        to="/mapa" 
                        state={{ center: [ev.latitud, ev.longitud] }}
                        className="municipal-cta shrink-0"
                      >
                        Ver en el Mapa
                        <span>&rarr;</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Interactive Filters Panel */}
      <div id="director-artesanal" className="scroll-mt-24 mb-6 text-center max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-800 dark:text-white tracking-tight mb-2">
          Directorio de Talleres y Creadores
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Accede al módulo independiente para buscar por especialidad, parroquia o nombre del artesano.
        </p>
        <div className="mt-6">
          <Link to="/directorio" className="municipal-cta px-6 py-3">Abrir Directorio</Link>
        </div>
      </div>

      {/* Artisans Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-panel rounded-3xl h-96 animate-pulse flex flex-col">
              <div className="bg-gray-200/50 dark:bg-slate-800/50 h-52 rounded-t-3xl"></div>
              <div className="p-5 flex-grow space-y-3">
                <div className="h-6 bg-gray-200/50 dark:bg-slate-800/50 rounded-lg w-3/4"></div>
                <div className="h-4 bg-gray-200/50 dark:bg-slate-800/50 rounded-lg w-1/2"></div>
                <div className="h-12 bg-gray-200/50 dark:bg-slate-800/50 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      ) : operators.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {operators.map((op: any) => (
            <CardArtesano key={op.id} operator={op} />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-16 text-center shadow-lg border border-dashed border-gray-200 dark:border-white/5 max-w-md mx-auto">
          <WifiOff size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <h3 className="font-display font-bold text-lg mb-1">No se encontraron talleres</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Prueba ajustando los criterios del filtro de búsqueda o recarga la página.
          </p>
          <button 
            onClick={loadData}
            className="mt-5 bg-brand-blue dark:bg-brand-light text-white px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-1.5 hover:shadow-lg transition cursor-pointer"
          >
            <RefreshCw size={14} /> Recargar Directorio
          </button>
        </div>
      )}

      {modalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden max-w-4xl w-full shadow-2xl">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 h-80 md:h-auto">
                <img src={modalItem.image} alt={modalItem.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-6 md:w-1/2">
                <h3 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">{modalItem.title}</h3>
                <p className="text-slate-600 dark:text-slate-300">{modalItem.description}</p>
                <div className="mt-4">
                  <button onClick={closeModal} className="municipal-cta">Cerrar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HomeView;
