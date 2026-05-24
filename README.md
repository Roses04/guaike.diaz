# GUAIKE.DÍAZ

Plataforma para difundir talleres artesanales del Municipio Díaz con:

- directorio de operadores artesanales
- búsqueda por categoría y parroquia
- detalle de talleres con mapas, galerías y reseñas
- login y roles de usuario (turista, operador, admin)
- validación de visitas vía QR
- dashboard administrativo para aprobar operadores, gestionar eventos y ver estadísticas
- soporte offline/PWA en el frontend

## Estructura del proyecto

- `backend/`: API con Express, PostgreSQL, autenticación JWT y control por roles
- `frontend/`: aplicación React + Vite con UI responsiva, mapas y escáner QR
- `database_schema.sql`: modelo completo de datos para la base de datos
- `docker-compose.yml`: configuración local opcional

## Deploy

### Base de datos
Usar Supabase para la base de datos PostgreSQL/PostGIS. El esquema se puede crear manualmente con `database_schema.sql`.

### Frontend
Deploy en Vercel como app estática desde la carpeta `frontend`.

### Backend
El backend puede desplegarse en un servicio que soporte Node.js y variables de entorno.

## Notas

- `node_modules/`, `dist/` y archivos de configuración local se eliminan del repositorio
- `backend/.env` no debe añadirse al control de versiones

## Próximos pasos

1. Crear el repo en GitHub y agregar un remote.
2. Configurar variables de entorno en Supabase/Vercel.
3. Ajustar la conexión de backend para usar Supabase en lugar de la base de datos local.
