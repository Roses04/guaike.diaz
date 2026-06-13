-- Script para añadir campos de contraseña temporal y función de purga de eventos

-- 1. Añadir campos a la tabla usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS requiere_cambio_clave BOOLEAN DEFAULT FALSE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS clave_temporal_expira TIMESTAMP DEFAULT NULL;

-- 2. Función de Purga de Eventos Antiguos
CREATE OR REPLACE FUNCTION public.purge_old_events()
RETURNS void AS $$
BEGIN
  -- Borrar todos los eventos cuya fecha de fin haya pasado hace más de 3 meses
  DELETE FROM public.eventos 
  WHERE fecha_fin < NOW() - INTERVAL '3 months';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permisos para la ejecución
ALTER FUNCTION public.purge_old_events() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.purge_old_events() TO postgres;
GRANT EXECUTE ON FUNCTION public.purge_old_events() TO authenticated;
GRANT EXECUTE ON FUNCTION public.purge_old_events() TO anon;

-- Para asegurarnos de que la función se llama periódicamente, la llamaremos desde el frontend (api.ts) 
-- a través de RPC (Remote Procedure Call) cada vez que el admin u otros carguen la lista de eventos.
-- O alternativamente crear una vista. Dado que el borrado debe ser físico, el RPC es la mejor solución 
-- sin pg_cron.
