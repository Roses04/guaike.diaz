import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import api from "../services/api";
import SEO from "../components/SEO";
import { PageHeader } from "../components/ui/PageHeader";
import { 
  Camera, 
  QrCode, 
  ArrowLeft, 
  AlertTriangle, 
  Cpu
} from "lucide-react";


const QRScannerView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [manualCode, setManualCode] = useState("");
  
  // Referencia mutable para instanciar y controlar el lector Html5Qrcode
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerId = "qr-reader-target";

  /**
   * Detiene el flujo de captura de la cámara si se encuentra activo.
   */
  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        setCameraActive(false);
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  useEffect(() => {
    // Instanciar la clase de lectura de códigos QR vinculándola al div objetivo
    html5QrCodeRef.current = new Html5Qrcode(scannerId);

    // Arrancar la cámara automáticamente al montar el componente
    startCamera();

    return () => {
      // Garantizar la liberación de la cámara al desmontar la vista
      stopScanner();
    };
  }, []);

  /**
   * Solicita acceso a la cámara trasera e inicia la decodificación continua de fotogramas.
   */
  const startCamera = async () => {
    setValidationError("");
    if (!html5QrCodeRef.current) return;

    try {
      await html5QrCodeRef.current.start(
        { facingMode: "environment" }, // Prioriza el uso de la cámara trasera
        {
          fps: 15,
          qrbox: (width, height) => {
            const size = Math.min(width, height) * 0.65;
            return { width: size, height: size };
          }
        },
        (decodedText) => {
          // Callback de lectura exitosa del código QR
          handleValidateQr(decodedText);
          stopScanner();
        },
        () => {
          // Callback de fallo: se ignora silenciosamente mientras busca patrones
        }
      );
      setCameraActive(true);
    } catch (err: any) {
      console.warn("Could not start physical camera:", err);
      setValidationError("No se pudo acceder a la cámara. Concede permisos o usa la simulación manual.");
      setCameraActive(false);
    }
  };

  /**
   * Despacha el UUID leído hacia la base de datos para verificar autenticidad.
   * Si es un código QR válido de un operador verificado, redirige de vuelta a la ficha
   * del operador inyectando el estado `qrVerified: true` para desbloquear reseñas.
   */
  const handleValidateQr = async (code: string) => {
    setValidating(true);
    setValidationError("");
    
    try {
      const res = await api.post("/reviews/validate-qr", { qr_uuid: code });
      
      if (res.data.valido) {
        setValidating(false);
        // Redirecciona al taller marcando la visita física como verificada
        navigate(`/operador/${id}`, { 
          state: { qrVerified: true },
          replace: true
        });
      } else {
        setValidationError(res.data.message || "Código QR inválido.");
        setValidating(false);
      }
    } catch (err: any) {
      console.error("QR Validation error:", err);
      setValidationError(err.response?.data?.message || "Error al validar el código QR física.");
      setValidating(false);
    }
  };

  /**
   * Procesa la simulación manual para pruebas en entornos de desarrollo sin webcam.
   */
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleValidateQr(manualCode.trim());
  };


  return (
    <>
      <SEO
        title="Escáner de Visita"
        description="Escanea el código QR de un taller artesanal para registrar tu visita y presencia física en el Municipio Díaz."
        canonical={`/operador/${id}/escanear`}
      />
      <div className="container mx-auto px-4 py-8 max-w-md flex-grow flex flex-col justify-center">
        {/* Back to Operator Link */}
        <Link 
          to={`/operador/${id}`} 
          className="mb-6 text-sm font-bold text-slate-500 hover:text-brand-blue flex items-center gap-1 self-start"
          onClick={stopScanner}
        >
          <ArrowLeft size={16} /> Volver al Taller
        </Link>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden border border-white/20 dark:border-white/5 space-y-6">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-blue via-brand-light to-brand-gold"></div>

          <PageHeader
            align="center"
            title="Escáner de Visita"
            description="Apunta la cámara del móvil hacia el código QR físico expuesto en el taller del artesano."
            icon={QrCode}
          />

          {/* Validation Status Overlay */}
          {validating && (
            <div className="text-center p-8 bg-slate-900/10 dark:bg-black/20 rounded-2xl flex flex-col items-center justify-center space-y-3 animate-pulse">
              <div className="w-10 h-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-semibold">Verificando presencia física en el taller...</p>
            </div>
          )}

          {/* Error State */}
          {validationError && !validating && (
            <div className="bg-red-500/10 dark:bg-red-950/20 border border-red-500/30 text-red-600 dark:text-red-400 p-4.5 rounded-2xl text-xs space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="flex-shrink-0" />
                <span className="font-bold">Error de Validación</span>
              </div>
              <p className="leading-relaxed">{validationError}</p>
              <button
                onClick={() => {
                  setValidationError("");
                  startCamera();
                }}
                className="mt-2 text-brand-blue dark:text-brand-light font-bold hover:underline cursor-pointer"
              >
                Reintentar Cámara
              </button>
            </div>
          )}

          {/* Scanner Feed Window */}
          {!validating && !validationError && (
            <div className="space-y-4">
              <div className="relative aspect-square w-full max-w-full sm:max-w-[280px] mx-auto px-0 rounded-3xl overflow-hidden bg-black border-2 border-brand-gold/50 shadow-inner flex items-center justify-center">
                {/* Scan box alignment overlays */}
                <div className="absolute inset-0 border-[24px] border-black/40 pointer-events-none z-10 flex items-center justify-center">
                  <div className="w-full h-full border-2 border-dashed border-brand-gold/80 rounded-2xl relative">
                    {/* Neon laser animation */}
                    <div className="absolute left-0 right-0 h-0.5 bg-brand-gold shadow-md shadow-brand-gold/80 top-0 animate-bounce"></div>
                  </div>
                </div>

                {/* Scanning Target Div for html5-qrcode */}
                <div id={scannerId} className="w-full h-full object-cover"></div>

                {!cameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-900 text-slate-400 space-y-2 z-20">
                    <Camera size={40} className="animate-pulse opacity-40" />
                    <p className="text-xs font-semibold">Cámara Apagada</p>
                  </div>
                )}
              </div>

              {cameraActive && (
                <p className="text-center text-[10px] text-slate-400 animate-pulse font-medium">
                  Escaneando en tiempo real...
                </p>
              )}
            </div>
          )}

          {/* Manual Simulation Option (Extremely Helpful for Desktop Testing) */}
          <div className="pt-6 border-t border-gray-200 dark:border-white/10 space-y-3">
            <button
              type="button"
              onClick={() => {
                // Toggle or prompt manual input
                const target = document.getElementById("manual-form-container");
                target?.classList.toggle("hidden");
              }}
              className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-slate-800/10 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-gray-100 transition cursor-pointer text-slate-600 dark:text-slate-300"
            >
              <Cpu size={14} /> Simulación Manual (Desarrollo)
            </button>

            <div id="manual-form-container" className="hidden space-y-2.5 bg-slate-100/50 dark:bg-slate-800/20 p-4 rounded-2xl border border-dashed border-gray-200 dark:border-white/5">
              <p className="text-[10px] text-slate-400 leading-snug">
                Si estás en un ordenador de desarrollo sin webcam, puedes simular la presencia introduciendo el UUID único del código QR del artesano.
              </p>
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Pegar UUID del QR..."
                  className="flex-grow px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-brand-gold text-slate-800 dark:text-slate-100"
                />
                <button
                  type="submit"
                  className="bg-brand-gold hover:bg-brand-gold/90 text-black font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                >
                  Validar
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QRScannerView;
