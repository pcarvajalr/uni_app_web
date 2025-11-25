import type { BookingStatus } from '@/types/tutoring.types';

/**
 * Valid state transitions for tutoring bookings
 *
 * State Machine:
 *           ┌─────────► cancelled
 *           │
 * pending ───┼─────────► confirmed ───┬─────► in_progress ───► completed
 *           │                        │
 *           │                        └─────► no_show
 *           │                        │
 *           └────────────────────────┴─────► cancelled
 */
export const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['in_progress', 'cancelled', 'no_show'],
  in_progress: ['completed'],
  completed: [], // Terminal state
  cancelled: [], // Terminal state
  no_show: [], // Terminal state
};

/**
 * Check if a transition from one status to another is valid
 */
export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Check if a status is a terminal state (no further transitions possible)
 */
export function isTerminalState(status: BookingStatus): boolean {
  return VALID_TRANSITIONS[status]?.length === 0;
}

/**
 * Get available transitions from a given status
 */
export function getAvailableTransitions(status: BookingStatus): BookingStatus[] {
  return VALID_TRANSITIONS[status] || [];
}

/**
 * Actions that can be performed on a booking by role
 */
export interface BookingActions {
  canConfirm: boolean;
  canReject: boolean;
  canCancel: boolean;
  canStart: boolean;
  canComplete: boolean;
  canMarkNoShow: boolean;
  canReview: boolean;
}

/**
 * Get available actions for a tutor on a booking
 */
export function getTutorActions(status: BookingStatus): BookingActions {
  return {
    canConfirm: status === 'pending',
    canReject: status === 'pending',
    canCancel: status === 'pending' || status === 'confirmed',
    canStart: status === 'confirmed',
    canComplete: status === 'in_progress',
    canMarkNoShow: status === 'confirmed',
    canReview: false, // Tutors don't review students in this implementation
  };
}

/**
 * Get available actions for a student on a booking
 */
export function getStudentActions(status: BookingStatus): BookingActions {
  return {
    canConfirm: false, // Students don't confirm
    canReject: false, // Students don't reject
    canCancel: status === 'pending' || status === 'confirmed',
    canStart: false, // Students don't start sessions
    canComplete: false, // Students don't complete sessions
    canMarkNoShow: false, // Students don't mark no-shows
    canReview: status === 'completed',
  };
}

/**
 * Get the timestamp field to update based on the new status
 */
export function getTimestampFieldForStatus(
  status: BookingStatus
): 'confirmed_at' | 'completed_at' | null {
  switch (status) {
    case 'confirmed':
      return 'confirmed_at';
    case 'completed':
      return 'completed_at';
    default:
      return null;
  }
}

/**
 * Booking status metadata for UI display
 */
export interface StatusMeta {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
}

export const STATUS_META: Record<BookingStatus, StatusMeta> = {
  pending: {
    label: 'Pendiente',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: 'Clock',
    description: 'Esperando confirmación del tutor',
  },
  confirmed: {
    label: 'Confirmada',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: 'CheckCircle',
    description: 'Sesión confirmada, pendiente de realizarse',
  },
  in_progress: {
    label: 'En Progreso',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: 'Play',
    description: 'La sesión está en curso',
  },
  completed: {
    label: 'Completada',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: 'CheckCircle2',
    description: 'Sesión finalizada exitosamente',
  },
  cancelled: {
    label: 'Cancelada',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: 'XCircle',
    description: 'Sesión cancelada',
  },
  no_show: {
    label: 'No Asistió',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: 'UserX',
    description: 'El estudiante no asistió a la sesión',
  },
};

/**
 * Get status metadata
 */
export function getStatusMeta(status: BookingStatus): StatusMeta {
  return STATUS_META[status];
}

/**
 * Filter statuses that are considered active (session might still happen)
 */
export function isActiveStatus(status: BookingStatus): boolean {
  return status === 'pending' || status === 'confirmed' || status === 'in_progress';
}

/**
 * Filter statuses that are considered past (session happened or was cancelled)
 */
export function isPastStatus(status: BookingStatus): boolean {
  return status === 'completed' || status === 'cancelled' || status === 'no_show';
}

/**
 * Check if the booking can still be modified
 */
export function canModifyBooking(status: BookingStatus): boolean {
  return status === 'pending' || status === 'confirmed';
}
