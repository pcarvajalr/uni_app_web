# API Contracts: Módulo de Tutorías

**Feature**: 001-tutoring-module
**Date**: 2025-11-25
**API Type**: Supabase Client API (no REST endpoints separados)

Este proyecto usa Supabase directamente desde el frontend. Los "contratos" describen las funciones del servicio TypeScript que interactúan con Supabase.

## Service: tutoring.service.ts

### Sesiones de Tutoría

#### getTutoringSessions

Obtiene lista de sesiones de tutoría con filtros opcionales.

```typescript
interface TutoringFilters {
  category_id?: string;
  subject?: string;
  mode?: 'presential' | 'online' | 'both';
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  search?: string;
  tutor_id?: string;
  availability_day?: string;
  only_favorites?: boolean;
  user_id?: string; // Para filtrar favoritos
}

interface TutoringSessionWithTutor {
  id: string;
  title: string;
  description: string;
  subject: string;
  price_per_hour: number;
  duration_minutes: number;
  mode: 'presential' | 'online' | 'both';
  location: string | null;
  meeting_url: string | null;
  max_students: number | null;
  available_days: string[] | null;
  available_hours: string | null;
  status: 'active' | 'paused' | 'deleted';
  rating: number | null;
  total_bookings: number | null;
  created_at: string;
  tutor: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    rating: number;
    total_tutoring_sessions: number;
    career: string | null;
  };
  category: {
    id: string;
    name: string;
    icon: string | null;
  } | null;
  is_favorite?: boolean;
}

function getTutoringSessions(
  filters?: TutoringFilters
): Promise<TutoringSessionWithTutor[]>
```

#### getTutoringSessionById

Obtiene una sesión por ID con detalles completos.

```typescript
function getTutoringSessionById(
  id: string
): Promise<TutoringSessionWithTutor & {
  tutor: {
    phone: string | null;
  };
}>
```

#### createTutoringSession

Crea una nueva sesión de tutoría.

```typescript
interface CreateTutoringSessionInput {
  tutor_id: string;
  title: string;
  description: string;
  subject: string;
  category_id?: string;
  price_per_hour: number;
  duration_minutes: number;
  mode: 'presential' | 'online' | 'both';
  location?: string;
  meeting_url?: string;
  max_students?: number;
  available_days?: string[];
  available_hours?: string; // JSON stringified
}

function createTutoringSession(
  session: CreateTutoringSessionInput
): Promise<TutoringSession>
```

#### updateTutoringSession

Actualiza una sesión existente.

```typescript
interface UpdateTutoringSessionInput {
  title?: string;
  description?: string;
  subject?: string;
  category_id?: string;
  price_per_hour?: number;
  duration_minutes?: number;
  mode?: 'presential' | 'online' | 'both';
  location?: string;
  meeting_url?: string;
  max_students?: number;
  available_days?: string[];
  available_hours?: string;
  status?: 'active' | 'paused';
}

function updateTutoringSession(
  id: string,
  updates: UpdateTutoringSessionInput
): Promise<TutoringSession>
```

#### deleteTutoringSession

Elimina (soft delete) una sesión.

```typescript
function deleteTutoringSession(id: string): Promise<boolean>
// Sets status = 'deleted'
```

#### pauseTutoringSession / activateTutoringSession

Pausa o reactiva una sesión.

```typescript
function pauseTutoringSession(id: string): Promise<TutoringSession>
function activateTutoringSession(id: string): Promise<TutoringSession>
```

### Reservas

#### createTutoringBooking

Crea una reserva de tutoría.

```typescript
interface CreateBookingInput {
  session_id: string;
  student_id: string;
  tutor_id: string;
  scheduled_date: string; // YYYY-MM-DD
  scheduled_time: string; // HH:MM
  duration_minutes: number;
  total_price: number;
  location?: string;
  meeting_url?: string;
  notes?: string;
}

interface CreateBookingResult {
  booking: TutoringBooking;
  conflict?: boolean;
  error?: string;
}

function createTutoringBooking(
  booking: CreateBookingInput
): Promise<CreateBookingResult>
```

#### checkBookingConflict

Verifica si hay conflicto de horario.

```typescript
function checkBookingConflict(
  sessionId: string,
  date: string,
  time: string
): Promise<boolean>
```

#### getStudentBookings

Obtiene reservas de un estudiante.

```typescript
interface BookingWithDetails extends TutoringBooking {
  session: TutoringSessionWithTutor;
  tutor: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    phone: string | null;
  };
}

function getStudentBookings(
  studentId: string,
  statusFilter?: string[]
): Promise<BookingWithDetails[]>
```

#### getTutorBookings

Obtiene reservas recibidas por un tutor.

```typescript
interface TutorBookingDetails extends TutoringBooking {
  session: TutoringSession & {
    category: { id: string; name: string; icon: string | null } | null;
  };
  student: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    phone: string | null;
    student_id: string | null;
    career: string | null;
  };
}

function getTutorBookings(
  tutorId: string,
  statusFilter?: string[]
): Promise<TutorBookingDetails[]>
```

