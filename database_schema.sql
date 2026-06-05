-- Esquema de Base de Datos para GUAIKE.DÍAZ
-- Sistema de Información Geoespacial - Municipio Díaz
-- Sistema Manejador: PostgreSQL 15+ con PostGIS

-- 1. Habilitar extensión geoespacial
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Tablas Maestras (Lookup Tables)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT
);

CREATE TABLE parroquias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE opciones_accesibilidad (
    id SERIAL PRIMARY KEY,
    etiqueta VARCHAR(100) UNIQUE NOT NULL,
    icono VARCHAR(50) -- Clase de icono de Lucide o similar
);

-- 3. Usuarios y Autenticación
CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    correo VARCHAR(255) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol_id INTEGER NOT NULL REFERENCES roles(id),
    verificado BOOLEAN DEFAULT FALSE,
    codigo_verificacion VARCHAR(20) DEFAULT NULL,
    codigo_enviado_en TIMESTAMP DEFAULT NULL,
    preguntas_seguridad JSONB DEFAULT NULL,
    intentos_fallidos INTEGER DEFAULT 0,
    bloqueado_hasta TIMESTAMP DEFAULT NULL,
    auth_id UUID,
    ultimo_acceso TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Operadores (Artesanos / Guías)
CREATE TABLE operadores (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    parroquia_id INTEGER NOT NULL REFERENCES parroquias(id),
    categoria_id INTEGER NOT NULL REFERENCES categorias(id),
    nombre_taller VARCHAR(255) NOT NULL,
    descripcion TEXT,
    ubicacion GEOGRAPHY(Point, 4326) NOT NULL,
    direccion_detallada TEXT,
    telefono_whatsapp VARCHAR(20),
    es_verificado BOOLEAN DEFAULT FALSE,
    qr_codigo_unico UUID UNIQUE DEFAULT gen_random_uuid(),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Imágenes de Operadores (Relación 1:N para Galería/UGC)
CREATE TABLE operador_imagenes (
    id BIGSERIAL PRIMARY KEY,
    operador_id BIGINT NOT NULL REFERENCES operadores(id) ON DELETE CASCADE,
    url_imagen TEXT NOT NULL,
    es_principal BOOLEAN DEFAULT FALSE,
    subido_por_usuario_id BIGINT REFERENCES usuarios(id), -- Para el contenido generado por usuarios (UGC)
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Accesibilidad (Relación N:M)
CREATE TABLE operador_accesibilidad (
    operador_id BIGINT REFERENCES operadores(id) ON DELETE CASCADE,
    accesibilidad_id INTEGER REFERENCES opciones_accesibilidad(id) ON DELETE CASCADE,
    PRIMARY KEY (operador_id, accesibilidad_id)
);

-- 7. Catálogo de Productos
CREATE TABLE productos (
    id BIGSERIAL PRIMARY KEY,
    operador_id BIGINT NOT NULL REFERENCES operadores(id) ON DELETE CASCADE,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2),
    url_imagen TEXT,
    esta_disponible BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Reseñas y Calificaciones
CREATE TABLE resenas (
    id BIGSERIAL PRIMARY KEY,
    operador_id BIGINT NOT NULL REFERENCES operadores(id) ON DELETE CASCADE,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
    puntuacion INTEGER CHECK (puntuacion >= 1 AND puntuacion <= 5),
    comentario TEXT,
    qr_verificado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Eventos y Ferias
CREATE TABLE eventos (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    ubicacion GEOGRAPHY(Point, 4326),
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL,
    url_imagen TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Registros para Estadísticas (Dashboard)
CREATE TABLE registros_busqueda (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES usuarios(id), -- Opcional (anónimo)
    categoria_id INTEGER REFERENCES categorias(id),
    parroquia_id INTEGER REFERENCES parroquias(id),
    fecha_busqueda TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices Geoespaciales y de Búsqueda
CREATE INDEX idx_operadores_ubicacion ON operadores USING GIST (ubicacion);
CREATE INDEX idx_eventos_ubicacion ON eventos USING GIST (ubicacion);
CREATE INDEX idx_operadores_nombre ON operadores(nombre_taller);

-- Datos Semilla Básicos
INSERT INTO roles (nombre) VALUES ('admin'), ('operador'), ('turista');
INSERT INTO parroquias (nombre) VALUES ('San Juan Bautista'), ('Zabala');
INSERT INTO categorias (nombre) VALUES 
    ('Tejido de Palma'), 
    ('Textil (Hamacas)'), 
    ('Gastronomía Tradicional'), 
    ('Artesanía en Dátil'), 
    ('Guía Turístico');
INSERT INTO opciones_accesibilidad (etiqueta) VALUES 
    ('Acceso Vehicular'), 
    ('Rampa de Discapacidad'), 
    ('Pet Friendly'), 
    ('Estacionamiento');
