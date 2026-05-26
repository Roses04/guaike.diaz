import { useEffect, useState } from "react";
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

      {/* Hero Section */}
      <header className="mb-12 text-center max-w-3xl mx-auto py-6">
        <span className="text-xs uppercase tracking-widest font-extrabold text-brand-gold dark:text-brand-gold bg-brand-gold/10 px-3.5 py-1.5 rounded-full mb-4 inline-block">
          Patrimonio Cultural Verificado
        </span>
        <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight mb-4 bg-gradient-to-r from-brand-blue via-brand-light to-brand-gold bg-clip-text text-transparent dark:from-white dark:via-slate-200 dark:to-brand-gold">
          Directorio Artesanal
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg sm:text-xl font-normal leading-relaxed">
          Explora los talleres de los maestros artesanos del Municipio Díaz. Tradición viva, saberes ancestrales y calidez humana de Nueva Esparta.
        </p>
      </header>

      {/* Interactive Filters Panel */}
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
