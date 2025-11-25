# Research: Módulo de Tutorías

**Feature**: 001-tutoring-module
**Date**: 2025-11-25

## Technical Decisions

### 1. Slot de Disponibilidad Horaria

**Decision**: Usar campo JSON `available_hours` existente para almacenar slots de 4 horas por día.

**Rationale**:
- La tabla `tutoring_sessions` ya tiene el campo `available_hours` como string
- Se puede usar como JSON stringificado para mantener compatibilidad
- Estructura propuesta: `{"monday": ["06:00-10:00", "10:00-14:00"], "tuesday": [...], ...}`

**Alternatives Considered**:
- Tabla separada `tutoring_availability_slots`: Más compleja, requiere migración y joins adicionales
- Array de PostgreSQL: Menos flexible para queries de filtrado

**Implementation**:
```typescript
interface AvailabilitySlots {
  monday?: string[];    // ["06:00-10:00", "14:00-18:00"]
  tuesday?: string[];
  wednesday?: string[];
  thursday?: string[];
  friday?: string[];
  saturday?: string[];
  sunday?: string[];
}
```

### 2. Múltiples Materias por Sesión

**Decision**: Usar combinación de `category_id` (materia principal) + `subject` (texto descriptivo) + tags opcionales.

**Rationale**:
- El schema actual tiene `category_id` y `subject` como campos separados
- `category_id` vincula a la tabla `categories` para filtrado estructurado
- `subject` permite texto libre para descripción adicional
- No se requiere migración

**Alternatives Considered**:
- Tabla `tutoring_session_subjects` (many-to-many): Más compleja, requiere migración
- Array de IDs en la sesión: Menos eficiente para queries

### 3. Sistema de Mensajes

**Decision**: Usar tabla `messages` existente con `tutoring_session_id`.

**Rationale**:
- La tabla `messages` ya soporta `tutoring_session_id` además de `product_id`
- Campos disponibles: `sender_id`, `recipient_id`, `content`, `is_read`, `images`
- Permite agrupar por conversación (session_id + user_ids)

**Implementation Pattern**:
```typescript
// Obtener mensajes agrupados por alumno para el tutor
const getMessagesByStudent = async (sessionId: string, tutorId: string) => {
  const { data } = await supabase
    .from('messages')
    .select('*, sender:users!sender_id(*), recipient:users!recipient_id(*)')
    .eq('tutoring_session_id', sessionId)
    .or(`sender_id.eq.${tutorId},recipient_id.eq.${tutorId}`)
    .order('created_at', { ascending: true });

  // Agrupar por el otro usuario (no el tutor)
  return groupByStudent(data, tutorId);
};
```

### 4. Sistema de Reviews/Calificaciones

**Decision**: Usar campo inline en `tutoring_bookings` (`student_rating`, `student_review`) para reviews simples.

**Rationale**:
- La tabla `tutoring_bookings` ya tiene `student_rating` y `student_review`
- Evita joins adicionales al mostrar historial de reservas
- La tabla `reviews` existe para casos más complejos (reviews bidireccionales)

**Flow**:
1. Reserva completada → estado = `completed`
2. Alumno puede agregar `student_rating` (1-5) y `student_review`
3. Trigger o función actualiza `rating` en `tutoring_sessions`

### 5. Flujo de Estados de Reserva

**Decision**: Implementar máquina de estados simple en el servicio.

**States**:
```
pending → confirmed → in_progress → completed
pending → cancelled
confirmed → cancelled
confirmed → no_show
```

**Implementation**:
```typescript
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['in_progress', 'cancelled', 'no_show'],
  in_progress: ['completed'],
  completed: [],
  cancelled: [],
  no_show: [],
};

const canTransition = (from: string, to: string): boolean => {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
};
```

### 6. Validación de Conflictos de Horario

**Decision**: Validar en el servicio antes de crear reserva con query a bookings existentes.

