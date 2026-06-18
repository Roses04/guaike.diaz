export interface HistoricalMilestone {
  year: string;
  title: string;
  description: string;
}

export interface TouristAttraction {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  lat: number;
  lng: number;
  tags: string[];
}

export interface CulturalItem {
  id: string;
  title: string;
  description: string;
  image: string;
  origin: string;
}

export interface GastronomyItem {
  id: string;
  name: string;
  description: string;
  image: string;
  type: 'Dulce' | 'Salado' | 'Bebida';
}

export interface HistoricalFigure {
  name: string;
  period: string;
  role: string;
}

export interface MythItem {
  title: string;
  description: string;
  location: string;
}

export interface MunicipioData {
  name: string;
  capital: string;
  foundationYear: string;
  patronSaint: string;
  demonym: string;
  eponym: string;
  introduction: string;
  timeline: HistoricalMilestone[];
  attractions: TouristAttraction[];
  culture: CulturalItem[];
  gastronomy: GastronomyItem[];
  figures: HistoricalFigure[];
  myths: MythItem[];
}

export const municipioDiazData: MunicipioData = {
  name: "Municipio Antonio Díaz",
  capital: "San Juan Bautista",
  foundationYear: "1525",
  patronSaint: "San Juan Bautista",
  demonym: "Diazense / Sanjuanero/a",
  eponym: "Capitán de Navío Antonio Díaz",
  introduction: "Situado en la región centro-sur de la Isla de Margarita, el Municipio Antonio Díaz es un territorio geohistórico de importancia excepcional. Combina un relieve montañoso coronado por el Cerro San Juan con fértiles valles agrícolas y una vibrante ensenada pesquera en el norte. Es el corazón artesanal del estado Nueva Esparta, cuna del sombrero de cogollo, la alpargatería tradicional y la orfebrería perlera ancestral.",

  timeline: [
    {
      year: "1525",
      title: "Capitulación de Villalobos y Origen Agrario",
      description: "El oidor Marcelo de Villalobos firma capitulaciones para establecer 'Granjerías y Crianzas' en Margarita. El Valle de San Juan (originalmente Valle de Charaima, dominado por el cacique Charaima) se convierte en el hinterland agrícola y de agua dulce vital para sostener la explotación perlífera de Cubagua (Nueva Cádiz)."
    },
    {
      year: "1529",
      title: "Fundación de San Juan Bautista y Primer Hato",
      description: "Pedro de Alegría, primer poblador europeo estable de la isla, funda formalmente la comuna y establece el primer hato ganadero (vacuno, equino y caprino) de Venezuela. Pedro de Villardiga traslada reses desde Santo Domingo, consolidando una colonia agraria próspera."
    },
    {
      year: "1541-1543",
      title: "Migración Masiva y Surgimiento de Caseríos",
      description: "Tras la destrucción de Cubagua por terremoto y tsunami en 1541, y los ataques de corsarios franceses en 1543, familias españolas huyen al Valle de San Juan. Entre ellos, Rodrigo de Fuentidueña se asienta en las faldas de El Copey, dando origen al poblado de Fuentidueño."
    },
    {
      year: "1757",
      title: "Censo Histórico del Valle",
      description: "El censo oficial registra 203 familias y 589 habitantes dedicados activamente a la agricultura, la tejeduría de palma y el buceo de perlas en el valle templado."
    },
    {
      year: "1817",
      title: "Defensa Heroica en Boquerón y Línea de Caranay",
      description: "Durante la campaña realista de Morillo, el Coronel José Joaquín Maneiro con solo 300 hombres resiste tenazmente en Boquerón el 7 de julio. Posteriormente, el 18 de julio, el Coronel Francisco Esteban Gómez retira el ejército patriota a la línea defensiva de Caranay (San Juan), forzando a los realistas a un terreno desfavorable y preparando la gran victoria de Matasiete."
    },
    {
      year: "1901",
      title: "Instalación del Distrito Díaz",
      description: "Bajo el gobierno de Cipriano Castro, el 5 de julio se instala formalmente el Distrito Díaz (segregado de Marcano), abarcando inicialmente las parroquias San Juan y Punta de Piedras. Su territorio original daría origen más tarde a los municipios Macanao (1974) y Tubores (1976)."
    },
    {
      year: "2021",
      title: "Declaración de Patrimonio del Piñonate",
      description: "El tradicional dulce de Piñonate es declarado Patrimonio Cultural del Estado Nueva Esparta mediante la Gaceta Oficial E-5.339 del 2 de septiembre de 2021, reconociendo el saber ancestral custodiado en Fuentidueño."
    }
  ],

  attractions: [
    {
      id: "attr-fuentidueno",
      name: "Valle de Fuentidueño",
      category: "Naturaleza y Senderismo",
      description: "Ubicado al pie del macizo montañoso de El Copey, es un paraíso ecológico rico en manantiales de agua dulce y extensos palmerales datileras. Fundado en 1543 por la migración tras el tsunami de Cubagua, es el epicentro de la tejeduría y la elaboración artesanal del Piñonate de Margarita.",
      image: "/images/fuentidueno.jpg",
      lat: 11.0150,
      lng: -63.9253,
      tags: ["Dátiles", "Manantiales", "Montaña", "Senderismo"]
    },
    {
      id: "attr-el-yaque",
      name: "Playa El Yaque",
      category: "Deporte y Aventura",
      description: "Famosa en todo el mundo como un santuario del windsurf y kitesurf debido a sus constantes e intensos vientos alisios que soplan de forma perpendicular a la costa. Sus aguas templadas, poco profundas y planas la hacen un sitio seguro y un destino turístico con infraestructura de primer nivel.",
      image: "/images/el_yaque.jpg",
      lat: 10.8972,
      lng: -63.9605,
      tags: ["Playa", "Windsurf", "Velas", "Deporte"]
    },
    {
      id: "attr-la-guardia",
      name: "Ensenada y Playa de La Guardia",
      category: "Pesca y Paisaje",
      description: "Bahía pesquera e histórica rada de comercio que en tiempos coloniales recibía barcos cargados de maíz del Orinoco, papelón de El Golfo y tabaco de Píritu. Hoy destaca por sus espectaculares atardeceres sobre la Península de Macanao, el cultivo sustentable de mejillón y su Feria del Mejillón.",
      image: "/images/la_guardia.jpg",
      lat: 10.9960,
      lng: -64.0260,
      tags: ["Atardecer", "Puerto Pesquero", "Mejillón", "Playa"]
    },
    {
      id: "attr-pozas-san-juan",
      name: "Pozas de San Juan Bautista",
      category: "Ecoturismo",
      description: "Balnearios y cascadas de montaña esculpidos en piedra natural rodeados de densa vegetación tropical. Sus pozas más conocidas, como 'El Hacha' y 'El Encabuyado', son paradas obligatorias de ecoturismo alimentadas por vertientes puras del cerro El Copey.",
      image: "/images/pozas_san_juan.jpg",
      lat: 11.0205,
      lng: -63.9220,
      tags: ["Cascadas", "Pozas", "Selva", "Ecoturismo"]
    },
    {
      id: "attr-iglesia-sanjuan",
      name: "Santuario Histórico San Juan Bautista",
      category: "Patrimonio Histórico",
      description: "Templo colonial originario del siglo XVI, reconstruido tras ser saqueado e incinerado por los realistas en 1816. Cuenta con un campanario majestuoso de más de 20 metros de altura que domina visualmente el valle, albergando la imagen de San Juan Bautista traída por familias andaluzas.",
      image: "/images/plaza_san_juan.jpg",
      lat: 11.0118,
      lng: -63.9427,
      tags: ["Arquitectura", "Colonial", "Religión", "Campanario"]
    },
    {
      id: "attr-barrancas",
      name: "Alfarería de Las Barrancas",
      category: "Artesanía y Tradición",
      description: "Poblado dedicado a la alfarería con técnicas precolombinas moldeadas a mano. Familias locales extraen y modelan arcilla roja para hornear en rústicos hornos a leña tinajas, cazuelas de barro y budares, preservando la artesanía de barro más pura del estado.",
      image: "/images/tejedora.jpg",
      lat: 10.9902,
      lng: -63.9773,
      tags: ["Barro", "Cerámica", "Arcilla", "Ancestral"]
    },
    {
      id: "attr-laguna-marites",
      name: "Monumento Natural Laguna de Las Marites",
      category: "Naturaleza",
      description: "Decretado Monumento Natural en 1974, esta albufera costera en los límites orientales del municipio cuenta con frondosos canales navegables cubiertos de manglares (rojo, negro, blanco y botoncillo) y es un refugio esencial para una amplia biodiversidad de avifauna acuática.",
      image: "/images/la_guardia_caminata.jpg",
      lat: 10.9250,
      lng: -63.8850,
      tags: ["Manglar", "Canales", "Aves", "Laguna"]
    },
    {
      id: "attr-deportes",
      name: "Infraestructura Deportiva y Coleo",
      category: "Recreación",
      description: "Díaz posee una vibrante cultura deportiva. En Las Guevaras se encuentra la única Manga de Coleo del Estado Nueva Esparta. Además, cuenta con siete estadios iluminados, incluyendo el Estadio Primitivo Velásquez en El Espinal y la Pista de Atletismo Simón Bolívar en Las Barrancas.",
      image: "/images/san_juan_valle.jpg",
      lat: 10.9562,
      lng: -64.0043,
      tags: ["Toros Coleados", "Estadios", "Deportes", "Atletismo"]
    }
  ],

  culture: [
    {
      id: "cult-cogollo",
      title: "Tejido de Cogollo y Crinejas de Dátil",
      description: "Proceso riguroso de género. Los hombres extraen el cogollo en las alturas de los datileros (Phoenix dactylifera, emblema municipal desde el 2000). Las hojas se secan al sol para blanquearse y se cortan en hebras ('gajos'). Las mujeres y niños tejen la 'crineja' bajo el brazo, que luego se cose para crear sombreros mediante la técnica de 'enchapar'. Tradicionalmente se realizaba el cortejo juvenil al 'despicar la crineja' (cortar las puntas sobrantes).",
      image: "/images/sombrero_cogollo.jpg",
      origin: "San Juan Bautista / Fuentidueño"
    },
    {
      id: "cult-alpargata",
      title: "Alpargatería de El Espinal",
      description: "El calzado tradicional tiene su cuna en El Espinal. La capellada (corte) y el talón se tejen con hilo pabilo empleando telares mecánicos de diseño local. Su sello distintivo es el uso de caucho reciclado de neumáticos automotrices para confeccionar una suela de altísima durabilidad, cosiendo las tirillas a mano.",
      image: "/images/hamaca.jpg",
      origin: "El Espinal"
    },
    {
      id: "cult-orfebreria",
      title: "Orfebrería Perlera Tradicional",
      description: "Desde el período colonial, maestros plateros y orfebres sanjuaneros moldean oro y plata para transformarlos en complejas joyas finas, engastadas exclusivamente con perlas legítimas de los ostrales margariteños. Maestros de avanzada edad como Jesús Velásquez continúan custodiando este antiguo oficio en sus talleres del casco central.",
      image: "/images/tejedora.jpg",
      origin: "San Juan Bautista"
    },
    {
      id: "cult-musica",
      title: "Agrupaciones y Folklore Musical",
      description: "La memoria musical de Díaz está viva en tres agrupaciones emblemáticas: 'Los Antaños de San Juan' (antes Chapalengo), pilar musical de las fiestas tradicionales; 'Los Conuqueros' en El Espinal, famosos por sus parrandas inéditas de año nuevo el primero de enero; y la agrupación 'Ensenada' en La Guardia, expertos en galerones y diversiones pascuales de pescadores.",
      image: "/images/plaza_san_juan.jpg",
      origin: "Zabala / El Espinal / San Juan"
    }
  ],

  gastronomy: [
    {
      id: "gast-pinonate",
      name: "El Piñonate de Fuentidueño",
      description: "Baluarte dulcero protegido como Patrimonio Cultural desde 2021. Es una adaptación de recetas andaluzas de Linares de la Sierra. Combina lechosa (papaya) verde rallada con semillas (corcha), papelón concentrado y jugo y ralladura de naranja ácida. Se bate a leña por tres horas en pailas de cobre ('fondadas') y se extiende en tablas de madera húmedas antes de envolverse herméticamente en 'cachipo' (hoja seca de plátano) para conservar su humedad.",
      image: "/images/pinonate.jpg",
      type: "Dulce"
    },
    {
      id: "gast-datiles",
      name: "Conservas y Dulces de Dátil",
      description: "Elaborados con dátiles cosechados en el valle. Incluyen dátiles rellenos, conservas de dátil molido cocido con azúcar, y un exótico licor artesanal espirituoso fermentado a base de dátil, único de la región.",
      image: "/images/datiles.jpg",
      type: "Dulce"
    },
    {
      id: "gast-pan-leche",
      name: "Pan de Leche Horneo a Leña",
      description: "Pan tradicional de masa suave y esponjosa horneado a fuego de leña. Sus ingredientes clave son harina, leche condensada, azúcar y anís dulce, resultando en una corteza dorada deliciosa muy consumida en las meriendas vespertinas.",
      image: "/images/pan_de_leche.jpg",
      type: "Dulce"
    },
    {
      id: "gast-marina",
      name: "Cocina Marina y Mejillón de La Guardia",
      description: "Preparaciones basadas en el pescado fresco y mariscos capturados en las costas. Destacan las famosas empanadas de cazón con masa dulce frita, el sancocho de pescado y la cocina a base de mejillón cultivado de manera sustentable en La Guardia.",
      image: "/images/comida_marina.jpg",
      type: "Salado"
    }
  ],

  figures: [
    {
      name: "Antonio Díaz",
      period: "1784 – 1826",
      role: "Capitán de Navío, nacido en San Juan. Comandante de las Fuerzas Sutiles de Venezuela, prócer clave de la independencia en la Batalla de la Isla de Pagayos en el Río Orinoco en 1817."
    },
    {
      name: "Gaspar Marcano Boadas",
      period: "1781 – 1821",
      role: "Oficial del Ejército libertador, abogado de prestigio, diputado al Congreso de Angostura y poeta-cronista que retrató las luchas en la Batalla de Matasiete."
    },
    {
      name: "Juan Simón Marcano",
      period: "Fallecido después de 1836",
      role: "Primer Comandante de Caballería patriota, ascendido directamente por Simón Bolívar en su cuartel general de la Villa del Norte en 1816."
    },
    {
      name: "Pablo Morales",
      period: "1805 – 1872",
      role: "General de Brigada de la República. Veterano combatiente contra Pablo Morillo en los combates de Los Barales, Matasiete y el Fuerte de Juan Griego."
    },
    {
      name: "Verni Salazar",
      period: "Activo",
      role: "Renombrado historiador, Cronista Oficial de Díaz y del Estado Nueva Esparta, y declarado Patrimonio Cultural Viviente por su labor de rescate de la geohistoria insular."
    }
  ],

  myths: [
    {
      title: "El Quebrahacho de la Otra Banda",
      description: "Árbol centenario de supuesta inmortalidad en el Portachuelo de Tacarigua, nacido sobre la tumba de un cacique indígena. Bajo su sombra, los viajeros cambiaban sus rústicas alpargatas por zapatos elegantes antes de ingresar a los pueblos del valle.",
      location: "Portachuelo de Tacarigua"
    },
    {
      title: "Presagios domésticos del Cocuyo y la Mariposa Negra",
      description: "Creencia popular fuertemente arraigada donde la entrada de un cocuyo (luciérnaga) o una mariposa negra a los rincones oscuros de la casa representa anuncios inequívocos sobre la salud, fallecimiento o destino de los familiares.",
      location: "Ámbito doméstico municipal"
    },
    {
      title: "El Jinete Fantasma de los Caminos",
      description: "Mito rural de un jinete espectral que galopa por los senderos de tierra en un caballo relinchón, arrastrando ruidosamente cadenas oxidadas y cueros secos que producen un estruendo infernal en las noches oscuras.",
      location: "Caminos rurales del valle"
    },
    {
      title: "Los misterios de las Pozas de Fuentidueño",
      description: "Leyendas de montaña en los senderos hídricos. La poza de 'El Hacha' tiene su mito por su forma física y origen, mientras que la poza de 'El Encabuyado' debe su nombre al supuesto fantasma de un viajero visto atado por el cuello con una cabuya.",
      location: "Pozas de Fuentidueño"
    }
  ]
};
