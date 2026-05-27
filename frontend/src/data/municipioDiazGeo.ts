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
  [11.025287, -63.966953],
  [11.011382, -63.957597],
  [11.009778, -63.945838],
  [11.011801, -63.931505],
  [11.004128, -63.921806],
  [11.014247, -63.905627],
  [10.999661, -63.896271],
  [10.985918, -63.906364],
  [10.980608, -63.923122],
  [10.957608, -63.927503],
  [10.932906, -63.911025],
  [10.902263, -63.918901],
  [10.892404, -63.936058],
  [10.873264, -63.932135],
  [10.865488, -63.948261],
  [10.878546, -63.964912],
  [10.880402, -63.987700],
  [10.899899, -64.015112],
  [10.925046, -64.032236],
  [10.963428, -64.038459],
  [10.963428, -64.024040],
  [11.004482, -64.004556],
  [11.024528, -63.983957],
  [11.025287, -63.966953]
];

const toLngLatRing = (ring: [number, number][]) =>
  ring.map(([lat, lng]) => [lng, lat] as [number, number]);

const municipioLngLatRing = toLngLatRing(MUNICIPIO_DIAZ_RING);

/** Anillo exterior para enmascarar el área fuera del municipio. */
const MASK_EXTERIOR: [number, number][] = [
  [11.025287, -63.966953],
  [11.011382, -63.957597],
  [11.009778, -63.945838],
  [11.011801, -63.931505],
  [11.004128, -63.921806],
  [11.014247, -63.905627],
  [10.999661, -63.896271],
  [10.985918, -63.906364],
  [10.980608, -63.923122],
  [10.957608, -63.927503],
  [10.932906, -63.911025],
  [10.902263, -63.918901],
  [10.892404, -63.936058],
  [10.873264, -63.932135],
  [10.865488, -63.948261],
  [10.878546, -63.964912],
  [10.880402, -63.987700],
  [10.899899, -64.015112],
  [10.925046, -64.032236],
  [10.963428, -64.038459],
  [10.963428, -64.024040],
  [11.004482, -64.004556],
  [11.024528, -63.983957],
  [11.025287, -63.966953]
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
