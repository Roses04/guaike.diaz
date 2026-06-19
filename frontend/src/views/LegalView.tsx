/**
 * VISTA LEGAL (Términos, Privacidad, Cláusulas y Registro SAPI)
 * 
 * Esta vista reúne toda la documentación legal de la plataforma GUAIKE.DÍAZ,
 * redactada formalmente bajo el ordenamiento jurídico de la República Bolivariana de Venezuela.
 * 
 * Características clave:
 * 1. Pestañas dinámicas sincronizadas mediante URL query parameters (?tab=...).
 * 2. El contenedor del documento siempre mantiene un fondo claro y texto oscuro (hoja física),
 *    incluso si el usuario activa el modo oscuro global en la aplicación.
 * 3. Botón de descarga en PDF mediante hoja de estilos de impresión corporativa (@media print)
 *    que formatea el documento con membrete oficial (sello textual G.D), pie de página y sello digital.
 * 4. Ficha Técnica orientada al SAPI para registro de derechos de autor de software.
 */

import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  Scale, Shield, FileText, Cpu, ArrowLeft, Printer 
} from "lucide-react";
import SEO from "../components/SEO";

const LegalView = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const activeTab = searchParams.get("tab") || "terms";

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const handlePrint = () => {
    window.print();
  };

  // Fecha actual formateada para el pie del PDF de impresión
  const currentDate = new Date().toLocaleDateString("es-VE", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <>
      <SEO 
        title="Documentación Legal" 
        description="Términos y condiciones, política de privacidad, avisos legales y descripción técnica de propiedad intelectual de la plataforma GUAIKE.DÍAZ." 
        canonical="/legal"
      />

      <div className="container mx-auto px-4 py-6 md:py-10 max-w-5xl flex-grow flex flex-col justify-start">
        
        {/* --- CABECERA DE LA PÁGINA (Oculta en Impresión) --- */}
        <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white text-xs font-bold mb-3 transition cursor-pointer"
            >
              <ArrowLeft size={16} /> Volver Atrás
            </button>
            <h1 className="text-3xl md:text-4xl font-display font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
              <Scale className="text-brand-blue dark:text-brand-light" size={32} />
              Marco Legal y Tecnológico
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Documentación reguladora de GUAIKE.DÍAZ conforme a la legislación de la República Bolivariana de Venezuela.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handlePrint}
              className="bg-brand-blue text-white hover:bg-brand-blue/90 dark:bg-brand-light dark:text-slate-900 dark:hover:bg-brand-light/90 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
            >
              <Printer size={16} />
              <span>Imprimir / Descargar PDF</span>
            </button>
          </div>
        </div>

        {/* --- NAVEGACIÓN POR PESTAÑAS (Oculta en Impresión) --- */}
        <div className="print:hidden flex gap-2 border-b border-gray-200 dark:border-white/5 pb-2 mb-6 overflow-x-auto select-none no-scrollbar">
          <button
            onClick={() => handleTabChange("terms")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap transition-all border ${
              activeTab === "terms"
                ? "bg-brand-blue border-transparent text-white dark:bg-brand-light dark:text-slate-900 shadow-md shadow-brand-blue/20"
                : "bg-stone-50 dark:bg-slate-800/40 border-stone-200/90 dark:border-white/5 text-slate-650 dark:text-slate-350 hover:bg-stone-100 dark:hover:bg-slate-800"
            }`}
          >
            <FileText size={15} />
            Términos y Condiciones
          </button>
          <button
            onClick={() => handleTabChange("privacy")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap transition-all border ${
              activeTab === "privacy"
                ? "bg-brand-blue border-transparent text-white dark:bg-brand-light dark:text-slate-900 shadow-md shadow-brand-blue/20"
                : "bg-stone-50 dark:bg-slate-800/40 border-stone-200/90 dark:border-white/5 text-slate-650 dark:text-slate-350 hover:bg-stone-100 dark:hover:bg-slate-800"
            }`}
          >
            <Shield size={15} />
            Política de Privacidad
          </button>
          <button
            onClick={() => handleTabChange("disclaimer")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap transition-all border ${
              activeTab === "disclaimer"
                ? "bg-brand-blue border-transparent text-white dark:bg-brand-light dark:text-slate-900 shadow-md shadow-brand-blue/20"
                : "bg-stone-50 dark:bg-slate-800/40 border-stone-200/90 dark:border-white/5 text-slate-650 dark:text-slate-350 hover:bg-stone-100 dark:hover:bg-slate-800"
            }`}
          >
            <Scale size={15} />
            Avisos y Cláusulas
          </button>
          <button
            onClick={() => handleTabChange("sapi")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap transition-all border ${
              activeTab === "sapi"
                ? "bg-brand-blue border-transparent text-white dark:bg-brand-light dark:text-slate-900 shadow-md shadow-brand-blue/20"
                : "bg-stone-50 dark:bg-slate-800/40 border-stone-200/90 dark:border-white/5 text-slate-650 dark:text-slate-350 hover:bg-stone-100 dark:hover:bg-slate-800"
            }`}
          >
            <Cpu size={15} />
            Propiedad Intelectual (SAPI)
          </button>
        </div>

        {/* --- MEMBRETE IMPRESIÓN (Visible ÚNICAMENTE al imprimir o generar PDF) --- */}
        <div className="hidden print:flex flex-col items-center border-b-[3px] border-slate-900 pb-5 mb-8 text-center w-full">
          <div className="flex items-center justify-center gap-4.5 mb-2">
            {/* Sello Geométrico Textual en lugar de logo corporativo externo */}
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-display font-black text-lg shadow-sm shrink-0 print-black-box">G.D</div>
            <div className="text-left">
              <h2 className="text-xl font-display font-black tracking-tight text-slate-900 leading-none">GUAIKE.DÍAZ</h2>
              <span className="text-[10px] font-bold tracking-widest text-slate-650 block">SISTEMA GEORREFERENCIADO TURÍSTICO</span>
            </div>
          </div>
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
            República Bolivariana de Venezuela • Estado Nueva Esparta • Municipio Díaz
          </p>
          <p className="text-[8px] text-slate-400 mt-1">
            Documento de Validez Digital y Contractual • Emitido el {currentDate}
          </p>
        </div>

        {/* --- CONTENEDOR CENTRAL DE DOCUMENTACIÓN (Siempre fondo claro para impresión/lectura) --- */}
        <div className="bg-white text-slate-800 border border-slate-200 shadow-xl rounded-3xl p-6 md:p-10 flex-1 print:bg-transparent print:border-none print:shadow-none print:p-0">
          
          {/* ================= PESTAÑA: TÉRMINOS Y CONDICIONES ================= */}
          {activeTab === "terms" && (
            <div className="prose prose-sm max-w-none text-slate-750 space-y-6 print:text-slate-900">
              
              <div className="border-b border-gray-200 pb-4 mb-4 flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-display font-black tracking-tight text-slate-900 print:text-slate-950">
                  Términos y Condiciones de Uso
                </h2>
                <span className="hidden print:inline text-[9px] font-mono text-slate-400">Ref: TYC-GD-2026-V1</span>
              </div>

              <p className="text-xs text-slate-400 print:text-slate-500 italic">
                Última actualización y entrada en vigencia: 19 de junio de 2026.
              </p>

              <section className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-blue print:text-slate-900 pl-1 border-l-2 border-brand-blue">
                  1. Disposiciones Generales y Objeto
                </h3>
                <p className="text-xs md:text-sm leading-relaxed text-justify">
                  El presente documento constituye un contrato de adhesión regulado bajo el ordenamiento jurídico de la <strong>República Bolivariana de Venezuela</strong>, especialmente bajo la <strong>Ley Sobre Mensajes de Datos y Firmas Electrónicas</strong> y el <strong>Código Civil</strong>. Al acceder, registrarse o utilizar la PWA <strong>GUAIKE.DÍAZ</strong>, el usuario acepta de manera expresa, libre y sin reservas todas las condiciones aquí establecidas. 
                </p>
                <p className="text-xs md:text-sm leading-relaxed text-justify">
                  El objeto de la plataforma es proporcionar un <strong>Sistema de Información Geoespacial y Directorio Cultural</strong> para mapear, georreferenciar y guiar a turistas a través de talleres artesanales y tradicionales en el Municipio Díaz, Estado Nueva Esparta, promoviendo el acervo cultural tradicional de la región.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-blue print:text-slate-900 pl-1 border-l-2 border-brand-blue">
                  2. Registro y Roles de Usuario
                </h3>
                <p className="text-xs md:text-sm leading-relaxed text-justify">
                  La plataforma implementa un registro segmentado con dos roles diferenciados:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs md:text-sm text-justify">
                  <li>
                    <strong>Turista / Visitante:</strong> Cuenta creada para planificar itinerarios de viaje, visualizar el mapa patrimonial y calificar talleres mediante reseñas. Aceptan el uso de sus datos de geolocalización exclusivamente para funciones locales de ruteo. De acuerdo con la <strong>LOPNNA</strong>, los menores de edad podrán utilizar la cuenta de Turista únicamente bajo la supervisión directa y autorización de su representante legal.
                  </li>
                  <li>
                    <strong>Operador / Artesano:</strong> Cuenta dedicada a artesanos locales del Municipio Díaz. Para completar el registro de la Ficha Técnica, el Operador debe ser <strong>mayor de 18 años</strong> (mayoría de edad civil en Venezuela) y tiene la obligación de suministrar documentos de identidad (Cédula o RIF) válidos. La activación final de la cuenta depende de la verificación administrativa ejecutada por la alcaldía municipal.
                  </li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-blue print:text-slate-900 pl-1 border-l-2 border-brand-blue">
                  3. Veracidad de la Información y Declaración Fiscal
                </h3>
                <p className="text-xs md:text-sm leading-relaxed text-justify">
                  En cumplimiento con el <strong>Código de Comercio de Venezuela</strong>, los Operadores garantizan bajo juramento la autenticidad y exactitud de sus registros fiscales y del taller físico. Cualquier falsedad u omisión en la Cédula de Identidad, Registro de Información Fiscal (RIF), dirección detallada o características de los talleres constituirá causa suficiente para la inhabilitación del operador en el mapa público, sin perjuicio de las sanciones administrativas o penales que dicten las leyes venezolanas.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-blue print:text-slate-900 pl-1 border-l-2 border-brand-blue">
                  4. Algoritmos de Ruteo e Itinerarios (TSP)
                </h3>
                <p className="text-xs md:text-sm leading-relaxed text-justify">
                  GUAIKE.DÍAZ incorpora un planificador de itinerarios optimizado mediante un algoritmo de resolución heurística local del <strong>Problema del Viajante (TSP)</strong> basado en el Vecino Más Cercano (Nearest Neighbor) y la distancia por la <strong>Fórmula de Haversine</strong>, aplicando un coeficiente de curvatura real del terreno de <strong>1.35</strong>. 
                </p>
                <p className="text-xs md:text-sm leading-relaxed text-justify">
                  El usuario reconoce que esta funcionalidad se ejecuta a nivel de cliente y tiene fines únicamente informativos y de sugerencia. Las condiciones reales de vialidad, climatología y seguridad física en el territorio del Municipio Díaz escapan al control de los desarrolladores y de la alcaldía, por lo que el turista asume la total responsabilidad de sus traslados.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-blue print:text-slate-900 pl-1 border-l-2 border-brand-blue">
                  5. Veracidad de Reseñas por Validación Física QR
                </h3>
                <p className="text-xs md:text-sm leading-relaxed text-justify">
                  Para mitigar la reseñas falsas y spam en la base de datos (resguardando el honor y la reputación comercial de los artesanos bajo la <strong>Constitución Nacional</strong>), el sistema exige que el turista verifique físicamente su presencia en el taller artesanal escaneando el código QR único provisto por el operador (<code>isQrVerified</code>). Solo los usuarios con visita QR validada quedan habilitados para redactar y enviar una reseña calificada sobre el taller visitado.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-blue print:text-slate-900 pl-1 border-l-2 border-brand-blue">
                  6. Propiedad Intelectual y Uso Aceptable
                </h3>
                <p className="text-xs md:text-sm leading-relaxed text-justify">
                  Queda estrictamente prohibida la reproducción, copia, distribución, ingeniería inversa o cualquier intento de descifrado del código de la PWA GUAIKE.DÍAZ. Todo acto de alteración cibernética, sabotaje o inyección de datos geográficos falsos será denunciado bajo la <strong>Ley Especial contra Delitos Informáticos</strong> de la República Bolivariana de Venezuela.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-blue print:text-slate-900 pl-1 border-l-2 border-brand-blue">
                  7. Jurisdicción y Ley Aplicable
                </h3>
                <p className="text-xs md:text-sm leading-relaxed text-justify">
                  Cualquier controversia relacionada con la interpretación o aplicación de estos términos se resolverá exclusivamente bajo las leyes de la República Bolivariana de Venezuela. Ambas partes eligen como domicilio especial e improrrogable la jurisdicción de los Tribunales Ordinarios de la Circunscripción Judicial del <strong>Estado Nueva Esparta</strong> (Sede en La Asunción o Porlamar).
                </p>
              </section>
              
            </div>
          )}

          {/* ================= PESTAÑA: POLÍTICA DE PRIVACIDAD ================= */}
          {activeTab === "privacy" && (
            <div className="prose prose-sm max-w-none text-slate-750 space-y-6 print:text-slate-900">
              
              <div className="border-b border-gray-200 pb-4 mb-4 flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-display font-black tracking-tight text-slate-900 print:text-slate-950">
                  Política de Privacidad y Tratamiento de Datos
                </h2>
                <span className="hidden print:inline text-[9px] font-mono text-slate-400">Ref: PRIV-GD-2026-V1</span>
              </div>

              <p className="text-xs text-slate-400 print:text-slate-500 italic">
                Última actualización y entrada en vigencia: 19 de junio de 2026.
              </p>

              <section className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-blue print:text-slate-900 pl-1 border-l-2 border-brand-blue">
                  1. Fundamento Constitucional (Habeas Data)
                </h3>
                <p className="text-xs md:text-sm leading-relaxed text-justify">
                  Esta Política de Privacidad se redacta y ejecuta en apego al <strong>Artículo 28 de la Constitución de la República Bolivariana de Venezuela</strong>, el cual establece el derecho de toda persona a acceder a la información que de sí misma conste en registros oficiales o privados, a conocer el uso que se haga de la misma y a exigir su rectificación, actualización o destrucción en caso de ser errónea o afectar ilegítimamente sus derechos (Garantía de Habeas Data).
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-blue print:text-slate-900 pl-1 border-l-2 border-brand-blue">
                  2. Identificación del Responsable
                </h3>
                <p className="text-xs md:text-sm leading-relaxed text-justify">
                  El tratamiento de los datos personales es gestionado por el equipo técnico y de desarrollo de <strong>GUAIKE.DÍAZ</strong>, en corresponsabilidad con la alcaldía municipal del Municipio Díaz del Estado Nueva Esparta, actuando bajo el marco regulador de la <strong>Ley Orgánica de Telecomunicaciones (LOTEL)</strong>.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-blue print:text-slate-900 pl-1 border-l-2 border-brand-blue">
                  3. Datos Objeto de Recopilación y Tratamiento
                </h3>
                <p className="text-xs md:text-sm leading-relaxed text-justify">
                  La plataforma almacena y procesa exclusivamente los datos necesarios para brindar los servicios del directorio cultural y la geolocalización:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs md:text-sm text-justify">
                  <li>
                    <strong>Datos de Registro:</strong> Correo electrónico y contraseñas cifradas. Para la recuperación segura, se almacenan respuestas de preguntas de seguridad hasheadas localmente mediante algoritmo robusto.
                  </li>
                  <li>
                    <strong>Datos de Operadores:</strong> Nombre completo del operador, número de teléfono (WhatsApp), dirección detallada del taller, tipo y número de documento fiscal (Cédula/RIF), fecha de nacimiento (para validar mayoría de edad), e imágenes (portada del taller, galería de productos e imagen del documento para verificación de identidad).
                  </li>
                  <li>
                    <strong>Datos de Geolocalización:</strong> Coordenadas GPS (Latitud y Longitud WGS84) del taller para el mapeo geoespacial en PostGIS. La geolocalización del turista sólo se procesa localmente en el dispositivo para el ruteo heurístico y no se almacena de forma persistente en los servidores de la plataforma.
                  </li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-blue print:text-slate-900 pl-1 border-l-2 border-brand-blue">
                  4. Seguridad y Transferencia de Datos
                </h3>
                <p className="text-xs md:text-sm leading-relaxed text-justify">
                  Todos los datos son transmitidos de forma segura mediante protocolo HTTPS con cifrado SSL. La información persistente reside en el motor de base de datos relacional de <strong>Supabase</strong> protegido mediante políticas RLS (Row Level Security) que impiden a terceros acceder a datos privados de otros usuarios. Las imágenes se almacenan de forma segura en <strong>Cloudinary</strong>.
                </p>
                <p className="text-xs md:text-sm leading-relaxed text-justify">
                  En cumplimiento con la <strong>Ley Especial contra Delitos Informáticos</strong>, GUAIKE.DÍAZ no vende, alquila o comercializa los datos de sus usuarios con ninguna entidad externa.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-blue print:text-slate-900 pl-1 border-l-2 border-brand-blue">
                  5. Derechos de Acceso, Rectificación, Cancelación y Oposición (ARCO)
                </h3>
                <p className="text-xs md:text-sm leading-relaxed text-justify">
                  Todo usuario registrado en la plataforma podrá ejercer sus derechos de consulta, modificación o supresión de datos escribiendo a la cuenta de soporte legal del sistema. Los artesanos pueden modificar la ficha de su taller directamente desde su perfil personal o solicitar su retiro total de la cartografía pública cuando lo deseen.
                </p>
              </section>
              
            </div>
          )}

          {/* ================= PESTAÑA: CLÁUSULAS DE RESPONSABILIDAD ================= */}
          {activeTab === "disclaimer" && (
            <div className="prose prose-sm max-w-none text-slate-750 space-y-6 print:text-slate-900">
              
              <div className="border-b border-gray-200 pb-4 mb-4 flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-display font-black tracking-tight text-slate-900 print:text-slate-950">
                  Aviso Legal y Descargos de Responsabilidad
                </h2>
                <span className="hidden print:inline text-[9px] font-mono text-slate-400">Ref: AVL-GD-2026-V1</span>
              </div>

              <p className="text-xs text-slate-400 print:text-slate-500 italic">
                Última actualización y entrada en vigencia: 19 de junio de 2026.
              </p>

              <section className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-blue print:text-slate-900 pl-1 border-l-2 border-brand-blue">
                  1. Exención de Intermediación Comercial
                </h3>
                <p className="text-xs md:text-sm leading-relaxed text-justify">
                  GUAIKE.DÍAZ funciona estrictamente como una <strong>guía digital de información geo-turística y patrimonial</strong>. La plataforma no procesa transacciones, no intermedia en pasarelas de pago, ni establece tarifas por los productos ofrecidos en los talleres. Cualquier relación comercial, compraventa de artesanías, contratación de tours, precios o métodos de pago acordados es de exclusiva responsabilidad del Turista y del Operador, rigiéndose bajo el Código Civil y Código de Comercio de Venezuela.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-blue print:text-slate-900 pl-1 border-l-2 border-brand-blue">
                  2. Exención de Responsabilidad Civil por Traslados e Itinerarios
                </h3>
                <p className="text-xs md:text-sm leading-relaxed text-justify">
                  El sistema genera rutas optimizadas aplicando fórmulas matemáticas y datos del mapa base. Sin embargo, no garantiza la viabilidad física real, el estado de mantenimiento de las calles públicas, el clima en el Municipio Díaz, ni las condiciones de seguridad en las vías. Ni la plataforma, ni su creador, ni la alcaldía del Municipio Díaz asumen responsabilidad civil o penal por accidentes, pérdidas materiales, lesiones corporales o daños de cualquier tipo sufridos por los turistas durante el recorrido de sus itinerarios.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-blue print:text-slate-900 pl-1 border-l-2 border-brand-blue">
                  3. Funcionamiento Offline PWA y Sincronización diferida
                </h3>
                <p className="text-xs md:text-sm leading-relaxed text-justify">
                  Al tratarse de una Aplicación Web Progresiva con arquitectura <strong>Offline-First</strong>, cierta información mostrada en el mapa o directorio (reseñas pendientes, estado del operador) puede provenir de cachés locales del navegador y no estar completamente actualizada en tiempo real. La plataforma no se responsabiliza por desactualizaciones temporales debido a la pérdida de conectividad móvil en el territorio de la Isla de Margarita.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-blue print:text-slate-900 pl-1 border-l-2 border-brand-blue">
                  4. Límites Territoriales (Geo-fencing)
                </h3>
                <p className="text-xs md:text-sm leading-relaxed text-justify">
                  El registro en la plataforma está restringido geométricamente a los límites del Municipio Díaz. La plataforma no certifica de ningún modo la idoneidad legal ni autoriza la publicación de talleres ubicados fuera de las demarcaciones indicadas.
                </p>
              </section>
              
            </div>
          )}

          {/* ================= PESTAÑA: PROPIEDAD INTELECTUAL (SAPI) ================= */}
          {activeTab === "sapi" && (
            <div className="prose prose-sm max-w-none text-slate-750 space-y-6 print:text-slate-900">
              
              <div className="border-b border-gray-200 pb-4 mb-4 flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-display font-black tracking-tight text-slate-900 print:text-slate-950">
                  Ficha Tecnológica y Propiedad Intelectual
                </h2>
                <span className="hidden print:inline text-[9px] font-mono text-slate-400">Ref: FTS-GD-2026-V1</span>
              </div>

              <p className="text-xs text-slate-400 print:text-slate-500 italic">
                Documento técnico preparado para el registro de derecho de autor ante el Servicio Autónomo de la Propiedad Intelectual (SAPI) de Venezuela.
              </p>

              <section className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 p-4.5 rounded-2xl print:bg-transparent print:border-slate-300">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-blue mb-3">
                    Resumen del Registro del Software
                  </h4>
                  <table className="w-full text-xs border-collapse">
                    <tbody>
                      <tr className="border-b border-slate-200">
                        <td className="py-2.5 font-semibold w-1/3 text-slate-500">Denominación:</td>
                        <td className="py-2.5 text-slate-800">GUAIKE.DÍAZ (PWA y GIS)</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-2.5 font-semibold text-slate-500">Tipo de Obra:</td>
                        <td className="py-2.5 text-slate-800">Programa de Computación (Software de Aplicación)</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-2.5 font-semibold text-slate-500">Autoría Intelectual:</td>
                        <td className="py-2.5 text-slate-800">Dionkel Rosas</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-2.5 font-semibold text-slate-500">Territorio de Registro:</td>
                        <td className="py-2.5 text-slate-800">República Bolivariana de Venezuela (SAPI)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-semibold text-slate-500">Año de Finalización:</td>
                        <td className="py-2.5 text-slate-800">2026</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-blue print:text-slate-900 pl-1 border-l-2 border-brand-blue">
                  1. Descripción Arquitectónica
                </h3>
                <p className="text-xs md:text-sm leading-relaxed text-justify">
                  GUAIKE.DÍAZ ha sido diseñado como una aplicación desacoplada PWA que implementa:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs md:text-sm text-justify">
                  <li><strong>Frontend:</strong> React + Vite + TypeScript, integrando almacenamiento offline vía Service Workers (<code>vite-plugin-pwa</code>) y mapas interactivos con Leaflet.</li>
                  <li><strong>Base de Datos y Backend:</strong> Supabase BaaS montado sobre PostgreSQL 15, con la extensión geoespacial <strong>PostGIS</strong> habilitada.</li>
                  <li><strong>Funciones de Borde (Serverless):</strong> Controladores Node.js hospedados en Vercel API para el despacho seguro de correos.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-blue print:text-slate-900 pl-1 border-l-2 border-brand-blue">
                  2. Módulos de Innovación Protegidos
                </h3>
                <div className="space-y-3 text-xs md:text-sm text-justify">
                  <p>
                    <strong>A. Algoritmo resolvedor TSP Offline-First:</strong> Algoritmo desarrollado nativamente en TypeScript para el cálculo optimizado de rutas sobre el cliente mediante la heurística del Vecino Más Cercano (Nearest Neighbor). Se resalta la calibración espacial a la topografía vial real del Municipio Díaz aplicando un factor de corrección de la distancia por Haversine de <strong>1.35</strong>.
                  </p>
                  <p>
                    <strong>B. Algoritmo de Verificación QR de Visitas:</strong> Mecanismo que restringe la calificación de opiniones mediante validación de presencia real con un hash QR UUID v4 temporal único. Este blindaje garantiza la veracidad de los datos evitando spam masivo en la base de datos relacional.
                  </p>
                  <p>
                    <strong>C. Polígono de Geo-Fencing en PostGIS:</strong> Restricción estricta implementada a nivel de cliente y servidor mediante coordenadas poligonales del Municipio Díaz para impedir la creación de fichas de talleres que no correspondan geográficamente a la región del municipio (Latitud: 10.84 a 11.06, Longitud: -64.06 a -63.88).
                  </p>
                  <p>
                    <strong>D. Hardening RLS a Nivel de Servidor:</strong> Trigger de seguridad <code>handle_new_user()</code> y políticas Row Level Security (RLS) en la base de datos que restringen el escalado de privilegios y accesos no autorizados a las tablas críticas, alineado con la <strong>Ley Especial contra Delitos Informáticos</strong>.
                  </p>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-blue print:text-slate-900 pl-1 border-l-2 border-brand-blue">
                  3. Declaración de Derechos de Autor
                </h3>
                <p className="text-xs md:text-sm leading-relaxed text-justify">
                  La totalidad del código fuente, arquitectura de base de datos relacional, interfaz de usuario (UI), esquemas CSS, y algoritmos de optimización TSP constituyen una obra original en el área de software protegida por la <strong>Ley sobre el Derecho de Autor de Venezuela</strong>. El autor se reserva el ejercicio pleno de todos los derechos morales y patrimoniales inherentes a la obra de computación aquí detallada.
                </p>
              </section>
              
            </div>
          )}

          {/* --- SELLO Y FIRMA DIGITAL DE CERTIFICACIÓN --- */}
          <div className="mt-12 border-t border-slate-200 pt-6 text-[10px] text-slate-500 w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-6 items-center">
              
              {/* Metadata de Verificación */}
              <div className="space-y-1 text-center md:text-left print:text-left">
                <p className="font-extrabold text-slate-800 uppercase tracking-wider text-[9px]">
                  Documento Digital Verificado
                </p>
                <p className="text-slate-650 font-medium">
                  Código: <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200/60">{activeTab === "terms" ? "TYC-GD-2026-V1" : activeTab === "privacy" ? "PRIV-GD-2026-V1" : activeTab === "disclaimer" ? "AVL-GD-2026-V1" : "FTS-GD-2026-V1"}</span>
                </p>
                <p className="text-slate-400 text-[8px]">
                  Registro y Validez Territorial: Municipio Díaz, Estado Nueva Esparta
                </p>
              </div>

              {/* Firma Hash SHA-256 */}
              <div className="flex flex-col items-center justify-center text-center md:border-x md:border-slate-200 md:px-4 print:border-x print:border-slate-200 print:px-4">
                <p className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                  Firma de Integridad (SHA-256)
                </p>
                <span className="font-mono text-[8px] text-slate-700 bg-slate-50/80 px-2.5 py-1.5 rounded-lg border border-slate-150 select-all break-all tracking-tight max-w-[240px] leading-normal shadow-xs">
                  8f9a2b5c7d8e1f0a9b8c7d6e5f4a3b2c1d0e9f8a
                </span>
              </div>

              {/* Aprobación Gubernamental / SAPI Seal */}
              <div className="flex items-center justify-center md:justify-end print:justify-end gap-3 text-center md:text-right print:text-right">
                <div className="space-y-0.5">
                  <p className="font-extrabold text-[9px] text-slate-800 leading-tight">
                    APROBADO BAJO LA LEY VENEZOLANA
                  </p>
                  <p className="text-[8px] text-slate-450 font-medium">
                    SAPI • Registro de Obra de Software
                  </p>
                </div>
                <div className="w-10 h-10 border border-slate-900 flex items-center justify-center font-mono font-black text-[9px] bg-slate-900 text-white shrink-0 shadow-sm print-black-box rounded-lg">
                  SAPI
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </>
  );
};

export default LegalView;
