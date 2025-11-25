# Data Model: Módulo de Tutorías

**Feature**: 001-tutoring-module
**Date**: 2025-11-25

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────────┐       ┌─────────────────┐
│     users       │       │  tutoring_sessions  │       │   categories    │
├─────────────────┤       ├─────────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ tutor_id (FK)       │       │ id (PK)         │
│ full_name       │       │ id (PK)             │──────►│ name            │
│ email           │       │ title               │       │ type            │
│ avatar_url      │       │ description         │       │ icon            │
│ rating          │       │ subject             │       └─────────────────┘
│ is_tutor        │       │ category_id (FK)────┘
│ total_tutoring  │       │ price_per_hour      │
│ _sessions       │       │ duration_minutes    │
│ ...             │       │ mode                │
└─────────────────┘       │ location            │
        ▲                 │ meeting_url         │
        │                 │ max_students        │
        │                 │ available_days[]    │
        │                 │ available_hours     │
        │                 │ status              │
        │                 │ rating              │
        │                 │ total_bookings      │
        │                 └─────────────────────┘
        │                           │
        │                           │
        │         ┌─────────────────┴─────────────────┐
        │         │                                   │
        │         ▼                                   ▼
┌───────┴─────────────────┐               ┌───────────────────────┐
│   tutoring_bookings     │               │       messages        │
├─────────────────────────┤               ├───────────────────────┤
│ id (PK)                 │               │ id (PK)               │
│ session_id (FK)─────────┘               │ tutoring_session_id───┘
│ student_id (FK)─────────►users          │ sender_id (FK)────────►users
│ tutor_id (FK)───────────►users          │ recipient_id (FK)─────►users
│ scheduled_date          │               │ content               │
│ scheduled_time          │               │ is_read               │
│ duration_minutes        │               │ images[]              │
│ total_price             │               │ created_at            │
│ status                  │               └───────────────────────┘
│ location                │
│ meeting_url             │
│ notes                   │
│ student_rating          │               ┌───────────────────────┐
│ student_review          │               │      favorites        │
│ confirmed_at            │               ├───────────────────────┤
│ completed_at            │               │ id (PK)               │
└─────────────────────────┘               │ user_id (FK)──────────►users
                                          │ tutoring_session_id───►tutoring_sessions
                                          │ item_type             │
                                          │ created_at            │
                                          └───────────────────────┘
```

## Entities

### tutoring_sessions

Representa una publicación de tutoría creada por un tutor.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | Yes | Primary key |
| tutor_id | uuid (FK) | Yes | Reference to users.id |
| title | string | Yes | Título de la tutoría |
| description | string | Yes | Descripción detallada |
| subject | string | Yes | Materia/tema (texto libre) |
| category_id | uuid (FK) | No | Reference to categories.id |
| price_per_hour | number | Yes | Precio por hora |
| duration_minutes | number | Yes | Duración estándar de sesión |
| mode | enum | Yes | 'presential', 'online', 'both' |
| location | string | No | Ubicación física (si presencial) |
| meeting_url | string | No | URL de reunión (si online) |
| max_students | number | No | Máximo estudiantes por sesión |
| available_days | string[] | No | Días disponibles |
| available_hours | string (JSON) | No | Slots de 4 horas por día |
| status | enum | Yes | 'active', 'paused', 'deleted' |
| rating | number | No | Rating promedio calculado |
| total_bookings | number | No | Total de reservas completadas |
| created_at | timestamp | Yes | Auto-generated |
| updated_at | timestamp | Yes | Auto-updated |

**State Machine: status**
```
active ──► paused ──► active
   │          │
   ▼          ▼
deleted    deleted
```

### tutoring_bookings

Representa una reserva de tutoría hecha por un alumno.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | Yes | Primary key |
| session_id | uuid (FK) | Yes | Reference to tutoring_sessions.id |
| student_id | uuid (FK) | Yes | Reference to users.id (alumno) |
| tutor_id | uuid (FK) | Yes | Reference to users.id (tutor) |
| scheduled_date | date | Yes | Fecha de la sesión |
| scheduled_time | time | Yes | Hora de inicio |
| duration_minutes | number | Yes | Duración en minutos |
| total_price | number | Yes | Precio total calculado |
| status | enum | Yes | Estado de la reserva |
| location | string | No | Ubicación acordada |
| meeting_url | string | No | URL de reunión |
| notes | string | No | Notas del alumno |
| tutor_notes | string | No | Notas del tutor |
| student_rating | number (1-5) | No | Calificación del alumno |
| student_review | string | No | Reseña del alumno |
| confirmed_at | timestamp | No | Momento de confirmación |
| completed_at | timestamp | No | Momento de completación |
| created_at | timestamp | Yes | Auto-generated |
| updated_at | timestamp | Yes | Auto-updated |

**State Machine: status**
```
           ┌─────────► cancelled
           │
pending ───┼─────────► confirmed ───┬─────► in_progress ───► completed
           │                        │
           │                        └─────► no_show
           │                        │
           └────────────────────────┴─────► cancelled
