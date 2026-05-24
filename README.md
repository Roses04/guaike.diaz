# GUAIKE.DÍAZ

Aplicación web para promover talleres artesanales del Municipio Díaz con funciones de registro, gestión de operadores, reseñas, mapa interactivo y validación de visitas por QR.

## Características principales

- Registro y login con roles: `admin`, `operador` y `turista`
- Panel admin para aprobar operadores, gestionar eventos y ver estadísticas
- Directorio de operadores artesanales con búsqueda por categoría y parroquia
- Detalles de talleres con mapa, galería y reseñas
- Escáner QR para validar visitas
- Soporte offline/PWA en el frontend

## Estructura del proyecto

- `backend/`: API en Node.js + Express con TypeScript
- `frontend/`: aplicación React + Vite + TypeScript
- `database_schema.sql`: esquema de datos PostgreSQL/PostGIS
- `docker-compose.yml`: configuración local opcional para backend y base de datos

## Tecnologías

- Backend: Node.js, Express, PostgreSQL, JWT, bcrypt, TypeScript
- Frontend: React, Vite, TypeScript, Tailwind CSS, Leaflet, html5-qrcode, Zustand

## Requisitos previos

- Node.js 20+ / npm
- PostgreSQL con extensión PostGIS (Recomendado Supabase)
- Git

## Cómo ejecutar el proyecto localmente

### 1. Backend

```powershell
cd backend
npm install
```

Crear un archivo `.env` en `backend/` con las variables necesarias:

```env
PORT=4000
DATABASE_URL=postgres://user:password@localhost:5432/tu_base_de_datos
JWT_SECRET=una_clave_secreta
```

Iniciar el backend en modo desarrollo:

```powershell
npm run dev
```

### 2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

El frontend se ejecuta normalmente en `http://localhost:5173`.

## Despliegue

### Base de datos
- Usar Supabase para PostgreSQL/PostGIS.
- Importar o crear el esquema con `database_schema.sql`.

### Backend
- Deploy en un servicio Node.js que soporte variables de entorno.
- Asegurarse de configurar `DATABASE_URL` y `JWT_SECRET`.

### Frontend
- Deploy estático desde la carpeta `frontend`.
- Vercel es una opción recomendada para la app React + Vite.

## Buenas prácticas

- No subir `backend/.env` o archivos con credenciales.
- Mantener `node_modules/` fuera del repositorio.
- Usar `gitignore` para ignorar `dist/`, `node_modules/` y datos sensibles.

## Contenido del repositorio

- `backend/`: servidor, rutas, controladores, modelos y migraciones
- `frontend/`: vistas, componentes, servicios y estado de la app
- `database_schema.sql`: definición de tablas y relaciones
- `docker-compose.yml`: configuración base para entornos locales

## Contacto

Repositorio GitHub: https://github.com/Roses04/guaike.diaz

> Esta documentación es una base para instalar, desarrollar y desplegar el proyecto.
