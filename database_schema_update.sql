-- MIGRACIÓN DE SEGURIDAD Y VERIFICACIÓN PARA GUAIKE.DÍAZ
-- Ejecuta este script en el editor SQL de tu panel de Supabase.

-- 1. Agregar columnas necesarias para la verificación, recuperación y rate limiting
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS verificado BOOLEAN DEFAULT FALSE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS codigo_verificacion VARCHAR(20) DEFAULT NULL;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS codigo_enviado_en TIMESTAMP DEFAULT NULL;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS preguntas_seguridad JSONB DEFAULT NULL;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS intentos_fallidos INTEGER DEFAULT 0;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS bloqueado_hasta TIMESTAMP DEFAULT NULL;

-- 2. Asegurar que los usuarios existentes queden con estado verificado para no interrumpir su flujo previo
UPDATE usuarios SET verificado = TRUE WHERE verificado IS NULL;
