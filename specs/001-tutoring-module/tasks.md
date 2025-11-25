# Tasks: Módulo de Tutorías

**Input**: Design documents from `/specs/001-tutoring-module/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not included (no testing framework configured in the project)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root
- Structure follows existing patterns with `components/`, `pages/`, `services/`, `hooks/`

---

## Phase 1: Setup (Shared Infrastructure) ✅

**Purpose**: Project initialization and TypeScript type definitions

- [X] T001 Define TypeScript interfaces for tutoring module in src/types/tutoring.types.ts
- [X] T002 [P] Create AvailableHours JSON schema and helper functions in src/lib/availability-utils.ts
- [X] T003 [P] Define booking state machine transitions in src/lib/booking-states.ts

---

## Phase 2: Foundational (Blocking Prerequisites) ✅

**Purpose**: Core services and hooks that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Extend tutoring.service.ts with getTutoringSessions filter support in src/services/tutoring.service.ts
- [X] T005 [P] Implement getTutoringSessionById in src/services/tutoring.service.ts
- [X] T006 Create useTutoringSessions React Query hook in src/hooks/useTutoringSessions.ts
- [X] T007 [P] Create useTutoringSession hook for single session in src/hooks/useTutoringSessions.ts
- [X] T008 Create TutoringCard component for session display in src/components/tutoring/tutoring-card.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin ✅

---

## Phase 3: User Story 1 - Crear y Publicar Sesión de Tutoría (Priority: P1) 🎯 MVP ✅

**Goal**: Allow authenticated users to create tutoring sessions with detailed information and availability configuration

**Independent Test**: Create a session with all required fields, configure availability slots, verify it appears in public listing

### Implementation for User Story 1

- [X] T009 [US1] Extend create-tutoring-dialog.tsx to use real Supabase service in src/components/tutoring/create-tutoring-dialog.tsx
- [X] T010 [US1] Add availability slots selector (4-hour blocks per day) to create-tutoring-dialog.tsx
- [X] T011 [US1] Implement createTutoringSession service function in src/services/tutoring.service.ts
- [X] T012 [US1] Add form validation with Zod for session creation in src/components/tutoring/create-tutoring-dialog.tsx
- [X] T013 [US1] Create useCreateTutoringSession mutation hook in src/hooks/useTutoringSessions.ts
- [X] T014 [US1] Update TutoringPage.tsx to fetch real sessions instead of mock data in src/pages/TutoringPage.tsx
- [X] T015 [US1] Display availability slots in tutoring-details-dialog.tsx in src/components/tutoring/tutoring-details-dialog.tsx

**Checkpoint**: Users can create tutoring sessions with availability configuration ✅

---

## Phase 4: User Story 2 - Buscar y Reservar Tutoría (Priority: P1) ✅

**Goal**: Allow students to search, filter, and book 1-hour slots within tutor availability

**Independent Test**: Search with filters, select a session, choose available time slot, complete booking

### Implementation for User Story 2

- [X] T016 [US2] Add filter panel to TutoringPage with category, mode, price, rating filters in src/pages/TutoringPage.tsx
- [X] T017 [P] [US2] Implement availability_day filter in getTutoringSessions service in src/services/tutoring.service.ts
- [X] T018 [P] [US2] Create booking-calendar.tsx component for slot selection in src/components/tutoring/booking-calendar.tsx (integrated into tutoring-details-dialog.tsx)
- [X] T019 [US2] Create booking-dialog.tsx with time slot selection and booking form in src/components/tutoring/booking-dialog.tsx (integrated into tutoring-details-dialog.tsx)
- [X] T020 [US2] Implement createTutoringBooking service with conflict validation in src/services/tutoring.service.ts
- [X] T021 [US2] Implement checkBookingConflict service function in src/services/tutoring.service.ts
- [X] T022 [US2] Create useCreateBooking mutation hook in src/hooks/useTutoringBookings.ts
- [X] T023 [US2] Add booking button and flow to tutoring-details-dialog.tsx in src/components/tutoring/tutoring-details-dialog.tsx
- [X] T024 [US2] Add validation to prevent booking own sessions in booking-dialog.tsx

**Checkpoint**: Students can search, filter, and book tutoring sessions ✅

---

## Phase 5: User Story 3 - Gestionar Reservas como Tutor (Priority: P2) ✅

**Goal**: Allow tutors to view, confirm, reject, and manage booking requests

**Independent Test**: Receive booking request, confirm/reject it, verify status changes

### Implementation for User Story 3

- [X] T025 [US3] Implement getTutorBookings service with status filter in src/services/tutoring.service.ts
- [X] T026 [US3] Implement updateBookingStatus service (confirm, reject, complete, no_show) in src/services/tutoring.service.ts
- [X] T027 [US3] Create useTutorBookings React Query hook in src/hooks/useTutoringBookings.ts
- [X] T028 [US3] Create useUpdateBookingStatus mutation hook in src/hooks/useTutoringBookings.ts
- [X] T029 [US3] Integrated booking management into MySessionsPage.tsx (no separate page needed)
- [X] T030 [US3] Add booking management UI with confirm/reject/complete actions in src/pages/MySessionsPage.tsx
- [X] T031 [US3] Route already exists at /tutoring/my-sessions
- [X] T032 [US3] MySessionsPage.tsx updated with full tutor booking management

**Checkpoint**: Tutors can manage incoming booking requests ✅

---

## Phase 6: User Story 4 - Ver y Cancelar Reservas como Alumno (Priority: P2) ✅

**Goal**: Allow students to view booking status and cancel pending/confirmed bookings

**Independent Test**: View booking list with statuses, cancel a pending booking, verify it cannot be cancelled when in_progress

### Implementation for User Story 4

- [X] T033 [US4] Implement getStudentBookings service in src/services/tutoring.service.ts
- [X] T034 [US4] Implement cancelBooking service in src/services/tutoring.service.ts
- [X] T035 [US4] Create useStudentBookings React Query hook in src/hooks/useTutoringBookings.ts
- [X] T036 [US4] Create useCancelBooking mutation hook in src/hooks/useTutoringBookings.ts
- [X] T037 [US4] Add student bookings view to MySessionsPage with status filters in src/pages/MySessionsPage.tsx
- [X] T038 [US4] Add cancel booking button and confirmation dialog in src/pages/MySessionsPage.tsx

**Checkpoint**: Students can view and manage their bookings ✅

---

## Phase 7: User Story 5 - Calificar y Reseñar Tutoría (Priority: P3) ✅

**Goal**: Allow students to rate and review completed tutoring sessions

**Independent Test**: Complete a booking, add rating and review, verify session average rating updates

### Implementation for User Story 5

- [X] T039 [US5] Implement addBookingReview service in src/services/tutoring.service.ts
- [X] T040 [US5] Create useAddBookingReview mutation hook in src/hooks/useTutoringBookings.ts
- [X] T041 [US5] Review dialog integrated into MySessionsPage.tsx (no separate component needed)
- [X] T042 [US5] Add review button to completed bookings in MySessionsPage in src/pages/MySessionsPage.tsx
- [X] T043 [US5] Display session reviews in tutoring-details-dialog.tsx in src/components/tutoring/tutoring-details-dialog.tsx

**Checkpoint**: Students can rate completed sessions, ratings visible to all users ✅

---

## Phase 8: User Story 6 - Enviar Mensajes sobre Tutorías (Priority: P3) ✅

**Goal**: Allow users to send and receive messages about tutoring sessions

**Independent Test**: Send message from student, tutor sees it grouped by student, tutor responds, student sees response

### Implementation for User Story 6

- [X] T044 [US6] Create tutoring-messages.service.ts with all message functions in src/services/tutoring-messages.service.ts
- [X] T045 [US6] Implement sendTutoringMessage in src/services/tutoring-messages.service.ts
- [X] T046 [US6] Implement getTutoringMessages for conversation view in src/services/tutoring-messages.service.ts
- [X] T047 [US6] Implement getTutoringMessagesGroupedByStudent for tutor in src/services/tutoring-messages.service.ts
- [X] T048 [US6] Implement markMessagesAsRead in src/services/tutoring-messages.service.ts
- [X] T049 [US6] Implement getUnreadMessageCount in src/services/tutoring-messages.service.ts
- [X] T050 [US6] Create useTutoringMessages React Query hook with polling in src/hooks/useTutoringMessages.ts
- [X] T051 [US6] Create useSendMessage mutation hook in src/hooks/useTutoringMessages.ts
- [X] T052 [US6] Create tutoring-messages.tsx component for conversation UI in src/components/tutoring/tutoring-messages.tsx
- [X] T053 [US6] Add messages section to tutoring-details-dialog.tsx in src/components/tutoring/tutoring-details-dialog.tsx
- [X] T054 [US6] Add unread message badge indicator to session cards in src/components/tutoring/tutoring-card.tsx

**Checkpoint**: Users can communicate about tutoring sessions ✅

---

## Phase 9: User Story 7 - Gestionar Favoritos de Tutorías (Priority: P4) ✅

**Goal**: Allow students to mark sessions as favorites and filter to show only favorites

**Independent Test**: Mark session as favorite, filter to show only favorites, unmark favorite

### Implementation for User Story 7

- [X] T055 [US7] Implement toggleTutoringFavorite service in src/services/tutoring.service.ts
- [X] T056 [US7] Implement getUserTutoringFavorites service in src/services/tutoring.service.ts
- [X] T057 [US7] Create useTutoringFavorites hook in src/hooks/useTutoringSessions.ts
- [X] T058 [US7] Create useToggleFavorite mutation hook in src/hooks/useTutoringSessions.ts
- [X] T059 [US7] Add favorite button to TutoringCard and tutoring-details-dialog in src/components/tutoring/tutoring-card.tsx
- [X] T060 [US7] Add "Only favorites" filter to TutoringPage in src/pages/TutoringPage.tsx
- [X] T061 [US7] Implement only_favorites filter in getTutoringSessions in src/services/tutoring.service.ts

**Checkpoint**: Students can save and filter favorite tutoring sessions ✅

---

## Phase 10: User Story 8 - Pausar y Reactivar Sesión (Priority: P4) ✅

**Goal**: Allow tutors to pause and reactivate their tutoring sessions

**Independent Test**: Pause active session, verify not in public search, reactivate, verify visible again

### Implementation for User Story 8

- [X] T062 [US8] Implement pauseTutoringSession service in src/services/tutoring.service.ts
- [X] T063 [US8] Implement activateTutoringSession service in src/services/tutoring.service.ts
- [X] T064 [US8] Create usePauseSession and useActivateSession mutation hooks in src/hooks/useTutoringSessions.ts
- [X] T065 [US8] Add pause/activate toggle to MySessionsPage for tutor sessions in src/pages/MySessionsPage.tsx
- [X] T066 [US8] Add status indicator (paused badge) to session cards in src/components/tutoring/tutoring-card.tsx
- [X] T067 [US8] Filter out paused sessions from public listing in getTutoringSessions in src/services/tutoring.service.ts

**Checkpoint**: Tutors can manage session visibility without deleting ✅

---

## Phase 11: Polish & Cross-Cutting Concerns ✅

**Purpose**: Improvements that affect multiple user stories

- [X] T068 [P] Add loading states and skeletons to all tutoring components
- [X] T069 [P] Add error handling with toast notifications across all mutations
- [X] T070 [P] Add empty states for no results in listings and filters
- [X] T071 [P] Ensure responsive design for all tutoring components (mobile-first)
- [X] T072 Performance optimization: add staleTime and cacheTime to React Query hooks
- [X] T073 Run quickstart.md validation to verify all flows work end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-10)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 - complete before moving to P2 stories
  - US3 and US4 are both P2 - can proceed after US1/US2
  - US5 and US6 are both P3 - can proceed after US1/US2
  - US7 and US8 are both P4 - can proceed after US1/US2
- **Polish (Phase 11)**: Depends on all desired user stories being complete

### User Story Dependencies

| Story | Priority | Depends On | Notes |
|-------|----------|------------|-------|
| US1 | P1 | Foundation only | Can start after Phase 2 |
| US2 | P1 | Foundation only | Can start after Phase 2, parallel with US1 |
| US3 | P2 | US2 (booking service) | Uses booking service functions |
| US4 | P2 | US2 (booking service) | Uses booking service functions |
| US5 | P3 | US3 (completed status) | Needs completed bookings |
| US6 | P3 | Foundation only | Independent messaging system |
| US7 | P4 | Foundation only | Independent favorites system |
| US8 | P4 | US1 (sessions) | Extends session management |

### Within Each User Story

- Services before hooks
- Hooks before components
- Components before page integration
- Core implementation before enhancements

### Parallel Opportunities

- T002, T003 can run in parallel (different files)
- T005, T006, T007 can run in parallel within Phase 2
- T017, T018 can run in parallel within US2
- T044-T049 (all message service functions) are in same file - sequential
- All Phase 11 tasks marked [P] can run in parallel

---

## Parallel Example: User Story 2

```bash
# Launch filter implementations together:
Task: "Add filter panel to TutoringPage" (T016)
Task: "Implement availability_day filter" (T017)
Task: "Create booking-calendar.tsx component" (T018)

