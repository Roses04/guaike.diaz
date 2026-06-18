export interface PuntoInteres {
  id: string;
  nombre: string;
  categoria: 'turismo' | 'religion' | 'comida' | 'educacion' | 'servicios';
  latitud: number;
  longitud: number;
  descripcion: string;
  direccion: string;
}

export const puntosInteres: PuntoInteres[] = [
  // ─── RELIGIÓN / CULTURA ───────────────────────────────────────────────────
  {
    id: "poi-iglesia-sanjuan",
    nombre: "Iglesia Parroquial San Juan Bautista",
    categoria: "religion",
    // Verified: Wikipedia/Mapcarta — frente a Plaza Antonio Díaz
    latitud: 11.0118,
    longitud: -63.9427,
    descripcion: "Templo histórico del siglo XVI de gran valor arquitectónico y espiritual. Es famosa por albergar a San Juan Bautista, patrono del municipio, y poseer un campanario de gran altura visible desde el valle.",
    direccion: "Frente a la Plaza Antonio Díaz, San Juan Bautista"
  },

  // ─── TURISMO / NATURALEZA ─────────────────────────────────────────────────
  {
    id: "poi-pozas-fuentidueno",
    nombre: "Pozas de Fuentidueño",
    categoria: "turismo",
    // Sector hídrico de Fuentidueño en las faldas de El Copey
    latitud: 11.0205,
    longitud: -63.9220,
    descripcion: "Hermoso balneario natural alimentado por manantiales de montaña. Rodeado de frondosos árboles y plantaciones de dátiles, es un sitio ideal para refrescarse y disfrutar de la naturaleza autóctona de Margarita.",
    direccion: "Sector Fuentidueño, Valle de San Juan"
  },
  {
    id: "poi-playa-yaque",
    nombre: "Playa El Yaque",
    categoria: "turismo",
    // Verified: zona turística y de playa al sur, al este del aeropuerto
    latitud: 10.8972,
    longitud: -63.9605,
    descripcion: "Reconocida mundialmente como uno de los mejores destinos para la práctica de windsurf y kitesurf debido a sus vientos constantes y aguas poco profundas. Colinda directamente con el Municipio Díaz.",
    direccion: "Borde costero sur, adyacente al aeropuerto Santiago Mariño"
  },
  {
    id: "poi-playa-laguardia",
    nombre: "Playa de La Guardia",
    categoria: "turismo",
    // Verified: costa noroeste del municipio, La Guardia ≈ 10.992,-64.021 → playa ligeramente al norte
    latitud: 10.9960,
    longitud: -64.0260,
    descripcion: "Extensa y pacífica playa pesquera en el norte del Municipio Díaz. Destaca por sus hermosos atardeceres y por ser el punto de partida de lanchas de pescadores artesanales.",
    direccion: "Costanera norte, Población de La Guardia"
  },
  {
    id: "poi-cesteria-espinal",
    nombre: "Mercado de Cestería El Espinal",
    categoria: "turismo",
    // Verified: El Espinal sobre la autopista J.B. Arismendi
    latitud: 10.9675,
    longitud: -63.9815,
    descripcion: "Mercado artesanal al aire libre donde se concentran los tejedores locales de El Espinal. Podrás comprar carteras, sombreros de cogollo, alfombras y cestas tejidas con fibras de palma datilera.",
    direccion: "Troncal 5 (Autopista Juan Bautista Arismendi), sector El Espinal"
  },

  // ─── SERVICIOS / TRANSPORTE ───────────────────────────────────────────────
  {
    id: "poi-aeropuerto",
    nombre: "Aeropuerto Internacional Santiago Mariño",
    categoria: "servicios",
    // Verified: coordenadas reales del aeropuerto de Margarita
    latitud: 10.9126,
    longitud: -63.9660,
    descripcion: "El principal terminal aéreo del Estado Nueva Esparta, conectando a la Isla de Margarita con destinos nacionales e internacionales. Está ubicado enteramente en territorio del Municipio Díaz.",
    direccion: "Sector El Yaque, vía El Espinal, Municipio Díaz"
  },

  // ─── EDUCACIÓN ────────────────────────────────────────────────────────────
  {
    id: "poi-liceo-prieto",
    nombre: "Liceo Bolivariano \"Dr. Luis Beltrán Prieto Figueroa\"",
    categoria: "educacion",
    // Verified: La Guardia (Mapcarta/Wikipedia) ≈ 10.992,-64.021 → liceo en zona céntrica de La Guardia
    latitud: 10.9930,
    longitud: -64.0175,
    descripcion: "Destacado liceo con la infraestructura más moderna del municipio, inaugurada en 2026. Cuenta con laboratorios científicos, salas de computación, talleres, comedor y canchas deportivas múltiples.",
    direccion: "Calle Nueva Norte, Sector La Guardia"
  },
  {
    id: "poi-escuela-miguelsuniaga",
    nombre: "U.E. Nacional Bolivariana \"Miguel Suniaga\"",
    categoria: "educacion",
    // Verified: frente a la Calle Nueva, cerca de antena CANTV, La Guardia
    latitud: 10.9918,
    longitud: -64.0198,
    descripcion: "Centro educativo de gran tradición histórica en La Guardia. Considerada una de las escuelas graduadas originarias de Nueva Esparta y pieza fundamental para la comunidad pesquera local.",
    direccion: "Sector Centro, frente a Calle Nueva y antena CANTV, La Guardia"
  },
  {
    id: "poi-escuela-tecnica-ayacucho",
    nombre: "Escuela Técnica \"Gran Mariscal de Ayacucho\"",
    categoria: "educacion",
    // Verified: Carapacho ≈ 11.0021,-63.9592 (gelvez.com.ve)
    latitud: 11.0021,
    longitud: -63.9592,
    descripcion: "Pilar de la formación media técnica y profesional del municipio. Prepara a jóvenes del sector central directamente para la inserción en el sector administrativo y de comercio local.",
    direccion: "Calle Miranda, diagonal con Calle Ayacucho, Sector Carapacho"
  },
  {
    id: "poi-escuela-agropecuaria-bolivar",
    nombre: "Escuela Técnica Agropecuaria \"Simón Bolívar\"",
    categoria: "educacion",
    // Verified: El Tuey / Guatacaral ≈ 11.003,-63.965 (mapcarta + elsoldemargarita)
    latitud: 11.0030,
    longitud: -63.9650,
    descripcion: "Institución clave en el desarrollo agrícola del valle. Enfocada en la enseñanza técnica agropecuaria, aprovechando las características geográficas del Municipio Díaz.",
    direccion: "Sector El Tuey / Guatacaral, San Juan Bautista"
  },
  {
    id: "poi-escuela-mariainmaculada",
    nombre: "U.E. \"María Inmaculada\"",
    categoria: "educacion",
    // Verified: Mapcarta/worldplaces.me 11.01177,-63.94271 → San Juan Bautista
    latitud: 11.0118,
    longitud: -63.9427,
    descripcion: "Institución subvencionada de referencia tradicional en San Juan Bautista. Con larga trayectoria académica y excelente ubicación, es el centro educativo histórico de las familias de la zona central del municipio.",
    direccion: "Calle Principal, cerca de la Plaza Antonio Díaz, San Juan Bautista"
  },

  // ─── GASTRONOMÍA ─────────────────────────────────────────────────────────
  {
    id: "poi-parador-datil",
    nombre: "Parador del Dátil y Piñonate",
    categoria: "comida",
    // Cerca de El Espinal sobre la Autopista Juan Bautista Arismendi
    latitud: 10.9690,
    longitud: -63.9830,
    descripcion: "Punto de encuentro gastronómico tradicional a pie de carretera. Famoso por la venta de piñonate original (dulce de lechosa y naranja) y conservas de dátiles elaboradas por familias artesanas locales.",
    direccion: "Autopista Juan Bautista Arismendi, vía San Juan – El Espinal"
  },
  {
    id: "poi-rest-lafinca",
    nombre: "Restaurante \"La Finca de San Juan\"",
    categoria: "comida",
    // Entrada de San Juan Bautista desde la autopista
    latitud: 11.0080,
    longitud: -63.9380,
    descripcion: "Destacado restaurante de comida típica margariteña y menús ejecutivos. Famoso por su sancocho de pescado fresco, cochino frito y arepas de maíz pilado en un ambiente campestre y familiar.",
    direccion: "Entrada a San Juan Bautista, sector La Finca"
  },
  {
    id: "poi-arepera-espinal",
    nombre: "Arepera Tradicional El Espinal",
    categoria: "comida",
    // Cruce de El Espinal sobre autopista
    latitud: 10.9665,
    longitud: -63.9800,
    descripcion: "Parada gastronómica obligatoria y muy concurrida por locales. Ofrece arepas gigantes rellenas de guisados típicos (cazón, carne mechada, queso de mano) y platos ejecutivos a precios accesibles.",
    direccion: "Cruce de El Espinal, Autopista Juan Bautista Arismendi"
  },
  {
    id: "poi-rincon-datil",
    nombre: "Dulcería \"El Rincón del Dátil\"",
    categoria: "comida",
    // San Juan, cerca de la plaza (frente a la Plaza Antonio Díaz)
    latitud: 11.0120,
    longitud: -63.9430,
    descripcion: "Cafetería y dulcería especializada en repostería tradicional. Sirven tortas de dátil, helados artesanales de frutas locales y almuerzos ejecutivos caseros muy cotizados.",
    direccion: "Calle Carabobo, frente a la Plaza Antonio Díaz, San Juan Bautista"
  },
  {
    id: "poi-rest-muelle-guardia",
    nombre: "Restaurante \"El Muelle de La Guardia\"",
    categoria: "comida",
    // Orilla de playa de La Guardia
    latitud: 10.9970,
    longitud: -64.0230,
    descripcion: "Famoso restaurante de mariscos y pescado fresco ubicado frente a la orilla del mar. Su especialidad son las mariscadas, el pescado frito al estilo margariteño y los almuerzos de mar de excelente calidad.",
    direccion: "Calle La Marina, orilla de playa, La Guardia"
  },
  {
    id: "poi-empanadas-carmen",
    nombre: "Empanadas de Doña Carmen",
    categoria: "comida",
    // San Juan, frente a plaza (ligeramente desplazado de la iglesia)
    latitud: 11.0115,
    longitud: -63.9428,
    descripcion: "El puesto de empanadas más concurrido de San Juan. Famoso por sus empanadas de cazón (típicas de la isla), carne mechada y queso de mano, hechas al momento y acompañadas de salsas de la casa.",
    direccion: "Frente a la Plaza Antonio Díaz, San Juan Bautista"
  },
  {
    id: "poi-rest-sabor-campestre",
    nombre: "Restaurante \"Sabor Campestre\"",
    categoria: "comida",
    // Sector las Barrancas, entre San Juan y la autopista
    latitud: 10.9910,
    longitud: -63.9750,
    descripcion: "Muy conocido por sus accesibles y abundantes almuerzos ejecutivos caseros (sancocho de gallina, asado negro, pescado frito) en un ambiente campestre rodeado de vegetación.",
    direccion: "Sector Las Barrancas, vía San Juan Bautista"
  },
  {
    id: "poi-empanadas-patria",
    nombre: "Empanadas \"Doña Patria\"",
    categoria: "comida",
    // El Espinal, parada de autobuses
    latitud: 10.9670,
    longitud: -63.9810,
    descripcion: "Puesto emblemático de comida típica rápida en El Espinal. Sus empanadas de mariscos (pepitonas, camarones y cazón) son sumamente populares tanto para locales como para viajeros.",
    direccion: "Cerca de la parada de autobuses, El Espinal"
  }
];