#### updateBookingStatus

Actualiza el estado de una reserva (para tutor).

```typescript
type BookingAction = 'confirm' | 'reject' | 'complete' | 'no_show';

function updateBookingStatus(
  bookingId: string,
  action: BookingAction
): Promise<TutoringBooking>

// Mapeo interno:
// confirm: pending → confirmed
// reject: pending → cancelled
// complete: in_progress → completed
// no_show: confirmed → no_show
```

#### cancelBooking

Cancela una reserva (para estudiante).

```typescript
function cancelBooking(
  bookingId: string,
  studentId: string
): Promise<TutoringBooking>
// Solo si status = 'pending' o 'confirmed'
```

#### addBookingReview

Agrega reseña a una reserva completada.

```typescript
interface AddReviewInput {
  booking_id: string;
  student_rating: number; // 1-5
  student_review?: string;
}

function addBookingReview(
  input: AddReviewInput
): Promise<TutoringBooking>
// También actualiza rating promedio de la sesión
```

### Favoritos

#### toggleTutoringFavorite

Agrega o quita favorito.

```typescript
function toggleTutoringFavorite(
  sessionId: string,
  userId: string
): Promise<boolean>
// Returns true if now favorite, false if removed
```

#### getUserTutoringFavorites

Obtiene IDs de sesiones favoritas del usuario.

```typescript
function getUserTutoringFavorites(
  userId: string
): Promise<string[]>
// Returns array of session IDs
```

## Service: tutoring-messages.service.ts

### Mensajes

#### sendTutoringMessage

Envía un mensaje sobre una sesión.

```typescript
interface SendMessageInput {
  tutoring_session_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  images?: string[];
}

function sendTutoringMessage(
  input: SendMessageInput
): Promise<Message>
```

#### getTutoringMessages

Obtiene mensajes de una sesión para un usuario.

```typescript
interface MessageWithUser extends Message {
  sender: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  recipient: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

function getTutoringMessages(
  sessionId: string,
  userId: string
): Promise<MessageWithUser[]>
```

#### getTutoringMessagesGroupedByStudent

Obtiene mensajes agrupados por alumno (para tutor).

```typescript
interface StudentConversation {
  student: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  messages: MessageWithUser[];
  unread_count: number;
  last_message_at: string;
}

function getTutoringMessagesGroupedByStudent(
  sessionId: string,
  tutorId: string
): Promise<StudentConversation[]>
```

#### markMessagesAsRead

Marca mensajes como leídos.

```typescript
function markMessagesAsRead(
  sessionId: string,
  recipientId: string
): Promise<void>
```

#### getUnreadMessageCount

Obtiene conteo de mensajes no leídos para un tutor.

```typescript
function getUnreadMessageCount(
  tutorId: string
): Promise<{ session_id: string; count: number }[]>
```

## React Query Hooks

### useTutoringSessions

```typescript
function useTutoringSessions(filters?: TutoringFilters) {
  return useQuery({
    queryKey: ['tutoring-sessions', filters],
    queryFn: () => getTutoringSessions(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
```

### useTutoringSession

```typescript
function useTutoringSession(id: string) {
  return useQuery({
    queryKey: ['tutoring-session', id],
    queryFn: () => getTutoringSessionById(id),
    enabled: !!id,
  });
}
```

### useStudentBookings

```typescript
function useStudentBookings(studentId: string) {
  return useQuery({
    queryKey: ['student-bookings', studentId],
    queryFn: () => getStudentBookings(studentId),
    enabled: !!studentId,
  });
}
```

### useTutorBookings

```typescript
function useTutorBookings(tutorId: string) {
  return useQuery({
    queryKey: ['tutor-bookings', tutorId],
    queryFn: () => getTutorBookings(tutorId),
    enabled: !!tutorId,
  });
}
```

### useCreateBooking

```typescript
function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTutoringBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['tutor-bookings'] });
    },
  });
}
```

### useUpdateBookingStatus

```typescript
function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, action }: { bookingId: string; action: BookingAction }) =>
      updateBookingStatus(bookingId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutor-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['student-bookings'] });
    },
  });
}
```

### useTutoringMessages

```typescript
function useTutoringMessages(sessionId: string, userId: string) {
  return useQuery({
    queryKey: ['tutoring-messages', sessionId, userId],
    queryFn: () => getTutoringMessages(sessionId, userId),
    enabled: !!sessionId && !!userId,
    refetchInterval: 30000, // Polling cada 30 segundos
  });
}
```

### useSendMessage

```typescript
function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendTutoringMessage,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tutoring-messages', variables.tutoring_session_id],
      });
    },
  });
}
```

## Error Handling

Todos los servicios pueden lanzar errores con la siguiente estructura:

```typescript
interface ServiceError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Códigos comunes:
// 'BOOKING_CONFLICT' - Ya existe reserva en ese horario
// 'INVALID_TRANSITION' - Transición de estado no válida
// 'UNAUTHORIZED' - Usuario no autorizado
// 'NOT_FOUND' - Recurso no encontrado
// 'VALIDATION_ERROR' - Error de validación
```
