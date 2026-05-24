# Flujos de Interacción: GUAIKE.DÍAZ

Este documento describe detalladamente cómo interactúan los distintos usuarios con el sistema a través de diagramas de secuencia.

## 1. Descubrimiento y Contacto (Turista)
El flujo básico donde un visitante localiza a un artesano y establece contacto.

```plantuml
@startuml
actor "Turista" as T
participant "PWA (Frontend)" as UI
participant "API (Backend)" as API
database "Base de Datos" as DB
participant "WhatsApp" as WA

T -> UI: Accede a Mapa/Directorio
UI -> API: GET /api/operators (con filtros)
API -> DB: SELECT * FROM operators WHERE...
DB --> API: Lista de operadores
API --> UI: Mostrar marcadores/tarjetas
T -> UI: Selecciona Perfil de Artesano
UI -> T: Muestra Detalle (Fotos, Productos, Accesibilidad)
T -> UI: Pulsa "Contactar por WhatsApp"
UI -> WA: Redirección con mensaje pre-llenado
WA -> T: Abre chat con el Artesano
@enduml
```

---

## 2. Registro y Verificación (Operador)
El proceso de formalización digital de un nuevo artesano.

```plantuml
@startuml
actor "Operador Artesanal" as O
participant "PWA (Frontend)" as UI
participant "API (Backend)" as API
participant "Cloudinary" as CDN
actor "Administrador" as A

O -> UI: Completa Formulario de Registro
UI -> CDN: Sube fotos de taller y documentos
CDN --> UI: URLs de imágenes
UI -> API: POST /api/operators/register
API -> DB: INSERT INTO operators (status='pending')
API --> UI: "Registro recibido, pendiente de validación"
A -> UI: Revisa Panel de Administración
UI -> API: GET /api/admin/pending-operators
API --> UI: Lista de registros pendientes
A -> UI: Valida documentos y pulsa "Aprobar"
UI -> API: PATCH /api/operators/{id}/verify
API -> DB: UPDATE operators SET is_verified=true
API --> UI: Operador Verificado
@enduml
```

---

## 3. Reseña Verificada vía QR (Turista + Operador)
Garantiza que las calificaciones provienen de visitas reales.

```plantuml
@startuml
actor "Turista" as T
participant "PWA (Frontend)" as UI
participant "API (Backend)" as API
database "Base de Datos" as DB

T -> T: Visita física al taller
T -> UI: Escanea QR físico del artesano
UI -> API: POST /api/reviews/validate-qr (QR_Data)
API -> DB: Verificar autenticidad del QR
DB --> API: QR Válido (ID_Operador)
API --> UI: Habilitar formulario de reseña
T -> UI: Envía comentario y puntuación
UI -> API: POST /api/reviews (Datos + JWT)
API -> DB: INSERT INTO reviews (qr_verified=true)
DB --> API: OK
API --> UI: "Reseña publicada con éxito"
UI --> T: Muestra sello de "Visita Verificada"
@enduml
```

---

## 4. Gestión de Eventos y Estadísticas (Alcaldía)
Uso de la información para la toma de decisiones.

```plantuml
@startuml
actor "Administrador" as A
participant "PWA (Frontend)" as UI
participant "API (Backend)" as API
database "Base de Datos" as DB

A -> UI: Crea nuevo evento (Feria del Dátil)
UI -> API: POST /api/events (Datos)
API -> DB: INSERT INTO events
DB --> API: OK
API --> UI: Evento publicado (Visible en Mapa)

A -> UI: Consulta Dashboard de Estadísticas
UI -> API: GET /api/admin/stats
API -> DB: SELECT count(*), category FROM searches...
DB --> API: Datos agregados
API --> UI: Renderiza Gráficos / Mapas de Calor
@enduml
```
