# Especificaciones del Módulo de Tutorías

## 1. ROLES Y PERMISOS

### 1.1 Modelo de Usuario Dual
- Cualquier usuario autenticado puede actuar como **tutor** (publica sesiones) y como **alumno** (reserva sesiones)
- Un usuario no puede reservar sus propias tutorías

---

## 2. GESTIÓN DE SESIONES DE TUTORÍA (Tutor)

### 2.1 Crear Sesión
- Campos: título, descripción, materia (selector existente), precio/hora, duración, modalidad (presencial/online/ambos), ubicación o URL, máximo de estudiantes
- Selector de materias: componente existente con categorías configuradas, se deben poder seleccionar varias materias.
- Selector de disponibilidad horaria (ver sección 3)

### 2.2 Editar Sesión
- Solo el tutor creador puede editar
- Puede pausar/reactivar la publicación

### 2.3 Estados de Sesión
- `active` | `paused` | `deleted`

---

## 3. SISTEMA DE DISPONIBILIDAD HORARIA

### 3.1 Estructura de Slots
- Slots predefinidos de **4 horas** cubriendo 24h (6 slots/día × 7 días)
- El tutor selecciona qué slots están disponibles para cada día

### 3.2 Reserva de Alumnos
- Los alumnos reservan bloques de **1 hora** dentro de los slots activos del tutor
- Validación de conflictos: no permitir reservas superpuestas

---

## 4. FLUJO DE RESERVAS (Alumno)

### 4.1 Proceso de Reserva
1. Alumno selecciona sesión de tutoría
2. Visualiza slots disponibles del tutor
3. Selecciona fecha + horario de 1 hora dentro de slot disponible
4. Envía solicitud de reserva

### 4.2 Estados de Reserva
- `pending` → `confirmed` → `in_progress` → `completed`
- `pending` → `cancelled`
- `confirmed` → `no_show`

### 4.3 Aprobación del Tutor
- Reservas inician en estado `pending`
- Tutor debe confirmar o rechazar cada solicitud

---

## 5. VISUALIZACIÓN DE RESERVAS

### 5.1 Vista Tutor
- Lista de reservas recibidas con filtros por estado
- Acciones: confirmar, rechazar, marcar completada, marcar no-show

### 5.2 Vista Alumno
- Lista de reservas realizadas con estado actual
- Acciones: cancelar (si está pendiente/confirmada)

---

## 6. SISTEMA DE RESEÑAS Y CALIFICACIÓN

### 6.1 Condiciones
- Solo alumnos pueden calificar
- Solo después de reserva con estado `completed`
- Una reseña por reserva

### 6.2 Datos
- Rating: 1-5 estrellas
- Comentario de texto
- Se refleja en el rating promedio de la sesión

---

## 7. SISTEMA DE MENSAJES

### 7.1 Mensajes Públicos
- Cualquier usuario puede dejar mensaje/pregunta en una tutoría
- El tutor puede responder

### 7.2 Visibilidad
- Mensajes visibles solo para el tutor y el alumno que escribio.
- Botón para ver mensajes (solo visible para el tutor creador como notificación)
- agrupar los mensajes por alumno.

---

## 8. FAVORITOS

### 8.1 Funcionalidad
- Usuarios pueden marcar tutorías como favoritas
- Usar tabla `favorites` existente
- Filtro para mostrar solo favoritos del usuario

---

## 9. FILTROS Y BÚSQUEDA

### 9.1 Filtros Disponibles
- Por materia/categoría
- Por modalidad (presencial/online/ambos)
- Por rango de precio
- Por disponibilidad horaria
- Solo favoritos
- Por rating

---

## 10. CONSIDERACIONES TÉCNICAS

### 10.1 Plataforma
- Mobile-first (Capacitor)
- Interfaces responsivas optimizadas para touch

### 10.2 Tablas Base
- `tutoring_sessions`: publicaciones de tutoría
- `tutoring_bookings`: reservas con rating/review integrado
- `favorites`: marcadores de favoritos
- Tabla adicional requerida: `tutoring_messages` (mensajes/preguntas)

---

## DIAGRAMA DE FLUJO

```
┌─────────────────────────────────────────────────────────────────┐
│                         TUTOR                                   │
├─────────────────────────────────────────────────────────────────┤
│  Crear Sesión → Configurar Horarios → Publicar                 │
│       ↓                                                         │
│  Recibir Reservas → Confirmar/Rechazar                         │
│       ↓                                                         │
│  Dar Clase → Marcar Completada                                 │
│       ↓                                                         │
│  Ver Reseñas y Rating                                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        ALUMNO                                   │
├─────────────────────────────────────────────────────────────────┤
│  Buscar/Filtrar Tutorías → Ver Detalles → Agregar Favorito     │
│       ↓                                                         │
│  Seleccionar Horario → Reservar                                │
│       ↓                                                         │
│  Esperar Confirmación → Asistir a Clase                        │
│       ↓                                                         │
│  Dejar Reseña y Calificación                                   │
└─────────────────────────────────────────────────────────────────┘
```
