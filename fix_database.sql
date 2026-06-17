-- ===========================================================================
-- SCRIPT DE CORRECCIÓN PARA SUPABASE (EJECUTAR EN SQL EDITOR)
-- ===========================================================================

-- 1. CORREGIR EL TRIGGER DE NUEVOS USUARIOS PARA LEER EL ROL CORRECTO DESDE METADATOS
-- Esto garantiza que en el futuro cualquier registro de Operador o Turista se guarde con su rol correspondiente.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  role_name text;
  role_id_var integer;
BEGIN
  -- Extraer rol de raw_user_meta_data (por defecto 'turista')
  role_name := COALESCE(new.raw_user_meta_data ->> 'role', 'turista');
  
  -- Obtener el ID del rol correspondiente en la tabla roles
  SELECT id INTO role_id_var FROM public.roles WHERE nombre = role_name;
  
  -- Si no se encuentra, usar el rol de 'turista'
  IF role_id_var IS NULL THEN
    SELECT id INTO role_id_var FROM public.roles WHERE nombre = 'turista';
  END IF;

  -- Insertar en la tabla usuarios pública o actualizar si ya existe (evitando duplicaciones)
  INSERT INTO public.usuarios (correo, contrasena, rol_id, auth_id, verificado, fecha_creacion, fecha_actualizacion)
  VALUES (new.email, '', role_id_var, new.id, true, now(), now())
  ON CONFLICT (correo) DO UPDATE 
  SET auth_id = new.id, 
      rol_id = EXCLUDED.rol_id,
      fecha_actualizacion = now();
      
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Asegurarnos de que el trigger esté vinculado a auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. CORREGIR EL USUARIO jesus05vmartinez@gmail.com A ROL OPERADOR Y CREAR SU REGISTRO
DO $$
DECLARE
  role_op_id integer;
  user_id_var bigint;
  parr_id integer;
  cat_id integer;
BEGIN
  -- Obtener el ID del rol 'operador'
  SELECT id INTO role_op_id FROM public.roles WHERE nombre = 'operador';
  
  IF role_op_id IS NULL THEN
    RAISE NOTICE 'El rol operador no existe. Por favor crea primero el esquema básico.';
    RETURN;
  END IF;

  -- Corregir el rol en la tabla usuarios
  UPDATE public.usuarios 
  SET rol_id = role_op_id 
  WHERE correo = 'jesus05vmartinez@gmail.com';

  -- Obtener el id del usuario actualizado
  SELECT id INTO user_id_var FROM public.usuarios WHERE correo = 'jesus05vmartinez@gmail.com';

  IF user_id_var IS NOT NULL THEN
    -- Si no tiene un registro en la tabla operadores, crearlo por defecto
    IF NOT EXISTS (SELECT 1 FROM public.operadores WHERE usuario_id = user_id_var) THEN
      -- Obtener alguna parroquia y categoría de respaldo
      SELECT id INTO parr_id FROM public.parroquias LIMIT 1;
      SELECT id INTO cat_id FROM public.categorias LIMIT 1;

      INSERT INTO public.operadores (
        usuario_id, 
        parroquia_id, 
        categoria_id, 
        nombre_taller, 
        descripcion, 
        ubicacion, 
        direccion_detallada, 
        es_verificado
      )
      VALUES (
        user_id_var,
        COALESCE(parr_id, 1),
        COALESCE(cat_id, 1),
        'Taller de Jesús Martínez',
        'Taller artesanal de productos tradicionales.',
        'SRID=4326;POINT(-63.8966 11.0189)'::geography, -- Coordenada predeterminada del Municipio Díaz
        'Valle de San Juan, Municipio Díaz',
        true
      );
      
      RAISE NOTICE '¡Perfil de operador creado para jesus05vmartinez exitosamente!';
    ELSE
      -- Si ya existe, asegurar que es_verificado = true para que aparezca en el directorio
      UPDATE public.operadores 
      SET es_verificado = true 
      WHERE usuario_id = user_id_var;
      
      RAISE NOTICE '¡Rol y perfil de jesus05vmartinez actualizados a verificado!';
    END IF;
  ELSE
    RAISE NOTICE 'El usuario jesus05vmartinez@gmail.com no se encontró en la tabla usuarios pública.';
  END IF;
END $$;
