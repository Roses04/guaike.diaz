# 🔐 Guía de Seguridad — GUAIKE.DÍAZ
**Stack: Vercel + Supabase + Cloudflare**

> Esta guía asume que tu proyecto ya está desplegado. Sigue los pasos en orden para obtener el nivel de seguridad más alto sin costo adicional.

---

## 1. SUPABASE — Base de Datos y Autenticación

### 1.1 Ejecutar la Migración de Base de Datos

Entra a **Supabase → SQL Editor** y ejecuta el siguiente script para agregar las columnas de seguridad:

```sql
-- Columnas de autenticación segura (si aún no existen)
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS verificado BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS codigo_verificacion TEXT,
  ADD COLUMN IF NOT EXISTS codigo_enviado_en TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS preguntas_seguridad JSONB,
  ADD COLUMN IF NOT EXISTS intentos_fallidos INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bloqueado_hasta TIMESTAMPTZ;

-- Índices de rendimiento en columnas de autenticación
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios (correo_electronico);
CREATE INDEX IF NOT EXISTS idx_usuarios_bloqueado ON usuarios (bloqueado_hasta);
```

### 1.2 Row Level Security (RLS) — CRÍTICO

En **Supabase → Authentication → Policies**, habilita RLS para **todas** las tablas:

```sql
-- Habilitar RLS en tabla usuarios
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Política: solo puede leer su propio registro
CREATE POLICY "Usuarios solo ven su propia fila"
  ON usuarios FOR SELECT
  USING (correo_electronico = current_user);

-- Política de actualización
CREATE POLICY "Usuarios solo editan su propia fila"
  ON usuarios FOR UPDATE
  USING (correo_electronico = current_user);

-- Deshabilitar SELECT total (sin auth) en todas las tablas sensibles
-- Repite para cada tabla que contenga datos de usuarios
```

> **⚠️ IMPORTANTE:** Asegúrate de que ninguna tabla tenga la política `USING (true)` activa en producción. Esto expone todos los datos públicamente.

### 1.3 Variables de Entorno en Supabase

- **Nunca** expongas la `service_role` key en el frontend.
- Usa únicamente la `anon` (public) key en el cliente.
- La `service_role` key solo debe usarse en funciones serverless del backend (Vercel Functions).

### 1.4 Restricciones de Contraseñas

En **Supabase → Authentication → Settings → Password security**:
- ✅ Minimum password length: **8**
- ✅ Require uppercase letters
- ✅ Require numbers
- ✅ Require special characters

### 1.5 Protección contra Ataques de Enumeración

En **Supabase → Authentication → Settings**:
- ✅ Activar **"Prevent email enumeration"** — evita que atacantes descubran qué correos están registrados.

### 1.6 Rate Limiting de Supabase Auth

Supabase incluye rate limiting nativo en los endpoints de autenticación. En el plan gratuito está activo por defecto. No es necesaria configuración adicional.

### 1.7 Backup Automático

- Plan gratuito: backups diarios conservados **7 días**.
- Verifica en **Supabase → Project Settings → Database → Backups** que los backups estén activos.

---

## 2. VERCEL — Funciones Serverless y Despliegue

### 2.1 Variables de Entorno

Ve a **Vercel → Project → Settings → Environment Variables** y agrega:

| Variable | Valor | Entornos |
|---|---|---|
| `VITE_SUPABASE_URL` | Tu URL de Supabase | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | Tu Anon Key | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Tu Service Role Key | Production únicamente |
| `GMAIL_USER` | Tu correo Gmail completo | Production únicamente |
| `GMAIL_PASS` | Contraseña de aplicación Gmail | Production únicamente |

> **⚠️ CRÍTICO:** `SUPABASE_SERVICE_ROLE_KEY`, `GMAIL_USER` y `GMAIL_PASS` **nunca deben** empezar con `VITE_`. Las variables con ese prefijo son expuestas al navegador.

### 2.2 Configurar Gmail para Envío de Correos

1. En tu cuenta Gmail → **Configuración → Seguridad → Verificación en dos pasos** → actívala.
2. Luego ve a **Seguridad → Contraseñas de aplicaciones**.
3. Genera una contraseña de aplicación para "Correo / Windows".
4. Usa esa contraseña (16 caracteres) como valor de `GMAIL_PASS` en Vercel.

> La contraseña de aplicación permite que tu servidor envíe correos sin exponer tu contraseña real y puede revocarse en cualquier momento.

### 2.3 Headers de Seguridad HTTP

