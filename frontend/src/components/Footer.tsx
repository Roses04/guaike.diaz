const Footer = () => {
  return (
    <footer className="block md:block bg-white/60 dark:bg-brand-dark/60 backdrop-blur-md border-t border-gray-200/50 dark:border-white/5 py-6 mt-auto text-slate-500 dark:text-slate-400 transition-colors duration-300">
      <div className="container mx-auto px-4 text-center space-y-4">
        <div className="flex flex-col items-center justify-center gap-1.5">
          <div className="text-lg font-display font-extrabold tracking-tight flex items-center gap-1">
            <span className="text-primary dark:text-white">GUAIKE</span>
            <span className="text-brand-gold font-black">.</span>
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-sans tracking-normal">DÍAZ</span>
          </div>
          <p className="text-[11px] max-w-md leading-relaxed text-slate-400 dark:text-slate-500">
            Sistema de Información Geoespacial para la Gestión Turístico-Artesanal del Municipio Díaz, Nueva Esparta.
          </p>
        </div>
        <div className="border-t border-gray-200/50 dark:border-white/5 pt-4 max-w-lg mx-auto">
          <p className="text-[10px] tracking-wide text-slate-400 dark:text-slate-500">
            © 2026 Municipio Díaz, Nueva Esparta. Facultad de Ingeniería - Escuela de Sistemas.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
