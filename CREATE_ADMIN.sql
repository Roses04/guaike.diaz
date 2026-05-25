-- ===========================================================================
-- SCRIPT SQL PARA CREAR EL USUARIO ADMINISTRADOR EN SUPABASE
-- ===========================================================================
--
-- Ejecuta este script en el editor SQL de tu panel de Supabase (SQL Editor)
-- para registrar al administrador de forma inmediata, saltándose la verificación de email.
--
-- Datos del administrador:
-- • Correo: admin@guaikediaz.com
-- • Contraseña: 20Guaike26.
--

DO $$
DECLARE
    role_admin_id int;
    new_user_id uuid := gen_random_uuid();
BEGIN
    -- 1. Obtener el ID del rol de administrador desde la tabla roles pública
    SELECT id INTO role_admin_id FROM public.roles WHERE nombre = 'admin';

    IF role_admin_id IS NULL THEN
        RAISE EXCEPTION 'El rol de administrador "admin" no existe en la tabla public.roles. Por favor, asegúrate de correr primero el esquema database_schema.sql.';
    END IF;

    -- 2. Registrar el usuario en la autenticación de Supabase (auth.users) si no existe ya
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@guaikediaz.com') THEN
        -- Hashea la contraseña '20Guaike26.' de forma segura usando bcrypt de Postgres
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            new_user_id,
            'authenticated',
            'authenticated',
            'admin@guaikediaz.com',
            extensions.crypt('20Guaike26.', extensions.gen_salt('bf')),
            now(), -- Confirma el correo inmediatamente
            '{"provider":"email","providers":["email"]}',
            '{"role":"admin","full_name":"Administrador Guaike.Díaz"}',
            now(),
            now(),
            '',
            '',
            '',
            ''
        );

        -- 3. Vincularlo con la tabla de usuarios de la aplicación
        INSERT INTO public.usuarios (
            correo,
            contrasena,
            rol_id,
            ultimo_acceso,
            fecha_creacion,
            fecha_actualizacion
        ) VALUES (
            'admin@guaikediaz.com',
            '', -- Contraseña segura almacenada en auth.users
            role_admin_id,
            NULL,
            now(),
            now()
        ) ON CONFLICT (correo) DO NOTHING;

        RAISE NOTICE '¡Usuario administrador creado exitosamente!';
    ELSE
        -- Si ya existe en auth.users, asegurar que esté en la tabla usuarios pública con rol admin
        INSERT INTO public.usuarios (
            correo,
            contrasena,
            rol_id,
            ultimo_acceso,
            fecha_creacion,
            fecha_actualizacion
        ) VALUES (
            'admin@guaikediaz.com',
            '',
            role_admin_id,
            NULL,
            now(),
            now()
        ) ON CONFLICT (correo) DO UPDATE SET rol_id = role_admin_id;

        RAISE NOTICE 'El usuario admin@guaikediaz.com ya existía; se le ha asignado/asegurado el rol de admin.';
    END IF;
END $$;
