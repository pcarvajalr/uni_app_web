# Implementation Plan: Módulo de Tutorías

**Branch**: `001-tutoring-module` | **Date**: 2025-11-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-tutoring-module/spec.md`

## Summary

Implementar un módulo completo de tutorías que permita a usuarios autenticados crear y publicar sesiones de tutoría, y a otros usuarios buscar, filtrar y reservar horarios de 1 hora dentro de los slots de disponibilidad del tutor. El módulo incluye gestión de reservas con flujo de estados, sistema de reseñas/calificaciones post-sesión, mensajería entre alumnos y tutores, y favoritos.

La base de datos ya está creada con las tablas principales (`tutoring_sessions`, `tutoring_bookings`, `messages`, `favorites`, `reviews`). El enfoque será completar la funcionalidad del frontend existente (actualmente usa datos mock) conectándolo con los servicios de Supabase existentes y añadiendo las funcionalidades faltantes.

## Technical Context

**Language/Version**: TypeScript 5.3.3
**Primary Dependencies**: React 18.3.1, Vite 5.1.6, TanStack React Query 5.28, Supabase JS 2.84, React Router DOM 6.22, React Hook Form 7.51, Zod 3.22, Tailwind CSS 3.4, Radix UI, Capacitor 6.0
**Storage**: Supabase (PostgreSQL) - tablas ya existentes: `tutoring_sessions`, `tutoring_bookings`, `messages`, `favorites`, `reviews`, `users`, `categories`
**Testing**: N/A (no hay configuración de tests en el proyecto actualmente)
**Target Platform**: Mobile-first (Capacitor para iOS/Android) + Web responsive
**Project Type**: Single - aplicación React con Vite
**Performance Goals**: Búsquedas filtradas < 2 segundos, mensajes visibles < 3 segundos
**Constraints**: Offline-capable mediante Capacitor, interfaces optimizadas para touch
**Scale/Scope**: ~100 sesiones activas simultáneas, ~50 pantallas/componentes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

El archivo de constitución está en estado de plantilla (no configurado). Se procede con las mejores prácticas estándar:

| Gate | Status | Notes |
|------|--------|-------|
| No implementation details in spec | PASS | Spec focuses on WHAT/WHY |
| Scope clearly bounded | PASS | 8 user stories with clear acceptance criteria |
| Dependencies identified | PASS | Uses existing Supabase infrastructure |
| Security considerations | PASS | RLS policies assumed at DB level |

## Project Structure

### Documentation (this feature)

```text
specs/001-tutoring-module/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── tutoring/
│   │   ├── create-tutoring-dialog.tsx     # Existente - ampliar
│   │   ├── tutoring-details-dialog.tsx    # Existente - ampliar
│   │   ├── booking-dialog.tsx             # NUEVO - flujo de reserva
│   │   ├── booking-calendar.tsx           # NUEVO - selector de slots
│   │   ├── tutoring-messages.tsx          # NUEVO - mensajes
│   │   ├── tutoring-review.tsx            # NUEVO - calificaciones
│   │   └── tutoring-card.tsx              # NUEVO - card de tutoría
│   └── ui/                                # Componentes UI existentes
├── pages/
│   ├── TutoringPage.tsx                   # Existente - refactorizar
│   ├── MySessionsPage.tsx                 # Existente - ampliar
│   └── TutoringBookingsPage.tsx           # NUEVO - reservas del usuario
├── services/
│   ├── tutoring.service.ts                # Existente - ampliar
│   ├── tutoring-subjects.service.ts       # Existente
│   └── tutoring-messages.service.ts       # NUEVO - mensajes
├── hooks/
│   ├── useTutoringSessions.ts             # NUEVO - React Query hooks
│   ├── useTutoringBookings.ts             # NUEVO
│   └── useTutoringMessages.ts             # NUEVO
├── lib/
│   └── supabase.ts                        # Existente
└── types/
    └── database.types.ts                  # Existente - ya tiene tipos
```

**Structure Decision**: Single project (React + Vite). El frontend consume directamente la API de Supabase sin backend separado. La estructura sigue el patrón existente con `components/`, `pages/`, `services/`, `hooks/`.

## Complexity Tracking

No hay violaciones de complejidad. El módulo sigue los patrones existentes del proyecto.

## Database Analysis

### Existing Tables (no migration needed)

Las siguientes tablas ya existen y cumplen con los requisitos de la spec:

1. **tutoring_sessions** - Sesiones de tutoría con todos los campos requeridos
2. **tutoring_bookings** - Reservas con flujo de estados y campos para review inline
3. **messages** - Mensajes con soporte para `tutoring_session_id`
4. **favorites** - Favoritos con soporte para `tutoring_session_id`
5. **reviews** - Reviews con referencia a `booking_id`
6. **categories** - Categorías para materias
7. **users** - Usuarios con campos `is_tutor`, `rating`, `total_tutoring_sessions`

### Schema Gaps Identified

1. **tutoring_sessions.available_hours**: Es `string` pero debería ser estructura JSON para slots de 4 horas
2. **tutoring_sessions.subject**: Es `string` único, pero spec pide múltiples materias → usar `category_id` + texto descriptivo

**User Input**: La base de datos ya está creada según la estructura. Si es necesario crear migración, usar Supabase CLI.

## Next Steps

1. Generate `research.md` with technical decisions
2. Generate `data-model.md` documenting existing schema
3. Generate API contracts in `contracts/`
4. Generate `quickstart.md` for development setup
5. Run `/speckit.tasks` to generate implementation tasks
