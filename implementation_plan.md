# Plan de Implementación: GUAIKE.DÍAZ

Este documento detalla el plan de acción para el desarrollo del Sistema de Información Geoespacial GUAIKE.DÍAZ, basado en la propuesta técnica y el estado actual del repositorio.

## 📌 Resumen del Proyecto
**GUAIKE.DÍAZ** es una Progressive Web App (PWA) diseñada para la gestión y visibilidad de artesanos y operadores turísticos en el Municipio Díaz, Nueva Esparta. Utiliza un stack moderno enfocado en la operatividad offline y capacidades geoespaciales.

---

## 🛠 Estado Actual (Diagnóstico)
- **Backend**: Estructura base en Express/TypeScript. Dependencias instaladas (pg, jwt, bcrypt, helmet). Una migración inicial creada.
- **Frontend**: Estructura base en Vite/React/TS/Tailwind v4. Rutas iniciales definidas (`/`, `/mapa`, `/login`). `vite-plugin-pwa` configurado.
- **Infraexecution**: `docker-compose.yml` presente para orquestación.

---

## 📅 Cronograma de Implementación

### Fase 1: Cimientos y Core del Backend (Semanas 1-4)
*Objetivo: Establecer una base de datos sólida y un sistema de autenticación seguro.*

- [ ] **Base de Datos**: 
    - [ ] Habilitar extensión `postgis` en PostgreSQL.
    - [ ] Definir esquemas para `users`, `operators`, `products`, y `reviews`.
    - [ ] Configurar relaciones y constraints geoespaciales.
- [ ] **Autenticación (M1)**:
    - [ ] Implementar registro/login con JWT y Bcrypt.
    - [ ] Definir Middlewares para protección de rutas y roles (Admin, Operador, Turista).
- [ ] **Gestión de Operadores (M1)**:
    - [ ] Endpoints CRUD para perfiles de operadores.
    - [ ] Integración inicial con Cloudinary para carga de documentos/fotos.

### Fase 2: Interfaz Base y PWA (Semanas 5-8)
*Objetivo: Crear una experiencia de usuario fluida y resiliente.*

- [ ] **Design System**:
    - [ ] Configurar paleta de colores y tipografía en Tailwind CSS v4.
    - [ ] Crear componentes atómicos (Botones, Inputs, Cards, Loaders).
- [ ] **Core PWA**:
    - [ ] Configurar Service Worker para caché de activos estáticos.
    - [ ] Implementar manifiesto de aplicación (icons, theme colors).
    - [ ] Gestión de estado global con Zustand (Auth, UI).
- [ ] **Vistas Base**:
    - [ ] Rediseño de HomeView (Landing page premium).
    - [ ] Implementación de Login/Registro en el frontend.

### Fase 3: Geoespacial y Directorio Público (Semanas 9-13)
*Objetivo: Implementar la funcionalidad principal de búsqueda y visualización.*

- [ ] **Mapa Interactivo (M3)**:
    - [ ] Integración de Leaflet.js con OpenStreetMap.
    - [ ] Lógica de clustering para marcadores de operadores.
    - [ ] Funcionalidad de "Cerca de mí" usando geolocalización del navegador.
- [ ] **Directorio Público (M2)**:
    - [ ] Lista filtrable por categoría (Textiles, Palma, Gastronomía, etc.).
    - [ ] Buscador por nombre o palabra clave.
    - [ ] Vista de detalle del operador (Perfil público).

### Fase 4: Oficina Virtual y Verificación (Semanas 14-17)
*Objetivo: Permitir a los artesanos autogestionar su información.*

- [ ] **Panel del Operador (M1)**:
    - [ ] Formulario de actualización de perfil.
    - [ ] Gestión de catálogo de productos (fotos, precios, descripción).
- [ ] **Sistema de Verificación**:
    - [ ] Flujo de subida de documentos (Cédula/RIF).
    - [ ] Interfaz de administrador para validar/rechazar registros.
    - [ ] Generación automática del "Sello de Verificado".

### Fase 5: Características Avanzadas (Semanas 18-21)
*Objetivo: Valor añadido y fidelización.*

- [ ] **Reseñas Verificadas (M4)**:
    - [ ] Generación de códigos QR únicos por operador.
    - [ ] Lógica de validación: Solo usuarios que escaneen el QR pueden reseñar.
- [ ] **Generador de Itinerarios (M5)**:
    - [ ] Algoritmo básico de recomendación basado en proximidad y horarios.
- [ ] **Dashboard Administrativo (M6)**:
    - [ ] Gráficos de actividad y estadísticas de búsqueda.
    - [ ] Exportación de reportes a CSV.

### Fase 6: Pulido, Pruebas y Despliegue (Semanas 22-24)
*Objetivo: Calidad final y lanzamiento.*

- [ ] **Testing**:
    - [ ] Pruebas unitarias en backend (Jest/Supertest).
    - [ ] Pruebas de usabilidad en dispositivos móviles.
- [ ] **Internacionalización**:
    - [ ] Soporte bilingüe (Español/Inglés) con i18next.
- [ ] **Despliegue**:
    - [ ] Configuración final de producción en VPS.
    - [ ] Configuración de TLS (SSL) con Let's Encrypt.

---

## 🚀 Próximos Pasos Inmediatos
1.  **Revisar la migración inicial**: Asegurarse de que incluya PostGIS y los campos necesarios para la autenticación.
2.  **Configurar el entorno**: Validar que el `docker-compose.yml` levanta correctamente la base de datos PostgreSQL.
3.  **Implementar Auth**: Finalizar los endpoints de registro y login en el backend.

---
> [!IMPORTANT]
> El enfoque principal debe ser **Offline-First**. Cada componente del frontend debe estar diseñado para manejar estados de "Sin Conexión" de manera elegante.
