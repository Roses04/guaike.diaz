/** Bounds del Municipio Díaz [sur-oeste, norte-este] — lat, lng */
export const MUNICIPIO_LAT_MIN = 10.84;
export const MUNICIPIO_LAT_MAX = 11.06;
export const MUNICIPIO_LNG_MIN = -64.06;
export const MUNICIPIO_LNG_MAX = -63.88;

export type ParsedCoords = { latitud: number; longitud: number };

const toNum = (v: unknown): number => {
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : NaN;
};

/** Parsea columna PostGIS / GeoJSON / WKT a lng-lat crudos. */
export const normalizeLocation = (ubicacion: unknown): ParsedCoords => {
  if (ubicacion == null) return { latitud: NaN, longitud: NaN };

  if (typeof ubicacion === "string") {
    const sridMatch = ubicacion.match(
      /POINT\s*\(\s*([-0-9.]+)\s+([-0-9.]+)\s*\)/i
    );
    if (sridMatch) {
      return { longitud: toNum(sridMatch[1]), latitud: toNum(sridMatch[2]) };
    }
  }

  const geo = ubicacion as {
    type?: string;
    coordinates?: unknown[];
    x?: unknown;
    y?: unknown;
    lat?: unknown;
    lng?: unknown;
    latitude?: unknown;
    longitude?: unknown;
  };

  if (geo?.type === "Point" && Array.isArray(geo.coordinates) && geo.coordinates.length >= 2) {
    return {
      longitud: toNum(geo.coordinates[0]),
      latitud: toNum(geo.coordinates[1]),
    };
  }

  if (geo?.x !== undefined && geo?.y !== undefined) {
    return { longitud: toNum(geo.x), latitud: toNum(geo.y) };
  }

  if (geo?.lng !== undefined && geo?.lat !== undefined) {
    return { longitud: toNum(geo.lng), latitud: toNum(geo.lat) };
  }

  if (geo?.longitude !== undefined && geo?.latitude !== undefined) {
    return { longitud: toNum(geo.longitude), latitud: toNum(geo.latitude) };
  }

  return { latitud: NaN, longitud: NaN };
};

export const isInsideMunicipioBounds = (lat: number, lng: number): boolean =>
  lat >= MUNICIPIO_LAT_MIN &&
  lat <= MUNICIPIO_LAT_MAX &&
  lng >= MUNICIPIO_LNG_MIN &&
  lng <= MUNICIPIO_LNG_MAX;

/**
 * Devuelve coords válidas dentro del municipio; corrige lat/lng invertidos.
 * null si no hay ubicación usable.
 */
export const resolveMunicipioCoords = (
  rawLat: number,
  rawLng: number
): ParsedCoords | null => {
  if (!Number.isFinite(rawLat) || !Number.isFinite(rawLng)) return null;
  if (rawLat === 0 && rawLng === 0) return null;

  if (isInsideMunicipioBounds(rawLat, rawLng)) {
    return { latitud: rawLat, longitud: rawLng };
  }

  if (isInsideMunicipioBounds(rawLng, rawLat)) {
    return { latitud: rawLng, longitud: rawLat };
  }

  return null;
};

export const parseUbicacionForMunicipio = (
  ubicacion: unknown,
  debugId?: string | number
): (ParsedCoords & { coordsValidas: boolean }) | null => {
  const raw = normalizeLocation(ubicacion);
  const resolved = resolveMunicipioCoords(raw.latitud, raw.longitud);

  if (!resolved) {
    if (import.meta.env.DEV && debugId != null) {
      console.warn(
        `[geo] Ubicación inválida o fuera del municipio (id=${debugId})`,
        ubicacion
      );
    }
    return null;
  }

  return { ...resolved, coordsValidas: true };
};

export const isValidMunicipioCoord = (lat: unknown, lng: unknown): boolean => {
  const latN = toNum(lat);
  const lngN = toNum(lng);
  return resolveMunicipioCoords(latN, lngN) !== null;
};
