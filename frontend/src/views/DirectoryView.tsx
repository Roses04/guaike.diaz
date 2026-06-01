import { useEffect, useState } from "react";
import CardArtesano from "../components/CardArtesano";
import api from "../services/api";
import { Search, Tag, MapPin, RefreshCw, WifiOff } from "lucide-react";

const DirectoryView = () => {
  const [operators, setOperators] = useState([]);
  const [categories, setCategories] = useState([]);
  const [parroquias, setParroquias] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("");
  const [selectedParr, setSelectedParr] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const staticRes = await api.get("/operators/static-data");
      setCategories(staticRes.data.categorias);
      setParroquias(staticRes.data.parroquias);

      const params: any = {};
      if (selectedCat) params.categoria_id = selectedCat;
      if (selectedParr) params.parroquia_id = selectedParr;
      if (searchQuery) params.q = searchQuery;

      const opsRes = await api.get("/operators", { params });
      setOperators(opsRes.data);

      localStorage.setItem("cache_operadores", JSON.stringify(opsRes.data));
      localStorage.setItem("cache_categorias", JSON.stringify(staticRes.data.categorias));
      localStorage.setItem("cache_parroquias", JSON.stringify(staticRes.data.parroquias));
    } catch (err) {
      console.error(err);
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
  }, [selectedCat, selectedParr]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="text-center max-w-xl mx-auto mb-6">
        <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-800 dark:text-white tracking-tight mb-2">
          Directorio de Talleres y Creadores
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Usa los filtros para buscar por especialidad artesanal, parroquia o nombre del artesano.
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-6 mb-8 shadow-xl">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="md:col-span-2 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Buscar taller, artesano o especialidad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 dark:focus:ring-brand-light/30 focus:border-brand-blue/60 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
              <Tag size={16} />
            </span>
            <select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)} className="w-full pl-9 pr-4 py-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-sm focus:outline-none">
              <option value="">Todas las Categorías</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
              <MapPin size={16} />
            </span>
            <select value={selectedParr} onChange={(e) => setSelectedParr(e.target.value)} className="w-full pl-9 pr-4 py-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-sm focus:outline-none">
              <option value="">Todas las Parroquias</option>
              {parroquias.map((p: any) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3].map(i => (
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
          <p className="text-slate-500 dark:text-slate-400 text-sm">Prueba ajustando los criterios del filtro de búsqueda o recarga la página.</p>
          <button onClick={loadData} className="mt-5 bg-brand-blue dark:bg-brand-light text-white px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-1.5 hover:shadow-lg transition cursor-pointer">
            <RefreshCw size={14} /> Recargar
          </button>
        </div>
      )}
    </div>
  );
};

export default DirectoryView;
