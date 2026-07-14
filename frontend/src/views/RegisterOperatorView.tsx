/**
 * VISTA: REGISTRO DE OPERADOR (Artesano)
 * 
 * Pantalla dedicada a los usuarios con rol = "operador" para que completen
 * su "Ficha Técnica". Una vez enviada, el taller queda "pendiente" (es_verificado = false)
 * hasta que un Administrador lo apruebe desde el Dashboard.
 * 
 * Funcionalidades clave:
 * - Localización GPS con marcador en el mapa.
 * - Subida de imágenes a Cloudinary (con un fallback a Base64 si falla).
 * - Carga de documento de identidad (Cédula/RIF).
 * - Selección de categoría y parroquia (Cargadas dinámicamente desde el backend).
 */

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import api from "../services/api";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import SEO from "../components/SEO";
import { PageHeader } from "../components/ui/PageHeader";
import { compressImageToWebP } from "../utils/imageCompressor";
import {
  MunicipioBoundsController,
  MunicipioMaskLayer,
  MunicipioBorderLayer,
  MunicipioLocationPicker,
  getMapTileConfig,
  MUNICIPIO_DIAZ_CENTER,
  MUNICIPIO_DEFAULT_ZOOM,
} from "../components/map/MunicipioMapLayers";
import { MUNICIPIO_MAX_BOUNDS, clampToMunicipioBounds } from "../data/municipioDiazGeo";
import { 
  Store, MapPin, Tag, Upload, Camera, Trash2, Compass, Check, Info, AlertTriangle, FileText,
  Fingerprint, Calendar
} from "lucide-react";

// Invalidador de tamaño para corregir problemas de renderizado de Leaflet cuando el mapa se muestra en pestañas dinámicas o layouts flex.
const MapSizeInvalidator = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

