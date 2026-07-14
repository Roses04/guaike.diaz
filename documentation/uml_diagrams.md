# Diagramas UML: GUAIKE.DÍAZ (PlantUML)

Este documento contiene la arquitectura visual del sistema mediante diagramas PlantUML en español, actualizados para reflejar fielmente la estructura real de la base de datos, la organización del código y el diseño de la solución actual.

---

## 1. Diagrama de Casos de Uso
Describe las interacciones de los distintos roles de usuario con las funcionalidades generales del sistema, simplificando la representación mediante herencia de actores.

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor "Turista / Visitante" as T
actor "Turista Autenticado" as TA
actor "Operador Artesanal" as O
actor "Administrador Municipal" as A

T <|-- TA

rectangle "Sistema GUAIKE.DÍAZ (General)" {
    usecase "Explorar Directorio y Mapa Geoespacial" as UC_Explorar
    usecase "Planificar Itinerarios (TSP)" as UC_Ruta
    usecase "Establecer Contacto Comercial (WhatsApp)" as UC_Contacto
    usecase "Valorar Taller (QR Verificado)" as UC_Valorar
    usecase "Registrar Operador" as UC_Registro
    usecase "Gestionar Catálogo y Ficha del Taller" as UC_Gestion
    usecase "Verificar y Auditar Operadores" as UC_Auditar
    usecase "Gestionar Eventos y Ferias" as UC_Eventos
    usecase "Analizar Métricas Turísticas (Data Mart)" as UC_Métricas
}

T --> UC_Explorar
T --> UC_Ruta
T --> UC_Contacto

TA --> UC_Valorar

O --> UC_Registro
O --> UC_Gestion

A --> UC_Auditar
A --> UC_Eventos
A --> UC_Métricas
@enduml
```

---

## 2. Diagrama de Clases
Representa las entidades del sistema, sus atributos con tipado físico correspondiente al esquema de PostgreSQL/PostGIS, métodos clave y relaciones de persistencia.

```plantuml
@startuml
class Usuario {
    +BIGINT id
    +String correo
    +String contrasena
    +Int rol_id
    +Boolean verificado
    +String codigo_verificacion
    +Timestamp codigo_enviado_en
    +JSONB preguntas_seguridad
    +Int intentos_fallidos
    +Timestamp bloqueado_hasta
    +UUID auth_id
    +Timestamp ultimo_acceso
    +Timestamp fecha_creacion
    +iniciarSesion()
    +registrarse()
    +verificarCorreo()
}

class Rol {
    +Int id
    +String nombre
}

class Parroquia {
    +Int id
    +String nombre
}

class Categoria {
    +Int id
    +String nombre
    +String descripcion
}

class OpcionAccesibilidad {
    +Int id
    +String etiqueta
    +String icono
}

class Operador {
    +BIGINT id
    +BIGINT usuario_id
    +Int parroquia_id
    +Int categoria_id
    +String nombre_taller
    +String descripcion
    +Geography ubicacion
    +String direccion_detallada
    +String telefono_whatsapp
    +Boolean es_verificado
    +UUID qr_codigo_unico
    +Timestamp fecha_creacion
    +actualizarPerfil()
    +obtenerCalificacionPromedio()
}

class OperadorImagen {
    +BIGINT id
    +BIGINT operador_id
    +String url_imagen
    +Boolean es_principal
    +BIGINT subido_por_usuario_id
    +Timestamp fecha_subida
}

class Producto {
    +BIGINT id
    +BIGINT operador_id
    +String nombre
    +String descripcion
    +Decimal precio
    +String url_imagen
    +Boolean esta_disponible
    +Timestamp fecha_creacion
}

class Resena {
    +BIGINT id
    +BIGINT operador_id
    +BIGINT usuario_id
    +Int puntuacion
    +String comentario
    +Boolean qr_verificado
    +Timestamp fecha_creacion
}

class Evento {
    +BIGINT id
    +String titulo
    +String descripcion
    +Geography ubicacion
    +Timestamp fecha_inicio
    +Timestamp fecha_fin
    +String url_imagen
    +Timestamp fecha_creacion
}