Crea o edita el archivo `vercel.json` en la raíz del proyecto:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(self)" },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://nominatim.openstreetmap.org https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com; frame-ancestors 'none';"
        }
      ]
    }
  ]
}
```

### 2.4 Proteger Rutas Serverless

Las funciones en `api/` deben validar siempre:
- El origen de la solicitud (header `Origin`).
- Que el `Content-Type` sea `application/json`.
- El tamaño máximo del cuerpo de la solicitud.

Esto ya está implementado en `api/send-email.ts`. Verifica que ninguna función serverless tenga lógica pública sin autenticación.

### 2.5 Dominio Personalizado con HTTPS

En **Vercel → Project → Settings → Domains**:
- Agrega tu dominio personalizado.
- Vercel provisiona automáticamente un certificado TLS/SSL de Let's Encrypt.
- Asegúrate de que **HTTPS Redirect** esté activo (es el comportamiento por defecto).

---

## 3. CLOUDFLARE — DNS, CDN y Firewall

### 3.1 Agregar tu Sitio a Cloudflare (Plan Free)

1. Registra tu dominio en **cloudflare.com**.
2. Cambia los nameservers de tu dominio a los de Cloudflare (te los indica en el proceso).
3. Agrega un registro DNS de tipo `CNAME` apuntando a `cname.vercel-dns.com`.

### 3.2 SSL/TLS — Modo "Full (Strict)"

En **Cloudflare → SSL/TLS → Overview**:
- Cambia el modo a **Full (Strict)**.
- Esto garantiza cifrado de extremo a extremo: navegador ↔ Cloudflare ↔ Vercel.

En **SSL/TLS → Edge Certificates**:
- ✅ Activar **Always Use HTTPS**
- ✅ Activar **Automatic HTTPS Rewrites**
- ✅ Activar **HTTP Strict Transport Security (HSTS)**: `max-age=31536000; includeSubDomains; preload`
- ✅ Minimum TLS Version: **TLS 1.2**
- ✅ Activar **TLS 1.3**
- ✅ Activar **Opportunistic Encryption**

### 3.3 Firewall Rules — Bloquear Ataques Comunes

En **Cloudflare → Security → WAF (Web Application Firewall)**:

**Regla 1: Bloquear bots maliciosos conocidos**
- Expression: `(cf.client.bot) and not (cf.verified_bot_category in {"Search Engine Crawlers" "Monitoring & Analytics" "Advertising & Marketing"})`
- Action: **Block**

**Regla 2: Bloquear países de alto riesgo (opcional, ajusta según necesidades)**
- Expression: `(ip.geoip.country in {"RU" "CN" "KP" "IR"})`
- Action: **Challenge (Managed Challenge)**

**Regla 3: Proteger endpoints de API**
- Expression: `(http.request.uri.path contains "/api/") and (not http.request.method in {"GET" "POST" "OPTIONS"})`
- Action: **Block**

**Regla 4: Rate Limiting en login**
- En **Security → Rate Limiting**: Crear regla para `/api/send-email` → máximo **10 solicitudes por IP cada 60 segundos** → Action: Block.

### 3.4 DDoS Protection

- El plan gratuito de Cloudflare incluye protección DDoS **Layer 3/4 y Layer 7** sin límite de volumen.
- En **Security → DDoS**: Verifica que esté en modo **High**.

### 3.5 Bot Fight Mode

En **Security → Bots**:
- ✅ Activar **Bot Fight Mode** (gratuito).
- Esto bloquea automáticamente bots de scraping, spam y credential stuffing.

### 3.6 Privacy & Speed

En **Speed → Optimization**:
- ✅ Activar **Auto Minify** (JS, CSS, HTML)
- ✅ Activar **Brotli** (compresión)

En **Caching → Configuration**:
- Browser Cache TTL: **4 hours**
- ✅ Activar **Always Online™** (sirve versión cacheada si Vercel falla)

### 3.7 Email Obfuscation

En **Scrape Shield**:
- ✅ Activar **Email Address Obfuscation** — evita que bots recolecten tu correo del HTML.

---

## 4. RESUMEN DE PRIORIDADES

| Prioridad | Acción | Plataforma |
|---|---|---|
| 🔴 Crítica | Activar RLS en todas las tablas | Supabase |
| 🔴 Crítica | Configurar variables de entorno sin prefijo VITE_ | Vercel |
| 🔴 Crítica | Configurar contraseña de aplicación Gmail | Gmail → Vercel |
| 🔴 Crítica | SSL Full (Strict) + Always Use HTTPS | Cloudflare |
| 🟠 Alta | Agregar `vercel.json` con headers de seguridad | Vercel |
| 🟠 Alta | Activar Bot Fight Mode | Cloudflare |
| 🟠 Alta | Activar WAF Rules (bloqueo de bots maliciosos) | Cloudflare |
| 🟡 Media | Rate Limiting en `/api/send-email` | Cloudflare |
| 🟡 Media | HSTS + TLS 1.3 | Cloudflare |
| 🟡 Media | Activar "Prevent email enumeration" | Supabase |
| 🟢 Baja | Email Obfuscation + Auto Minify | Cloudflare |

---

## 5. VERIFICACIÓN FINAL

Una vez aplicados los cambios, puedes verificar la seguridad de tu sitio con estas herramientas gratuitas:

- **SSL/TLS:** https://www.ssllabs.com/ssltest/ → Debe dar **A+**
- **Headers HTTP:** https://securityheaders.com/ → Debe dar **A** o superior
- **Vulnerabilidades generales:** https://observatory.mozilla.org/ → Objetivo: **B+** o superior
- **Cloudflare:** Panel → Security → Events → Verifica que el tráfico malicioso esté siendo bloqueado

---

*Generado para el proyecto GUAIKE.DÍAZ — Sistema de Información Geoespacial del Municipio Díaz, Nueva Esparta.*
