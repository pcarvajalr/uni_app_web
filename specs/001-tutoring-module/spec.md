# Feature Specification: Módulo de Tutorías

**Feature Branch**: `001-tutoring-module`
**Created**: 2025-11-25
**Status**: Draft
**Input**: Módulo completo de tutorías con gestión de sesiones, reservas, sistema de disponibilidad horaria, reseñas y mensajes

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear y Publicar Sesión de Tutoría (Priority: P1)

Como usuario autenticado que desea ofrecer tutorías, quiero crear una sesión de tutoría con información detallada y configurar mi disponibilidad horaria, para que los alumnos puedan encontrar y reservar mis servicios.

**Why this priority**: Sin sesiones de tutoría publicadas, no existe el inventario base del módulo. Esta funcionalidad es el punto de entrada para que el marketplace funcione.

**Independent Test**: Puede probarse completamente creando una sesión con todos los campos requeridos, configurando slots de disponibilidad, y verificando que la sesión aparezca en el listado público.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado, **When** completa el formulario de creación con título, descripción, materias, precio/hora, duración, modalidad, ubicación/URL y máximo de estudiantes, **Then** la sesión se guarda con estado `active` y es visible en el listado público
2. **Given** un usuario creando una sesión, **When** selecciona la disponibilidad horaria en slots de 4 horas por día, **Then** los slots quedan asociados a la sesión y son visibles para los alumnos
3. **Given** un usuario autenticado, **When** selecciona múltiples materias del selector existente, **Then** todas las materias quedan asociadas a la sesión

---

### User Story 2 - Buscar y Reservar Tutoría (Priority: P1)

Como alumno, quiero buscar tutorías disponibles usando filtros y reservar un bloque de 1 hora dentro de los slots disponibles del tutor, para recibir ayuda académica personalizada.

**Why this priority**: La capacidad de descubrir y reservar tutorías es esencial para conectar alumnos con tutores. Sin esta funcionalidad, las sesiones publicadas no tienen utilidad.

**Independent Test**: Puede probarse buscando tutorías con diferentes filtros, seleccionando una sesión, eligiendo un horario disponible de 1 hora, y completando la reserva.

**Acceptance Scenarios**:

1. **Given** tutorías publicadas en el sistema, **When** un alumno aplica filtros (materia, modalidad, precio, disponibilidad, rating), **Then** se muestra una lista filtrada de tutorías que cumplen los criterios
2. **Given** una tutoría con slots disponibles, **When** el alumno selecciona fecha y horario de 1 hora dentro de un slot activo, **Then** se crea una reserva con estado `pending`
3. **Given** un alumno intentando reservar, **When** selecciona un horario que ya está reservado, **Then** el sistema muestra un mensaje de conflicto y no permite la reserva
4. **Given** un usuario autenticado viendo sus propias tutorías, **When** intenta reservar una de ellas, **Then** el sistema impide la acción (un usuario no puede reservar sus propias tutorías)

---

### User Story 3 - Gestionar Reservas como Tutor (Priority: P2)

Como tutor, quiero ver y gestionar las solicitudes de reserva recibidas, para confirmar o rechazar alumnos y mantener control sobre mi agenda.

**Why this priority**: Permite al tutor tener control sobre quién asiste a sus tutorías, completando el flujo de reserva bidireccional.

**Independent Test**: Puede probarse recibiendo una solicitud de reserva y ejecutando las acciones de confirmar/rechazar, verificando los cambios de estado.

**Acceptance Scenarios**:

1. **Given** reservas con estado `pending`, **When** el tutor accede a su lista de reservas, **Then** ve todas las reservas con filtros por estado
2. **Given** una reserva en estado `pending`, **When** el tutor la confirma, **Then** el estado cambia a `confirmed`
3. **Given** una reserva en estado `pending`, **When** el tutor la rechaza, **Then** el estado cambia a `cancelled`
4. **Given** una reserva en estado `confirmed` y la sesión completada, **When** el tutor la marca como completada, **Then** el estado cambia a `completed`
5. **Given** una reserva en estado `confirmed`, **When** el alumno no asiste, **Then** el tutor puede marcarla como `no_show`