# Then sequentially:
Task: "Create booking-dialog.tsx" (T019) - depends on T018
Task: "Implement createTutoringBooking service" (T020)
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T008)
3. Complete Phase 3: User Story 1 (T009-T015)
4. Complete Phase 4: User Story 2 (T016-T024)
5. **STOP and VALIDATE**: Test session creation and booking flow
6. Deploy/demo if ready - Core marketplace functionality complete

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Sessions can be created → First increment
3. Add US2 → Sessions can be booked → **MVP Complete!**
4. Add US3 + US4 → Full booking management → Second increment
5. Add US5 + US6 → Reviews and messaging → Third increment
6. Add US7 + US8 → Favorites and pause → Full feature

### Single Developer Strategy

Execute in priority order:
1. Phase 1: Setup (3 tasks)
2. Phase 2: Foundation (5 tasks)
3. Phase 3: US1 - Create Sessions (7 tasks)
4. Phase 4: US2 - Book Sessions (9 tasks)
5. **Validate MVP**
6. Phase 5-6: US3 + US4 - Booking Management (14 tasks)
7. Phase 7-8: US5 + US6 - Reviews + Messages (16 tasks)
8. Phase 9-10: US7 + US8 - Favorites + Pause (13 tasks)
9. Phase 11: Polish (6 tasks)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Total: 73 tasks across 11 phases
