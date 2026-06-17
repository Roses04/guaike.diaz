/**
 * MÓDULO DE SERVICIOS GEOGRÁFICOS Y DE LOCALIZACIÓN
 * 
 * Este archivo centraliza la lógica geográfica del Municipio Díaz. Dado que los mapas
 * de Leaflet requieren formato [latitud, longitud] (WGS 84) y PostgreSQL/PostGIS almacena
 * los datos como geometrías binarias (EWKB), este archivo implementa la decodificación,
 * normalización y validación de las coordenadas para asegurar que todas las ubicaciones
 * caigan exactamente dentro de los límites legales del Municipio Díaz, previniendo errores de visualización.
 */

// Límites geográficos definidos para el Municipio Díaz [sur-oeste, norte-este]
export const MUNICIPIO_LAT_MIN = 10.84;
export const MUNICIPIO_LAT_MAX = 11.06;
export const MUNICIPIO_LNG_MIN = -64.06;
export const MUNICIPIO_LNG_MAX = -63.88;

export type ParsedCoords = { latitud: number; longitud: number };

// Helper para convertir cualquier valor a número de forma segura
const toNum = (v: unknown): number => {
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : NaN;
};

// Parámetros de especificación WKB para la extracción de puntos
const WKB_POINT = 1;
const WKB_SRID_FLAG = 0x20000000;

/**
 * Decodifica puntos espaciales guardados en formato binario EWKB (Extended Well-Known Binary) hex.
 * Este es el formato nativo retornado por PostGIS en Supabase.
 * 
 * @param hex Cadena hexadecimal representando el punto espacial de la base de datos.
 * @returns Coordenadas legibles { longitud, latitud }, o null si falla.
 */
const parseEwkbPointHex = (hex: string): ParsedCoords | null => {
  const clean = hex.replace(/^\\x/i, "").replace(/^0x/i, "").trim();
  if (!/^[0-9a-fA-F]+$/.test(clean) || clean.length < 42) return null;

  try {
    const bytes = new Uint8Array(clean.length / 2);
    for (let i = 0; i < clean.length; i += 2) {
      bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16);
    }
    if (bytes.length < 25) return null;

    const le = bytes[0] === 1; // Little Endian vs Big Endian
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let offset = 1;
    const wkbType = view.getUint32(offset, le);
    offset += 4;

    if ((wkbType & 0xff) !== WKB_POINT) return null;
    if (wkbType & WKB_SRID_FLAG) offset += 4; // Saltar bytes de SRID si están presentes

    const longitud = view.getFloat64(offset, le);
    offset += 8;
    const latitud = view.getFloat64(offset, le);

    if (!Number.isFinite(longitud) || !Number.isFinite(latitud)) return null;
    return { longitud, latitud };
  } catch {
    return null;
  }
};

/**
 * Normaliza cualquier formato de ubicación de Supabase (EWKB, GeoJSON, WKT o JSON crudo)
 * a un objeto estandarizado de coordenadas { latitud, longitud }.
 */
export const normalizeLocation = (ubicacion: unknown): ParsedCoords => {
  if (ubicacion == null) return { latitud: NaN, longitud: NaN };

  if (typeof ubicacion === "string") {
    const trimmed = ubicacion.trim();
    // Intentar decodificar como hexadecimal de PostGIS
    const ewkb = parseEwkbPointHex(trimmed);
    if (ewkb) return ewkb;

    // Intentar parsear si viene en formato WKT string (ej. "POINT(lng lat)")
    const sridMatch = trimmed.match(
      /POINT\s*\(\s*([-0-9.]+)\s+([-0-9.]+)\s*\)/i
    );
    if (sridMatch) {
      return { longitud: toNum(sridMatch[1]), latitud: toNum(sridMatch[2]) };
    }
  }

  // Si viene como objeto JSON o coordenadas GeoJSON (Point)
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

/**
 * Valida si un punto geográfico se encuentra estrictamente dentro de los límites del Municipio Díaz.
 */
export const isInsideMunicipioBounds = (lat: number, lng: number): boolean =>
  lat >= MUNICIPIO_LAT_MIN &&
  lat <= MUNICIPIO_LAT_MAX &&
  lng >= MUNICIPIO_LNG_MIN &&
  lng <= MUNICIPIO_LNG_MAX;

/**
 * Corrige y devuelve coordenadas válidas dentro del municipio.
 * Si las coordenadas vienen invertidas (latitud por longitud), las auto-corrige e invierte.
 * Retorna null si la ubicación está completamente fuera de rango o es inválida.
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

  // Si los datos están invertidos (error común de digitación), se rotan
  if (isInsideMunicipioBounds(rawLng, rawLat)) {
    return { latitud: rawLng, longitud: rawLat };
  }

  return null;
};

/**
 * Parsea y valida si una ubicación de la base de datos es procesable dentro del mapa del Municipio Díaz.
 */
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

/**
 * Verifica de forma rápida si una coordenada lat/lng pertenece geográficamente al Municipio Díaz.
 */
export const isValidMunicipioCoord = (lat: unknown, lng: unknown): boolean => {
  const latN = toNum(lat);
  const lngN = toNum(lng);
  return resolveMunicipioCoords(latN, lngN) !== null;
};
