import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import api from "../services/api";
import L from "leaflet";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { 
  Store, 
  MapPin, 
  Tag, 
  Upload, 
  Camera, 
  Trash2, 
  Compass, 
  Check, 
  Info, 
  AlertTriangle,
  FileText
} from "lucide-react";

// Custom Leaflet Pin Icon Creator
const createDivIcon = (colorClass: string, iconHtml: string) => {
  return L.divIcon({
    html: `<div class="w-9 h-9 rounded-full ${colorClass} text-white flex items-center justify-center border-2 border-white shadow-lg transform transition duration-200 hover:scale-110">${iconHtml}</div>`,
    className: "custom-div-icon",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -32],
  });
};

// Map click event listener for picking location
const LocationPicker = ({ 
  position, 
  setPosition 
}: { 
  position: [number, number]; 
  setPosition: (coords: [number, number]) => void; 
}) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend(e) {
          const marker = e.target;
          const pos = marker.getLatLng();
          setPosition([pos.lat, pos.lng]);
        },
      }}
      icon={createDivIcon("bg-brand-blue", '<span class="w-3 h-3 rounded-full bg-white block"></span>')}
    />
  );
};

const RegisterOperatorView = () => {
  const { user, token } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const navigate = useNavigate();

  // Redirect if not logged in or not an operator role
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

  // Form states
  const [nombreTaller, setNombreTaller] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [parroquiaId, setParroquiaId] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [direccionDetallada, setDireccionDetallada] = useState("");
  const [telefonoWhatsapp, setTelefonoWhatsapp] = useState("");
  
  // Geolocation
  const [location, setLocation] = useState<[number, number]>([11.018, -63.95]); // Default Municipio Diaz
  const [gpsLoading, setGpsLoading] = useState(false);

  // Accessibilities & Static Options
  const [categories, setCategories] = useState([]);
  const [parroquias, setParroquias] = useState([]);
  const [accessibilityOptions, setAccessibilityOptions] = useState([]);
  const [selectedAccessibilities, setSelectedAccessibilities] = useState<number[]>([]);

  // Images & Document Uploads
  const [primaryImage, setPrimaryImage] = useState<string>("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [cedulaRifDoc, setCedulaRifDoc] = useState<string>("");
  
  const [uploading, setUploading] = useState<string | null>(null); // Track upload targets
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Load Categories and Accessibility Tags
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

  // Try to locate operator's current location using GPS
  const handleGPSLocation = () => {
    if (!navigator.geolocation) {
      alert("La geolocalización no está soportada por tu navegador.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation([pos.coords.latitude, pos.coords.longitude]);
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

  // Cloudinary Direct Upload with elegant base64 DataURL fallback
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "primary" | "gallery" | "document") => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(target);
    const file = files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default"); // standard default preset

    try {
      // Direct Real Upload to Cloudinary using standard API
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
      
      // Fallback base64 representation
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

  const handleAccessibilityToggle = (id: number) => {
    setSelectedAccessibilities((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!parroquiaId || !categoriaId || !nombreTaller) {
      setError("Por favor completa los campos obligatorios (Nombre, Parroquia, Categoría).");
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
    };

    try {
      const res = await api.post("/operators", payload);
      setSuccess(res.data.message || "¡Registro enviado con éxito!");
      
      // Clear form
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

      // Redirect operator after short delay
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-8 text-center max-w-2xl mx-auto">
        <span className="text-xs uppercase tracking-widest font-extrabold text-brand-blue dark:text-brand-light bg-brand-blue/10 dark:bg-brand-light/10 px-3.5 py-1.5 rounded-full mb-3 inline-block">
          Registro de Operador
        </span>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight mb-2 text-slate-800 dark:text-white">
          Inscribe tu Taller
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
          Únete a la red patrimonial GUAIKE.DÍAZ. Completa el formulario para que la alcaldía verifique tu ubicación y exponga tus obras al turismo regional.
        </p>
      </header>

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
            <span className="font-bold text-base">¡Formulario de Registro Enviado!</span>
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
            <MapContainer center={location} zoom={13} className="h-full w-full">
              <TileLayer
                attribution={
                  isDarkMode
                    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                }
                url={
                  isDarkMode
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                }
              />
              <LocationPicker position={location} setPosition={setLocation} />
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
                    <p className="text-xs text-slate-400">Verificable por la junta de desarrollo cultural.</p>
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
            {loadingSubmit ? "Registrando taller..." : "Enviar Inscripción"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterOperatorView;
