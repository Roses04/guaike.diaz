export const shorthands = undefined;

export const up = (pgm) => {
  // 1. Enable PostGIS
  pgm.sql("CREATE EXTENSION IF NOT EXISTS postgis");

  // 2. Roles Table
  pgm.createTable("roles", {
    id: "id",
    nombre: { type: "varchar(50)", notNull: true, unique: true },
  });

  // 3. Categorias Table
  pgm.createTable("categorias", {
    id: "id",
    nombre: { type: "varchar(100)", notNull: true, unique: true },
    descripcion: { type: "text" },
  });

  // 4. Parroquias Table
  pgm.createTable("parroquias", {
    id: "id",
    nombre: { type: "varchar(100)", notNull: true, unique: true },
  });

  // 5. Opciones Accesibilidad Table
  pgm.createTable("opciones_accesibilidad", {
    id: "id",
    etiqueta: { type: "varchar(100)", notNull: true, unique: true },
    icono: { type: "varchar(50)" },
  });

  // 6. Usuarios Table
  pgm.createTable("usuarios", {
    id: { type: "bigserial", primaryKey: true },
    correo: { type: "varchar(255)", notNull: true, unique: true },
    contrasena: { type: "varchar(255)", notNull: true },
    rol_id: {
      type: "integer",
      notNull: true,
      references: '"roles"',
    },
    ultimo_acceso: { type: "timestamp" },
    fecha_creacion: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    fecha_actualizacion: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // 7. Operadores Table
  pgm.createTable("operadores", {
    id: { type: "bigserial", primaryKey: true },
    usuario_id: {
      type: "bigint",
      notNull: true,
      unique: true,
      references: '"usuarios"',
      onDelete: "CASCADE",
    },
    parroquia_id: {
      type: "integer",
      notNull: true,
      references: '"parroquias"',
    },
    categoria_id: {
      type: "integer",
      notNull: true,
      references: '"categorias"',
    },
    nombre_taller: { type: "varchar(255)", notNull: true },
    descripcion: { type: "text" },
    ubicacion: { type: "geography(Point, 4326)", notNull: true },
    direccion_detallada: { type: "text" },
    telefono_whatsapp: { type: "varchar(20)" },
    es_verificado: { type: "boolean", notNull: true, default: false },
    qr_codigo_unico: {
      type: "uuid",
      unique: true,
      default: pgm.func("gen_random_uuid()"),
    },
    fecha_creacion: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    fecha_actualizacion: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // 8. Operador Imagenes Table
  pgm.createTable("operador_imagenes", {
    id: { type: "bigserial", primaryKey: true },
    operador_id: {
      type: "bigint",
      notNull: true,
      references: '"operadores"',
      onDelete: "CASCADE",
    },
    url_imagen: { type: "text", notNull: true },
    es_principal: { type: "boolean", notNull: true, default: false },
    subido_por_usuario_id: {
      type: "bigint",
      references: '"usuarios"',
    },
    fecha_subida: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // 9. Operador Accesibilidad Table (M:N Join Table)
  pgm.createTable("operador_accesibilidad", {
    operador_id: {
      type: "bigint",
      notNull: true,
      references: '"operadores"',
      onDelete: "CASCADE",
    },
    accesibilidad_id: {
      type: "integer",
      notNull: true,
      references: '"opciones_accesibilidad"',
      onDelete: "CASCADE",
    },
  });
  pgm.addConstraint("operador_accesibilidad", "pk_operador_accesibilidad", {
    primaryKey: ["operador_id", "accesibilidad_id"],
  });

  // 10. Productos Table
  pgm.createTable("productos", {
    id: { type: "bigserial", primaryKey: true },
    operador_id: {
      type: "bigint",
      notNull: true,
      references: '"operadores"',
      onDelete: "CASCADE",
    },
    nombre: { type: "varchar(150)", notNull: true },
    descripcion: { type: "text" },
    precio: { type: "decimal(10, 2)" },
    url_imagen: { type: "text" },
    esta_disponible: { type: "boolean", notNull: true, default: true },
    fecha_creacion: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // 11. Resenas Table
  pgm.createTable("resenas", {
    id: { type: "bigserial", primaryKey: true },
    operador_id: {
      type: "bigint",
      notNull: true,
      references: '"operadores"',
      onDelete: "CASCADE",
    },
    usuario_id: {
      type: "bigint",
      notNull: true,
      references: '"usuarios"',
    },
    puntuacion: {
      type: "integer",
      notNull: true,
      check: "puntuacion >= 1 AND puntuacion <= 5",
    },
    comentario: { type: "text" },
    qr_verificado: { type: "boolean", notNull: true, default: false },
    fecha_creacion: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // 12. Eventos Table
  pgm.createTable("eventos", {
    id: { type: "bigserial", primaryKey: true },
    titulo: { type: "varchar(255)", notNull: true },
    descripcion: { type: "text" },
    ubicacion: { type: "geography(Point, 4326)" },
    fecha_inicio: { type: "timestamp", notNull: true },
    fecha_fin: { type: "timestamp", notNull: true },
    url_imagen: { type: "text" },
    fecha_creacion: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // 13. Registros Busqueda Table
  pgm.createTable("registros_busqueda", {
    id: { type: "bigserial", primaryKey: true },
    usuario_id: { type: "bigint", references: '"usuarios"' },
    categoria_id: { type: "integer", references: '"categorias"' },
    parroquia_id: { type: "integer", references: '"parroquias"' },
    fecha_busqueda: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // 14. Indexes
  pgm.createIndex("operadores", "ubicacion", { method: "gist" });
  pgm.createIndex("eventos", "ubicacion", { method: "gist" });
  pgm.createIndex("operadores", "nombre_taller");

  // 15. Seed Seeders
  pgm.sql("INSERT INTO roles (nombre) VALUES ('admin'), ('operador'), ('turista')");
  pgm.sql("INSERT INTO parroquias (nombre) VALUES ('San Juan Bautista'), ('Zabala')");
  pgm.sql(
    "INSERT INTO categorias (nombre, descripcion) VALUES " +
      "('Tejido de Palma', 'Artesanías tejidas tradicionales a base de palma de dátil.'), " +
      "('Textil (Hamacas)', 'Hamacas y chinchorros de alta calidad tejidos a mano.'), " +
      "('Gastronomía Tradicional', 'Platos típicos del Municipio Díaz, incluyendo dulces a base de dátil.'), " +
      "('Artesanía en Dátil', 'Objetos utilitarios e industriales hechos de madera o derivados del dátil.'), " +
      "('Guía Turístico', 'Servicios de guiatura por el Valle de San Juan y zonas aledañas.')"
  );
  pgm.sql(
    "INSERT INTO opciones_accesibilidad (etiqueta, icono) VALUES " +
      "('Acceso Vehicular', 'car'), " +
      "('Rampa de Discapacidad', 'accessibility'), " +
      "('Pet Friendly', 'footprints'), " +
      "('Estacionamiento', 'square-parking')"
  );
};

export const down = (pgm) => {
  pgm.dropTable("registros_busqueda");
  pgm.dropTable("eventos");
  pgm.dropTable("resenas");
  pgm.dropTable("productos");
  pgm.dropTable("operador_accesibilidad");
  pgm.dropTable("operador_imagenes");
  pgm.dropTable("operadores");
  pgm.dropTable("usuarios");
  pgm.dropTable("opciones_accesibilidad");
  pgm.dropTable("parroquias");
  pgm.dropTable("categorias");
  pgm.dropTable("roles");
  pgm.sql("DROP EXTENSION IF EXISTS postgis");
};