```

**Valid Transitions**:
| From | To |
|------|-----|
| pending | confirmed, cancelled |
| confirmed | in_progress, cancelled, no_show |
| in_progress | completed |
| completed | (terminal) |
| cancelled | (terminal) |
| no_show | (terminal) |

### messages

Mensajes entre usuarios sobre una sesión de tutoría.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | Yes | Primary key |
| tutoring_session_id | uuid (FK) | No | Reference to tutoring_sessions.id |
| product_id | uuid (FK) | No | Reference to products.id (otro uso) |
| sender_id | uuid (FK) | Yes | Reference to users.id |
| recipient_id | uuid (FK) | Yes | Reference to users.id |
| content | string | Yes | Contenido del mensaje |
| images | string[] | No | URLs de imágenes adjuntas |
| is_read | boolean | Yes | Si fue leído |
| read_at | timestamp | No | Momento de lectura |
| created_at | timestamp | Yes | Auto-generated |

**Visibility Rules**:
- Mensajes solo visibles para sender y recipient
- En contexto de tutoría: tutor ve todos sus mensajes agrupados por alumno

### favorites

Favoritos de usuarios sobre tutorías.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | Yes | Primary key |
| user_id | uuid (FK) | Yes | Reference to users.id |
| tutoring_session_id | uuid (FK) | No | Reference to tutoring_sessions.id |
| product_id | uuid (FK) | No | Reference to products.id |
| campus_location_id | uuid (FK) | No | Reference to campus_locations.id |
| item_type | enum | Yes | 'tutoring_session', 'product', 'location' |
| created_at | timestamp | Yes | Auto-generated |

**Constraint**: Solo uno de `tutoring_session_id`, `product_id`, `campus_location_id` debe tener valor.

### categories

Categorías/materias para tutorías.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | Yes | Primary key |
| name | string | Yes | Nombre de la categoría |
| type | enum | Yes | 'tutoring', 'product', 'both' |
| description | string | No | Descripción |
| icon | string | No | Nombre del ícono |
| created_at | timestamp | Yes | Auto-generated |

### users (campos relevantes)

Campos del usuario relacionados con tutorías.

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| full_name | string | Nombre completo |
| avatar_url | string | URL del avatar |
| rating | number | Rating promedio general |
| is_tutor | boolean | Si es tutor activo |
| total_tutoring_sessions | number | Total de sesiones como tutor |
| career | string | Carrera del estudiante |
| phone | string | Teléfono de contacto |

## Indexes Requeridos

```sql
-- Para búsquedas de sesiones activas
CREATE INDEX idx_tutoring_sessions_status_tutor
  ON tutoring_sessions(status, tutor_id);

-- Para verificar conflictos de horario
CREATE INDEX idx_tutoring_bookings_session_date
  ON tutoring_bookings(session_id, scheduled_date, status);

-- Para obtener mensajes de una sesión
CREATE INDEX idx_messages_tutoring_session
  ON messages(tutoring_session_id, created_at);

-- Para favoritos del usuario
CREATE INDEX idx_favorites_user_type
  ON favorites(user_id, item_type);
```

## Validation Rules

### tutoring_sessions
- `price_per_hour` >= 0
- `duration_minutes` > 0 y <= 480 (8 horas)
- `max_students` > 0 y <= 50
- `mode` IN ('presential', 'online', 'both')
- `status` IN ('active', 'paused', 'deleted')
- Si `mode` = 'presential' o 'both', `location` debe tener valor
- Si `mode` = 'online' o 'both', `meeting_url` puede tener valor

### tutoring_bookings
- `scheduled_date` >= current_date
- `scheduled_time` debe estar dentro de `available_hours` de la sesión
- `student_id` != session.tutor_id (no puede reservar propia tutoría)
- `student_rating` BETWEEN 1 AND 5
- `total_price` = (duration_minutes / 60) * session.price_per_hour

### messages
- Al menos uno de `tutoring_session_id` o `product_id` debe tener valor
- `sender_id` != `recipient_id`
- `content` no vacío (min 1 carácter)

## Available Hours JSON Schema

```typescript
interface AvailableHours {
  monday?: SlotRange[];
  tuesday?: SlotRange[];
  wednesday?: SlotRange[];
  thursday?: SlotRange[];
  friday?: SlotRange[];
  saturday?: SlotRange[];
  sunday?: SlotRange[];
}

type SlotRange =
  | "00:00-04:00"
  | "04:00-08:00"
  | "08:00-12:00"
  | "12:00-16:00"
  | "16:00-20:00"
  | "20:00-24:00";

// Ejemplo
const example: AvailableHours = {
  monday: ["08:00-12:00", "16:00-20:00"],
  wednesday: ["12:00-16:00"],
  friday: ["08:00-12:00", "12:00-16:00", "16:00-20:00"]
};
```

El campo `available_hours` en la tabla se almacena como `string` (JSON.stringify).
