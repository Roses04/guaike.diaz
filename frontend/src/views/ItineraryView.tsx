import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { 
  Compass, MapPin, Navigation, Calendar, Award, CheckCircle2, 
  MessageSquare, Trash2, Sliders, Play, Footprints, Car, 
  Plus, Check, Sparkles, AlertCircle, Share2, Eye
} from "lucide-react";
import api from "../services/api";
import { useThemeStore } from "../store/useThemeStore";
import {
  MunicipioBoundsController,
  MunicipioMaskLayer,
  MunicipioBorderLayer,
  getMapTileConfig,
  MUNICIPIO_DIAZ_CENTER,
  MUNICIPIO_DEFAULT_ZOOM,
} from "../components/map/MunicipioMapLayers";
import { MUNICIPIO_MAX_BOUNDS } from "../data/municipioDiazGeo";
import { PageHeader, TabSwitcher } from "../components/ui/PageHeader";

interface Operator {
  id: number;
  nombre_taller: string;
  descripcion?: string;
  categoria_nombre: string;
  parroquia_nombre: string;
  es_verificado: boolean;
  telefono_whatsapp?: string;
  longitud: number;
  latitud: number;
  imagen_principal?: string;
  accesibilidades?: { id: number; etiqueta: string; icono: string }[];
}

interface SavedItinerary {
  id: string;
  name: string;
  createdAt: string;
  operators: Operator[];
  transportMode: "driving" | "walking";
  visitedIds: number[];
}

// Map bounds auto-fitter
const MapBoundsController = ({ points }: { points: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [points, map]);
  return null;
};

