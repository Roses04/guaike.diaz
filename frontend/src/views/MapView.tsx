import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import api from "../services/api";
import L from "leaflet";
import { Link, useLocation } from "react-router-dom";
import { Navigation, Tag, ChevronUp, ChevronDown, MapPin } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";
import SEO from "../components/SEO";

import {
  MunicipioBoundsController,
  MunicipioMaskLayer,
  MunicipioBorderLayer,
  MunicipioMapLegend,
  getMapTileConfig,
  MUNICIPIO_DIAZ_CENTER,
  MUNICIPIO_DEFAULT_ZOOM,
} from "../components/map/MunicipioMapLayers";
import { MUNICIPIO_MAX_BOUNDS, clampToMunicipioBounds } from "../data/municipioDiazGeo";
import { isValidMunicipioCoord } from "../utils/geo";
import { puntosInteres } from "../data/puntosInteres";



// Custom premium marker creators
const createDivIcon = (colorClass: string, iconHtml: string) => {
  return L.divIcon({
    html: `<div class="w-9 h-9 rounded-full ${colorClass} text-white flex items-center justify-center border-2 border-white shadow-lg transform transition duration-200 hover:scale-110">${iconHtml}</div>`,
    className: "custom-div-icon",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -32],
  });
};

// Component to handle map centering programmatically
const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.panTo(center);
  }, [center, map]);
  return null;
};

