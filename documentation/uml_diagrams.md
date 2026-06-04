# Diagramas UML: GUAIKE.DÍAZ (PlantUML)

Este documento contiene la arquitectura visual del sistema mediante diagramas PlantUML en español.

## 1. Diagrama de Casos de Uso
Describe las interacciones entre los actores y las funcionalidades del sistema.

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor "Turista Anónimo" as TA
actor "Turista Autenticado" as T
actor "Operador Artesanal" as O
actor "Administrador Municipal" as A

rectangle "Sistema GUAIKE.DÍAZ" {
    usecase "Consultar Mapa y Directorio" as UC1
    usecase "Registrar Solicitud de Operador" as UC2
    usecase "Gestionar Perfil y Catálogo" as UC3
    usecase "Validar y Verificar Operador" as UC4
    usecase "Escanear QR y Dejar Reseña" as UC5
    usecase "Generar Itinerario Personalizado" as UC6
    usecase "Contactar por WhatsApp" as UC7
    usecase "Gestionar Eventos y Ferias" as UC8
    usecase "Ver Estadísticas de Uso" as UC9
}

TA --> UC1
TA --> UC7

T --> UC1
T --> UC5
T --> UC6
T --> UC7

O --> UC2
O --> UC3

A --> UC4
A --> UC8
A --> UC9
@enduml
```

---

## 2. Diagrama de Clases
Representa la estructura de datos y las relaciones entre las entidades.

```plantuml
@startuml
class Usuario {
    +Int id
    +String correo
    +String contrasena
    +Int rol_id
    +DateTime fecha_creacion
    +iniciarSesion()
    +registrarse()
}

class Rol {
    +Int id
    +String nombre
}

class Operador {
    +Int id
    +Int usuario_id
    +String nombre
    +String descripcion
    +String categoria
    +Point ubicacion
    +String[] imagenes
    +Boolean esta_verificado
    +String whatsapp
    +JSON info_accesibilidad
    +actualizarPerfil()
    +obtenerCalificacionPromedio()
}

class Producto {
    +Int id
    +Int operador_id
    +String nombre
    +String descripcion
    +Float precio
    +String url_imagen
}

class Resena {
    +Int id
    +Int operador_id
    +Int usuario_id
    +Int puntuacion
    +String comentario
    +Boolean qr_verificado
    +DateTime fecha_creacion
}

class Evento {
    +Int id
    +String titulo
    +String descripcion
    +DateTime fecha_inicio
    +DateTime fecha_fin
    +Point ubicacion
}

Usuario "1" -- "1" Rol : posee
Usuario "1" -- "0..1" Operador : identifica
Operador "1" -- "0..*" Producto : ofrece
Operador "1" -- "0..*" Resena : recibe
Usuario "1" -- "0..*" Resena : escribe
@enduml
```

---

## 3. Diagrama de Componentes
Describe la organización de los módulos del sistema.

```plantuml
@startuml
package "Capa de Presentación (PWA - React)" {
    [Enrutador] --> [Vistas/Páginas]
    [Vistas/Páginas] --> [Componentes UI]
    [Vistas/Páginas] --> [Almacén de Estado (Zustand)]
    [Componentes UI] --> [Mapa Leaflet]
    [Service Worker] ..> [Caché Offline] : gestiona
}

package "Capa de Aplicación (API Rest - Node.js)" {
    [Middleware de Autenticación] --> [Controladores]
    [Controladores] --> [Servicios]
    [Servicios] --> [Modelos/Repositorio]
}

database "Capa de Datos" {
    [PostgreSQL + PostGIS]
}

cloud "Servicios Externos" {
    [API Cloudinary]
    [API WhatsApp]
    [Mapas OpenStreetMap]
}

[Almacén de Estado (Zustand)] --> [Middleware de Autenticación] : JWT
[Servicios] --> [PostgreSQL + PostGIS] : Consultas SQL/Geo
[Servicios] --> [API Cloudinary] : Gestión de Imágenes
[Mapa Leaflet] --> [Mapas OpenStreetMap] : Teselas de mapa
@enduml
```

---
> [!TIP]
> Los diagramas de clases y casos de uso ya incorporan las nuevas funcionalidades solicitadas: **WhatsApp**, **Accesibilidad**, **Eventos** y **Reseñas verificadas por QR**.
