import { Link } from "react-router-dom";
import { MapPin, Tag, CheckCircle2 } from "lucide-react";

interface Operator {
  id: number;
  nombre_taller: string;
  descripcion?: string;
  categoria_nombre: string;
  parroquia_nombre: string;
  es_verificado: boolean;
  imagen_principal?: string;
}

const CardArtesano = ({ operator }: { operator: Operator }) => {
  const mainImage = operator.imagen_principal || "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop";

  return (
    <div className="glass-panel rounded-3xl overflow-hidden hover:-translate-y-1 hover:shadow-2xl hover:border-brand-blue/30 dark:hover:border-brand-light/30 transition-all duration-300 flex flex-col group h-full">
      <div className="relative overflow-hidden">
        <img 
          src={mainImage} 
          alt={operator.nombre_taller} 
          className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <span className="bg-slate-900/70 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Tag size={10} className="text-brand-gold" /> {operator.categoria_nombre}
          </span>
        </div>
        {operator.es_verificado && (
          <div className="absolute top-3 right-3 bg-brand-blue/90 dark:bg-brand-light/90 backdrop-blur-md text-white p-1.5 rounded-full shadow-lg" title="Verificado por la alcaldía">
            <CheckCircle2 size={16} className="text-white" />
          </div>
        )}
      </div>
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="font-display font-bold text-xl text-slate-800 dark:text-slate-100 group-hover:text-brand-blue dark:group-hover:text-brand-light transition duration-200 mb-2">
          {operator.nombre_taller}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-4 flex-grow">
          {operator.descripcion || "Artesano tradicional verificado del Municipio Díaz."}
        </p>
        <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1 font-bold text-slate-600 dark:text-slate-300">
            <MapPin size={14} className="text-brand-gold" /> {operator.parroquia_nombre}
          </div>
          <Link 
            to={`/operador/${operator.id}`}
            className="text-brand-blue dark:text-brand-light font-bold hover:text-brand-gold dark:hover:text-brand-gold transition duration-200 text-sm"
          >
            Ver Perfil &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CardArtesano;