const MapView = () => {
  const { isDarkMode } = useThemeStore();
  const location = useLocation();
  const [operators, setOperators] = useState([]);
  const [events, setEvents] = useState([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    location.state && (location.state as any).center
      ? (location.state as any).center
      : MUNICIPIO_DIAZ_CENTER
  );
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  // Filter states
  const [showOperators, setShowOperators] = useState(true);
  const [showEvents, setShowEvents] = useState(true);
  const [showPOIs, setShowPOIs] = useState(true);
  const [selectedPoiCategories, setSelectedPoiCategories] = useState<string[]>([
    "religion", "turismo", "comida", "educacion", "servicios"
  ]);

  const operatorsOnMap = operators.filter((op: { latitud: number; longitud: number; coordsValidas?: boolean }) =>
    op.coordsValidas ?? isValidMunicipioCoord(op.latitud, op.longitud)
  );
  const eventsOnMap = events.filter((ev: { latitud: number; longitud: number; coordsValidas?: boolean }) =>
    ev.coordsValidas ?? isValidMunicipioCoord(ev.latitud, ev.longitud)
  );
  const eventsMissingLocation = events.length > 0 && eventsOnMap.length === 0;

  useEffect(() => {
    if (location.state && (location.state as any).center) {
      setMapCenter((location.state as any).center);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [opsRes, eventsRes] = await Promise.all([
          api.get("/operators"),
          api.get("/events")
        ]);
        setOperators(opsRes.data);
        setEvents(eventsRes.data);

        // Cache for offline
        localStorage.setItem("cache_operadores_mapa", JSON.stringify(opsRes.data));
        localStorage.setItem("cache_eventos_mapa", JSON.stringify(eventsRes.data));
      } catch (error) {
        console.error("Error loading map data:", error);
        // Load from cache if offline
        const cachedOps = localStorage.getItem("cache_operadores_mapa");
        const cachedEvents = localStorage.getItem("cache_eventos_mapa");
        if (cachedOps) setOperators(JSON.parse(cachedOps));
        if (cachedEvents) setEvents(JSON.parse(cachedEvents));
      }
    };
    fetchData();
  }, []);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("La geolocalización no está soportada por tu navegador.");
      return;
    }

    setLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coords = clampToMunicipioBounds(latitude, longitude);
        setUserLocation(coords);
        setMapCenter(coords);
        if (coords[0] !== latitude || coords[1] !== longitude) {
          alert("Tu ubicación está fuera del Municipio Díaz. Se mostró el límite municipal más cercano.");
        }
        setLoadingLoc(false);
      },
      (error) => {
        console.error("Error obteniendo ubicación:", error);
        alert("No pudimos obtener tu ubicación actual.");
        setLoadingLoc(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <>
      <SEO
        title="Mapa Interactivo"
        description="Explora la ubicación de talleres artesanales, ferias culturales y eventos en el Municipio Díaz, Nueva Esparta. Mapa interactivo con geolocalización."
        canonical="/mapa"
      />
      <div className="min-h-map-mobile w-full relative flex flex-col md:flex-row bg-slate-50/30 dark:bg-slate-900/20">

        {/* Sidebar Panel */}
        <div className="w-full md:w-[320px] lg:w-95 shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-b md:border-b-0 md:border-r border-stone-200/80 dark:border-white/10 flex flex-col z-20 shadow-lg md:shadow-[4px_0_24px_rgba(0,0,0,0.05)] dark:md:shadow-[4px_0_24px_rgba(0,0,0,0.2)] md:z-20 overflow-hidden transition-all duration-300">

          {/* Header / Toggle Button */}
          <div
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="w-full p-4 md:p-8 flex items-center justify-between text-left cursor-pointer md:cursor-default bg-transparent"
            role="button"
            tabIndex={0}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="md:hidden text-sm font-display font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5 select-none shrink-0">
                <MapPin size={16} className="text-brand-blue dark:text-brand-light" />
                Leyenda y Filtros
              </span>
              
              {/* Active filter badges on mobile */}
              <div className="md:hidden flex items-center gap-1.5 ml-2 overflow-x-auto no-scrollbar py-0.5">
                {showOperators && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue dark:text-brand-light border border-brand-blue/20 dark:border-brand-blue/30 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-blue dark:bg-brand-light"></span>
                    {operatorsOnMap.length}
                  </span>
                )}
                {showEvents && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-gold/10 dark:bg-brand-gold/20 text-brand-gold border border-brand-gold/20 dark:border-brand-gold/30 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse"></span>
                    {eventsOnMap.length}
                  </span>
                )}
                {showPOIs && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 dark:border-purple-500/30 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400"></span>
                    {puntosInteres.length}
                  </span>
                )}
              </div>

              <h1 className="hidden md:block text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">Municipio Díaz</h1>
            </div>
            <div className="md:hidden p-2 bg-stone-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors shrink-0">
              {isSidebarExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>

          {/* Collapsible Content */}
          <div className={`px-4 pb-4 md:px-8 md:pb-8 flex-col flex-1 overflow-y-auto ${isSidebarExpanded ? 'flex' : 'hidden md:flex'}`}>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              Explora la ubicación de talleres, ferias y eventos. Usa los controles para centrarte y descubrir actividades cercanas de nuestros artesanos.
            </p>

            {/* Legend / Stats */}
            <div className="flex flex-col gap-3 mt-auto md:mt-8">
              <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Leyenda y Filtros</h3>

              <button
                type="button"
                onClick={() => setShowOperators(!showOperators)}
                className={`flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800 border shadow-sm hover:shadow-md transition cursor-pointer text-left w-full ${showOperators ? "border-brand-blue/30" : "border-stone-200/80 dark:border-white/5 opacity-50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-brand-blue/10 dark:bg-brand-blue/20 flex items-center justify-center">
                    <span className="w-3.5 h-3.5 rounded-full bg-brand-blue border-2 border-white dark:border-slate-800 shadow-sm"></span>
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Talleres</span>
                </div>
                <span className="text-xs font-black bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg">{operatorsOnMap.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowEvents(!showEvents)}
                className={`flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800 border shadow-sm hover:shadow-md transition cursor-pointer text-left w-full ${showEvents ? "border-brand-gold/40" : "border-stone-200/80 dark:border-white/5 opacity-50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                    <span className="w-3.5 h-3.5 rounded-full bg-brand-gold border-2 border-white dark:border-slate-800 shadow-sm"></span>
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Eventos</span>
                </div>
                <span className="text-xs font-black bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg">{eventsOnMap.length}</span>
              </button>

              {/* Puntos de Interés Toggle */}
              <button
                type="button"
                onClick={() => setShowPOIs(!showPOIs)}
                className={`flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800 border shadow-sm hover:shadow-md transition cursor-pointer text-left w-full ${showPOIs ? "border-purple-600/30" : "border-stone-200/80 dark:border-white/5 opacity-50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                    <span className="w-3.5 h-3.5 rounded-full bg-purple-600 border-2 border-white dark:border-slate-800 shadow-sm"></span>
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Sitios Históricos y POIs</span>
                </div>
                <span className="text-xs font-black bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg">
                  {puntosInteres.length}
                </span>
              </button>

              {/* Sub-categorias de POIs */}
              {showPOIs && (
                <div className="pl-3.5 pr-2.5 py-2.5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 border border-stone-200/50 dark:border-white/5 space-y-2">
                  <h4 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Categorías de Sitios</h4>
                  <div className="space-y-1.5">
                    {[
                      { id: "religion", label: "⛪ Iglesias / Cultura", colorClass: "text-purple-600 dark:text-purple-400" },
                      { id: "turismo", label: "🏖️ Playas y Turismo", colorClass: "text-teal-600 dark:text-teal-400" },
                      { id: "comida", label: "🍲 Restaurantes / Comida", colorClass: "text-amber-600 dark:text-amber-400" },
                      { id: "educacion", label: "🎓 Escuelas y Liceos", colorClass: "text-indigo-600 dark:text-indigo-400" },
                      { id: "servicios", label: "✈️ Servicios / Aeropuerto", colorClass: "text-slate-600 dark:text-slate-400" }
                    ].map((cat) => {
                      const isSelected = selectedPoiCategories.includes(cat.id);
                      return (
                        <label
                          key={cat.id}
                          className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none py-1 hover:text-slate-800 dark:hover:text-white transition"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              if (isSelected) {
                                setSelectedPoiCategories(selectedPoiCategories.filter(c => c !== cat.id));
                              } else {
                                setSelectedPoiCategories([...selectedPoiCategories, cat.id]);
                              }
                            }}
                            className="rounded text-brand-blue focus:ring-brand-blue border-gray-300 dark:border-white/10"
                          />
                          <span className={cat.colorClass}>{cat.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {eventsMissingLocation && (
                <div className="mt-2 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-500/30 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Hay {events.length - eventsOnMap.length} evento(s) sin ubicación</span>
                </div>
              )}

              {userLocation && (
                <div className="mt-2 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-500/30 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0"></span>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Tu Ubicación Activa</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative h-[60vh] md:h-auto w-full z-10">
          {/* Floating Action Button (Locate Me) */}
          <div className="absolute bottom-6 right-4 md:bottom-8 md:right-8 z-1000 pointer-events-auto">
            <button
              onClick={handleLocateMe}
              disabled={loadingLoc}
              className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 text-brand-blue dark:text-brand-light shadow-[0_8px_20px_rgba(15,76,129,0.2)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.4)] border border-stone-100 dark:border-white/10 flex items-center justify-center hover:bg-stone-50 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
              title="Centrar en mi ubicación"
            >
              <Navigation size={24} strokeWidth={2.5} className={`${loadingLoc ? "animate-spin" : "group-hover:text-brand-blue/80 dark:group-hover:text-white transition-colors"}`} />
            </button>
          </div>


          <MapContainer
            center={MUNICIPIO_DIAZ_CENTER}
            zoom={MUNICIPIO_DEFAULT_ZOOM}
            maxBounds={MUNICIPIO_MAX_BOUNDS}
            maxBoundsViscosity={1}
            minZoom={11}
            className="h-full w-full"
          >
            <TileLayer key={isDarkMode ? "dark" : "light"} {...getMapTileConfig(isDarkMode)} />
            <MunicipioBoundsController fitOnMount />
            <MunicipioMaskLayer isDarkMode={isDarkMode} />
            <MunicipioBorderLayer isDarkMode={isDarkMode} />
            <MapController center={mapCenter} />

            {/* User Location Marker */}
            {userLocation && (
              <Marker
                position={userLocation}
                icon={createDivIcon("bg-emerald-500", '<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-white"></span>')}
              >
                <Popup>
                  <div className="p-1 text-center">
                    <h4 className="font-bold text-emerald-600">¡Estás aquí!</h4>
                    <p className="text-xs text-slate-500">Buscando artesanos a tu alrededor.</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Operator Markers */}
            {showOperators && operatorsOnMap.map((op: any) => (
              <Marker
                key={`op-${op.id}`}
                position={[op.latitud, op.longitud]}
                icon={createDivIcon("bg-brand-blue dark:bg-brand-light", '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-store"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.53.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.53.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.53.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.53.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 10V7"/></svg>')}
              >
                <Popup>
                  <div className="p-1 max-w-50">
                    <h3 className="font-display font-bold text-sm text-slate-800 dark:text-white mb-0.5">{op.nombre_taller}</h3>
                    <div className="text-[10px] text-brand-blue dark:text-brand-light font-semibold mb-2 flex items-center gap-1">
                      <Tag size={10} /> {op.categoria_nombre}
                    </div>
                    {op.imagen_principal && (
                      <img
                        src={op.imagen_principal}
                        alt={op.nombre_taller}
                        className="w-full h-24 object-cover rounded-xl mb-3 shadow-inner"
                      />
                    )}
                    <Link
                      to={`/operador/${op.id}`}
                      className="text-xs bg-brand-blue dark:bg-brand-light text-white px-3 py-2 rounded-xl block text-center font-bold shadow-md shadow-brand-blue/20 hover:shadow-lg transition"
                    >
                      Ver Perfil
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Event Markers */}
            {showEvents && eventsOnMap.map((ev: any) => (
              <Marker
                key={`ev-${ev.id}`}
                position={[ev.latitud, ev.longitud]}
                icon={createDivIcon("bg-brand-gold", '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>')}
              >
                <Popup>
                  <div className="p-1 max-w-50">
                    <span className="bg-amber-100 dark:bg-amber-950/30 text-brand-gold text-[9px] font-bold px-2 py-0.5 rounded-full mb-1 inline-block">
                      Feria / Evento
                    </span>
                    <h3 className="font-display font-bold text-sm text-slate-800 dark:text-white mb-1 leading-snug">{ev.titulo}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">{ev.descripcion}</p>

                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mb-3">
                      Fin: {new Date(ev.fecha_fin).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                    </div>

                    {ev.url_imagen && (
                      <img
                        src={ev.url_imagen}
                        alt={ev.titulo}
                        className="w-full h-20 object-cover rounded-lg mb-2"
                      />
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* POI Markers */}
            {showPOIs && puntosInteres
              .filter((poi) => selectedPoiCategories.includes(poi.categoria))
              .map((poi) => {
                const markerColor =
                  poi.categoria === "religion" ? "bg-purple-600" :
                    poi.categoria === "turismo" ? "bg-teal-500" :
                      poi.categoria === "comida" ? "bg-amber-500" :
                        poi.categoria === "educacion" ? "bg-indigo-600" :
                          "bg-slate-500";

                const markerIconHtml =
                  poi.categoria === "religion" ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-church"><path d="M12 2v20M17 5H7M15 9H9"/></svg>' :
                    poi.categoria === "turismo" ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-compass"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>' :
                      poi.categoria === "comida" ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-utensils"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>' :
                        poi.categoria === "educacion" ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>' :
                          '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plane"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3.5c-.5-.5-2.5 0-4 1.5L13.5 8.5 5.3 6.7c-.7-.2-1.5 0-2 .5l-.5.5c-.3.3-.3.8-.1 1.1l7.1 5.9-1.9 1.9-4.3-.9c-.4-.1-.8.1-1 .4l-.5.5c-.3.3-.2.8.1 1l4.4 2.8c.3.2.8.2 1.1-.1l1.9-1.9 5.9 7.1c.3.2.8.2 1.1-.1l.5-.5c.4-.5.6-1.3.4-2z"/></svg>';

                return (
                  <Marker
                    key={`poi-${poi.id}`}
                    position={[poi.latitud, poi.longitud]}
                    icon={createDivIcon(markerColor, markerIconHtml)}
                  >
                    <Popup>
                      <div className="p-1 max-w-50">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full mb-1 inline-block ${poi.categoria === "religion" ? "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300" :
                          poi.categoria === "turismo" ? "bg-teal-100 text-teal-700 dark:bg-teal-950/30 dark:text-teal-300" :
                            poi.categoria === "comida" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300" :
                              poi.categoria === "educacion" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300" :
                                "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300"
                          }`}>
                          {poi.categoria === "religion" ? "Religión / Cultura" :
                            poi.categoria === "turismo" ? "Turismo / Naturaleza" :
                              poi.categoria === "comida" ? "Gastronomía / Popular" :
                                poi.categoria === "educacion" ? "Educación / Liceo" :
                                  "Servicio / Aeropuerto"}
                        </span>
                        <h3 className="font-display font-bold text-sm text-slate-800 dark:text-white mb-1 leading-snug">{poi.nombre}</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mb-2">{poi.descripcion}</p>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mb-3 flex items-start gap-1">
                          <MapPin size={10} className="mt-0.5 shrink-0" />
                          <span>{poi.direccion}</span>
                        </div>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${poi.latitud},${poi.longitud}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl block text-center font-bold transition"
                        >
                          Cómo llegar
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
          </MapContainer>
          <MunicipioMapLegend />
        </div>
      </div>
    </>
  );
};

export default MapView;
