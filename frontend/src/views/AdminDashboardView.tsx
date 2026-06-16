/**
 * VISTA: PANEL DE CONTROL DE ADMINISTRADOR
 * 
 * Este componente es accesible SOLO por usuarios con rol = "admin".
 * Sirve como el "Cockpit de Moderación" de la Alcaldía.
 * Contiene tres secciones principales controladas por "Pestañas" (Tabs):
 * 
 * 1. SOLICITUDES (requests): Muestra artesanos que se registraron y están esperando
 *    ser aprobados para aparecer en el mapa público.
 * 2. FERIAS Y EVENTOS (events): Permite al administrador crear, editar y eliminar
 *    eventos culturales que aparecen en el Home (y guardar coordenadas GPS).
 * 3. USUARIOS (users): Permite crear otros usuarios (turistas, operadores o admins) manualmente.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import api from "../services/api";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { PageHeader, TabSwitcher } from "../components/ui/PageHeader";
import {
  MunicipioBoundsController,
  MunicipioMaskLayer,
  MunicipioBorderLayer,
  MunicipioLocationPicker,
  getMapTileConfig,
  MUNICIPIO_DIAZ_CENTER,
  MUNICIPIO_DEFAULT_ZOOM,
} from "../components/map/MunicipioMapLayers"; // Componentes del Mapa Leaflet
import { MUNICIPIO_MAX_BOUNDS } from "../data/municipioDiazGeo";
import {
  Users, Store, Calendar, MessageSquare, Award, ShieldCheck, CheckCircle,
  XCircle, FileText, MapPin, Plus, Trash2, TrendingUp, BarChart3, ListTodo, AlertCircle, Edit
} from "lucide-react"; // Iconos

const AdminDashboardView = () => {
  const { user, token } = useAuthStore(); // Obtener sesión actual
  const { isDarkMode } = useThemeStore();
  const navigate = useNavigate();

  // Redirect non-admin users
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!user) {
      // Esperar a que el estado de sesión se cargue desde localStorage o login
      return;
    }

    if (user.role !== "admin") {
      navigate("/");
    }
  }, [user, token, navigate]);

  if (!token) {
    return null;
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-4 border-brand-blue border-t-transparent animate-spin mx-auto mb-6"></div>
        <p className="text-slate-600 dark:text-slate-400">Restaurando sesión de administrador...</p>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<"requests" | "events" | "stats" | "users">("requests");
  
  // Tab 1: Operator Requests States
  const [pendingOperators, setPendingOperators] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [activeDocument, setActiveDocument] = useState<string | null>(null); // Inline document viewer modal

  // Tab 2: Event Creator States
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventStart, setEventStart] = useState("");
  const [eventEnd, setEventEnd] = useState("");
  const [eventImageUrl, setEventImageUrl] = useState("");
  const [eventLocation, setEventLocation] = useState<[number, number]>(MUNICIPIO_DIAZ_CENTER);
  const [publishingEvent, setPublishingEvent] = useState(false);
  const [eventSuccess, setEventSuccess] = useState("");
  const [eventError, setEventError] = useState("");
  const [editingEventId, setEditingEventId] = useState<number | null>(null);

  // Tab 3: Stats States
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Tab 4: Admin User Registration States
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminRole, setAdminRole] = useState("turista");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminSuccess, setAdminSuccess] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  
  // Operator Registration Additional States
  const [adminWorkshopName, setAdminWorkshopName] = useState("");
  const [adminCategoryId, setAdminCategoryId] = useState("");
  const [adminParroquiaId, setAdminParroquiaId] = useState("");
  const [adminLocation, setAdminLocation] = useState<[number, number]>(MUNICIPIO_DIAZ_CENTER);
  
  const [staticCategories, setStaticCategories] = useState([]);
  const [staticParroquias, setStaticParroquias] = useState([]);

  // Global Action Notification State
  const [alertMsg, setAlertMsg] = useState("");

  // Load Pending Operator Requests
  const loadPending = async () => {
    setLoadingRequests(true);
    try {
      const res = await api.get("/operators/pending");
      setPendingOperators(res.data);
    } catch (err) {
      console.error("Error loading pending requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  };

  // Load Active Events
  const loadEventsList = async () => {
    setLoadingEvents(true);
    try {
      const res = await api.get("/events");
      setEvents(res.data);
    } catch (err) {
      console.error("Error loading events list:", err);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Load Admin Stats
  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const res = await api.get("/stats/admin");
      setStats(res.data);
    } catch (err) {
      console.error("Error loading admin stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (activeTab === "requests") {
      loadPending();
    } else if (activeTab === "events") {
      loadEventsList();
    } else if (activeTab === "stats") {
      loadStats();
    } else if (activeTab === "users") {
      // Load static data for operator registration if not loaded
      if (staticCategories.length === 0) {
        api.get("/operators/static-data").then(res => {
          setStaticCategories(res.data.categorias || []);
          setStaticParroquias(res.data.parroquias || []);
        }).catch(err => console.error(err));
      }
    }
  }, [activeTab]);

  // Operator Verification Actions
  const handleVerifyOperator = async (operatorId: number, approve: boolean) => {
    try {
      await api.patch(`/operators/${operatorId}/verify`, { es_verificado: approve });
      setAlertMsg(`Solicitud del taller ${approve ? "APROBADA" : "RECHAZADA"} con éxito.`);
      loadPending();
      setTimeout(() => setAlertMsg(""), 3500);
    } catch (err) {
      console.error("Error verifying operator:", err);
      alert("No se pudo completar la acción de verificación.");
    }
  };

  // Event Publish Action
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setEventSuccess("");
    setEventError("");

    if (!eventTitle || !eventStart || !eventEnd) {
      setEventError("Por favor completa los campos obligatorios del evento.");
      return;
    }

    setPublishingEvent(true);
    try {
      const payload = {
        titulo: eventTitle,
        descripcion: eventDescription,
        longitud: eventLocation[1],
        latitud: eventLocation[0],
        fecha_inicio: eventStart,
        fecha_fin: eventEnd,
        url_imagen: eventImageUrl
      };

      if (editingEventId) {
        await api.put(`/events/${editingEventId}`, payload);
        setEventSuccess("¡Evento modificado exitosamente!");
      } else {
        await api.post("/events", payload);
        setEventSuccess("¡Feria/Evento cultural publicado exitosamente en el mapa!");
      }
      
      // Clear form
      setEventTitle("");
      setEventDescription("");
      setEventStart("");
      setEventEnd("");
      setEventImageUrl("");
      setEventLocation(MUNICIPIO_DIAZ_CENTER);
      setEditingEventId(null);

      loadEventsList();
    } catch (err: any) {
      setEventError(err.response?.data?.message || "Error al guardar el evento.");
    } finally {
      setPublishingEvent(false);
    }
  };

  const handleEditClick = (ev: any) => {
    const isStarted = new Date(ev.fecha_inicio) <= new Date();
    if (isStarted) {
      alert("No puedes editar un evento que ya ha comenzado.");
      return;
    }
    setEditingEventId(ev.id);
    setEventTitle(ev.titulo || "");
    setEventDescription(ev.descripcion || "");
    setEventStart(ev.fecha_inicio ? ev.fecha_inicio.slice(0, 16) : "");
    setEventEnd(ev.fecha_fin ? ev.fecha_fin.slice(0, 16) : "");
    setEventImageUrl(ev.url_imagen || "");
    if (ev.latitud && ev.longitud) {
      setEventLocation([ev.latitud, ev.longitud]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Event Delete Action
  const handleDeleteEvent = async (eventId: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar este evento del mapa?")) return;
    try {
      await api.delete(`/events/${eventId}`);
      setAlertMsg("Evento cultural eliminado con éxito.");
      loadEventsList();
      setTimeout(() => setAlertMsg(""), 3500);
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("No se pudo eliminar el evento.");
    }
  };

  const handleAdminCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");
    setAdminSuccess("");
    setAdminLoading(true);

    try {
      if (!adminEmail || !adminPassword || !adminName || !adminRole) {
        setAdminError("Completa todos los campos obligatorios para registrar un usuario.");
        return;
      }

      let operatorData = undefined;
      if (adminRole === "operador") {
        if (!adminWorkshopName || !adminCategoryId || !adminParroquiaId) {
          setAdminError("Completa todos los datos obligatorios del operador (Taller, Categoría, Parroquia).");
          setAdminLoading(false);
          return;
        }
        operatorData = {
          nombre_taller: adminWorkshopName,
          categoria_id: adminCategoryId,
          parroquia_id: adminParroquiaId,
          latitud: adminLocation[0],
          longitud: adminLocation[1]
        };
      }

      const res = await api.post("/auth/admin-register-user", {
        email: adminEmail,
        password: adminPassword,
        role: adminRole,
        name: adminName,
        phone: adminPhone,
        operatorData
      });

      setAdminSuccess(res.data?.message || "Usuario creado correctamente.");
      setAdminEmail("");
      setAdminPassword("");
      setAdminName("");
      setAdminPhone("");
      setAdminRole("turista");
      setAdminWorkshopName("");
      setAdminLocation(MUNICIPIO_DIAZ_CENTER);
    } catch (err: any) {
      setAdminError(err.response?.data?.message || "No se pudo crear el usuario.");
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl grow">
      <PageHeader
        align="left"
        badge="Módulo Gubernamental · Alcaldía"
        title="Cockpit de Moderación"
        description="Gestión de solicitudes, ferias y estadísticas del Municipio Díaz."
        icon={ShieldCheck}
        actions={
          <TabSwitcher
            active={activeTab}
            onChange={(id: string) => setActiveTab(id as any)}
            tabs={[
              { id: "requests", label: "Solicitudes", icon: ListTodo },
              { id: "events", label: "Ferias", icon: Calendar },
              { id: "stats", label: "Estadísticas", icon: BarChart3 },
            ]}
          />
        }
      />

      {/* Global alert messages */}
      {alertMsg && (
        <div className="mb-6 bg-brand-blue/10 dark:bg-brand-light/10 border border-brand-blue/20 dark:border-brand-light/20 text-brand-blue dark:text-brand-light p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle size={16} />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* TABS VIEWPORT */}

      {/* Tab 1: SOLICITUDES PENDIENTES */}
      {activeTab === "requests" && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
          <h2 className="text-xl font-display font-bold border-b border-slate-200/80 dark:border-white/5 pb-4 text-slate-800 dark:text-white">
            Solicitudes de Registro Pendientes ({pendingOperators.length})
          </h2>

          {loadingRequests ? (
            <div className="text-center py-12 text-slate-400">
              <div className="w-10 h-10 border-4 border-brand-blue dark:border-brand-light border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <span>Cargando solicitudes de artesanos...</span>
            </div>
          ) : pendingOperators.length > 0 ? (
            <>
            <div className="md:hidden space-y-4">
              {pendingOperators.map((req: any) => (
                <div key={req.id} className="rounded-2xl border border-slate-200/80 dark:border-white/10 p-4 space-y-3 bg-white/50 dark:bg-slate-900/30">
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{req.nombre_taller}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{req.usuario_correo}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <span className="capitalize bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{req.categoria_nombre}</span>
                    <span className="capitalize bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{req.parroquia_nombre}</span>
                  </div>
                  <button
                    onClick={() => setActiveDocument(req.imagen_principal)}
                    className="w-full bg-brand-blue/5 hover:bg-brand-blue/10 dark:bg-brand-light/10 text-brand-blue dark:text-brand-light font-bold px-3 py-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition text-xs"
                  >
                    <FileText size={12} /> Ver Cédula/RIF
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVerifyOperator(req.id, true)}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 text-sm"
                    >
                      <CheckCircle size={16} /> Aprobar
                    </button>
                    <button
                      onClick={() => handleVerifyOperator(req.id, false)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 text-sm"
                    >
                      <XCircle size={16} /> Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-white/5 text-[10px] uppercase tracking-wider text-slate-400">
                    <th className="pb-3.5 pl-2">Taller/Operador</th>
                    <th className="pb-3.5">Categoría</th>
                    <th className="pb-3.5">Parroquia</th>
                    <th className="pb-3.5">Documentación</th>
                    <th className="pb-3.5 text-right pr-2">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 dark:divide-white/5 text-xs text-slate-700 dark:text-slate-300">
                  {pendingOperators.map((req: any) => (
                    <tr key={req.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/10 transition">
                      <td className="py-4 pl-2 font-semibold">
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{req.nombre_taller}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{req.usuario_correo}</p>
                        </div>
                      </td>
                      <td className="py-4 capitalize">{req.categoria_nombre}</td>
                      <td className="py-4 capitalize">{req.parroquia_nombre}</td>
                      <td className="py-4">
                        <button
                          onClick={() => setActiveDocument(req.imagen_principal)} // Simulate document previewing
                          className="bg-brand-blue/5 hover:bg-brand-blue/10 dark:bg-brand-light/10 dark:hover:bg-brand-light/15 text-brand-blue dark:text-brand-light font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition text-[10px]"
                        >
                          <FileText size={12} /> Ver Cédula/RIF
                        </button>
                      </td>
                      <td className="py-4 text-right pr-2">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleVerifyOperator(req.id, true)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold p-2 rounded-xl transition cursor-pointer flex items-center justify-center"
                            title="Aprobar Taller"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleVerifyOperator(req.id, false)}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold p-2 rounded-xl transition cursor-pointer flex items-center justify-center"
                            title="Rechazar Taller"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          ) : (
            <div className="text-center py-16 text-slate-400 dark:text-slate-500">
              <ShieldCheck size={48} className="mx-auto mb-2 opacity-50 text-slate-300" />
              <p className="font-semibold text-sm">No hay solicitudes pendientes en este momento.</p>
              <p className="text-xs text-slate-400">Todos los perfiles de artesanos del Municipio Díaz han sido verificados.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: GESTION DE USUARIOS */}
      {activeTab === "users" && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
          <h2 className="text-xl font-display font-bold border-b border-slate-200/80 dark:border-white/5 pb-4 text-slate-800 dark:text-white">
            Registrar Usuario desde Administración
          </h2>

          {adminSuccess && (
            <div className="bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-4.5 rounded-2xl text-xs">
              {adminSuccess}
            </div>
          )}

          {adminError && (
            <div className="bg-red-500/10 dark:bg-red-950/20 border border-red-500/30 text-red-600 dark:text-red-400 p-4.5 rounded-2xl text-xs">
              {adminError}
            </div>
          )}

          <form onSubmit={handleAdminCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Correo electrónico *</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full rounded-2xl bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                placeholder="nombre@correo.com"
                required
              />
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Contraseña inicial *</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full rounded-2xl bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                placeholder="Contraseña segura"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Nombre completo *</label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full rounded-2xl bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                placeholder="Ej. Joaquín Martínez"
                required
              />
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Rol *</label>
              <select
                value={adminRole}
                onChange={(e) => setAdminRole(e.target.value)}
                className="w-full rounded-2xl bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                required
              >
                <option value="turista">Turista</option>
                <option value="operador">Operador</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Teléfono de contacto (opcional)</label>
              <input
                type="tel"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                className="w-full rounded-2xl bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                placeholder="Ej. +584121234567"
              />
            </div>

            {adminRole === "operador" && (
              <div className="space-y-4 md:col-span-2 border-t border-slate-200 dark:border-white/10 pt-4 mt-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Datos del Operador (Taller/Servicio)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3 md:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Nombre del Taller o Emprendimiento *</label>
                    <input
                      type="text"
                      value={adminWorkshopName}
                      onChange={(e) => setAdminWorkshopName(e.target.value)}
                      className="w-full rounded-2xl bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                      placeholder="Ej. Tejidos Margarita"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Categoría *</label>
                    <select
                      value={adminCategoryId}
                      onChange={(e) => setAdminCategoryId(e.target.value)}
                      className="w-full rounded-2xl bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                    >
                      <option value="">Selecciona Categoría</option>
                      {staticCategories.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Parroquia *</label>
                    <select
                      value={adminParroquiaId}
                      onChange={(e) => setAdminParroquiaId(e.target.value)}
                      className="w-full rounded-2xl bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                    >
                      <option value="">Selecciona Parroquia</option>
                      {staticParroquias.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Ubicación (Mueve el marcador)</label>
                    <div className="h-[250px] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 z-0">
                      <MapContainer
                        center={adminLocation}
                        zoom={13}
                        className="h-full w-full"
                        maxBounds={MUNICIPIO_MAX_BOUNDS}
                        maxBoundsViscosity={1.0}
                        minZoom={12}
                      >
                        <TileLayer {...getMapTileConfig(isDarkMode)} />
                        <MunicipioMaskLayer isDarkMode={isDarkMode} />
                        <MunicipioBorderLayer isDarkMode={isDarkMode} />
                        <MunicipioBoundsController />
                        <MunicipioLocationPicker position={adminLocation} setPosition={setAdminLocation} />
                      </MapContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                disabled={adminLoading}
                className="w-full bg-brand-blue text-white rounded-2xl py-3 font-bold hover:bg-brand-blue/90 transition disabled:opacity-50"
              >
                {adminLoading ? "Registrando usuario..." : "Registrar usuario"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: GESTION DE FERIAS Y EVENTOS */}
      {activeTab === "events" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Create Event Form */}
          <form onSubmit={handleCreateEvent} className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-3xl shadow-xl space-y-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-brand-gold"></div>
            <h2 className="text-xl font-display font-bold text-slate-800 dark:text-white flex items-center gap-1.5 border-b border-slate-200/80 dark:border-white/5 pb-4">
              <Calendar size={20} className="text-brand-gold" />
              {editingEventId ? "Editar Feria o Evento" : "Publicar Feria o Evento"}
            </h2>

            {eventSuccess && (
              <div className="bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-4.5 rounded-2xl text-xs">
                {eventSuccess}
              </div>
            )}

            {eventError && (
              <div className="bg-red-500/10 dark:bg-red-950/20 border border-red-500/30 text-red-600 dark:text-red-400 p-4.5 rounded-2xl text-xs">
                {eventError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 pl-1">Título del Evento *</label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Ej. Feria de Palma del Dátil 2026"
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50/50 dark:bg-slate-800/30 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 pl-1">Descripción</label>
                <textarea
                  rows={2}
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Detalles sobre las exposiciones artesanales, horarios y artistas regionales..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50/50 dark:bg-slate-800/30 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 pl-1">Fecha Inicio *</label>
                  <input
                    type="datetime-local"
                    required
                    value={eventStart}
                    onChange={(e) => setEventStart(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50/50 dark:bg-slate-800/30 border border-gray-200 dark:border-white/10 text-xs focus:outline-none text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 pl-1">Fecha Fin *</label>
                  <input
                    type="datetime-local"
                    required
                    value={eventEnd}
                    onChange={(e) => setEventEnd(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50/50 dark:bg-slate-800/30 border border-gray-200 dark:border-white/10 text-xs focus:outline-none text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 pl-1">Foto o Banner URL</label>
                <input
                  type="url"
                  value={eventImageUrl}
                  onChange={(e) => setEventImageUrl(e.target.value)}
                  placeholder="https://ejemplo.com/banner.jpg"
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50/50 dark:bg-slate-800/30 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Geographic selection of the event */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pl-1">Ubicación Georreferenciada *</label>
                <p className="text-[10px] text-slate-400 pl-1 pb-1">Selecciona en el mapa el punto exacto de la feria.</p>
                <div className="h-52 w-full rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/10 z-0 relative">
                  <MapContainer
                    center={eventLocation}
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
                    <MunicipioLocationPicker position={eventLocation} setPosition={setEventLocation} />
                  </MapContainer>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={publishingEvent}
                className="flex-1 bg-brand-gold hover:bg-brand-gold/90 text-black font-bold py-3 rounded-2xl transition disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer text-sm"
              >
                <Plus size={16} /> {publishingEvent ? "Guardando..." : editingEventId ? "Actualizar Evento" : "Publicar en Mapa"}
              </button>
              {editingEventId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingEventId(null);
                    setEventTitle("");
                    setEventDescription("");
                    setEventStart("");
                    setEventEnd("");
                    setEventImageUrl("");
                    setEventLocation(MUNICIPIO_DIAZ_CENTER);
                  }}
                  className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-bold py-3 px-4 rounded-2xl transition cursor-pointer text-sm"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          {/* Active Events List */}
          <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
            <h2 className="text-xl font-display font-bold border-b border-slate-200/80 dark:border-white/5 pb-4 text-slate-800 dark:text-white">
              Eventos y Ferias Culturales Activas ({events.length})
            </h2>

            {loadingEvents ? (
              <div className="text-center py-10 text-slate-400">
                <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <span>Cargando listado de eventos...</span>
              </div>
            ) : events.length > 0 ? (
              <div className="space-y-4">
                {events.map((ev: any) => (
                  <div key={ev.id} className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/10 border border-slate-200/50 dark:border-white/5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 rounded-xl bg-gray-200 dark:bg-slate-800 overflow-hidden shrink-0">
                        <img src={ev.url_imagen || "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=400"} alt={ev.titulo} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm">{ev.titulo}</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(ev.fecha_inicio).toLocaleDateString("es-ES")} - {new Date(ev.fecha_fin).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(ev)}
                        className={`p-2.5 rounded-xl transition ${
                          new Date(ev.fecha_inicio) <= new Date() 
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed" 
                            : "bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 dark:bg-brand-light/10 dark:text-brand-light dark:hover:bg-brand-light/20 cursor-pointer"
                        }`}
                        title={new Date(ev.fecha_inicio) <= new Date() ? "No se puede editar un evento en curso o finalizado" : "Editar evento"}
                        disabled={new Date(ev.fecha_inicio) <= new Date()}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100 p-2.5 rounded-xl transition cursor-pointer"
                        title="Eliminar evento"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Calendar size={36} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay ferias ni eventos publicados actualmente.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: METRICAS Y ANALITICAS (CULTURALES Y BUSQUEDAS) */}
      {activeTab === "stats" && (
        <div className="space-y-8">
          {/* Metricas Cards Dials */}
          {loadingStats ? (
            <div className="text-center py-20 text-slate-400">
              <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <span>Generando métricas y analíticas de búsqueda...</span>
            </div>
          ) : stats ? (
            <>
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                <div className="glass-panel p-5 rounded-3xl border border-white/20 dark:border-white/5 shadow-md flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-brand-blue/10 text-brand-blue dark:bg-brand-light/10 dark:text-brand-light shrink-0">
                    <Store size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Verificados</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{stats.metricas.operadores_verificados}</p>
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-3xl border border-white/20 dark:border-white/5 shadow-md flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 shrink-0">
                    <Store size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pendientes</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{stats.metricas.operadores_pendientes}</p>
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-3xl border border-white/20 dark:border-white/5 shadow-md flex items-center gap-3">
                  <div className="p-3 rounded-2xl chip-gold shrink-0">
                    <MessageSquare size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Reseñas Totales</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{stats.metricas.total_resenas}</p>
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-3xl border border-white/20 dark:border-white/5 shadow-md flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 shrink-0">
                    <Award size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Visitas QR</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{stats.metricas.resenas_verificadas_qr}</p>
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-3xl border border-white/20 dark:border-white/5 shadow-md flex items-center gap-3 col-span-2 md:col-span-1">
                  <div className="p-3 rounded-2xl bg-slate-500/10 text-slate-500 shrink-0">
                    <Users size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Usuarios</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{stats.metricas.total_usuarios}</p>
                  </div>
                </div>
              </div>

              {/* Graphic Charts (SVG distributions) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Searches by Category */}
                <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
                  <h3 className="text-lg font-display font-bold text-slate-800 dark:text-white flex items-center gap-1.5 border-b border-slate-200/80 dark:border-white/5 pb-4">
                    <TrendingUp size={18} className="text-brand-blue" />
                    Interés por Categoría (Búsquedas)
                  </h3>

                  {stats.busquedas_por_categoria.length > 0 ? (
                    <div className="space-y-4">
                      {stats.busquedas_por_categoria.map((cat: any, idx: number) => {
                        const total = stats.busquedas_por_categoria.reduce((acc: number, c: any) => acc + c.cantidad, 0);
                        const pct = total > 0 ? (cat.cantidad / total) * 100 : 0;
                        return (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-700 dark:text-slate-300">{cat.categoria_nombre}</span>
                              <span className="text-slate-400">{cat.cantidad} búsquedas ({pct.toFixed(0)}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-brand-blue dark:bg-brand-light h-full rounded-full transition-all duration-1000"
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center py-10 text-xs text-slate-400">Aún no se registran búsquedas para mapear tendencias.</p>
                  )}
                </div>

                {/* Searches by Parroquia */}
                <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
                  <h3 className="text-lg font-display font-bold text-slate-800 dark:text-white flex items-center gap-1.5 border-b border-slate-200/80 dark:border-white/5 pb-4">
                    <MapPin size={18} className="text-brand-gold" />
                    Demanda Territorial (Búsquedas por Parroquia)
                  </h3>

                  {stats.busquedas_por_parroquia.length > 0 ? (
                    <div className="space-y-4">
                      {stats.busquedas_por_parroquia.map((parr: any, idx: number) => {
                        const total = stats.busquedas_por_parroquia.reduce((acc: number, p: any) => acc + p.cantidad, 0);
                        const pct = total > 0 ? (parr.cantidad / total) * 100 : 0;
                        return (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-700 dark:text-slate-300 capitalize">{parr.parroquia_nombre}</span>
                              <span className="text-slate-400">{parr.cantidad} ({pct.toFixed(0)}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-brand-gold h-full rounded-full transition-all duration-1000"
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center py-10 text-xs text-slate-400">Aún no hay búsquedas geolocalizadas registradas.</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="glass-panel p-10 rounded-3xl text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Problema al cargar métricas</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">No pudimos conectar con la base de datos para obtener las estadísticas. Por favor, intenta recargar la página más tarde.</p>
              <button onClick={loadStats} className="mt-4 px-6 py-2 bg-brand-blue/10 text-brand-blue dark:bg-brand-light/10 dark:text-brand-light font-bold rounded-xl text-sm transition hover:bg-brand-blue/20">
                Reintentar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Document verification Modal */}
      {activeDocument && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-100 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative">
            <h3 className="font-bold text-lg">Documento RIF/Cédula Cargado</h3>
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-white/5 shadow-inner">
              <img src={activeDocument} alt="Documento verificador" className="w-full h-full object-contain" />
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveDocument(null)}
                className="bg-brand-blue text-white px-5 py-2.5 rounded-xl font-bold cursor-pointer hover:shadow-lg transition text-xs"
              >
                Cerrar Documento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardView;
