import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  MapPin, 
  Compass, 
  History, 
  Sparkles, 
  Utensils, 
  ArrowRight,
  Info,
  Award
} from "lucide-react";
import { PageHeader, TabSwitcher } from "../components/ui/PageHeader";
import RevealOnScroll from "../components/ui/RevealOnScroll";
import SEO from "../components/SEO";
import { municipioDiazData } from "../data/municipioInfo";

type TabId = "historia" | "lugares" | "cultura" | "gastronomia";

const DescubreView = () => {
  const [activeTab, setActiveTab] = useState<TabId>("historia");

  return (
    <>
      <SEO
        title="Descubre el Municipio Díaz"
        description="Conoce la historia, fundación, atractivos turísticos, tradiciones culturales y gastronomía típica de San Juan Bautista y el Municipio Díaz en la Isla de Margarita."
        canonical="/descubre"
      />
      
      <div className="w-full px-4 py-8 md:px-6">
        {/* Page Header with Tab Switcher */}
        <PageHeader
          badge="Guía Turística y Cultural"
          title="Descubre el Municipio Díaz"
          description="Sumérgete en la rica herencia histórica, los majestuosos valles naturales y los saberes ancestrales que definen la identidad de nuestro municipio."
          icon={BookOpen}
          actions={
            <TabSwitcher
              active={activeTab}
              onChange={(id) => setActiveTab(id as TabId)}
              tabs={[
                { id: "historia", label: "Historia y Orígenes", icon: History },
                { id: "lugares", label: "Sitios de Interés", icon: Compass },
                { id: "cultura", label: "Cultura y Tradición", icon: Sparkles },
                { id: "gastronomia", label: "Gastronomía Típica", icon: Utensils },
              ]}
            />
          }
        />

        {/* Section Content */}
        <div className="mt-6">
          
          {/* TAB 1: HISTORY & FOUNDATION */}
          {activeTab === "historia" && (
            <div className="space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Introduction Card */}
                <RevealOnScroll className="lg:col-span-1 space-y-6">
                  <div className="glass-panel p-6 rounded-3xl border border-stone-200/80 dark:border-white/5 shadow-xl relative overflow-hidden h-full flex flex-col justify-between">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-brand-blue/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10">
                      <span className="text-[10px] uppercase tracking-widest text-brand-gold font-extrabold px-3 py-1 bg-brand-gold/10 rounded-full mb-4 inline-block">
                        Ficha de Identidad
                      </span>
                      <h3 className="text-2xl font-display font-extrabold text-slate-800 dark:text-white tracking-tight mb-4">
                        {municipioDiazData.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                        {municipioDiazData.introduction}
                      </p>
                      
                      {/* Technical details list */}
                      <div className="space-y-4 border-t border-slate-100 dark:border-white/5 pt-4">
                        <div className="flex justify-between text-xs py-1">
                          <span className="text-slate-400 font-bold uppercase tracking-wider">Capital</span>
                          <span className="text-slate-800 dark:text-slate-200 font-extrabold">{municipioDiazData.capital}</span>
                        </div>
                        <div className="flex justify-between text-xs py-1">
                          <span className="text-slate-400 font-bold uppercase tracking-wider">Fundación</span>
                          <span className="text-slate-800 dark:text-slate-200 font-extrabold">{municipioDiazData.foundationYear}</span>
                        </div>
                        <div className="flex justify-between text-xs py-1">
                          <span className="text-slate-400 font-bold uppercase tracking-wider">Santo Patrono</span>
                          <span className="text-slate-800 dark:text-slate-200 font-extrabold">{municipioDiazData.patronSaint}</span>
                        </div>
                        <div className="flex justify-between text-xs py-1">
                          <span className="text-slate-400 font-bold uppercase tracking-wider">Gentilicio</span>
                          <span className="text-slate-800 dark:text-slate-200 font-extrabold">{municipioDiazData.demonym}</span>
                        </div>
                        <div className="flex flex-col gap-1 text-xs py-1">
                          <span className="text-slate-400 font-bold uppercase tracking-wider">Epónimo</span>
                          <span className="text-slate-800 dark:text-slate-200 font-extrabold leading-normal">{municipioDiazData.eponym}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 pt-4 border-t border-slate-100 dark:border-white/5">
                      <Link
                        to="/directorio"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:text-brand-gold transition duration-150"
                      >
                        Ver Directorio de Artesanos <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </RevealOnScroll>

                {/* Interactive Vertical Timeline */}
                <div className="lg:col-span-2">
                  <RevealOnScroll className="mb-6">
                    <h3 className="text-xl font-display font-extrabold text-slate-800 dark:text-white mb-2">
                      Línea del Tiempo Geohistórica
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Sigue los acontecimientos más emblemáticos que forjaron la identidad de nuestro municipio.
                    </p>
                  </RevealOnScroll>

                  <div className="relative border-l-2 border-brand-blue/30 dark:border-brand-light/20 ml-4 md:ml-6 space-y-8 py-2">
                    {municipioDiazData.timeline.map((item, index) => (
                      <RevealOnScroll key={index} className="relative pl-8 md:pl-10">
                        {/* Timeline dot */}
                        <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-4 border-brand-blue dark:border-brand-light shadow-md flex items-center justify-center z-10">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-blue dark:bg-brand-light"></span>
                        </div>
                        
                        {/* Timeline Content Card */}
                        <div className="glass-panel p-5 rounded-2xl hover:border-brand-blue/20 dark:hover:border-brand-light/25 hover:shadow-lg transition-all duration-300">
                          <span className="inline-block text-[10px] font-black text-brand-blue dark:text-brand-light bg-brand-blue/10 dark:bg-brand-light/10 px-3 py-1 rounded-full mb-2 uppercase tracking-wider">
                            Año {item.year}
                          </span>
                          <h4 className="text-base font-bold text-slate-800 dark:text-white mb-2">
                            {item.title}
                          </h4>
                          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </RevealOnScroll>
                    ))}
                  </div>
                </div>
              </div>

              {/* Historical Figures Sub-Section */}
              <div className="pt-8 border-t border-stone-200/60 dark:border-white/5">
                <RevealOnScroll className="mb-6">
                  <h3 className="text-xl font-display font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                    <Award className="text-brand-gold" size={22} />
                    Personajes Históricos Ilustres
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Héroes de la patria, oficiales, legisladores y cronistas que marcaron la historia de Díaz y del Estado.
                  </p>
                </RevealOnScroll>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {municipioDiazData.figures.map((fig, index) => (
                    <RevealOnScroll key={index} stagger={((index % 3) + 1) as 1 | 2 | 3}>
                      <div className="glass-panel p-5 rounded-3xl border border-slate-100 dark:border-white/5 hover:border-brand-gold/30 hover:shadow-lg transition duration-300 h-full flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-4 mb-3">
                            <h4 className="font-display font-bold text-base text-slate-800 dark:text-white">
                              {fig.name}
                            </h4>
                            <span className="text-[9px] font-black text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded-md shrink-0">
                              {fig.period}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            {fig.role}
                          </p>
                        </div>
                      </div>
                    </RevealOnScroll>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TOURIST ATTRACTIONS (Lugares de Interés) */}
          {activeTab === "lugares" && (
            <div>
              <RevealOnScroll className="max-w-2xl mb-8">
                <h3 className="text-xl font-display font-extrabold text-slate-800 dark:text-white mb-2">
                  Atractivos Turísticos y Patrimonio Natural
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Explora desde manantiales montañosos y manglares protegidos hasta playas y complejos deportivos de renombre. Haz clic en "Ver en el Mapa" para ubicarlos geográficamente.
                </p>
              </RevealOnScroll>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {municipioDiazData.attractions.map((attr, index) => (
                  <RevealOnScroll key={attr.id} stagger={((index % 3) + 1) as 1 | 2 | 3}>
                    <div className="glass-panel rounded-3xl overflow-hidden shadow-lg border border-slate-100 dark:border-white/5 flex flex-col hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 h-full group">
                      
                      {/* Attraction Image */}
                      <div className="relative h-48 w-full overflow-hidden">
                        <img
                          src={attr.image}
                          alt={attr.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Category Badge overlay */}
                        <div className="absolute top-3 left-3">
                          <span className="bg-brand-blue text-white text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                            {attr.category}
                          </span>
                        </div>
                      </div>

                      {/* Content details */}
                      <div className="p-6 flex flex-col grow justify-between">
                        <div>
                          <h4 className="font-display font-bold text-lg text-slate-800 dark:text-white mb-2 leading-snug">
                            {attr.name}
                          </h4>
                          <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-4">
                            {attr.description}
                          </p>
                          
                          {/* Tags list */}
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {attr.tags.map((tag, i) => (
                              <span key={i} className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 bg-stone-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Interactive Link to Map */}
                        <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                          <Link 
                            to="/mapa" 
                            state={{ center: [attr.lat, attr.lng] }} 
                            className="municipal-cta w-full text-center justify-center text-xs py-3 rounded-2xl cursor-pointer"
                          >
                            <MapPin size={13} /> Ver en el Mapa
                          </Link>
                        </div>
                      </div>

                    </div>
                  </RevealOnScroll>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CULTURE & TRADITIONS (Cultura y Tradición) */}
          {activeTab === "cultura" && (
            <div className="space-y-12">
              <div>
                <RevealOnScroll className="max-w-2xl mb-8">
                  <h3 className="text-xl font-display font-extrabold text-slate-800 dark:text-white mb-2">
                    Saberes y Expresiones Ancestrales
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Las manos creadoras, las parrandas y la orfebrería definen el orgullo díacense. Descubre la tejeduría de palma, calzado tradicional y mitología local.
                  </p>
                </RevealOnScroll>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {municipioDiazData.culture.map((cult, index) => (
                    <RevealOnScroll key={cult.id} stagger={((index % 2) + 1) as 1 | 2}>
                      <div className="glass-panel p-5 rounded-3xl flex flex-col sm:flex-row gap-5 border border-slate-100 dark:border-white/5 hover:shadow-xl transition duration-300 h-full group">
                        {/* Left side: Image */}
                        <div className="w-full sm:w-1/3 h-40 sm:h-auto overflow-hidden rounded-2xl shrink-0 relative">
                          <img 
                            src={cult.image} 
                            alt={cult.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                          <div className="absolute bottom-2 left-2">
                            <span className="bg-black/55 backdrop-blur-xs text-white text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">
                              {cult.origin}
                            </span>
                          </div>
                        </div>

                        {/* Right side: details */}
                        <div className="flex flex-col justify-between py-1 grow">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1.5 text-brand-gold">
                              <Sparkles size={14} />
                              <span className="text-[10px] font-black uppercase tracking-wider">Tradición Viva</span>
                            </div>
                            <h4 className="font-display font-bold text-lg text-slate-800 dark:text-white mb-2">
                              {cult.title}
                            </h4>
                            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                              {cult.description}
                            </p>
                          </div>
                          
                          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-white/5 flex justify-end">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1">
                              <Info size={11} /> Preservado en {cult.origin}
                            </span>
                          </div>
                        </div>
                      </div>
                    </RevealOnScroll>
                  ))}
                </div>
              </div>

              {/* Mitos y Leyendas Populares Sub-Section */}
              <div className="pt-8 border-t border-stone-200/60 dark:border-white/5">
                <RevealOnScroll className="mb-6">
                  <h3 className="text-xl font-display font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                    <Sparkles className="text-brand-blue" size={22} />
                    Mitos, Leyendas y Supersticiones Populares
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    El fascinante imaginario popular que habita en las montañas, caminos rurales y rincones domésticos del valle.
                  </p>
                </RevealOnScroll>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {municipioDiazData.myths.map((myth, index) => (
                    <RevealOnScroll key={index} stagger={((index % 2) + 1) as 1 | 2}>
                      <div className="glass-panel p-6 rounded-3xl border border-slate-100 dark:border-white/5 hover:border-brand-blue/30 hover:shadow-lg transition duration-300 h-full flex flex-col justify-between group">
                        <div>
                          <div className="flex items-center justify-between gap-4 mb-3">
                            <h4 className="font-display font-bold text-base text-slate-800 dark:text-white group-hover:text-brand-blue transition duration-150">
                              {myth.title}
                            </h4>
                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 bg-stone-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg shrink-0">
                              📍 {myth.location}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            {myth.description}
                          </p>
                        </div>
                      </div>
                    </RevealOnScroll>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TYPICAL GASTRONOMY (Gastronomía Típica) */}
          {activeTab === "gastronomia" && (
            <div>
              <RevealOnScroll className="max-w-2xl mb-8">
                <h3 className="text-xl font-display font-extrabold text-slate-800 dark:text-white mb-2">
                  Sabores Criollos y Manjares con Identidad
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Prueba la riqueza repostera de San Juan Bautista y la tradicional cocina de mar. El Piñonate y los licores de dátil son los embajadores de nuestro paladar.
                </p>
              </RevealOnScroll>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {municipioDiazData.gastronomy.map((gast, index) => (
                  <RevealOnScroll key={gast.id} stagger={((index % 4) + 1) as 1 | 2 | 3 | 4}>
                    <div className="glass-panel rounded-3xl p-5 border border-slate-100 dark:border-white/5 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition duration-300 h-full group">
                      
                      <div>
                        {/* Food Image Circle */}
                        <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-4 border-2 border-brand-gold/20 dark:border-brand-gold/30 shadow-md">
                          <img 
                            src={gast.image} 
                            alt={gast.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                          />
                        </div>

                        {/* Badges */}
                        <div className="text-center mb-3">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            gast.type === 'Dulce' 
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300' 
                              : gast.type === 'Salado'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300'
                          }`}>
                            {gast.type} Tradicional
                          </span>
                        </div>

                        <h4 className="text-center font-display font-bold text-base text-slate-800 dark:text-white mb-2">
                          {gast.name}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 text-xs text-center leading-relaxed">
                          {gast.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 text-center">
                        <Link 
                          to="/directorio" 
                          className="text-[10px] font-extrabold text-brand-blue hover:text-brand-gold transition duration-150 inline-flex items-center gap-1"
                        >
                          Buscar creadores <ArrowRight size={10} />
                        </Link>
                      </div>

                    </div>
                  </RevealOnScroll>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default DescubreView;
