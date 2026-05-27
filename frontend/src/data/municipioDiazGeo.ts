import L from "leaflet";

type GeoPolygonFeature = {
  type: "Feature";
  properties: Record<string, string>;
  geometry: {
    type: "Polygon";
    coordinates: [number, number][][];
  };
};

type GeoFeatureCollection = {
  type: "FeatureCollection";
  features: GeoPolygonFeature[];
};

/** Centro aproximado del Municipio Díaz (Nueva Esparta). */
export const MUNICIPIO_DIAZ_CENTER: [number, number] = [11.018, -63.95];

/** Límites de navegación del mapa [sur-oeste, norte-este]. */
export const MUNICIPIO_MAX_BOUNDS: L.LatLngBoundsExpression = [
  [10.92, -64.06],
  [11.11, -63.84],
];

export const MUNICIPIO_MIN_ZOOM = 11;
export const MUNICIPIO_DEFAULT_ZOOM = 13;

/**
 * Contorno simplificado del Municipio Díaz (lat, lng).
 * Ajustable si se dispone de GeoJSON oficial de la alcaldía.
 */
export const MUNICIPIO_DIAZ_RING: [number, number][] = [
  [11.088, -64.028],
  [11.098, -63.968],
  [11.082, -63.902],
  [11.048, -63.872],
  [11.012, -63.862],
  [10.972, -63.878],
  [10.942, -63.918],
  [10.938, -63.972],
  [10.958, -64.018],
  [11.002, -64.042],
  [11.048, -64.038],
  [11.088, -64.028],
];

const toLngLatRing = (ring: [number, number][]) =>
  ring.map(([lat, lng]) => [lng, lat] as [number, number]);

const municipioLngLatRing = toLngLatRing(MUNICIPIO_DIAZ_RING);

/** Anillo exterior para enmascarar el área fuera del municipio. */
const MASK_EXTERIOR: [number, number][] = [
  [-64.2, 10.82],
  [-63.65, 10.82],
  [-63.65, 11.18],
  [-64.2, 11.18],
  [-64.2, 10.82],
];

export const municipioDiazBoundaryGeoJSON: GeoPolygonFeature = {
  type: "Feature",
  properties: { name: "Municipio Díaz" },
  geometry: {
    type: "Polygon",
    coordinates: [municipioLngLatRing],
  },
};

export const municipioDiazMaskGeoJSON: GeoPolygonFeature = {
  type: "Feature",
  properties: { name: "mask" },
  geometry: {
    type: "Polygon",
    coordinates: [MASK_EXTERIOR, [...municipioLngLatRing].reverse()],
  },
};

export const municipioDiazBoundaryCollection: GeoFeatureCollection = {
  type: "FeatureCollection",
  features: [municipioDiazBoundaryGeoJSON],
};

const getMunicipioBounds = () => L.latLngBounds(MUNICIPIO_MAX_BOUNDS as L.LatLngTuple[]);

export function clampToMunicipioBounds(lat: number, lng: number): [number, number] {
  const bounds = getMunicipioBounds();
  return [
    Math.max(bounds.getSouth(), Math.min(bounds.getNorth(), lat)),
    Math.max(bounds.getWest(), Math.min(bounds.getEast(), lng)),
  ];
}

export function isInsideMunicipioBounds(lat: number, lng: number): boolean {
  return getMunicipioBounds().contains([lat, lng]);
}