// Create custom numbered markers
const createNumberedIcon = (num: number) => {
  return L.divIcon({
    html: `<div class="w-8 h-8 rounded-full bg-brand-blue dark:bg-brand-light text-white flex items-center justify-center border-2 border-white shadow-lg font-display font-extrabold text-sm hover:scale-110 transition duration-200">${num}</div>`,
    className: "custom-numbered-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const ItineraryView = () => {
  const { isDarkMode } = useThemeStore();

  // Core operators & static data
  const [operators, setOperators] = useState<Operator[]>([]);
  const [categories, setCategories] = useState<{ id: number; nombre: string }[]>([]);
  const [parroquias, setParroquias] = useState<{ id: number; nombre: string }[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [loading, setLoading] = useState(true);

  // Tabs: "curated" | "planner" | "active" | "history"
  const [activeTab, setActiveTab] = useState<"curated" | "planner" | "active" | "history">("curated");

  // Custom Planner Form State
  const [startPointType, setStartPointType] = useState<"gps" | "parish">("parish");
  const [selectedStartParish, setSelectedStartParish] = useState("");
  const [gpsLocation, setGpsLocation] = useState<[number, number] | null>(null);
  const [loadingGps, setLoadingGps] = useState(false);
  const [selectedCats, setSelectedCats] = useState<number[]>([]);
  const [maxStops, setMaxStops] = useState<number>(3);
  const [transportMode, setTransportMode] = useState<"driving" | "walking">("driving");
  const [selectedAccs, setSelectedAccs] = useState<number[]>([]);
  const [optionsAccs, setOptionsAccs] = useState<{ id: number; etiqueta: string; icono: string }[]>([]);

  // Active Itinerary state
  const [activeItinerary, setActiveItinerary] = useState<Operator[]>([]);
  const [activeItineraryName, setActiveItineraryName] = useState("");
  const [visitedStops, setVisitedStops] = useState<number[]>([]);
  const [saveRouteName, setSaveRouteName] = useState("");
  const [routeSavedSuccess, setRouteSavedSuccess] = useState(false);

  // History State
  const [itinerariesHistory, setItinerariesHistory] = useState<SavedItinerary[]>([]);

  // Static pre-defined curated routes in Municipio Díaz
  const curatedRoutes = [
    {
      id: "palma_route",
      title: "Ruta del Tejido de Palma",
      description: "Explora la cuna de los sombreros de cogollo de dátil y artesanías tejidas en San Juan Bautista. Conoce a los maestros de la fibra vegetal.",
      parish: "San Juan Bautista",
      category: "Tejido de Palma",
      iconClass: "bg-amber-100 dark:bg-amber-950/40 text-brand-gold",
      stopsCount: 3,
      duration: "~2 horas",
      image: "/images/tejedora.jpg",
      accentColor: "from-amber-600/70"
    },
    {
      id: "dulces_route",
      title: "Ruta del Dátil y la Dulcería",
      description: "Deléitate con la cocina tradicional y los icónicos dulces hechos de dátil de Margarita en San Juan y El Espinal.",
      parish: "San Juan Bautista",
      category: "Gastronomía Tradicional",
      iconClass: "bg-emerald-100 dark:bg-emerald-950/40 text-brand-accent",
      stopsCount: 2,
      duration: "~1.5 horas",
      image: "/images/datiles.jpg",
      accentColor: "from-emerald-700/70"
    },
    {
      id: "textil_route",
      title: "Ruta del Chinchorro y Textiles",
      description: "Conoce el minucioso arte de tejer hamacas de hilo en Zabala. Una tradición de colores y paciencia infinita.",
      parish: "Zabala",
      category: "Textil (Hamacas)",
      iconClass: "bg-blue-100 dark:bg-blue-950/40 text-brand-light",
      stopsCount: 2,
      duration: "~1.5 horas",
      image: "/images/hamaca.jpg",
      accentColor: "from-blue-700/70"
    }
  ];

  const defaultCenter: [number, number] = MUNICIPIO_DIAZ_CENTER;

  // 1. Fetch operators and static configuration data
  const loadData = async () => {
    setLoading(true);
    try {
      const [opsRes, staticRes] = await Promise.all([
        api.get("/operators"),
        api.get("/operators/static-data")
      ]);

      setOperators(opsRes.data);
      setCategories(staticRes.data.categorias);
      setParroquias(staticRes.data.parroquias);
      setOptionsAccs(staticRes.data.accesibilidades);

      // Save to cache for offline compatibility
      localStorage.setItem("cache_itinerarios_operadores", JSON.stringify(opsRes.data));
      localStorage.setItem("cache_itinerarios_categorias", JSON.stringify(staticRes.data.categorias));
      localStorage.setItem("cache_itinerarios_parroquias", JSON.stringify(staticRes.data.parroquias));
      localStorage.setItem("cache_itinerarios_accesibilidades", JSON.stringify(staticRes.data.accesibilidades));
      setIsOffline(false);
    } catch (error) {
      console.error("Error al cargar datos de itinerarios:", error);
      setIsOffline(true);

      // Offline Cache Fallbacks
      const cachedOps = localStorage.getItem("cache_itinerarios_operadores");
      const cachedCats = localStorage.getItem("cache_itinerarios_categorias");
      const cachedParrs = localStorage.getItem("cache_itinerarios_parroquias");
      const cachedAccs = localStorage.getItem("cache_itinerarios_accesibilidades");

      if (cachedOps) setOperators(JSON.parse(cachedOps));
      if (cachedCats) setCategories(JSON.parse(cachedCats));
      if (cachedParrs) setParroquias(JSON.parse(cachedParrs));
      if (cachedAccs) setOptionsAccs(JSON.parse(cachedAccs));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Load active itinerary from localstorage
    const savedActive = localStorage.getItem("active_itinerary");
    const savedActiveName = localStorage.getItem("active_itinerary_name");
    const savedVisited = localStorage.getItem("active_itinerary_visited");
    const savedMode = localStorage.getItem("active_itinerary_transport");

    if (savedActive) {
      setActiveItinerary(JSON.parse(savedActive));
      if (savedActiveName) setActiveItineraryName(savedActiveName);
      if (savedVisited) setVisitedStops(JSON.parse(savedVisited));
      if (savedMode) setTransportMode(savedMode as "driving" | "walking");
      setActiveTab("active"); // default to active route if exists
    }

    // Load history
    const savedHistory = localStorage.getItem("saved_itineraries_history");
    if (savedHistory) {
      setItinerariesHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save active itinerary changes to storage
  const persistActiveItinerary = (itinerary: Operator[], name: string, visited: number[], mode: "driving" | "walking") => {
    setActiveItinerary(itinerary);
    setActiveItineraryName(name);
    setVisitedStops(visited);
    setTransportMode(mode);
    localStorage.setItem("active_itinerary", JSON.stringify(itinerary));
    localStorage.setItem("active_itinerary_name", name);
    localStorage.setItem("active_itinerary_visited", JSON.stringify(visited));
    localStorage.setItem("active_itinerary_transport", mode);
  };

  // 2. Fetch User GPS coordinates
  const handleAcquireGps = () => {
    if (!navigator.geolocation) {
      alert("La geolocalización no está soportada en tu navegador.");
      return;
    }
    setLoadingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLocation([pos.coords.latitude, pos.coords.longitude]);
        setLoadingGps(false);
      },
      (err) => {
        console.error("GPS Error:", err);
        alert("No pudimos obtener tu señal GPS. Por favor, selecciona un punto de partida basado en parroquias.");
        setLoadingGps(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // Helper: Haversine distance formula in km (Orthodromic)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1.35; // Multiply by 1.35 standard factor to simulate real street curvature
  };

  // Estimates travel time based on transport mode and distance
  const formatTravelTime = (distanceKm: number) => {
    const speed = transportMode === "driving" ? 40 : 5; // 40 km/h for car, 5 km/h walking
    const hours = distanceKm / speed;
    const minutes = Math.round(hours * 60);

    if (minutes < 1) return "Menos de 1 min";
    if (minutes < 60) return `${minutes} min`;
    
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  // 3. Nearest Neighbor Geographical TSP routing solver (Offline-First!)
  const generateOptimalRoute = (startCoords: [number, number], candidates: Operator[], limit: number) => {
    const route: Operator[] = [];
    const unvisited = [...candidates];
    let currentCoords = startCoords;

    while (route.length < limit && unvisited.length > 0) {
      let nearestIndex = -1;
      let minDistance = Infinity;

      for (let i = 0; i < unvisited.length; i++) {
        const d = calculateDistance(
          currentCoords[0],
          currentCoords[1],
          unvisited[i].latitud,
          unvisited[i].longitud
        );
        if (d < minDistance) {
          minDistance = d;
          nearestIndex = i;
        }
      }

      if (nearestIndex !== -1) {
        const nextOp = unvisited.splice(nearestIndex, 1)[0];
        route.push(nextOp);
        currentCoords = [nextOp.latitud, nextOp.longitud];
      } else {
        break;
      }
    }
    return route;
  };

  // 4. Curated recommended routes activation trigger
  const handleLaunchCuratedRoute = (title: string, parishName: string, catName: string) => {
    // Filter operators in cache matching curated requirements
    const filtered = operators.filter(op => 
      op.es_verificado &&
      op.parroquia_nombre.toLowerCase() === parishName.toLowerCase() &&
      op.categoria_nombre.toLowerCase() === catName.toLowerCase()
    );

    if (filtered.length === 0) {
      alert("No se encontraron talleres verified locales para esta ruta en el momento.");
      return;
    }

    // Set San Juan Bautista center as default coordinates
    const sanJuanCoords: [number, number] = [11.0125, -63.9622];
    const optimalRoute = generateOptimalRoute(sanJuanCoords, filtered, 5);

    persistActiveItinerary(optimalRoute, title, [], transportMode);
    setActiveTab("active");
  };

  // 5. Custom generator execution form handler
  const handleLaunchCustomRoute = (e: React.FormEvent) => {
    e.preventDefault();

    // Determine starting coordinates
    let startCoords: [number, number] = MUNICIPIO_DIAZ_CENTER;
    if (startPointType === "gps" && gpsLocation) {
      startCoords = gpsLocation;
    } else if (startPointType === "parish" && selectedStartParish) {
      // Find coordinates of selected parish or fallback
      const chosenParish = parroquias.find(p => p.id === parseInt(selectedStartParish));
      if (chosenParish?.nombre.toLowerCase().includes("zabala")) {
        startCoords = [11.0267, -63.9167]; // Zabala center
      } else {
        startCoords = [11.0125, -63.9622]; // San Juan center
      }
    }

    // Filter operators based on form selections
    const candidates = operators.filter(op => {
      if (!op.es_verificado) return false;

      // Parish filters
      if (startPointType === "parish" && selectedStartParish) {
        const parishId = parseInt(selectedStartParish);
        const parishObj = parroquias.find(p => p.id === parishId);
        if (op.parroquia_nombre.toLowerCase() !== parishObj?.nombre.toLowerCase()) {
          return false;
        }
      }

      // Categories filter
      if (selectedCats.length > 0) {
        const matchedCat = categories.find(c => op.categoria_nombre.toLowerCase() === c.nombre.toLowerCase());
        if (!matchedCat || !selectedCats.includes(matchedCat.id)) {
          return false;
        }
      }

      // Accessibility filter
      if (selectedAccs.length > 0) {
        if (!op.accesibilidades || op.accesibilidades.length === 0) return false;
        const opAccIds = op.accesibilidades.map(a => a.id);
        const matchesAll = selectedAccs.every(id => opAccIds.includes(id));
        if (!matchesAll) return false;
      }

      return true;
    });

    if (candidates.length === 0) {
      alert("No se encontraron talleres verificados que coincidan con todos tus criterios. Prueba seleccionando más categorías.");
      return;
    }

    // Process optimal Nearest Neighbor tour
    const optimalRoute = generateOptimalRoute(startCoords, candidates, maxStops);

    const generatedName = `Ruta Personalizada (${optimalRoute.length} paradas)`;
    persistActiveItinerary(optimalRoute, generatedName, [], transportMode);
    setActiveTab("active");
  };

  // 6. Checked stop handler
  const handleToggleVisited = (id: number) => {
    let nextVisited = [...visitedStops];
    if (nextVisited.includes(id)) {
      nextVisited = nextVisited.filter(v => v !== id);
    } else {
      nextVisited.push(id);
    }
    setVisitedStops(nextVisited);
    localStorage.setItem("active_itinerary_visited", JSON.stringify(nextVisited));
  };

  // 7. Save route to history (with customizable name!)
  const handleSaveToHistory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveRouteName.trim()) return;

    const newSaved: SavedItinerary = {
      id: Math.random().toString(36).substring(2, 9),
      name: saveRouteName,
      createdAt: new Date().toLocaleDateString("es-ES", { day: 'numeric', month: 'short', year: 'numeric' }),
      operators: activeItinerary,
      transportMode: transportMode,
      visitedIds: visitedStops
    };

    const nextHistory = [newSaved, ...itinerariesHistory];
    setItinerariesHistory(nextHistory);
    localStorage.setItem("saved_itineraries_history", JSON.stringify(nextHistory));
    
    // update current active name to show saved status
    setActiveItineraryName(saveRouteName);
    localStorage.setItem("active_itinerary_name", saveRouteName);

    setSaveRouteName("");
    setRouteSavedSuccess(true);
    setTimeout(() => setRouteSavedSuccess(false), 3000);
  };

  // Load a route from history
  const handleLoadFromHistory = (route: SavedItinerary) => {
    persistActiveItinerary(route.operators, route.name, route.visitedIds, route.transportMode);
    setActiveTab("active");
  };

  // Delete a route from history
  const handleDeleteFromHistory = (id: string) => {
    const nextHistory = itinerariesHistory.filter(h => h.id !== id);
    setItinerariesHistory(nextHistory);
    localStorage.setItem("saved_itineraries_history", JSON.stringify(nextHistory));
  };

  // Reset active itinerary
  const handleResetActiveItinerary = () => {
    if (window.confirm("¿Seguro que quieres borrar la ruta actual de la pantalla de guiado activo?")) {
      setActiveItinerary([]);
      setActiveItineraryName("");
      setVisitedStops([]);
      localStorage.removeItem("active_itinerary");
      localStorage.removeItem("active_itinerary_name");
      localStorage.removeItem("active_itinerary_visited");
      setActiveTab("planner");
    }
  };

  // Calculate coordinates array for polylines connecting stops
  const getPolylineCoords = (): [number, number][] => {
    return activeItinerary.map(op => [op.latitud, op.longitud]);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-brand-blue dark:border-brand-light border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold animate-pulse">Cargando talleres y rutas...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <PageHeader
        badge="Planificación Geoespacial"
        title="Rutas e Itinerarios"
        description="Diseña tu propio tour cultural en el Municipio Díaz. Elige entre recorridos temáticos curados o calcula una ruta inteligente adaptada a tus tiempos e intereses."
        actions={
          <TabSwitcher
            active={activeTab}
            onChange={setActiveTab}
            tabs={[
              { id: "curated", label: "Rutas Sugeridas", icon: Award },
              { id: "planner", label: "Planificador", icon: Sliders },
              { id: "active", label: "Ruta Activa", icon: Compass },
              { id: "history", label: "Historial", icon: Calendar },
            ]}
          />
        }
      />

      {/* Offline Banner Indicator */}
      {isOffline && (
        <div className="mb-6 bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-amber-600 dark:text-amber-400 p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle size={20} />
          <div className="text-sm font-semibold">
            Modo Sin Conexión. Estás operando con el generador local offline y datos en caché.
          </div>
        </div>
      )}

      {/* Main Tab Panels */}
      <div>
        {/* TAB 1: CURATED RECOMMENDED ROUTES */}
        {activeTab === "curated" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {curatedRoutes.map((route) => (
              <div 
                key={route.id}
                className="glass-panel rounded-3xl overflow-hidden hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 flex flex-col h-full border border-slate-200 dark:border-white/5 group"
              >
                {/* Hero image banner */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={route.image}
                    alt={route.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${route.accentColor} to-transparent`} />
                  {/* Parish badge pinned top-right */}
                  <span className="absolute top-3 right-3 text-[10px] font-extrabold uppercase bg-black/40 backdrop-blur-sm text-white px-3 py-1 rounded-full border border-white/20">
                    {route.parish}
                  </span>
                  {/* Icon pinned bottom-left */}
                  <span className={`absolute bottom-3 left-3 p-2.5 rounded-xl ${route.iconClass} bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex items-center justify-center shadow-lg`}>
                    <Compass size={18} />
                  </span>
                </div>

                <div className="p-6 flex-grow space-y-3">
                  <h3 className="font-display font-bold text-xl text-slate-800 dark:text-white leading-tight">
                    {route.title}
                  </h3>
                  
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {route.description}
                  </p>

                  <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <MapPin size={13} className="text-brand-gold" /> {route.stopsCount} paradas
                    </div>
                    <div className="flex items-center gap-1">
                      <Navigation size={13} className="text-brand-accent" /> {route.duration}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => handleLaunchCuratedRoute(route.title, route.parish, route.category)}
                    className="w-full bg-brand-blue dark:bg-brand-light hover:bg-brand-blue/90 dark:hover:bg-brand-light/90 text-white font-bold py-3.5 px-4 rounded-2xl text-sm transition duration-200 cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    <Play size={14} fill="white" /> Iniciar Recorrido
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: INTERACTIVE CUSTOM PLANNER FORM */}
        {activeTab === "planner" && (
          <div className="glass-panel rounded-3xl p-6 md:p-8 max-w-3xl mx-auto shadow-xl border border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
              <span className="p-2.5 rounded-xl bg-brand-blue/10 dark:bg-brand-light/10 text-brand-blue dark:text-brand-light">
                <Sliders size={20} />
              </span>
              <div>
                <h3 className="font-display font-bold text-xl text-slate-800 dark:text-white">Planificador de Ruta</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Crea un recorrido espacial optimizado entre talleres verificados.</p>
              </div>
            </div>

            <form onSubmit={handleLaunchCustomRoute} className="space-y-6">
              {/* Transport Mode Switcher */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Modo de Transporte</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setTransportMode("driving")}
                    className={`py-3.5 rounded-2xl text-sm font-semibold transition cursor-pointer border flex items-center justify-center gap-2 ${
                      transportMode === "driving"
                        ? "bg-brand-blue/10 dark:bg-brand-light/10 border-brand-blue/40 dark:border-brand-light/40 text-brand-blue dark:text-brand-light"
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Car size={16} /> Vehículo (Auto)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransportMode("walking")}
                    className={`py-3.5 rounded-2xl text-sm font-semibold transition cursor-pointer border flex items-center justify-center gap-2 ${
                      transportMode === "walking"
                        ? "bg-brand-blue/10 dark:bg-brand-light/10 border-brand-blue/40 dark:border-brand-light/40 text-brand-blue dark:text-brand-light"
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Footprints size={16} /> Caminata (A pie)
                  </button>
                </div>
              </div>

              {/* Start Point */}
              <div className="space-y-3">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Punto de Partida</label>
                
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="startType"
                      checked={startPointType === "parish"}
                      onChange={() => setStartPointType("parish")}
                      className="text-brand-blue focus:ring-brand-blue"
                    />
                    Elegir Parroquia
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="startType"
                      checked={startPointType === "gps"}
                      onChange={() => {
                        setStartPointType("gps");
                        if (!gpsLocation) handleAcquireGps();
                      }}
                      className="text-brand-blue focus:ring-brand-blue"
                    />
                    Mi ubicación actual (GPS)
                  </label>
                </div>

                {startPointType === "parish" ? (
                  <select
                    value={selectedStartParish}
                    onChange={(e) => setSelectedStartParish(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-slate-100 cursor-pointer"
                  >
                    <option value="">-- Selecciona Parroquia de Origen --</option>
                    {parroquias.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3.5 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-white/5 rounded-2xl">
                    <Navigation size={16} className={`text-brand-gold ${loadingGps ? "animate-spin" : ""}`} />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {loadingGps 
                        ? "Adquiriendo señal satelital..." 
                        : gpsLocation 
                          ? `Coordenadas capturadas: [${gpsLocation[0].toFixed(4)}, ${gpsLocation[1].toFixed(4)}]` 
                          : "Ubicación GPS pendiente. Otorga permisos en tu pantalla."}
                    </span>
                    {!gpsLocation && !loadingGps && (
                      <button
                        type="button"
                        onClick={handleAcquireGps}
                        className="ml-auto text-xs font-bold text-brand-blue hover:text-brand-gold transition cursor-pointer"
                      >
                        Reintentar
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Categories Checklist */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Intereses (Especialidades)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const isChecked = selectedCats.includes(cat.id);
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => {
                          setSelectedCats(prev => 
                            isChecked ? prev.filter(id => id !== cat.id) : [...prev, cat.id]
                          );
                        }}
                        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-xs font-semibold text-left transition cursor-pointer ${
                          isChecked
                            ? "bg-brand-blue/5 dark:bg-brand-light/5 border-brand-blue/40 dark:border-brand-light/40 text-brand-blue dark:text-brand-light"
                            : "bg-white dark:bg-slate-900/20 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                          isChecked 
                            ? "bg-brand-blue dark:bg-brand-light border-brand-blue dark:border-brand-light" 
                            : "border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800"
                        }`}>
                          {isChecked && <Check size={10} className="text-white font-bold" />}
                        </span>
                        {cat.nombre}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stops Count Limit */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Límite de Paradas (Tamaño)</label>
                <select
                  value={maxStops}
                  onChange={(e) => setMaxStops(parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-slate-100 cursor-pointer"
                >
                  <option value={2}>Máximo 2 talleres (Tour Express)</option>
                  <option value={3}>Máximo 3 talleres (Tour Estándar)</option>
                  <option value={5}>Máximo 5 talleres (Tour Completo)</option>
                </select>
              </div>

              {/* Accessibility options */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Requisitos de Accesibilidad (Opcional)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {optionsAccs.map((acc) => {
                    const isChecked = selectedAccs.includes(acc.id);
                    return (
                      <button
                        type="button"
                        key={acc.id}
                        onClick={() => {
                          setSelectedAccs(prev => 
                            isChecked ? prev.filter(id => id !== acc.id) : [...prev, acc.id]
                          );
                        }}
                        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-xs font-semibold text-left transition cursor-pointer ${
                          isChecked
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                            : "bg-white dark:bg-slate-900/20 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                          isChecked 
                            ? "bg-emerald-500 border-emerald-500" 
                            : "border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800"
                        }`}>
                          {isChecked && <Check size={10} className="text-white font-bold" />}
                        </span>
                        {acc.etiqueta}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-brand-blue dark:bg-brand-light hover:bg-brand-blue/90 dark:hover:bg-brand-light/90 text-white font-bold py-4 px-6 rounded-2xl text-sm transition duration-200 shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} /> Calcular Mi Ruta Óptima
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: ACTIVE GUIDED TOUR ROUTE */}
        {activeTab === "active" && (
          <div>
            {activeItinerary.length === 0 ? (
              <div className="glass-panel rounded-3xl p-16 text-center max-w-lg mx-auto shadow-md border border-slate-200/50 dark:border-white/5 space-y-4">
                <Compass size={48} className="mx-auto text-slate-300 dark:text-slate-600 animate-spin-slow" />
                <h3 className="font-display font-bold text-xl text-slate-800 dark:text-white">Sin Ruta Activa</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Aún no tienes ningún itinerario en curso. Ve a la pestaña de **Rutas Sugeridas** o abre el **Planificador** para crear una ahora mismo.
                </p>
                <button
                  onClick={() => setActiveTab("planner")}
                  className="bg-brand-blue dark:bg-brand-light hover:bg-brand-blue/90 text-white px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus size={16} /> Planificar Nueva Ruta
                </button>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-8 items-stretch">
                {/* Visual Map (Left / Top) */}
                <div className="flex-grow min-h-[280px] max-h-[min(420px,calc(100dvh-var(--mobile-chrome-top)-var(--mobile-chrome-bottom)-8rem))] lg:max-h-none lg:h-[calc(100vh-220px)] rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-white/5 relative z-0">
                  <MapContainer
                    center={defaultCenter}
                    zoom={MUNICIPIO_DEFAULT_ZOOM}
                    maxBounds={MUNICIPIO_MAX_BOUNDS}
                    maxBoundsViscosity={1}
                    minZoom={11}
                    className="h-full w-full"
                  >
                    <TileLayer {...getMapTileConfig(isDarkMode)} />
                    <MunicipioBoundsController fitOnMount={false} />
                    <MunicipioMaskLayer isDarkMode={isDarkMode} />
                    <MunicipioBorderLayer isDarkMode={isDarkMode} />
                    
                    {/* Render sequence polyline connecting stops */}
                    <Polyline 
                      positions={getPolylineCoords()} 
                      color={isDarkMode ? "#10b981" : "#0093d9"} 
                      dashArray="8, 12"
                      weight={4}
                    />

                    {/* Sequential numbered markers */}
                    {activeItinerary.map((op, idx) => (
                      <Marker 
                        key={op.id} 
                        position={[op.latitud, op.longitud]} 
                        icon={createNumberedIcon(idx + 1)}
                      >
                        <Popup>
                          <div className="p-1.5 max-w-[180px] space-y-1.5 font-sans">
                            <span className="text-[10px] font-extrabold uppercase chip-gold px-2 py-0.5 rounded-full inline-block">
                              Parada {idx + 1}
                            </span>
                            <h4 className="font-bold text-sm text-slate-800 dark:text-white leading-tight">{op.nombre_taller}</h4>
                            <p className="text-slate-500 text-xs leading-normal line-clamp-2">{op.descripcion}</p>
                            <Link 
                              to={`/operador/${op.id}`} 
                              className="text-[11px] font-bold text-brand-blue hover:text-brand-gold flex items-center gap-0.5 mt-1"
                            >
                              <Eye size={12} /> Ver Perfil
                            </Link>
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                    {/* Auto center map bounds */}
                    <MapBoundsController points={getPolylineCoords()} />
                  </MapContainer>

                  {/* Absolute active route overlay details banner */}
                  <div className="absolute bottom-4 left-4 z-10 bg-surface-95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-stone-200/90 dark:border-white/5 flex items-center gap-3">
                    <span className={`p-2 rounded-xl flex items-center justify-center ${transportMode === 'driving' ? 'bg-blue-50 text-brand-blue' : 'bg-emerald-50 text-emerald-600'}`}>
                      {transportMode === 'driving' ? <Car size={16} /> : <Footprints size={16} />}
                    </span>
                    <div>
                      <h4 className="text-[11px] font-extrabold uppercase text-slate-400 leading-none">Guía Activo ({transportMode === 'driving' ? 'Auto' : 'A pie'})</h4>
                      <p className="text-sm font-extrabold text-slate-800 dark:text-white">{activeItineraryName}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline & Checklist (Right / Bottom) */}
                <div className="w-full lg:w-96 flex flex-col space-y-6">
                  {/* Stepper Timeline Panel */}
                  <div className="glass-panel rounded-3xl p-6 shadow-lg border border-slate-200 dark:border-white/5 flex-grow">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
                      <h3 className="font-display font-extrabold text-lg text-slate-800 dark:text-white">Hoja de Ruta</h3>
                      <button
                        onClick={handleResetActiveItinerary}
                        className="text-xs font-bold text-red-500 hover:text-red-600 transition cursor-pointer flex items-center gap-1"
                        title="Borrar itinerario activo"
                      >
                        <Trash2 size={14} /> Reiniciar
                      </button>
                    </div>

                    {/* Timeline stepper */}
                    <div className="space-y-6 relative before:absolute before:top-4 before:bottom-4 before:left-5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800/80">
                      {activeItinerary.map((op, idx) => {
                        const isVisited = visitedStops.includes(op.id);
                        
                        // Calculate travel info from previous stop if applicable
                        let prevDistance = 0;
                        if (idx > 0) {
                          const prevOp = activeItinerary[idx - 1];
                          prevDistance = calculateDistance(prevOp.latitud, prevOp.longitud, op.latitud, op.longitud);
                        }

                        // Google Maps direction link
                        const prevCoords = idx > 0 ? `${activeItinerary[idx - 1].latitud},${activeItinerary[idx - 1].longitud}` : "";
                        const mapsUrl = idx > 0
                          ? `https://www.google.com/maps/dir/?api=1&origin=${prevCoords}&destination=${op.latitud},${op.longitud}&travelmode=${transportMode === "walking" ? "walking" : "driving"}`
                          : `https://www.google.com/maps/dir/?api=1&destination=${op.latitud},${op.longitud}&travelmode=${transportMode === "walking" ? "walking" : "driving"}`;

                        return (
                          <div key={op.id} className="flex gap-4 relative group">
                            {/* Number badge / checkbox indicator */}
                            <button
                              onClick={() => handleToggleVisited(op.id)}
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-extrabold text-sm border-2 shadow-md transition z-10 cursor-pointer ${
                                isVisited
                                  ? "bg-emerald-500 border-emerald-500 text-white"
                                  : "bg-surface dark:bg-slate-800 border-brand-blue/30 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-brand-blue"
                              }`}
                              title={isVisited ? "Marcar como pendiente" : "Marcar como visitado"}
                            >
                              {isVisited ? <Check size={16} className="stroke-[3]" /> : idx + 1}
                            </button>

                            {/* Details card */}
                            <div className="flex-grow space-y-2 bg-surface-40 dark:bg-slate-900/20 border border-stone-200/60 dark:border-white/5 p-4 rounded-2xl">
                              {idx > 0 && (
                                <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mb-1">
                                  {transportMode === "driving" ? <Car size={10} /> : <Footprints size={10} />}
                                  <span>Tramo: {prevDistance.toFixed(1)} km (~{formatTravelTime(prevDistance)})</span>
                                </div>
                              )}
                              
                              <div className="flex justify-between items-start gap-2">
                                <h4 className={`font-display font-extrabold text-sm leading-tight transition group-hover:text-brand-blue dark:group-hover:text-brand-light ${isVisited ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                                  <Link to={`/operador/${op.id}`}>{op.nombre_taller}</Link>
                                </h4>
                              </div>

                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{op.descripcion || "Artesano tradicional verificado."}</p>

                              <div className="flex flex-wrap gap-1.5 pt-1">
                                <span className="text-[9px] font-extrabold uppercase bg-slate-200/60 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md">
                                  {op.parroquia_nombre}
                                </span>
                                <span className="text-[9px] font-extrabold uppercase chip-gold px-2 py-0.5 rounded-md">
                                  {op.categoria_nombre}
                                </span>
                              </div>

                              {/* Stop action links */}
                              <div className="flex gap-2 pt-2 mt-1 border-t border-slate-100 dark:border-white/5">
                                <a 
                                  href={mapsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-grow text-center bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                                >
                                  <Navigation size={10} /> GPS Mapa
                                </a>
                                {op.telefono_whatsapp && (
                                  <a 
                                    href={`https://wa.me/${op.telefono_whatsapp}?text=Hola%20${encodeURIComponent(op.nombre_taller)}!%20Estoy%20siguiendo%20mi%20ruta%20por%20GUAIKE.DÍAZ%20y%20me%20gustaría%20visitar%20tu%20taller.`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-center bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 p-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                                  >
                                    <MessageSquare size={12} /> WhatsApp
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Celebration / Route completed state */}
                    {visitedStops.length === activeItinerary.length && activeItinerary.length > 0 && (
                      <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-2 animate-bounce">
                        <Sparkles className="mx-auto text-emerald-500 animate-pulse" size={24} />
                        <h4 className="font-display font-extrabold text-sm text-emerald-600 dark:text-emerald-400">¡Recorrido Completado!</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Has visitado exitosamente todos los talleres culturales de tu itinerario.</p>
                      </div>
                    )}
                  </div>

                  {/* Save Active Route Form */}
                  <div className="glass-panel rounded-3xl p-6 shadow-md border border-slate-200 dark:border-white/5 space-y-3">
                    <h3 className="font-display font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                      <Share2 size={16} className="text-brand-gold" /> Guardar Ruta en Historial
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Mantén guardado este recorrido de paradas para utilizarlo en tus próximas visitas.</p>
                    
                    <form onSubmit={handleSaveToHistory} className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Ej. Mi Paseo de Fin de Semana" 
                        value={saveRouteName}
                        onChange={(e) => setSaveRouteName(e.target.value)}
                        required
                        className="flex-grow px-3 py-2 text-xs rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 focus:outline-none text-slate-800 dark:text-slate-100"
                      />
                      <button 
                        type="submit"
                        className="bg-brand-blue dark:bg-brand-light text-white font-bold p-2 px-3 rounded-xl text-xs hover:shadow-md cursor-pointer transition flex items-center justify-center gap-1"
                      >
                        <Plus size={14} /> Guardar
                      </button>
                    </form>

                    {routeSavedSuccess && (
                      <div className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-pulse">
                        <CheckCircle2 size={12} /> ¡Itinerario agregado exitosamente a tu historial!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SAVED ITINERARIES HISTORY LIST */}
        {activeTab === "history" && (
          <div>
            {itinerariesHistory.length === 0 ? (
              <div className="glass-panel rounded-3xl p-16 text-center max-w-lg mx-auto shadow-md border border-slate-200/50 dark:border-white/5 space-y-4">
                <Calendar size={48} className="mx-auto text-slate-300 dark:text-slate-600" />
                <h3 className="font-display font-bold text-xl text-slate-800 dark:text-white">Historial Vacío</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Aún no tienes itinerarios guardados en tu historial. Después de planificar o iniciar una ruta, utiliza la caja de "Guardar" en la Ruta Activa.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {itinerariesHistory.map((route) => (
                  <div 
                    key={route.id}
                    className="glass-panel rounded-3xl p-6 shadow-md hover:shadow-lg transition duration-200 border border-slate-200 dark:border-white/5 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-extrabold uppercase chip-gold px-2.5 py-1 rounded-full">
                          {route.createdAt}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                          {route.transportMode === "driving" ? <Car size={12} /> : <Footprints size={12} />}
                          {route.transportMode === "driving" ? "Auto" : "A pie"}
                        </span>
                      </div>

                      <h3 className="font-display font-extrabold text-xl text-slate-800 dark:text-white truncate">
                        {route.name}
                      </h3>

                      <p className="text-slate-500 dark:text-slate-400 text-xs">
                        Contiene <strong className="text-slate-700 dark:text-slate-300 font-bold">{route.operators.length} paradas</strong> en total. 
                        Progreso guardado: <span className="font-bold text-emerald-600 dark:text-emerald-400">{route.visitedIds?.length || 0}/{route.operators.length} visitados</span>.
                      </p>

                      {/* Stops names preview */}
                      <div className="text-[11px] text-slate-400 space-y-0.5 pt-2 border-t border-slate-100 dark:border-white/5">
                        {route.operators.map((op, idx) => (
                          <div key={op.id} className="truncate flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 text-[9px] font-bold text-slate-600 dark:text-slate-400 flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="truncate">{op.nombre_taller}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-5 mt-4 border-t border-slate-100 dark:border-white/5">
                      <button
                        onClick={() => handleLoadFromHistory(route)}
                        className="w-full bg-brand-blue dark:bg-brand-light hover:bg-brand-blue/90 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition duration-200 cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Play size={12} fill="white" /> Iniciar Ruta
                      </button>
                      <button
                        onClick={() => handleDeleteFromHistory(route.id)}
                        className="w-full bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-500 font-bold py-2.5 px-3 rounded-xl text-xs transition duration-200 cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Trash2 size={12} /> Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryView;
