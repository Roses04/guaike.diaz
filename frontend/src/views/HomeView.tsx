import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import CardArtesano from "../components/CardArtesano";
import { Search, MapPin, Tag, RefreshCw, WifiOff } from "lucide-react";

const HomeView = () => {
  const [operators, setOperators] = useState([]);
  const [categories, setCategories] = useState([]);
  const [parroquias, setParroquias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("");
  const [selectedParr, setSelectedParr] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch static data (categories, parroquias)
      const staticRes = await api.get("/operators/static-data");
      setCategories(staticRes.data.categorias);
      setParroquias(staticRes.data.parroquias);

      // Save static data to cache
      localStorage.setItem("cache_categorias", JSON.stringify(staticRes.data.categorias));
      localStorage.setItem("cache_parroquias", JSON.stringify(staticRes.data.parroquias));

      // 2. Fetch operators with active filters
      const params: any = {};
      if (selectedCat) params.categoria_id = selectedCat;
      if (selectedParr) params.parroquia_id = selectedParr;
      if (searchQuery) params.q = searchQuery;

      const opsRes = await api.get("/operators", { params });
      setOperators(opsRes.data);

      // Cache verified operators list
      localStorage.setItem("cache_operadores", JSON.stringify(opsRes.data));
      setIsOffline(false);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setIsOffline(true);
      
      // Load from cache if offline
      const cachedOps = localStorage.getItem("cache_operadores");
      const cachedCats = localStorage.getItem("cache_categorias");
      const cachedParrs = localStorage.getItem("cache_parroquias");

      if (cachedOps) setOperators(JSON.parse(cachedOps));
      if (cachedCats) setCategories(JSON.parse(cachedCats));
      if (cachedParrs) setParroquias(JSON.parse(cachedParrs));
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
  }, [selectedCat, selectedParr]); // Reload when filters change

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
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
      <header className="relative rounded-[32px] overflow-hidden mb-16 p-6 sm:p-10 lg:p-14 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-brand-dark/95 border border-white/10 shadow-2xl text-left flex flex-col lg:flex-row items-center gap-10">
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
          <div className="flex flex-wrap gap-3">
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
        <div className="relative z-10 shrink-0 w-full lg:w-[380px] h-[260px] sm:h-[300px] lg:h-[320px] flex items-center justify-center">
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
      <section className="mb-20">
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
          <div className="group relative rounded-3xl overflow-hidden glass-panel h-80 flex flex-col justify-end p-5 shadow-lg border border-slate-100 dark:border-white/5 hover:-translate-y-1.5 transition-all duration-300">
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
          <div className="group relative rounded-3xl overflow-hidden glass-panel h-80 flex flex-col justify-end p-5 shadow-lg border border-slate-100 dark:border-white/5 hover:-translate-y-1.5 transition-all duration-300">
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
          <div className="group relative rounded-3xl overflow-hidden glass-panel h-80 flex flex-col justify-end p-5 shadow-lg border border-slate-100 dark:border-white/5 hover:-translate-y-1.5 transition-all duration-300">
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
          <div className="group relative rounded-3xl overflow-hidden glass-panel h-80 flex flex-col justify-end p-5 shadow-lg border border-slate-100 dark:border-white/5 hover:-translate-y-1.5 transition-all duration-300">
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

      {/* Interactive Filters Panel */}
      <div id="director-artesanal" className="scroll-mt-24 mb-6 text-center max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-800 dark:text-white tracking-tight mb-2">
          Directorio de Talleres y Creadores
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Usa los filtros a continuación para buscar por especialidad artesanal, parroquia o nombre del artesano.
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-6 mb-12 shadow-xl">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Search bar */}
          <div className="md:col-span-2 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
              <Search size={18} />
            </span>
            <input 
              id="global-search"
              type="text" 
              placeholder="Buscar taller, artesano o especialidad..."
              aria-label="Buscar talleres o artesanos"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 dark:focus:ring-brand-light/30 focus:border-brand-blue/60 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          {/* Categoría Filter */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
              <Tag size={16} />
            </span>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="w-full pl-9 pr-4 py-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 dark:focus:ring-brand-light/30 focus:border-brand-blue/60 text-slate-800 dark:text-slate-100 cursor-pointer appearance-none"
            >
              <option value="">Todas las Categorías</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          {/* Parroquia Filter */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
              <MapPin size={16} />
            </span>
            <select
              value={selectedParr}
              onChange={(e) => setSelectedParr(e.target.value)}
              className="w-full pl-9 pr-4 py-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 dark:focus:ring-brand-light/30 focus:border-brand-blue/60 text-slate-800 dark:text-slate-100 cursor-pointer appearance-none"
            >
              <option value="">Todas las Parroquias</option>
              {parroquias.map((p: any) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
        </form>
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
    </div>
  );
};

export default HomeView;
