-- Esquema de Base de Datos para GUAIKE.DÍAZ
-- Sistema de Información Geoespacial - Municipio Díaz
-- Sistema Manejador: PostgreSQL 15+ con PostGIS

-- 1. Habilitar extensión geoespacial
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Tablas Maestras (Lookup Tables)
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS parroquias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS opciones_accesibilidad (
    id SERIAL PRIMARY KEY,
    etiqueta VARCHAR(100) UNIQUE NOT NULL,
    icono VARCHAR(50) -- Clase de icono de Lucide o similar
);

-- 3. Usuarios y Autenticación
CREATE TABLE IF NOT EXISTS usuarios (
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
    nombre_completo VARCHAR(255),
    telefono VARCHAR(20),
    cedula_tipo VARCHAR(10),
    cedula_numero VARCHAR(20),
    fecha_nacimiento DATE,
    municipio_residencia VARCHAR(100),
    requiere_cambio_clave BOOLEAN DEFAULT FALSE,
    clave_temporal_expira TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Operadores (Artesanos / Guías)
CREATE TABLE IF NOT EXISTS operadores (
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
CREATE TABLE IF NOT EXISTS operador_imagenes (
    id BIGSERIAL PRIMARY KEY,
    operador_id BIGINT NOT NULL REFERENCES operadores(id) ON DELETE CASCADE,
    url_imagen TEXT NOT NULL,
    es_principal BOOLEAN DEFAULT FALSE,
    subido_por_usuario_id BIGINT REFERENCES usuarios(id), -- Para el contenido generado por usuarios (UGC)
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Accesibilidad (Relación N:M)
CREATE TABLE IF NOT EXISTS operador_accesibilidad (
    operador_id BIGINT REFERENCES operadores(id) ON DELETE CASCADE,
    accesibilidad_id INTEGER REFERENCES opciones_accesibilidad(id) ON DELETE CASCADE,
    PRIMARY KEY (operador_id, accesibilidad_id)
);

-- 7. Catálogo de Productos
CREATE TABLE IF NOT EXISTS productos (
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
CREATE TABLE IF NOT EXISTS resenas (
    id BIGSERIAL PRIMARY KEY,
    operador_id BIGINT NOT NULL REFERENCES operadores(id) ON DELETE CASCADE,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
    puntuacion INTEGER CHECK (puntuacion >= 1 AND puntuacion <= 5),
    comentario TEXT,
    qr_verificado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Eventos y Ferias
CREATE TABLE IF NOT EXISTS eventos (
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
CREATE TABLE IF NOT EXISTS registros_busqueda (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES usuarios(id), -- Opcional (anónimo)
    categoria_id INTEGER REFERENCES categorias(id),
    parroquia_id INTEGER REFERENCES parroquias(id),
    fecha_busqueda TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices Geoespaciales y de Búsqueda
CREATE INDEX IF NOT EXISTS idx_operadores_ubicacion ON operadores USING GIST (ubicacion);
CREATE INDEX IF NOT EXISTS idx_eventos_ubicacion ON eventos USING GIST (ubicacion);
CREATE INDEX IF NOT EXISTS idx_operadores_nombre ON operadores(nombre_taller);

-- Datos Semilla Básicos
INSERT INTO roles (nombre) VALUES ('admin'), ('operador'), ('turista') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO parroquias (nombre) VALUES ('San Juan Bautista'), ('Zabala') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO categorias (nombre) VALUES 
    ('Tejido de Palma'), 
    ('Textil (Hamacas)'), 
    ('Gastronomía Tradicional'), 
    ('Artesanía en Dátil'), 
    ('Guía Turístico')
ON CONFLICT (nombre) DO NOTHING;
INSERT INTO opciones_accesibilidad (etiqueta) VALUES 
    ('Acceso Vehicular'), 
    ('Rampa de Discapacidad'), 
    ('Pet Friendly'), 
    ('Estacionamiento')
ON CONFLICT (etiqueta) DO NOTHING;

-- 11. Tablas del Data Mart (Inteligencia de Negocios)
CREATE TABLE IF NOT EXISTS dim_tiempo (
    sk_tiempo INTEGER PRIMARY KEY, -- Formato AAAAMMDD
    fecha DATE UNIQUE NOT NULL,
    dia INTEGER NOT NULL,
    mes INTEGER NOT NULL,
    mes_nombre VARCHAR(30) NOT NULL,
    trimestre INTEGER NOT NULL,
    ano INTEGER NOT NULL,
    dia_semana INTEGER NOT NULL,
    es_fin_de_semana BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS dim_artesano (
    sk_artesano SERIAL PRIMARY KEY,
    id_operador_sistema BIGINT UNIQUE NOT NULL,
    nombre_taller VARCHAR(255) NOT NULL,
    categoria_nombre VARCHAR(100) NOT NULL,
    esta_verificado BOOLEAN NOT NULL,
    accesibilidad_vehicular BOOLEAN DEFAULT FALSE,
    rampa_discapacidad BOOLEAN DEFAULT FALSE,
    pet_friendly BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS dim_ubicacion (
    sk_ubicacion SERIAL PRIMARY KEY,
    parroquia_nombre VARCHAR(100) UNIQUE NOT NULL,
    latitud NUMERIC(9, 6) DEFAULT 0.0 NOT NULL,
    longitud NUMERIC(9, 6) DEFAULT 0.0 NOT NULL
);

CREATE TABLE IF NOT EXISTS dim_turista (
    sk_turista SERIAL PRIMARY KEY,
    id_usuario_sistema BIGINT UNIQUE NOT NULL,
    esta_autenticado BOOLEAN NOT NULL,
    es_residente BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS hechos_actividad_turistica (
    id_hecho BIGSERIAL PRIMARY KEY,
    sk_tiempo INTEGER NOT NULL REFERENCES dim_tiempo(sk_tiempo),
    sk_artesano INTEGER NOT NULL REFERENCES dim_artesano(sk_artesano),
    sk_ubicacion INTEGER NOT NULL REFERENCES dim_ubicacion(sk_ubicacion),
    sk_turista INTEGER NOT NULL REFERENCES dim_turista(sk_turista),
    tipo_actividad VARCHAR(50) NOT NULL, -- 'busqueda_directorio', 'contacto_whatsapp', 'visita_qr_verificada', 'opinion_enviada', 'itinerario_calculado'
    puntuacion_resena INTEGER CHECK (puntuacion_resena BETWEEN 1 AND 5),
    distancia_recorrida_km NUMERIC(6, 2),
    cantidad INTEGER DEFAULT 1 NOT NULL
);

-- Índices del Data Mart
CREATE INDEX IF NOT EXISTS idx_hechos_tiempo ON hechos_actividad_turistica(sk_tiempo);
CREATE INDEX IF NOT EXISTS idx_hechos_artesano ON hechos_actividad_turistica(sk_artesano);
CREATE INDEX IF NOT EXISTS idx_hechos_actividad ON hechos_actividad_turistica(tipo_actividad);

-- Insertar Registros Desconocidos / No Aplica para integridad referencial
INSERT INTO dim_artesano (sk_artesano, id_operador_sistema, nombre_taller, categoria_nombre, esta_verificado)
VALUES (0, 0, 'No Aplica', 'Ninguna', false)
ON CONFLICT (id_operador_sistema) DO NOTHING;

INSERT INTO dim_ubicacion (sk_ubicacion, parroquia_nombre, latitud, longitud)
VALUES (0, 'No Aplica', 0.0, 0.0)
ON CONFLICT (parroquia_nombre) DO NOTHING;

INSERT INTO dim_turista (sk_turista, id_usuario_sistema, esta_autenticado, es_residente)
VALUES (0, 0, false, false)
ON CONFLICT (id_usuario_sistema) DO NOTHING;

-- Pre-poblar dim_tiempo para el periodo 2025-2035
INSERT INTO dim_tiempo (sk_tiempo, fecha, dia, mes, mes_nombre, trimestre, ano, dia_semana, es_fin_de_semana)
SELECT 
    to_char(d, 'YYYYMMDD')::integer as sk_tiempo,
    d::date as fecha,
    extract(day from d)::integer as dia,
    extract(month from d)::integer as mes,
    to_char(d, 'Month') as mes_nombre,
    extract(quarter from d)::integer as trimestre,
    extract(year from d)::integer as ano,
    extract(isodow from d)::integer as dia_semana,
    case when extract(isodow from d) in (6, 7) then true else false end as es_fin_de_semana
FROM generate_series('2025-01-01'::timestamp, '2035-12-31'::timestamp, '1 day'::interval) d
ON CONFLICT (fecha) DO NOTHING;

-- Trigger de creación de nuevo usuario desde Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  role_name text;
  role_id_var integer;
  full_name_var text;
  telefono_var text;
BEGIN
  -- Extraer rol de raw_user_meta_data (por defecto 'turista')
  role_name := COALESCE(new.raw_user_meta_data ->> 'role', 'turista');
  
  -- MEDIDA DE SEGURIDAD CRÍTICA:
  -- Prevenir escalación de privilegios. Solo se permite el registro público
  -- para los roles 'turista' y 'operador'. Cualquier otro (como 'admin')
  -- es degradado a 'turista' de forma inmediata y silenciosa.
  IF role_name NOT IN ('turista', 'operador') THEN
    role_name := 'turista';
  END IF;
  
  -- Extraer nombre y teléfono desde la metadata de Supabase Auth
  full_name_var := COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '');
  telefono_var := COALESCE(new.raw_user_meta_data ->> 'phone', '');
  
  -- Obtener el ID del rol correspondiente en la tabla roles
  SELECT id INTO role_id_var FROM public.roles WHERE nombre = role_name;
  
  -- Si por algún motivo no se encuentra, usar el rol de 'turista'
  IF role_id_var IS NULL THEN
    SELECT id INTO role_id_var FROM public.roles WHERE nombre = 'turista';
  END IF;

  -- Insertar en la tabla usuarios pública o actualizar si ya existe (evitando duplicaciones)
  INSERT INTO public.usuarios (
    correo, contrasena, rol_id, auth_id, verificado, 
    fecha_creacion, fecha_actualizacion, nombre_completo, telefono
  )
  VALUES (
    new.email, '', role_id_var, new.id, true, 
    now(), now(), full_name_var, telefono_var
  )
  ON CONFLICT (correo) DO UPDATE 
  SET auth_id = new.id, 
      rol_id = EXCLUDED.rol_id,
      nombre_completo = EXCLUDED.nombre_completo,
      telefono = EXCLUDED.telefono,
      fecha_actualizacion = now();
      
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-vincular el trigger de forma segura a auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger de actualización de auth_id cuando el usuario ya existe pero auth_id es null
CREATE OR REPLACE FUNCTION public.handle_update_user()
RETURNS trigger AS $$
BEGIN
  UPDATE public.usuarios
  SET auth_id = new.id,
      fecha_actualizacion = now()
  WHERE correo = new.email AND auth_id IS NULL;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_update_user();

-- Funciones y Triggers de Sincronización
-- 1. Usuarios a dim_turista
CREATE OR REPLACE FUNCTION sync_dim_turista()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.dim_turista (id_usuario_sistema, esta_autenticado, es_residente)
    VALUES (
        NEW.id,
        TRUE,
        CASE WHEN NEW.correo LIKE '%.ve' OR NEW.preguntas_seguridad IS NOT NULL THEN TRUE ELSE FALSE END
    )
    ON CONFLICT (id_usuario_sistema) DO UPDATE 
    SET esta_autenticado = TRUE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_dim_turista ON usuarios;
CREATE OR REPLACE TRIGGER trg_sync_dim_turista
AFTER INSERT ON usuarios
FOR EACH ROW
EXECUTE FUNCTION sync_dim_turista();
-- 2. Operadores a dim_artesano
CREATE OR REPLACE FUNCTION sync_dim_artesano()
RETURNS TRIGGER AS $$
DECLARE
    v_categoria VARCHAR(100);
    v_vehicular BOOLEAN;
    v_rampa BOOLEAN;
    v_pet BOOLEAN;
BEGIN
    SELECT nombre INTO v_categoria FROM public.categorias WHERE id = NEW.categoria_id;
    
    SELECT EXISTS (SELECT 1 FROM public.operador_accesibilidad WHERE operador_id = NEW.id AND accesibilidad_id = 1) INTO v_vehicular;
    SELECT EXISTS (SELECT 1 FROM public.operador_accesibilidad WHERE operador_id = NEW.id AND accesibilidad_id = 2) INTO v_rampa;
    SELECT EXISTS (SELECT 1 FROM public.operador_accesibilidad WHERE operador_id = NEW.id AND accesibilidad_id = 3) INTO v_pet;
 
    INSERT INTO public.dim_artesano (id_operador_sistema, nombre_taller, categoria_nombre, esta_verificado, accesibilidad_vehicular, rampa_discapacidad, pet_friendly)
    VALUES (
        NEW.id,
        NEW.nombre_taller,
        COALESCE(v_categoria, 'Sin Categoría'),
        NEW.es_verificado,
        v_vehicular,
        v_rampa,
        v_pet
    )
    ON CONFLICT (id_operador_sistema) DO UPDATE 
    SET nombre_taller = EXCLUDED.nombre_taller,
        categoria_nombre = EXCLUDED.categoria_nombre,
        esta_verificado = EXCLUDED.esta_verificado,
        accesibilidad_vehicular = EXCLUDED.accesibilidad_vehicular,
        rampa_discapacidad = EXCLUDED.rampa_discapacidad,
        pet_friendly = EXCLUDED.pet_friendly;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_dim_artesano ON operadores;
CREATE OR REPLACE TRIGGER trg_sync_dim_artesano
AFTER INSERT OR UPDATE ON operadores
FOR EACH ROW
EXECUTE FUNCTION sync_dim_artesano();

-- 3. Busquedas a hechos_actividad_turistica
CREATE OR REPLACE FUNCTION sync_fact_busqueda()
RETURNS TRIGGER AS $$
DECLARE
    v_sk_artesano INT;
    v_sk_ubicacion INT;
    v_sk_turista INT;
    v_sk_tiempo INT;
BEGIN
    v_sk_tiempo := to_char(NEW.fecha_busqueda, 'YYYYMMDD')::integer;
    
    -- Si hay categoría en la búsqueda, buscamos su registro dummy en dim_artesano
    IF NEW.categoria_id IS NOT NULL THEN
        SELECT sk_artesano INTO v_sk_artesano FROM public.dim_artesano WHERE id_operador_sistema = -NEW.categoria_id LIMIT 1;
    END IF;
    v_sk_artesano := COALESCE(v_sk_artesano, 0);

    IF NEW.parroquia_id IS NOT NULL THEN
        SELECT sk_ubicacion INTO v_sk_ubicacion FROM public.dim_ubicacion 
        WHERE parroquia_nombre = (SELECT nombre FROM public.parroquias WHERE id = NEW.parroquia_id) LIMIT 1;
    END IF;
    v_sk_ubicacion := COALESCE(v_sk_ubicacion, 0);

    IF NEW.usuario_id IS NOT NULL THEN
        SELECT sk_turista INTO v_sk_turista FROM public.dim_turista WHERE id_usuario_sistema = NEW.usuario_id LIMIT 1;
    END IF;
    v_sk_turista := COALESCE(v_sk_turista, 0);

    INSERT INTO public.hechos_actividad_turistica (sk_tiempo, sk_artesano, sk_ubicacion, sk_turista, tipo_actividad, cantidad)
    VALUES (v_sk_tiempo, v_sk_artesano, v_sk_ubicacion, v_sk_turista, 'busqueda_directorio', 1);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_fact_busqueda ON registros_busqueda;
CREATE OR REPLACE TRIGGER trg_sync_fact_busqueda
AFTER INSERT ON registros_busqueda
FOR EACH ROW
EXECUTE FUNCTION sync_fact_busqueda();

-- 4. Reseñas a hechos_actividad_turistica
CREATE OR REPLACE FUNCTION sync_fact_resena()
RETURNS TRIGGER AS $$
DECLARE
    v_sk_artesano INT;
    v_sk_ubicacion INT;
    v_sk_turista INT;
    v_sk_tiempo INT;
    v_parroquia_id INT;
BEGIN
    v_sk_tiempo := to_char(NEW.fecha_creacion, 'YYYYMMDD')::integer;
    
    SELECT sk_artesano INTO v_sk_artesano FROM public.dim_artesano WHERE id_operador_sistema = NEW.operador_id LIMIT 1;
    v_sk_artesano := COALESCE(v_sk_artesano, 0);

    SELECT parroquia_id INTO v_parroquia_id FROM public.operadores WHERE id = NEW.operador_id;
    IF v_parroquia_id IS NOT NULL THEN
        SELECT sk_ubicacion INTO v_sk_ubicacion FROM public.dim_ubicacion 
        WHERE parroquia_nombre = (SELECT nombre FROM public.parroquias WHERE id = v_parroquia_id) LIMIT 1;
    END IF;
    v_sk_ubicacion := COALESCE(v_sk_ubicacion, 0);

    SELECT sk_turista INTO v_sk_turista FROM public.dim_turista WHERE id_usuario_sistema = NEW.usuario_id LIMIT 1;
    v_sk_turista := COALESCE(v_sk_turista, 0);

    INSERT INTO public.hechos_actividad_turistica (sk_tiempo, sk_artesano, sk_ubicacion, sk_turista, tipo_actividad, puntuacion_resena, cantidad)
    VALUES (
        v_sk_tiempo, 
        v_sk_artesano, 
        v_sk_ubicacion, 
        v_sk_turista, 
        CASE WHEN NEW.qr_verificado THEN 'visita_qr_verificada' ELSE 'opinion_enviada' END,
        NEW.puntuacion,
        1
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_fact_resena ON resenas;
CREATE OR REPLACE TRIGGER trg_sync_fact_resena
AFTER INSERT ON resenas
FOR EACH ROW
EXECUTE FUNCTION sync_fact_resena();

-- Backfill de datos existentes
CREATE OR REPLACE FUNCTION backfill_data_mart()
RETURNS void AS $$
BEGIN
    -- A. Parroquias a dim_ubicacion
    INSERT INTO dim_ubicacion (parroquia_nombre, latitud, longitud)
    SELECT nombre, 10.95, -63.97 FROM parroquias
    ON CONFLICT (parroquia_nombre) DO NOTHING;

    -- B. Usuarios a dim_turista
    INSERT INTO dim_turista (id_usuario_sistema, esta_autenticado, es_residente)
    SELECT id, true, case when correo like '%.ve' then true else false end FROM usuarios
    ON CONFLICT (id_usuario_sistema) DO NOTHING;

    -- C.1. Insertar registros de categorías dummy en dim_artesano para búsquedas
    INSERT INTO dim_artesano (id_operador_sistema, nombre_taller, categoria_nombre, esta_verificado)
    SELECT -id, 'Solo Búsqueda', nombre, false FROM categorias
    ON CONFLICT (id_operador_sistema) DO NOTHING;

    -- C.2. Operadores a dim_artesano
    INSERT INTO dim_artesano (id_operador_sistema, nombre_taller, categoria_nombre, esta_verificado)
    SELECT o.id, o.nombre_taller, c.nombre, o.es_verificado 
    FROM operadores o
    JOIN categorias c ON o.categoria_id = c.id
    ON CONFLICT (id_operador_sistema) DO NOTHING;

    -- D. Registros de busqueda a hechos (mapeando a los dummies de categoria y parroquia)
    INSERT INTO hechos_actividad_turistica (sk_tiempo, sk_artesano, sk_ubicacion, sk_turista, tipo_actividad, cantidad)
    SELECT 
        to_char(r.fecha_busqueda, 'YYYYMMDD')::integer,
        COALESCE((SELECT sk_artesano FROM dim_artesano WHERE id_operador_sistema = -r.categoria_id), 0),
        COALESCE((SELECT sk_ubicacion FROM dim_ubicacion WHERE parroquia_nombre = (SELECT nombre FROM parroquias WHERE id = r.parroquia_id)), 0),
        COALESCE((SELECT sk_turista FROM dim_turista WHERE id_usuario_sistema = r.usuario_id), 0),
        'busqueda_directorio',
        1
    FROM registros_busqueda r
    ON CONFLICT DO NOTHING;

    -- E. Reseñas a hechos
    INSERT INTO hechos_actividad_turistica (sk_tiempo, sk_artesano, sk_ubicacion, sk_turista, tipo_actividad, puntuacion_resena, cantidad)
    SELECT 
        to_char(res.fecha_creacion, 'YYYYMMDD')::integer,
        COALESCE((SELECT sk_artesano FROM dim_artesano WHERE id_operador_sistema = res.operador_id), 0),
        COALESCE((SELECT sk_ubicacion FROM dim_ubicacion WHERE parroquia_nombre = (SELECT nombre FROM parroquias WHERE id = (SELECT parroquia_id FROM operadores WHERE id = res.operador_id))), 0),
        COALESCE((SELECT sk_turista FROM dim_turista WHERE id_usuario_sistema = res.usuario_id), 0),
        case when res.qr_verificado then 'visita_qr_verificada' else 'opinion_enviada' end,
        res.puntuacion,
        1
    FROM resenas res
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- 12. Políticas de Seguridad de Fila (RLS) para el Data Mart
ALTER TABLE dim_tiempo ENABLE ROW LEVEL SECURITY;
ALTER TABLE dim_artesano ENABLE ROW LEVEL SECURITY;
ALTER TABLE dim_ubicacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE dim_turista ENABLE ROW LEVEL SECURITY;
ALTER TABLE hechos_actividad_turistica ENABLE ROW LEVEL SECURITY;

-- Permite lecturas (SELECT) públicas a usuarios anónimos y autenticados
DROP POLICY IF EXISTS select_public_dim_tiempo ON dim_tiempo;
CREATE POLICY select_public_dim_tiempo ON dim_tiempo FOR SELECT USING (true);

DROP POLICY IF EXISTS select_public_dim_artesano ON dim_artesano;
CREATE POLICY select_public_dim_artesano ON dim_artesano FOR SELECT USING (true);

DROP POLICY IF EXISTS select_public_dim_ubicacion ON dim_ubicacion;
CREATE POLICY select_public_dim_ubicacion ON dim_ubicacion FOR SELECT USING (true);

DROP POLICY IF EXISTS select_public_dim_turista ON dim_turista;
CREATE POLICY select_public_dim_turista ON dim_turista FOR SELECT USING (true);

DROP POLICY IF EXISTS select_public_hechos ON hechos_actividad_turistica;
CREATE POLICY select_public_hechos ON hechos_actividad_turistica FOR SELECT USING (true);

-- 13. Políticas de Seguridad de Fila (RLS) para la tabla usuarios
-- Habilitar RLS (ya habilitado por la migración add_auth_id_and_rls, pero se garantiza aquí)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- SELECT: permite a cada usuario ver su propio registro.
-- Doble condición: por auth_id (preferida) o por correo extraído del JWT (fallback para
-- registros legacy cuyo auth_id todavía no ha sido backfillado).
-- NOTA: usamos auth.jwt() ->> 'email' en lugar de SELECT FROM auth.users porque
--       la tabla auth.users NO es accesible con el rol anon/authenticated.
DROP POLICY IF EXISTS usuarios_select_own ON usuarios;
DROP POLICY IF EXISTS usuarios_select_by_email ON usuarios;
CREATE POLICY usuarios_select_own ON usuarios
FOR SELECT
USING (
  auth.uid() = auth_id
  OR correo = (auth.jwt() ->> 'email')
);

-- INSERT: el trigger SECURITY DEFINER handle_new_user() inserta con el rol postgres,
-- que no está sujeto a RLS. Sin embargo, se permite también al usuario insertar su propio
-- registro en caso de que el trigger falle (condición de carrera).
DROP POLICY IF EXISTS usuarios_insert_own ON usuarios;
CREATE POLICY usuarios_insert_own ON usuarios
FOR INSERT
WITH CHECK (
  auth.uid() = auth_id
  OR correo = (auth.jwt() ->> 'email')
);

-- UPDATE: el usuario solo puede modificar su propio registro.
DROP POLICY IF EXISTS usuarios_update_own ON usuarios;
CREATE POLICY usuarios_update_own ON usuarios
FOR UPDATE
USING (
  auth.uid() = auth_id
  OR correo = (auth.jwt() ->> 'email')
)
WITH CHECK (
  auth.uid() = auth_id
  OR correo = (auth.jwt() ->> 'email')
);