---

### User Story 4 - Ver y Cancelar Reservas como Alumno (Priority: P2)

Como alumno, quiero ver el estado de mis reservas y poder cancelarlas cuando sea necesario, para mantener control sobre mis compromisos académicos.

**Why this priority**: Completa el flujo de reservas desde la perspectiva del alumno, permitiendo gestión autónoma de sus compromisos.

**Independent Test**: Puede probarse accediendo a la lista de reservas del alumno, verificando estados y ejecutando cancelación de una reserva pendiente o confirmada.

**Acceptance Scenarios**:

1. **Given** un alumno con reservas realizadas, **When** accede a su lista de reservas, **Then** ve todas sus reservas con el estado actual de cada una
2. **Given** una reserva con estado `pending` o `confirmed`, **When** el alumno solicita cancelar, **Then** el estado cambia a `cancelled`
3. **Given** una reserva con estado `in_progress` o `completed`, **When** el alumno intenta cancelar, **Then** el sistema no permite la acción

---

### User Story 5 - Calificar y Reseñar Tutoría (Priority: P3)

Como alumno con una reserva completada, quiero dejar una calificación y reseña de mi experiencia, para ayudar a otros alumnos a elegir tutores de calidad.

**Why this priority**: Las reseñas agregan confianza al marketplace y ayudan en la toma de decisiones, pero el módulo puede funcionar inicialmente sin ellas.

**Independent Test**: Puede probarse completando una reserva, accediendo a la opción de reseña, ingresando rating y comentario, y verificando que se refleje en el rating promedio de la sesión.

**Acceptance Scenarios**:

1. **Given** una reserva con estado `completed`, **When** el alumno accede a dejar reseña, **Then** puede ingresar rating (1-5 estrellas) y comentario de texto
2. **Given** una reserva que ya tiene reseña, **When** el alumno intenta agregar otra reseña, **Then** el sistema no lo permite (una reseña por reserva)
3. **Given** una reserva con estado diferente a `completed`, **When** el alumno intenta dejar reseña, **Then** el sistema no muestra la opción
4. **Given** una nueva reseña ingresada, **When** se guarda exitosamente, **Then** el rating promedio de la sesión de tutoría se actualiza

---

### User Story 6 - Enviar Mensajes sobre Tutorías (Priority: P3)

Como usuario interesado en una tutoría, quiero enviar preguntas al tutor y recibir respuestas, para aclarar dudas antes de reservar.

**Why this priority**: Mejora la comunicación entre partes interesadas, pero no es crítico para el flujo básico de reservas.

**Independent Test**: Puede probarse enviando un mensaje en una tutoría, verificando que el tutor lo reciba agrupado por alumno, y que el tutor pueda responder.

**Acceptance Scenarios**:

1. **Given** una tutoría publicada, **When** un usuario envía un mensaje/pregunta, **Then** el mensaje queda registrado y visible para el tutor y el alumno que escribió
2. **Given** mensajes recibidos de varios alumnos, **When** el tutor accede a los mensajes, **Then** los ve agrupados por alumno
3. **Given** un mensaje recibido, **When** el tutor responde, **Then** la respuesta es visible solo para el alumno que hizo la pregunta original
4. **Given** mensajes nuevos, **When** el tutor creador accede a su tutoría, **Then** ve una notificación/indicador de mensajes nuevos

---

### User Story 7 - Gestionar Favoritos de Tutorías (Priority: P4)

Como alumno, quiero marcar tutorías como favoritas y filtrar para ver solo mis favoritos, para acceder rápidamente a las opciones que más me interesan.

**Why this priority**: Es una funcionalidad de conveniencia que mejora la experiencia pero no afecta el flujo principal.

**Independent Test**: Puede probarse marcando una tutoría como favorita, verificando que aparezca al filtrar por favoritos, y desmarcándola.

**Acceptance Scenarios**:

1. **Given** una tutoría visible, **When** el usuario la marca como favorita, **Then** queda registrada en la tabla `favorites` existente
2. **Given** tutorías marcadas como favoritas, **When** el usuario activa el filtro "Solo favoritos", **Then** solo se muestran sus tutorías favoritas
3. **Given** una tutoría marcada como favorita, **When** el usuario la desmarca, **Then** se elimina de favoritos y no aparece al filtrar

---

### User Story 8 - Pausar y Reactivar Sesión (Priority: P4)

Como tutor, quiero pausar temporalmente mi sesión de tutoría y reactivarla cuando esté disponible, para gestionar mi disponibilidad sin eliminar la publicación.

**Why this priority**: Funcionalidad de gestión avanzada que no es crítica para el MVP pero agrega flexibilidad.

**Independent Test**: Puede probarse pausando una sesión activa, verificando que no aparezca en búsquedas, y reactivándola.

**Acceptance Scenarios**:

1. **Given** una sesión con estado `active`, **When** el tutor la pausa, **Then** el estado cambia a `paused` y no aparece en búsquedas públicas
2. **Given** una sesión con estado `paused`, **When** el tutor la reactiva, **Then** el estado cambia a `active` y vuelve a ser visible
3. **Given** una sesión con reservas confirmadas, **When** el tutor la pausa, **Then** las reservas existentes no se cancelan automáticamente

---

### Edge Cases

- ¿Qué sucede cuando un tutor elimina una sesión con reservas pendientes o confirmadas? Las reservas deben cancelarse y notificar a los alumnos
- ¿Qué sucede cuando dos alumnos intentan reservar el mismo horario simultáneamente? El sistema debe manejar concurrencia y solo permitir una reserva exitosa
- ¿Qué sucede cuando un alumno busca tutorías pero no hay ninguna disponible para los filtros seleccionados? Mostrar mensaje de "sin resultados" con sugerencia de ajustar filtros
- ¿Qué sucede cuando el tutor no responde a una reserva pendiente después de un tiempo prolongado? El sistema podría auto-cancelar reservas pendientes después de cierto período (asumir 48 horas)
- ¿Qué sucede si un slot de disponibilidad está completamente reservado? El slot no debe aparecer como opción disponible para nuevas reservas

## Requirements *(mandatory)*

### Functional Requirements

**Gestión de Sesiones (Tutor)**
- **FR-001**: El sistema DEBE permitir a usuarios autenticados crear sesiones de tutoría con título, descripción, materias (múltiples), precio/hora, duración, modalidad (presencial/online/ambos), ubicación o URL, y máximo de estudiantes
- **FR-002**: El sistema DEBE utilizar el selector de materias existente con categorías configuradas para la selección de materias
- **FR-003**: El sistema DEBE permitir al tutor configurar disponibilidad horaria mediante slots de 4 horas que cubren las 24 horas del día (6 slots/día × 7 días)
- **FR-004**: Solo el tutor creador DEBE poder editar su propia sesión de tutoría
- **FR-005**: El sistema DEBE permitir pausar y reactivar publicaciones de sesiones
- **FR-006**: Las sesiones DEBEN tener estados: `active`, `paused`, `deleted`

**Reservas (Alumno)**
- **FR-007**: El sistema DEBE permitir a alumnos reservar bloques de 1 hora dentro de los slots activos del tutor
- **FR-008**: El sistema DEBE validar conflictos de horario y no permitir reservas superpuestas
- **FR-009**: El sistema DEBE impedir que un usuario reserve sus propias tutorías
- **FR-010**: Las reservas DEBEN iniciar en estado `pending` y seguir el flujo: `pending` → `confirmed` → `in_progress` → `completed`, con alternativas: `pending` → `cancelled`, `confirmed` → `no_show`
- **FR-011**: El tutor DEBE poder confirmar o rechazar cada solicitud de reserva

**Visualización de Reservas**
- **FR-012**: Los tutores DEBEN ver una lista de reservas recibidas con filtros por estado y acciones: confirmar, rechazar, marcar completada, marcar no-show
- **FR-013**: Los alumnos DEBEN ver una lista de reservas realizadas con estado actual y acción de cancelar (si está pendiente/confirmada)

