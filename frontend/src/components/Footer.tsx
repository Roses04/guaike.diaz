const Footer = () => {
  return (
    <footer className="mt-6 w-full bg-slate-900/95 text-slate-300 border border-slate-800/80 backdrop-blur-md z-10 overflow-hidden relative rounded-3xl shadow-xl">
      {/* Top thin accent gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-gradient-to-r from-brand-blue via-brand-light to-brand-gold"></div>

      <div className="container mx-auto px-6 py-6 text-center space-y-4">
        <div className="flex flex-col items-center justify-center gap-1.5">
          <div className="text-lg font-display font-extrabold tracking-tight flex items-center gap-1">
            <span className="text-white">GUAIKE</span>
            <span className="text-brand-gold font-black">.</span>
            <span className="text-xs font-normal text-slate-400 font-sans tracking-normal">DÍAZ</span>
          </div>
          <p className="text-[11px] max-w-md leading-relaxed text-slate-400">
            Sistema de Información Geoespacial para la Gestión Turístico-Artesanal del Municipio Díaz, Nueva Esparta.
          </p>
        </div>
        <div className="border-t border-slate-800/80 pt-4 max-w-lg mx-auto">
          <p className="text-[10px] tracking-wide text-slate-500">
            © 2026 Dionkel Rosas. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
