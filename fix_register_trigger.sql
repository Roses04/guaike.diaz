-- ===========================================================================
-- SCRIPT DE SEGURIDAD PARA EL REGISTRO DE USUARIOS (EJECUTAR EN SUPABASE)
-- ===========================================================================
-- Este script actualiza el trigger `handle_new_user` para prevenir que usuarios
-- malintencionados escalen sus privilegios a Administrador ('admin') enviando
-- metadatos de registro alterados desde el cliente.
-- Solo se permiten registrar como 'turista' o 'operador'. Cualquier otro rol
-- es forzado automáticamente al rol base 'turista'.

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

-- Re-vincular el trigger de forma segura
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Notificar estado de la ejecución
RAISE NOTICE '¡Trigger handle_new_user() actualizado y protegido contra exploits con éxito!';
