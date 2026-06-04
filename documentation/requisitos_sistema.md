# Especificación de Requisitos: GUAIKE.DÍAZ

Este documento define las capacidades del sistema y las restricciones técnicas bajo las cuales debe operar.

## 1. Requisitos Funcionales (RF)
*Definen lo que el sistema debe hacer (servicios y funciones).*

| ID | Requisito | Descripción |
|:---|:---|:---|
| **RF-01** | Registro de Operadores | El sistema debe permitir a artesanos y guías registrarse subiendo documentos de identidad. |
| **RF-02** | Mapa Geoespacial | El sistema debe mostrar un mapa interactivo con la ubicación de los talleres verificados. |
| **RF-03** | Directorio Filtrable | El usuario debe poder buscar artesanos por nombre, categoría o parroquia. |
| **RF-04** | Perfil de Operador | Cada artesano tendrá una página con su descripción, catálogo de productos y contacto. |
| **RF-05** | Integración WhatsApp | Botón directo para iniciar chat con el artesano sin intermediarios. |
| **RF-06** | Reseñas por QR | Solo los usuarios que escaneen el código QR físico del taller podrán dejar una reseña calificada. |
| **RF-07** | Panel Administrativo | La Alcaldía podrá validar registros, moderar contenido y ver métricas de uso. |
| **RF-08** | Itinerarios | Generación automática de rutas turísticas basadas en la ubicación del usuario. |
| **RF-09** | Gestión de Eventos | El administrador podrá publicar ferias o eventos culturales temporales en el mapa. |

---

## 2. Requisitos No Funcionales (RNF)
*Definen cómo debe ser el sistema (calidad, rendimiento, seguridad).*

| ID | Categoría | Requisito | Descripción |
|:---|:---|:---|:---|
| **RNF-01** | Disponibilidad | **Operatividad Offline** | La aplicación debe ser funcional (consulta de mapa y datos guardados) sin conexión a internet mediante PWA. |
| **RNF-02** | Rendimiento | **Tiempo de Respuesta** | La búsqueda geoespacial no debe tardar más de 800ms en devolver resultados. |
| **RNF-03** | Portabilidad | **Multiplataforma** | El sistema debe funcionar en cualquier navegador moderno de Android o iOS sin necesidad de instalación desde tiendas. |
| **RNF-04** | Usabilidad | **Accesibilidad (WCAG)** | La interfaz debe cumplir con estándares de contraste y tamaño para personas con baja visión. |
| **RNF-05** | Seguridad | **Encriptación de Datos** | Todas las comunicaciones deben viajar por HTTPS y las contraseñas deben estar hasheadas con bcrypt. |
| **RNF-06** | Escalabilidad | **Carga de Usuarios** | El backend debe soportar al menos 50 peticiones concurrentes sin degradación del servicio. |
| **RNF-07** | Mantenibilidad | **Código Tipado** | El uso de TypeScript es obligatorio para reducir errores en tiempo de ejecución. |

---
> [!IMPORTANT]
> El requisito **RNF-01 (Offline-First)** es el más crítico para el éxito del proyecto debido a la intermitencia de la señal móvil en las zonas rurales del Municipio Díaz.