**Reseñas y Calificación**
- **FR-014**: Solo alumnos DEBEN poder calificar sesiones de tutoría
- **FR-015**: Solo DEBE permitirse calificación después de una reserva con estado `completed`
- **FR-016**: El sistema DEBE permitir una sola reseña por reserva
- **FR-017**: Las reseñas DEBEN incluir rating (1-5 estrellas) y comentario de texto
- **FR-018**: El rating promedio de la sesión DEBE actualizarse al agregar nuevas reseñas

**Mensajes**
- **FR-019**: El sistema DEBE permitir a cualquier usuario dejar mensajes/preguntas en una tutoría
- **FR-020**: El tutor DEBE poder responder a los mensajes
- **FR-021**: Los mensajes DEBEN ser visibles solo para el tutor y el alumno que escribió
- **FR-022**: El sistema DEBE agrupar mensajes por alumno para el tutor
- **FR-023**: El tutor creador DEBE ver una notificación/indicador de mensajes nuevos

**Favoritos**
- **FR-024**: El sistema DEBE permitir marcar tutorías como favoritas usando la tabla `favorites` existente
- **FR-025**: El sistema DEBE ofrecer filtro para mostrar solo favoritos del usuario

**Filtros y Búsqueda**
- **FR-026**: El sistema DEBE ofrecer filtros por: materia/categoría, modalidad, rango de precio, disponibilidad horaria, solo favoritos, rating

### Key Entities

- **Sesión de Tutoría (tutoring_sessions)**: Representa una publicación de tutoría. Incluye información del tutor, título, descripción, materias asociadas, precio, duración, modalidad, ubicación/URL, máximo de estudiantes, disponibilidad horaria (slots), y estado de publicación. Se relaciona con el usuario creador (tutor)
- **Reserva (tutoring_bookings)**: Representa una reserva de tutoría hecha por un alumno. Incluye referencia a la sesión, alumno, fecha y hora específica, estado del flujo, y opcionalmente rating/review después de completarse. Se relaciona con la sesión y el usuario alumno
- **Mensaje (tutoring_messages)**: Representa preguntas y respuestas entre usuarios y tutores sobre una sesión específica. Incluye contenido, remitente, receptor, sesión asociada, y timestamp. Se relaciona con la sesión y los usuarios involucrados
- **Favorito (favorites)**: Tabla existente que marca tutorías como favoritas por usuario. Se relaciona con la sesión y el usuario

## Assumptions

- El sistema de autenticación de usuarios ya existe y está funcional
- El selector de materias con categorías configuradas ya está implementado
- La tabla `favorites` existe y puede reutilizarse para tutorías
- La plataforma está optimizada para mobile-first (Capacitor) con interfaces responsivas
- Los timestamps se manejan en la zona horaria del usuario o configuración del sistema
- Las notificaciones de mensajes nuevos son visuales (badge/indicador), no push notifications (a menos que ya exista infraestructura)
- El sistema auto-cancela reservas pendientes después de 48 horas sin respuesta del tutor

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Los tutores pueden crear y publicar una sesión de tutoría completa en menos de 5 minutos
- **SC-002**: Los alumnos pueden encontrar y reservar una tutoría relevante en menos de 3 minutos usando filtros
- **SC-003**: El 95% de las búsquedas con filtros devuelven resultados en menos de 2 segundos
- **SC-004**: Los tutores pueden gestionar (confirmar/rechazar) una reserva en menos de 30 segundos
- **SC-005**: El 90% de los flujos de reserva se completan sin errores de conflicto de horario
- **SC-006**: El sistema soporta al menos 100 sesiones de tutoría activas simultáneamente sin degradación
- **SC-007**: El rating promedio de las sesiones se actualiza correctamente en el 100% de los casos al agregar reseñas
- **SC-008**: Los mensajes entre usuarios se entregan y muestran en menos de 3 segundos