**Implementation**:
```typescript
const hasConflict = async (sessionId: string, date: string, time: string) => {
  const { data } = await supabase
    .from('tutoring_bookings')
    .select('id')
    .eq('session_id', sessionId)
    .eq('scheduled_date', date)
    .eq('scheduled_time', time)
    .not('status', 'in', '("cancelled","no_show")')
    .limit(1);

  return (data?.length ?? 0) > 0;
};
```

### 7. Favoritos de Tutorías

**Decision**: Usar tabla `favorites` existente con `item_type = 'tutoring_session'`.

**Rationale**:
- Ya existe el patrón en el código (`toggleTutoringFavorite` en tutoring.service.ts)
- Tabla `favorites` tiene `tutoring_session_id` como FK opcional

### 8. Filtros y Búsqueda

**Decision**: Extender filtros existentes en `getTutoringSessions`.

**Filters to Add**:
- `availability_day`: Filtrar por días disponibles
- `only_favorites`: Filtrar solo favoritos del usuario
- `min_rating`: Filtrar por rating mínimo

**Implementation Note**:
El filtro de disponibilidad horaria requiere parsear el JSON de `available_hours`.

### 9. React Query para Estado

**Decision**: Usar TanStack React Query (ya instalado) para manejo de estado servidor.

**Patterns**:
```typescript
// Hook para sesiones
export const useTutoringSessions = (filters?: TutoringFilters) => {
  return useQuery({
    queryKey: ['tutoring-sessions', filters],
    queryFn: () => getTutoringSessions(filters),
  });
};

// Hook para mutaciones
export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTutoringBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutoring-bookings'] });
    },
  });
};
```

### 10. Notificación de Mensajes Nuevos

**Decision**: Polling simple para MVP, con posibilidad de Supabase Realtime en futuro.

**Rationale**:
- Supabase Realtime está disponible pero añade complejidad
- Polling cada 30 segundos es suficiente para MVP
- Badge en UI indica mensajes no leídos

**Future Enhancement**:
```typescript
// Para implementación con Realtime
supabase
  .channel('tutoring-messages')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'messages' },
    (payload) => { /* update UI */ }
  )
  .subscribe();
```

## Dependencies Analysis

### Existing (No Changes Needed)

| Dependency | Version | Usage |
|------------|---------|-------|
| @supabase/supabase-js | ^2.84.0 | Database client |
| @tanstack/react-query | ^5.28.0 | Server state management |
| react-hook-form | ^7.51.0 | Form handling |
| zod | ^3.22.4 | Validation |
| date-fns | ^3.3.1 | Date manipulation |
| lucide-react | ^0.356.0 | Icons |

### New Dependencies Required

None - all functionality can be built with existing dependencies.

## Security Considerations

### Row Level Security (RLS)

Assumed existing RLS policies. Verify:

1. **tutoring_sessions**: Users can only edit their own sessions
2. **tutoring_bookings**:
   - Users can see bookings where they are student or tutor
   - Only tutor can confirm/reject
   - Only student can cancel pending/confirmed
3. **messages**: Users can only see messages where they are sender or recipient
4. **favorites**: Users can only manage their own favorites

### Input Validation

- Validate `scheduled_date` is in future
- Validate `scheduled_time` is within session's available hours
- Validate user cannot book their own session
- Sanitize review text content

## Performance Considerations

1. **Indexed Queries**: Ensure indexes on:
   - `tutoring_sessions(status, tutor_id)`
   - `tutoring_bookings(session_id, scheduled_date, status)`
   - `messages(tutoring_session_id, sender_id, recipient_id)`

2. **Pagination**: Implement cursor-based pagination for large lists

3. **Caching**: React Query handles client-side caching with configurable stale time

## Migration Strategy

**No database migration needed** - existing schema supports all requirements.

Schema adaptation strategy:
1. `available_hours` (string) → Parse as JSON in application layer
2. `subject` (string) → Use descriptively, filter via `category_id`
3. Reviews → Use inline fields in `tutoring_bookings` for simplicity
