import { useEffect } from "react";
import { GeoJSON, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import {
  MUNICIPIO_MAX_BOUNDS,
  MUNICIPIO_MIN_ZOOM,
  MUNICIPIO_DIAZ_CENTER,
  MUNICIPIO_DEFAULT_ZOOM,
  municipioDiazBoundaryGeoJSON,
  municipioDiazMaskGeoJSON,
  clampToMunicipioBounds,
} from "../../data/municipioDiazGeo";

const createPinIcon = (colorClass: string) =>
  L.divIcon({
    html: `<div class="w-9 h-9 rounded-full ${colorClass} text-white flex items-center justify-center border-2 border-white shadow-lg"><span class="w-3 h-3 rounded-full bg-white block"></span></div>`,
    className: "custom-div-icon",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -32],
  });

/** Restringe pan/zoom al Municipio Díaz. */
export function MunicipioBoundsController({ fitOnMount = true }: { fitOnMount?: boolean }) {
  const map = useMap();

  useEffect(() => {
    map.setMaxBounds(MUNICIPIO_MAX_BOUNDS);
    map.setMinZoom(MUNICIPIO_MIN_ZOOM);
    map.setMaxZoom(18);
    map.options.maxBoundsViscosity = 1;

    if (fitOnMount) {
      map.fitBounds(MUNICIPIO_MAX_BOUNDS, { padding: [20, 20], maxZoom: MUNICIPIO_DEFAULT_ZOOM });
    }
  }, [map, fitOnMount]);

  return null;
}

/** Oscurece el territorio fuera del municipio. */
export function MunicipioMaskLayer({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <GeoJSON
      key={`mask-${isDarkMode ? "dark" : "light"}`}
      data={municipioDiazMaskGeoJSON}
      style={{
        stroke: false,
        fillColor: isDarkMode ? "#020617" : "#1e293b",
        fillOpacity: isDarkMode ? 0.55 : 0.4,
      }}
      interactive={false}
    />
  );
}

/** Borde resaltado del municipio. */
export function MunicipioBorderLayer({ isDarkMode }: { isDarkMode: boolean }) {
  const borderColor = isDarkMode ? "#5fbde3" : "#0093d9";
  const fillColor = isDarkMode ? "#5fbde3" : "#0093d9";

  return (
    <GeoJSON
      key={`border-${isDarkMode ? "dark" : "light"}`}
      data={municipioDiazBoundaryGeoJSON}
      style={{
        color: borderColor,
        weight: 4,
        opacity: 1,
        fillColor,
        fillOpacity: isDarkMode ? 0.14 : 0.1,
        dashArray: "10 6",
      }}
      onEachFeature={(_feature, layer) => {
        if (layer instanceof L.Path) {
          layer.bindTooltip("Municipio Díaz", {
            permanent: false,
            direction: "center",
            className: "municipio-map-tooltip",
          });
        }
      }}
      pathOptions={{
        className: "municipio-border-path",
      }}
    />
  );
}

/** Etiqueta flotante en el mapa (leyenda municipal). */
export function MunicipioMapLegend() {
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 z-[500] rounded-xl border border-brand-blue/30 bg-white/95 px-3 py-2 text-[10px] font-bold text-brand-blue shadow-lg backdrop-blur-md dark:border-brand-light/30 dark:bg-slate-900/95 dark:text-brand-light">
      Área del Municipio Díaz
    </div>
  );
}

export function getMapTileConfig(isDarkMode: boolean) {
  return {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    url: isDarkMode
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  };
}

/** Marcador arrastrable limitado al municipio (registro de eventos / operadores). */
export function MunicipioLocationPicker({
  position,
  setPosition,
  markerClass = "bg-brand-gold",
}: {
  position: [number, number];
  setPosition: (coords: [number, number]) => void;
  markerClass?: string;
}) {
  useMapEvents({
    click(e) {
      setPosition(clampToMunicipioBounds(e.latlng.lat, e.latlng.lng));
    },
  });

  return (
    <Marker
      position={position}
      draggable
      eventHandlers={{
        dragend(e) {
          const pos = e.target.getLatLng();
          setPosition(clampToMunicipioBounds(pos.lat, pos.lng));
        },
      }}
      icon={createPinIcon(markerClass)}
    />
  );
}

export { MUNICIPIO_DIAZ_CENTER, MUNICIPIO_DEFAULT_ZOOM };
