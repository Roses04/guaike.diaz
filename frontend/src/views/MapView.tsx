import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import api from "../services/api";
import L from "leaflet";
import { Link, useLocation } from "react-router-dom";
import { Navigation, Tag, Map } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";
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
    <div className="min-h-map-mobile w-full relative flex flex-col md:flex-row -mx-0 md:mx-0">
      {/* Floating Top Elements (like Google Maps Chips) */}
      <div className="absolute mobile-offset-top left-0 right-0 z-[1000] px-4 pointer-events-none md:top-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full pointer-events-auto pb-2">
          {/* Module Title Chip */}
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2.5 rounded-full shadow-lg border border-stone-200/80 dark:border-white/10 flex items-center gap-2 shrink-0">
            <Map size={14} className="text-brand-blue dark:text-brand-light" />
            <span className="font-display font-bold text-sm text-brand-blue dark:text-white tracking-wide">Mapa</span>
          </div>
          
          {/* Legend Chips */}
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-full shadow-lg border border-stone-200/80 dark:border-white/10 flex items-center gap-2 shrink-0">
            <span className="w-3 h-3 rounded-full bg-brand-blue border-[1.5px] border-white shadow-sm"></span>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Talleres ({operatorsOnMap.length})</span>
          </div>

          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-full shadow-lg border border-stone-200/80 dark:border-white/10 flex items-center gap-2 shrink-0">
            <span className="w-3 h-3 rounded-full bg-brand-gold border-[1.5px] border-white shadow-sm"></span>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Eventos ({eventsOnMap.length})</span>
          </div>

          {eventsMissingLocation && (
            <div className="bg-amber-50 dark:bg-amber-950/40 backdrop-blur-md px-3.5 py-2.5 rounded-full shadow-lg border border-amber-200 dark:border-amber-500/30 flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">Sin ubicación en mapa</span>
            </div>
          )}
          
          {userLocation && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 backdrop-blur-md px-3.5 py-2.5 rounded-full shadow-lg border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Tu Ubicación</span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button (Locate Me) - Google Maps Style */}
      <div className="absolute mobile-fab-bottom right-4 z-[1000] pointer-events-auto">
        <button 
          onClick={handleLocateMe}
          disabled={loadingLoc}
          className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 text-brand-blue dark:text-brand-light shadow-[0_8px_20px_rgba(15,76,129,0.2)] border border-stone-100 dark:border-white/10 flex items-center justify-center hover:bg-stone-50 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Centrar en mi ubicación"
        >
          <Navigation size={20} strokeWidth={2.5} className={`${loadingLoc ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Leaflet Map */}
      <div className="flex-grow h-full w-full z-0 relative">
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
          {operatorsOnMap.map((op: any) => (
            <Marker 
              key={`op-${op.id}`} 
              position={[op.latitud, op.longitud]}
              icon={createDivIcon("bg-brand-blue dark:bg-brand-light", '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-store"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.53.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.53.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.53.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.53.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 10V7"/></svg>')}
            >
              <Popup>
                <div className="p-1 max-w-[200px]">
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
          {eventsOnMap.map((ev: any) => (
            <Marker 
              key={`ev-${ev.id}`} 
              position={[ev.latitud, ev.longitud]}
              icon={createDivIcon("bg-brand-gold", '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>')}
            >
              <Popup>
                <div className="p-1 max-w-[200px]">
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
        </MapContainer>
        <MunicipioMapLegend />
      </div>
    </div>
  );
};

export default MapView;
