import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import type { BookingFilters, BookingReview } from '@/types/tutoring.types';
import {
  getTutorBookingsWithFilter,
  getStudentBookingsWithFilter,
  createBookingWithValidation,
  confirmBooking,
  rejectBooking,
  cancelBooking,
  startSession,
  completeSession,
  markNoShow,
  addBookingReview,
  getBookedSlots,
} from '@/services/tutoring.service';
import { tutoringKeys } from './useTutoringSessions';

// Query keys for bookings
export const bookingKeys = {
  all: ['tutoring-bookings'] as const,
  tutor: (tutorId: string) => [...bookingKeys.all, 'tutor', tutorId] as const,
  tutorFiltered: (tutorId: string, filters?: BookingFilters) =>
    [...bookingKeys.tutor(tutorId), filters] as const,
  student: (studentId: string) => [...bookingKeys.all, 'student', studentId] as const,
  studentFiltered: (studentId: string, filters?: BookingFilters) =>
    [...bookingKeys.student(studentId), filters] as const,
  bookedSlots: (sessionId: string, date: string) =>
    [...bookingKeys.all, 'slots', sessionId, date] as const,
};

/**
 * Hook to fetch tutor's bookings with optional filters
 */
export function useTutorBookings(filters?: BookingFilters) {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: userId ? bookingKeys.tutorFiltered(userId, filters) : ['disabled-tutor-bookings'],
    queryFn: () => {
      if (!userId) throw new Error('Usuario no autenticado');
      return getTutorBookingsWithFilter(userId, filters);
    },
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook to fetch student's bookings with optional filters
 */
export function useStudentBookings(filters?: BookingFilters) {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: userId ? bookingKeys.studentFiltered(userId, filters) : ['disabled-student-bookings'],
    queryFn: () => {
      if (!userId) throw new Error('Usuario no autenticado');
      return getStudentBookingsWithFilter(userId, filters);
    },
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook to fetch booked slots for a session on a specific date
 */
export function useBookedSlots(sessionId: string | undefined, date: string | undefined) {
  return useQuery({
    queryKey: bookingKeys.bookedSlots(sessionId || '', date || ''),
    queryFn: () => getBookedSlots(sessionId!, date!),
    enabled: !!sessionId && !!date,
    staleTime: 1000 * 30, // 30 seconds - more frequent refresh for availability
  });
}

/**
 * Hook to create a new booking
 */
export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({
      sessionId,
      scheduledDate,
      scheduledTime,
      durationMinutes,
      notes,
    }: {
      sessionId: string;
      scheduledDate: string;
      scheduledTime: string;
      durationMinutes: number;
      notes?: string;
    }) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      return createBookingWithValidation(
        sessionId,
        user.id,
        scheduledDate,
        scheduledTime,
        durationMinutes,
        notes
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate student bookings
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: bookingKeys.student(user.id) });
      }
      // Invalidate booked slots for the session/date
      queryClient.invalidateQueries({
        queryKey: bookingKeys.bookedSlots(variables.sessionId, variables.scheduledDate),
      });
    },
  });
}

/**
 * Hook to confirm a booking (tutor only)
 */
export function useConfirmBooking() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (bookingId: string) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      return confirmBooking(bookingId, user.id);
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: bookingKeys.tutor(user.id) });
      }
    },
  });
}

/**
 * Hook to reject a booking (tutor only)
 */
export function useRejectBooking() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (bookingId: string) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      return rejectBooking(bookingId, user.id);
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: bookingKeys.tutor(user.id) });
      }
    },
  });
}

/**
 * Hook to cancel a booking (student or tutor)
 */
export function useCancelBooking() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (bookingId: string) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      return cancelBooking(bookingId, user.id);
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: bookingKeys.student(user.id) });
        queryClient.invalidateQueries({ queryKey: bookingKeys.tutor(user.id) });
      }
    },
  });
}

/**
 * Hook to start a session (tutor only)
 */
export function useStartSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (bookingId: string) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      return startSession(bookingId, user.id);
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: bookingKeys.tutor(user.id) });
      }
    },
  });
}

/**
 * Hook to complete a session (tutor only)
 */
export function useCompleteSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (bookingId: string) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      return completeSession(bookingId, user.id);
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: bookingKeys.tutor(user.id) });
      }
    },
  });
}

/**
 * Hook to mark a booking as no-show (tutor only)
 */
export function useMarkNoShow() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (bookingId: string) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      return markNoShow(bookingId, user.id);
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: bookingKeys.tutor(user.id) });
      }
    },
  });
}

/**
 * Hook to update booking status (generic)
 */
export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      bookingId,
      action,
    }: {
      bookingId: string;
      action: 'confirm' | 'reject' | 'cancel' | 'start' | 'complete' | 'no_show';
    }) => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      switch (action) {
        case 'confirm':
          return confirmBooking(bookingId, user.id);
        case 'reject':
          return rejectBooking(bookingId, user.id);
        case 'cancel':
          return cancelBooking(bookingId, user.id);
        case 'start':
          return startSession(bookingId, user.id);
        case 'complete':
          return completeSession(bookingId, user.id);
        case 'no_show':
          return markNoShow(bookingId, user.id);
        default:
          throw new Error('Acción no válida');
      }
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: bookingKeys.tutor(user.id) });
        queryClient.invalidateQueries({ queryKey: bookingKeys.student(user.id) });
      }
    },
  });
}

/**
 * Hook to add a review to a completed booking
 */
export function useAddBookingReview() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({
      bookingId,
      review,
    }: {
      bookingId: string;
      review: BookingReview;
    }) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      return addBookingReview(bookingId, user.id, review);
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: bookingKeys.student(user.id) });
      }
      // Also invalidate session list to update ratings
      queryClient.invalidateQueries({ queryKey: tutoringKeys.lists() });
    },
  });
}
