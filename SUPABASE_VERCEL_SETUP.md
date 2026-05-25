# Configuración para Supabase + Vercel

Este documento describe las variables y pasos necesarios para que tu backend y frontend funcionen con la base de datos de Supabase y se reflejen en línea desde Vercel.

---

## 1. Variables de entorno necesarias

### Backend (Vercel)

En Vercel debes configurar al menos estas variables:

- `DATABASE_URL`
  - Cadena de conexión de Postgres de Supabase.
  - Ejemplo: `postgres://usuario:password@dbhost.supabase.co:5432/postgres`
  - El backend usa esta variable en `backend/src/config/database.ts`.

- `JWT_SECRET`
  - Clave secreta para firmar tokens JWT.
  - Puede ser cualquier cadena segura.
  - El backend usa esta variable en `backend/src/controllers/authController.ts` y `backend/src/middleware/auth.ts`.

- `PORT` (opcional)
  - El backend usa `process.env.PORT || 4000` en `backend/src/index.ts`.
  - No es obligatorio si Vercel asigna el puerto automáticamente.

### Frontend (Vercel)

En Vercel también debes configurar estas variables para el cliente de Supabase:

- `VITE_SUPABASE_URL`
  - URL pública de tu proyecto Supabase.
  - Ejemplo: `https://dragforktfapbkjavicx.supabase.co`

- `VITE_SUPABASE_PUBLISHABLE_KEY`
  - Key pública de cliente (anon key) de Supabase.

El frontend usa estas variables en `frontend/vite.config.ts` y `frontend/src/services/supabase.ts`.

> Nota: `vite.config.ts` también acepta `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, pero para consistencia con Vite se recomienda usar `VITE_SUPABASE_*`.

---

## 2. Qué debes configurar en Supabase

### 2.1 Base de datos PostgreSQL

En Supabase, la base de datos debe contener el esquema que usa tu backend. El backend espera estas tablas principales:

- `roles`
- `usuarios`
- `operadores`
- `operador_imagenes`
- `operador_accesibilidad`
- `productos`
- `resenas`
- `eventos`
- `registros_busqueda`
- `categorias`
- `parroquias`
- `opciones_accesibilidad`

### 2.2 Rol `admin`

El backend necesita el rol `admin` en la tabla `roles`.

Si aún no existe, agrega la fila:

```sql
INSERT INTO roles (nombre) VALUES ('admin');
```

También deben existir `operador` y `turista` si tu aplicación los usa:

```sql
INSERT INTO roles (nombre) VALUES ('operador'), ('turista');
```

### 2.3 Conexión entre Vercel y Supabase

- Usa el valor `DATABASE_URL` que te da Supabase.
- Ese valor debe ir en Vercel, no en el frontend.
- El frontend no necesita `DATABASE_URL`; solo necesita URL y publishable key públicas.

---

## 3. Recomendación de `.env` local

Para correr localmente, puedes usar un archivo `.env` en la raíz con estas variables:

```env
DATABASE_URL=postgres://usuario:password@dbhost.supabase.co:5432/postgres
JWT_SECRET=una_clave_secreta
VITE_SUPABASE_URL=https://dragforktfapbkjavicx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_XXXXXXXXXXXX
```

También puedes usar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` si tu entorno los requiere.

---

## 4. Pasos para que TODO cambio se refleje en línea

1. **Sube el código a Vercel**
   - Asegúrate de que el proyecto esté conectado a tu repositorio.

2. **Configura las variables en Vercel**
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

3. **Asegura el esquema en Supabase**
   - Ejecuta las migraciones o crea las tablas manualmente en Supabase.
   - Asegúrate de que `roles` contenga al menos `admin`, `operador`, `turista`.

4. **Verifica el deploy**
   - Una vez desplegado, prueba el endpoint:
     - `POST https://<tu-vercel-app>/api/auth/register`
     - `POST https://<tu-vercel-app>/api/auth/login`

5. **Usa Postman con la URL de Vercel**
   - `baseUrl` debe ser tu app Vercel.
   - El backend va a usar Supabase vía `DATABASE_URL`.

---

## 5. Ejemplo de los valores exactos que necesitas en Vercel

| Variable | Valor / descripción |
| --- | --- |
| `DATABASE_URL` | Cadena de conexión Postgres de Supabase |
| `JWT_SECRET` | Clave secreta JWT para autenticar tokens |
| `VITE_SUPABASE_URL` | URL pública de tu proyecto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Key pública de cliente Supabase |

> Si prefieres usar las variables estilo `NEXT_PUBLIC_`, también puedes definir:
> - `NEXT_PUBLIC_SUPABASE_URL`
> - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

---

## 6. Nota final

Tu backend está diseñado para leer la base de datos de Supabase directamente con `DATABASE_URL`. Mientras esa variable exista en Vercel y el esquema de tablas esté presente en Supabase, cualquier cambio que hagas en el repositorio y vuelvas a desplegar se reflejará en línea.