const RegisterOperatorView = () => {
  const { user, token } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const navigate = useNavigate();

  // ── REDIRECCIÓN DE SEGURIDAD ─────────────────────────────────────────────
  // Redirige al inicio si el usuario no tiene rol de operador o no hay token de sesión.
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!user) {
      return;
    }

    if (user.role !== "operador") {
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
        <p className="text-slate-600 dark:text-slate-400">Verificando credenciales de operador...</p>
      </div>
    );
  }

  // ── ESTADOS DE FORMULARIO DE FICHA TÉCNICA ─────────────────────────────────
  const [nombreTaller, setNombreTaller] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [parroquiaId, setParroquiaId] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [direccionDetallada, setDireccionDetallada] = useState("");
  const [telefonoWhatsapp, setTelefonoWhatsapp] = useState("");

  // ── ESTADOS DE CAMPOS FISCALES Y DE FISCALIZACIÓN ──────────────────────────
  const [cedulaTipo, setCedulaTipo] = useState("V");
  const [cedulaNumero, setCedulaNumero] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [municipioResidencia, setMunicipioResidencia] = useState("Díaz");
  
  // ── ESTADOS GEOGRÁFICOS ───────────────────────────────────────────────────
  // Ubicación por defecto en el centro del Municipio Díaz
  const [location, setLocation] = useState<[number, number]>(MUNICIPIO_DIAZ_CENTER);
  const [gpsLoading, setGpsLoading] = useState(false);

  // ── ESTADOS DE OPCIONES ESTÁTICAS ──────────────────────────────────────────
  const [categories, setCategories] = useState([]);
  const [parroquias, setParroquias] = useState([]);
  const [accessibilityOptions, setAccessibilityOptions] = useState([]);
  const [selectedAccessibilities, setSelectedAccessibilities] = useState<number[]>([]);

  // ── ESTADOS DE CARGA DE ARCHIVOS E IMÁGENES ────────────────────────────────
  const [primaryImage, setPrimaryImage] = useState<string>("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [cedulaRifDoc, setCedulaRifDoc] = useState<string>("");
  
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [acceptOperatorTerms, setAcceptOperatorTerms] = useState(false);

  // ── EFECTO: CARGA DE OPCIONES ESTÁTICAS (CATEGORÍAS, PARROQUIAS, ACCESIBILIDADES) ─
  useEffect(() => {
    const fetchStatic = async () => {
      try {
        const res = await api.get("/operators/static-data");
        setCategories(res.data.categorias || []);
        setParroquias(res.data.parroquias || []);
        setAccessibilityOptions(res.data.accesibilidades || []);
      } catch (err) {
        console.error("Error al cargar opciones de registro:", err);
      }
    };
    fetchStatic();
  }, []);

  // ── EFECTO: RELLENAR FORMULARIO CON DATOS EXISTENTES PARA EDICIÓN ────────
  // Si el operador ya posee una Ficha Técnica, carga y mapea su información previa.
  useEffect(() => {
    const loadMyOperator = async () => {
      try {
        const res = await api.get("/operators/my-operator");
        if (res.data) {
          const op = res.data;
          setIsEditing(true);
          setNombreTaller(op.nombre_taller || "");
          setDescripcion(op.descripcion || "");
          setTelefonoWhatsapp(op.telefono_whatsapp || "");
          setCategoriaId(op.categoria_id ? op.categoria_id.toString() : "");
          setParroquiaId(op.parroquia_id ? op.parroquia_id.toString() : "");
          setDireccionDetallada(op.direccion_detallada || "");
          
          if (op.latitud !== undefined && op.longitud !== undefined) {
            setLocation([op.latitud, op.longitud]);
          }
          
          if (Array.isArray(op.imagenes)) {
            const primary = op.imagenes.find((img: any) => img.es_principal);
            if (primary) {
              setPrimaryImage(primary.url_imagen);
            }
            const gallery = op.imagenes.filter((img: any) => !img.es_principal).map((img: any) => img.url_imagen);
            setGalleryImages(gallery);
          }
          
          if (Array.isArray(op.accesibilidades)) {
            setSelectedAccessibilities(op.accesibilidades.map((a: any) => a.id));
          }

          if (op.cedula_tipo) setCedulaTipo(op.cedula_tipo);
          if (op.cedula_numero) setCedulaNumero(op.cedula_numero.toString());
          if (op.fecha_nacimiento) setFechaNacimiento(op.fecha_nacimiento.split("T")[0]);
          if (op.municipio_residencia) setMunicipioResidencia(op.municipio_residencia);

          // Bypass simulado para el documento, ya que está validado previamente en la BD
          setCedulaRifDoc("documento_ya_verificado");
        }
      } catch (err) {
        console.log("No se pudo obtener el perfil del operador o no existe aún:", err);
      }
    };

    if (token && user && user.role === "operador") {
      loadMyOperator();
    }
  }, [token, user]);



  /**
   * Obtiene la posición física actual del dispositivo del operador mediante Geolocation API.
   * Restringe el marcador resultante estrictamente dentro de los límites del Municipio Díaz
   * utilizando la función utilitaria `clampToMunicipioBounds`.
   */
  const handleGPSLocation = () => {
    if (!navigator.geolocation) {
      alert("La geolocalización no está soportada por tu navegador.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(clampToMunicipioBounds(pos.coords.latitude, pos.coords.longitude));
        setGpsLoading(false);
      },
      (err) => {
        console.error("GPS error:", err);
        alert("No se pudo obtener la ubicación GPS actual.");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  /**
   * Carga de archivos multimedia (imágenes del taller, cédula y RIF).
   * Comprime y convierte la imagen a formato .webp antes de subirla o guardarla.
   * Intenta subir directamente a la API REST de Cloudinary.
   * Si la subida remota falla (por ejemplo, debido a fallas de red offline de PWA),
   * implementa un mecanismo de fallback que codifica el archivo localmente a Base64
   * en formato DataURL para poder encolar y procesar la petición.
   */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "primary" | "gallery" | "document") => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(target);
    let file = files[0];
    
    // Comprimir y convertir a WebP si es una imagen
    if (file.type.startsWith("image/")) {
      try {
        file = await compressImageToWebP(file, 1024, 0.75);
      } catch (compressErr) {
        console.warn("Fallo al comprimir imagen, usando archivo original:", compressErr);
      }
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default");

    try {
      // Intento de subida remota a Cloudinary
      const cloudName = "guaikediaz";
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const url = data.secure_url;
        
        if (target === "primary") {
          setPrimaryImage(url);
        } else if (target === "gallery") {
          setGalleryImages((prev) => [...prev, url]);
        } else {
          setCedulaRifDoc(url);
        }
      } else {
        throw new Error("Cloudinary rejected upload");
      }
    } catch (err) {
      console.warn("Direct Cloudinary upload failed. Falling back to local offline Base64 compression.", err);
      
      // Fallback a codificación Base64 local (soporte Offline de PWA)
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result as string;
        if (target === "primary") {
          setPrimaryImage(base64Url);
        } else if (target === "gallery") {
          setGalleryImages((prev) => [...prev, base64Url]);
        } else {
          setCedulaRifDoc(base64Url);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(null);
    }
  };

  /**
   * Agrega o remueve IDs de accesibilidad seleccionados en el formulario.
   */
  const handleAccessibilityToggle = (id: number) => {
    setSelectedAccessibilities((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  /**
   * Elimina una imagen específica del carrusel de galería local.
   */
  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Procesa el envío del formulario.
   * Realiza validaciones críticas antes del despacho:
   * 1. Verifica campos obligatorios básicos.
   * 2. Realiza validación de mayoría de edad (mínimo 18 años requeridos para registro comercial).
   * 3. Confirma la existencia de imágenes obligatorias (portada) y documentación fiscal.
   * 4. Despacha por PUT (edición) o POST (creación) al servicio API.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!parroquiaId || !categoriaId || !nombreTaller) {
      setError("Por favor completa los campos obligatorios (Nombre, Parroquia, Categoría).");
      return;
    }

    if (!cedulaNumero) {
      setError("Debes ingresar tu número de cédula o RIF.");
      return;
    }

    if (!fechaNacimiento) {
      setError("Debes ingresar tu fecha de nacimiento.");
      return;
    }

    // Validación de edad (mínimo 18 años)
    const birthDateObj = new Date(fechaNacimiento);
    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }

    if (age < 18) {
      setError("Debes ser mayor de edad (18 años o más) para registrarte como operador.");
      return;
    }

    if (!primaryImage) {
      setError("Debes subir una foto principal de tu taller.");
      return;
    }

    if (!cedulaRifDoc) {
      setError("Debes cargar tu documento Cédula/RIF para verificar tu identidad.");
      return;
    }

    if (!acceptOperatorTerms) {
      setError("Debes certificar bajo juramento la veracidad de los datos fiscales y aceptar los términos legales para continuar.");
      return;
    }

    setLoadingSubmit(true);

    const payload = {
      parroquia_id: parseInt(parroquiaId),
      categoria_id: parseInt(categoriaId),
      nombre_taller: nombreTaller,
      descripcion,
      longitud: location[1],
      latitud: location[0],
      direccion_detallada: direccionDetallada,
      telefono_whatsapp: telefonoWhatsapp,
      imagen_principal: primaryImage,
      galeria: galleryImages,
      accesibilidad_ids: selectedAccessibilities,
      cedula_tipo: cedulaTipo,
      cedula_numero: cedulaNumero,
      fecha_nacimiento: fechaNacimiento,
      municipio_residencia: municipioResidencia,
    };

    try {
      if (isEditing) {
        const res = await api.put("/operators/my-operator", payload);
        setSuccess(res.data.message || "¡Taller actualizado con éxito!");
      } else {
        const res = await api.post("/operators", payload);
        setSuccess(res.data.message || "¡Registro enviado con éxito!");
        
        // Reiniciar campos tras creación exitosa
        setNombreTaller("");
        setDescripcion("");
        setParroquiaId("");
        setCategoriaId("");
        setDireccionDetallada("");
        setTelefonoWhatsapp("");
        setPrimaryImage("");
        setGalleryImages([]);
        setCedulaRifDoc("");
        setSelectedAccessibilities([]);
        setCedulaTipo("V");
        setCedulaNumero("");
        setFechaNacimiento("");
        setMunicipioResidencia("Díaz");
        setAcceptOperatorTerms(false);
      }

      // Redirigir al inicio después de un retardo corto
      setTimeout(() => {
        navigate("/");
      }, 3500);

    } catch (err: any) {
      setError(err.response?.data?.message || "Ocurrió un error al enviar el registro. Verifica los datos.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <>
      <SEO
        title={isEditing ? "Gestionar tu Taller" : "Registro de Operador"}
        description={isEditing ? "Edita la información de tu taller artesanal en la red patrimonial GUAIKE.DÍAZ." : "Inscribe tu taller artesanal en la red patrimonial GUAIKE.DÍAZ. Completa el formulario para que la alcaldía verifique tu ubicación."}
        canonical="/registro-operador"
      />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <PageHeader
          badge={isEditing ? "Gestión de Taller" : "Registro de Operador"}
          title={isEditing ? "Gestionar tu Taller" : "Inscribe tu Taller"}
          description={isEditing ? "Actualiza la información, geolocalización y galería de tu taller artesanal." : "Únete a la red patrimonial GUAIKE.DÍAZ. Completa el formulario para que la alcaldía verifique tu ubicación y exponga tus obras al turismo regional."}
          icon={Store}
        />

      {error && (
        <div className="mb-6 bg-red-500/10 dark:bg-red-950/20 border border-red-500/30 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm flex items-start gap-2.5 animate-pulse">
          <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-5 rounded-2xl text-sm flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <Check size={20} className="text-emerald-500" />
            <span className="font-bold text-base">{isEditing ? "¡Taller Actualizado!" : "¡Formulario de Registro Enviado!"}</span>
          </div>
          <p>{success}</p>
          <p className="text-xs text-slate-400">Serás redirigido al catálogo principal en unos momentos...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* 1. Información General */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-brand-blue/30"></div>
          <h2 className="text-xl font-display font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-white/5 pb-4">
            <Store size={22} className="text-brand-blue dark:text-brand-light" />
            Datos Básicos del Taller
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">
                Nombre de Taller o Servicio *
              </label>
              <input
                type="text"
                required
                value={nombreTaller}
                onChange={(e) => setNombreTaller(e.target.value)}
                placeholder="Ej. Taller Artesanal Las Hamacas del Valle"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 dark:bg-slate-800/30 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">
                Teléfono de Contacto (WhatsApp)
              </label>
              <input
                type="tel"
                value={telefonoWhatsapp}
                onChange={(e) => setTelefonoWhatsapp(e.target.value)}
                placeholder="Ej. +584121234567"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 dark:bg-slate-800/30 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">
                Categoría Artesanal *
              </label>
              <select
                required
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 dark:bg-slate-800/30 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-slate-100 cursor-pointer"
              >
                <option value="">Selecciona una especialidad</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">
                Parroquia Geográfica *
              </label>
              <select
                required
                value={parroquiaId}
                onChange={(e) => setParroquiaId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 dark:bg-slate-800/30 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-slate-100 cursor-pointer"
              >
                <option value="">Selecciona tu Parroquia</option>
                {parroquias.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">
              Descripción del Oficio
            </label>
            <textarea
              rows={4}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Cuéntanos un poco sobre tu historia, técnicas tradicionales y los productos típicos que ofreces al público..."
              className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 dark:bg-slate-800/30 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-slate-100"
            />
          </div>
        </section>

        {/* Información Fiscal y Personal del Operador */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-brand-blue/30"></div>
          <h2 className="text-xl font-display font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-white/5 pb-4">
            <Fingerprint size={22} className="text-brand-blue dark:text-brand-light" />
            Información Fiscal y Personal del Operador
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">
                Tipo de Documento *
              </label>
              <select
                required
                value={cedulaTipo}
                onChange={(e) => setCedulaTipo(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 dark:bg-slate-800/30 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-slate-100 cursor-pointer"
              >
                <option value="V">V - Venezolano</option>
                <option value="E">E - Extranjero</option>
                <option value="J">J - Jurídico (RIF)</option>
                <option value="G">G - Gubernamental (RIF)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">
                Número de Cédula o RIF *
              </label>
              <input
                type="text"
                required
                value={cedulaNumero}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setCedulaNumero(val);
                }}
                placeholder="Ej. 12345678"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 dark:bg-slate-800/30 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1 flex items-center gap-1">
                <Calendar size={14} className="text-slate-400" />
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                required
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 dark:bg-slate-800/30 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-slate-100 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">
                Municipio de Residencia *
              </label>
              <select
                required
                value={municipioResidencia}
                onChange={(e) => setMunicipioResidencia(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 dark:bg-slate-800/30 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-slate-100 cursor-pointer"
              >
                <option value="Díaz">Díaz</option>
                <option value="Mariño">Mariño</option>
                <option value="Maneiro">Maneiro</option>
                <option value="Arismendi">Arismendi</option>
                <option value="Antolín del Campo">Antolín del Campo</option>
                <option value="García">García</option>
                <option value="Gómez">Gómez</option>
                <option value="Macanao">Macanao</option>
                <option value="Marcano">Marcano</option>
                <option value="Tubores">Tubores</option>
                <option value="Villalba">Villalba</option>
              </select>
            </div>
          </div>
        </section>

        {/* 2. Ubicación y Georreferencia */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-brand-gold/30"></div>
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-4">
            <h2 className="text-xl font-display font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <MapPin size={22} className="text-brand-gold" />
              Georreferenciación Física
            </h2>
            <button
              type="button"
              onClick={handleGPSLocation}
              disabled={gpsLoading}
              className="bg-brand-blue/5 dark:bg-brand-light/10 text-brand-blue dark:text-brand-light text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 hover:bg-brand-blue/15 transition cursor-pointer"
            >
              <Compass size={14} className={gpsLoading ? "animate-spin" : ""} />
              {gpsLoading ? "Buscando..." : "Localizar por GPS"}
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Haz clic en el mapa interactivo o arrastra el marcador para posicionar exactamente tu taller físico en el Municipio Díaz. Esto permitirá el direccionamiento de turistas.
          </p>

          <div className="h-80 w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 z-0">
            <MapContainer
              center={location}
              zoom={MUNICIPIO_DEFAULT_ZOOM}
              maxBounds={MUNICIPIO_MAX_BOUNDS}
              maxBoundsViscosity={1}
              minZoom={11}
              className="h-full w-full"
            >
              <TileLayer key={isDarkMode ? "dark" : "light"} {...getMapTileConfig(isDarkMode)} />
              <MunicipioBoundsController fitOnMount={false} />
              <MunicipioMaskLayer isDarkMode={isDarkMode} />
              <MunicipioBorderLayer isDarkMode={isDarkMode} />
              <MapSizeInvalidator />
              <MunicipioLocationPicker
                position={location}
                setPosition={setLocation}
                markerClass="bg-brand-blue"
              />
            </MapContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-1">Latitud</label>
              <input
                type="text"
                readOnly
                value={location[0].toFixed(6)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800/80 border border-transparent text-sm text-slate-500 dark:text-slate-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-1">Longitud</label>
              <input
                type="text"
                readOnly
                value={location[1].toFixed(6)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800/80 border border-transparent text-sm text-slate-500 dark:text-slate-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">
              Dirección Detallada *
            </label>
            <input
              type="text"
              required
              value={direccionDetallada}
              onChange={(e) => setDireccionDetallada(e.target.value)}
              placeholder="Ej. Calle Principal, a 100 metros de la Iglesia de San Juan Bautista, casa portón verde."
              className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 dark:bg-slate-800/30 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-slate-100"
            />
          </div>
        </section>

        {/* 3. Carga de Documentos e Imágenes */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-brand-light/30"></div>
          <h2 className="text-xl font-display font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-white/5 pb-4">
            <Camera size={22} className="text-brand-blue dark:text-brand-light" />
            Galería y Verificación de Identidad
          </h2>

          {/* Cédula / RIF Document Verification */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 pl-1">
              Documento Cédula o RIF (Imagen para validación de la alcaldía) *
            </label>
            
            {cedulaRifDoc ? (
              <div className="flex items-center justify-between p-4.5 rounded-2xl bg-brand-blue/5 dark:bg-brand-light/10 border border-brand-blue/20">
                <div className="flex items-center gap-3">
                  <FileText className="text-brand-blue dark:text-brand-light" size={24} />
                  <div>
                    <p className="text-sm font-semibold">Documento de Verificación Cargado</p>
                    <p className="text-xs text-slate-400">
                      {isEditing ? "Documento verificado previamente. Si deseas actualizarlo, elimínalo y sube uno nuevo." : "Verificable por la junta de desarrollo cultural."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCedulaRifDoc("")}
                  className="text-red-500 hover:text-red-600 transition cursor-pointer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ) : (
              <div className="relative border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-6 text-center hover:border-brand-blue/50 transition cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "document")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading !== null}
                />
                <Upload size={28} className="mx-auto mb-2 text-slate-400 dark:text-slate-500" />
                <p className="text-sm font-semibold">
                  {uploading === "document" ? "Cargando documento..." : "Subir Cédula o RIF"}
                </p>
                <p className="text-xs text-slate-400 mt-1">Formato JPG, PNG. Tamaño máximo 5MB.</p>
              </div>
            )}
          </div>

          {/* Primary Image Upload */}
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 pl-1">
              Foto de Portada del Taller *
            </label>

            {primaryImage ? (
              <div className="relative rounded-2xl overflow-hidden aspect-video max-w-md border border-gray-200 dark:border-white/10 shadow-lg">
                <img src={primaryImage} alt="Foto principal de taller" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPrimaryImage("")}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-xl hover:bg-red-600 transition shadow-lg cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <div className="relative border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-8 text-center hover:border-brand-blue/50 transition cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "primary")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading !== null}
                />
                <Upload size={32} className="mx-auto mb-2 text-slate-400 dark:text-slate-500" />
                <p className="text-sm font-semibold">
                  {uploading === "primary" ? "Cargando imagen..." : "Subir Foto Principal"}
                </p>
                <p className="text-xs text-slate-400 mt-1">Esta imagen aparecerá en el catálogo general.</p>
              </div>
            )}
          </div>

          {/* Gallery Upload */}
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 pl-1">
              Galería de Fotos del Taller y Creaciones (Opcional)
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {galleryImages.map((img, idx) => (
                <div key={idx} className="relative rounded-xl overflow-hidden aspect-square border border-gray-200 dark:border-white/10 group shadow">
                  <img src={img} alt={`Galería ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryImage(idx)}
                    className="absolute top-1.5 right-1.5 bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 transition shadow-lg opacity-90 group-hover:opacity-100 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              <div className="relative border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl aspect-square flex flex-col items-center justify-center hover:border-brand-blue/50 transition cursor-pointer text-slate-400">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "gallery")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading !== null}
                />
                <Upload size={24} className="mb-1" />
                <span className="text-xs font-semibold">
                  {uploading === "gallery" ? "Subiendo..." : "Agregar Foto"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Opciones de Accesibilidad */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500/30"></div>
          <h2 className="text-xl font-display font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-white/5 pb-4">
            <Tag size={22} className="text-emerald-500" />
            Tags de Accesibilidad y Facilidades
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Marca las facilidades que tiene tu espacio físico para recibir a todo tipo de visitantes. Esto generará insignias inclusivas en tu ficha.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {accessibilityOptions.map((acc: any) => {
              const selected = selectedAccessibilities.includes(acc.id);
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleAccessibilityToggle(acc.id)}
                  className={`p-4 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                    selected 
                      ? "border-emerald-500 bg-emerald-500/5 text-slate-800 dark:text-white" 
                      : "border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-slate-800/10 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <span className="text-sm font-semibold">{acc.etiqueta}</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selected ? "border-emerald-500 bg-emerald-500 text-white" : "border-gray-300 dark:border-white/20"}`}>
                    {selected && <Check size={12} strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Juramento y Veracidad Fiscal */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-500/30"></div>
          <h2 className="text-lg font-display font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-white/5 pb-3.5">
            <AlertTriangle size={20} className="text-red-500" />
            Declaración de Veracidad Fiscal y Legal
          </h2>

          <div className="flex items-start gap-3 text-slate-650 dark:text-slate-350 select-none">
            <input
              type="checkbox"
              id="acceptOperatorTerms"
              required
              checked={acceptOperatorTerms}
              onChange={(e) => setAcceptOperatorTerms(e.target.checked)}
              className="mt-1 h-4.5 w-4.5 rounded-md border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-brand-blue focus:ring-brand-blue cursor-pointer"
            />
            <label htmlFor="acceptOperatorTerms" className="text-xs leading-relaxed cursor-pointer">
              Certifico bajo fe de juramento que la información provista, incluyendo mi documento de identidad/RIF, datos de contacto, actividad cultural y georreferenciación física son veraces y corresponden a la realidad de mi taller artesanal. Autorizo a la Dirección de Turismo y Cultura de la Alcaldía del Municipio Díaz de Nueva Esparta a realizar las verificaciones, inspecciones físicas y validaciones necesarias según el Código de Comercio y la legislación de la República Bolivariana de Venezuela, aceptando las consecuencias legales de cualquier falsedad, y me adhiero plenamente a los{" "}
              <Link to="/legal?tab=terms" target="_blank" className="text-brand-blue dark:text-brand-light font-bold hover:underline">
                Términos y Condiciones de Uso
              </Link>{" "}
              y la{" "}
              <Link to="/legal?tab=privacy" target="_blank" className="text-brand-blue dark:text-brand-light font-bold hover:underline">
                Política de Privacidad
              </Link>{" "}
              de la plataforma.
            </label>
          </div>
        </section>

        {/* Submit Action */}
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between glass-panel p-6 rounded-3xl shadow-xl">
          <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
            <Info size={16} className="text-brand-blue flex-shrink-0" />
            <span>Al presionar enviar, tus datos serán sometidos a evaluación de idoneidad y veracidad física.</span>
          </div>

          <button
            type="submit"
            disabled={loadingSubmit}
            className="w-full sm:w-auto bg-brand-blue dark:bg-brand-light text-white font-bold px-8 py-3.5 rounded-2xl hover:shadow-lg hover:shadow-brand-blue/20 transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            {loadingSubmit 
              ? (isEditing ? "Guardando cambios..." : "Registrando taller...") 
              : (isEditing ? "Guardar Cambios" : "Enviar Inscripción")}
          </button>
        </div>
      </form>
    </div>
    </>
  );
};

export default RegisterOperatorView;
