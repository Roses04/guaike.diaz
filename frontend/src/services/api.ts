import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 8000,
});

// ─── Claves de caché en localStorage ────────────────────────────────────────
const CACHE_PREFIX = "api_cache_";
const QUEUE_KEY = "offline_queue";

const getCacheKey = (url: string, params?: any) =>
  CACHE_PREFIX + url + (params ? JSON.stringify(params) : "");

const readCache = (key: string) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const writeCache = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Ignorar errores de cuota de almacenamiento
  }
};

// ─── Obtener cola de acciones pendientes ────────────────────────────────────
export const getOfflineQueue = (): any[] => {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
};

const addToQueue = (item: any) => {
  const queue = getOfflineQueue();
  queue.push({ ...item, _queuedAt: new Date().toISOString() });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

const clearQueue = () => localStorage.removeItem(QUEUE_KEY);

// ─── Interceptor de REQUEST ──────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Interceptor de RESPONSE ─────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    // Guardar en caché toda respuesta GET exitosa
    if (response.config.method?.toLowerCase() === "get" && response.config.url) {
      const key = getCacheKey(response.config.url, response.config.params);
      writeCache(key, response.data);
    }
    return response;
  },
  async (error) => {
    const config = error.config;
    const isNetworkError = !error.response;

    // ─── Offline: GET → devolver caché ───────────────────────────────────
    if (isNetworkError && config?.method?.toLowerCase() === "get" && config?.url) {
      const key = getCacheKey(config.url, config.params);
      const cached = readCache(key);
      if (cached !== null) {
        return Promise.resolve({
          data: cached,
          status: 200,
          statusText: "OK (cached)",
          headers: {},
          config,
          _fromCache: true,
        });
      }
    }

    // ─── Offline: POST/PUT/DELETE → encolar ──────────────────────────────
    const enqueueableMethods = ["post", "put", "patch", "delete"];
    const method = config?.method?.toLowerCase() || "";
    // No encolar llamadas de autenticación (login/register)
    const isAuthCall = config?.url?.includes("/auth/");

    if (isNetworkError && enqueueableMethods.includes(method) && !isAuthCall) {
      addToQueue({
        url: config.url,
        method,
        data: config.data ? JSON.parse(config.data) : undefined,
        headers: config.headers,
      });

      // Devolver respuesta simulada para que la UI no falle
      return Promise.resolve({
        data: { message: "Guardado localmente. Se sincronizará al recuperar la conexión.", _offline: true },
        status: 202,
        statusText: "Queued",
        headers: {},
        config,
        _queued: true,
      });
    }

    return Promise.reject(error);
  }
);

// ─── Sincronización de cola al recuperar la conexión ────────────────────────
export const syncOfflineQueue = async (): Promise<void> => {
  const queue = getOfflineQueue();
  if (queue.length === 0) return;

  console.log(`[Offline Sync] Sincronizando ${queue.length} acción(es) pendiente(s)...`);
  const failed: any[] = [];

  for (const item of queue) {
    try {
      await api.request({
        url: item.url,
        method: item.method,
        data: item.data,
      });
      console.log(`[Offline Sync] ✓ ${item.method.toUpperCase()} ${item.url}`);
    } catch (err) {
      console.warn(`[Offline Sync] ✗ ${item.method.toUpperCase()} ${item.url}`, err);
      failed.push(item);
    }
  }

  if (failed.length > 0) {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(failed));
    console.warn(`[Offline Sync] ${failed.length} acción(es) no pudieron sincronizarse y se reintentarán.`);
  } else {
    clearQueue();
    console.log("[Offline Sync] ¡Sincronización completa!");
  }
};

export default api;