class RegistroBusqueda {
    +BIGINT id
    +BIGINT usuario_id
    +Int categoria_id
    +Int parroquia_id
    +Timestamp fecha_busqueda
}

Usuario "n" -- "1" Rol : posee
Usuario "1" -- "0..1" Operador : se_asocia
Operador "n" -- "1" Parroquia : pertenece
Operador "n" -- "1" Categoria : se_clasifica
Operador "1" -- "n" OperadorImagen : posee
Operador "1" -- "n" Producto : ofrece
Operador "1" -- "n" Resena : recibe
Usuario "1" -- "n" Resena : escribe
Operador "n" -- "m" OpcionAccesibilidad : cuenta_con (operador_accesibilidad)
Usuario "1" -- "n" RegistroBusqueda : realiza
RegistroBusqueda "n" -- "1" Categoria : busca
RegistroBusqueda "n" -- "1" Parroquia : filtra
@enduml
```

---

## 3. Diagrama de Componentes
Describe la organización modular del código en el frontend (React/Zustand), el backend (Express/Vercel Serverless), la base de datos (Supabase + PostGIS) y su interacción con servicios externos.

```plantuml
@startuml
package "Capa de Presentación (PWA - React / TypeScript)" {
    [Enrutador (App.tsx)] --> [Vistas / Páginas (views/)]
    [Vistas / Páginas (views/)] --> [Componentes UI (components/)]
    [Vistas / Páginas (views/)] --> [Gestión de Estado (store/ Zustand)]
    [Componentes UI (components/)] --> [Mapa Leaflet / OSM]
    [Vistas / Páginas (views/)] --> [Motor TSP / Haversine (utils/)]
    [Gestión de Estado (store/ Zustand)] --> [Servicio API (services/api.ts)]
    [Gestión de Estado (store/ Zustand)] --> [Cliente Supabase (services/supabase.ts)]
    [Service Worker] ..> [Caché Local / Sync Queue] : administra
}

package "Capa de Aplicación (API Rest - Node.js)" {
    [Rutas / Endpoints (routes/)] --> [Middleware de Autenticación / Rate Limit]
    [Middleware de Autenticación / Rate Limit] --> [Controladores (controllers/)]
    [Controladores (controllers/)] --> [Servicios de Negocio (services/)]
    [Servicios de Negocio (services/)] --> [Modelos / Repositorio (models/)]
}

database "Capa de Datos" {
    folder "PostgreSQL 15 + PostGIS" {
        [Tablas Relacionales (OLTP)]
        [Data Mart Estrella (OLAP)]
        [Políticas RLS y Triggers]
    }
}

cloud "Servicios Externos" {
    [API Cloudinary]
    [API WhatsApp]
    [OpenStreetMap Tile Server]
}

[Servicio API (services/api.ts)] --> [Rutas / Endpoints (routes/)] : HTTPS/JSON
[Cliente Supabase (services/supabase.ts)] --> [Tablas Relacionales (OLTP)] : PostgreSQL Direct Link
[Modelos / Repositorio (models/)] --> [Tablas Relacionales (OLTP)] : Consultas SQL / Geo
[Servicios de Negocio (services/)] --> [API Cloudinary] : Subida de imágenes
[Componentes UI (components/)] --> [API WhatsApp] : Redirección de chat
[Mapa Leaflet / OSM] --> [OpenStreetMap Tile Server] : Teselas cartográficas
@enduml
```

---
> [!NOTE]
> Los diagramas fueron reestructurados integralmente:
> 1. El **Diagrama de Casos de Uso** se simplificó agrupando acciones en casos de uso de negocio generales e incorporando herencia de actores (`Turista` -> `Turista Autenticado`).
> 2. El **Diagrama de Clases** incorpora los tipos de datos reales (`BIGINT`, `Geography`, `JSONB`, `Decimal`) y las tablas maestras (`Parroquia`, `Categoria`, `OpcionAccesibilidad`), así como las entidades de negocio añadidas (`OperadorImagen` y `RegistroBusqueda`).
> 3. El **Diagrama de Componentes** refleja la estructura física actual de directorios del proyecto (`views/`, `store/`, `services/`, `utils/`) y el flujo híbrido de peticiones a la API REST e integraciones directas con Supabase.
