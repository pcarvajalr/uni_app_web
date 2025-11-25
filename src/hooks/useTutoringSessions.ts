import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import type { TutoringFilters, TutoringSessionWithTutor } from '@/types/tutoring.types';
import {
  getTutoringSessions,
  getTutoringSessionById,
  createTutoringSession,
  updateTutoringSession,
  deleteTutoringSession,
  toggleTutoringFavorite,
  getUserTutoringFavorites,
  getMyTutoringSessions,
  pauseTutoringSession,
  activateTutoringSession,
  getSessionReviews,
} from '@/services/tutoring.service';

// Query keys
export const tutoringKeys = {
  all: ['tutoring-sessions'] as const,
  lists: () => [...tutoringKeys.all, 'list'] as const,
  list: (filters?: TutoringFilters) => [...tutoringKeys.lists(), filters] as const,
  details: () => [...tutoringKeys.all, 'detail'] as const,
  detail: (id: string) => [...tutoringKeys.details(), id] as const,
  mysessions: (userId: string) => [...tutoringKeys.all, 'my-sessions', userId] as const,
  favorites: (userId: string) => [...tutoringKeys.all, 'favorites', userId] as const,
  reviews: (sessionId: string) => [...tutoringKeys.all, 'reviews', sessionId] as const,
};

/**
 * Hook to fetch tutoring sessions with filters
 */
export function useTutoringSessions(filters?: TutoringFilters) {
  const { user } = useAuth();

  return useQuery({
    queryKey: tutoringKeys.list(filters),
    queryFn: () => getTutoringSessions(filters, user?.id),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch a single tutoring session by ID
 */
export function useTutoringSession(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: tutoringKeys.detail(id || ''),
    queryFn: () => getTutoringSessionById(id!, user?.id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch user's own tutoring sessions (as tutor)
 */
export function useMyTutoringSessions() {
  const { user, isLoading: authLoading } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: userId ? tutoringKeys.mysessions(userId) : ['disabled-my-sessions'],
    queryFn: async () => {
      if (!userId) throw new Error('Debes iniciar sesión para ver tus sesiones');
      return getMyTutoringSessions(userId);
    },
    enabled: !!userId && !authLoading, // Esperar a que auth termine
    staleTime: 1000 * 60 * 2,
    retry: (failureCount, error) => {
      // No reintentar si es error de autenticación o permisos
      const errorMsg = (error as Error).message?.toLowerCase() || '';
      if (
        errorMsg.includes('autenticación') ||
        errorMsg.includes('autenticado') ||
        errorMsg.includes('permisos') ||
        errorMsg.includes('sesión') ||
        errorMsg.includes('jwt')
      ) {
        return false;
      }
      // Reintentar hasta 3 veces para otros errores
      return failureCount < 3;
    },
  });
}

/**
 * Hook to fetch user's favorite tutoring sessions
 */
export function useTutoringFavorites() {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: userId ? tutoringKeys.favorites(userId) : ['disabled-favorites'],
    queryFn: () => {
      if (!userId) throw new Error('Usuario no autenticado');
      return getUserTutoringFavorites(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook to fetch reviews for a session
 */
export function useSessionReviews(sessionId: string | undefined) {
  return useQuery({
    queryKey: tutoringKeys.reviews(sessionId || ''),
    queryFn: () => getSessionReviews(sessionId!),
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to create a new tutoring session
 */
export function useCreateTutoringSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data: Parameters<typeof createTutoringSession>[0]) =>
      createTutoringSession(data),
    onSuccess: () => {
      // Invalidate session lists
      queryClient.invalidateQueries({ queryKey: tutoringKeys.lists() });
      // Invalidate my sessions
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: tutoringKeys.mysessions(user.id) });
      }
    },
  });
}

/**
 * Hook to update a tutoring session
 */
export function useUpdateTutoringSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateTutoringSession>[1] }) =>
      updateTutoringSession(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific session
      queryClient.invalidateQueries({ queryKey: tutoringKeys.detail(variables.id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: tutoringKeys.lists() });
      // Invalidate my sessions
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: tutoringKeys.mysessions(user.id) });
      }
    },
  });
}

/**
 * Hook to delete (soft delete) a tutoring session
 */
export function useDeleteTutoringSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (id: string) => deleteTutoringSession(id),
    onSuccess: (_, id) => {
      // Invalidate specific session
      queryClient.invalidateQueries({ queryKey: tutoringKeys.detail(id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: tutoringKeys.lists() });
      // Invalidate my sessions
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: tutoringKeys.mysessions(user.id) });
      }
    },
  });
}

/**
 * Hook to toggle favorite status for a session
 */
export function useToggleTutoringFavorite() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (sessionId: string) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      return toggleTutoringFavorite(sessionId, user.id);
    },
    onMutate: async (sessionId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: tutoringKeys.lists() });
      await queryClient.cancelQueries({ queryKey: tutoringKeys.detail(sessionId) });

      // Snapshot previous values
      const previousLists = queryClient.getQueriesData({ queryKey: tutoringKeys.lists() });
      const previousDetail = queryClient.getQueryData(tutoringKeys.detail(sessionId));

      // Optimistically update lists
      queryClient.setQueriesData(
        { queryKey: tutoringKeys.lists() },
        (old: TutoringSessionWithTutor[] | undefined) => {
          if (!old) return old;
          return old.map((session) =>
            session.id === sessionId
              ? { ...session, is_favorite: !session.is_favorite }
              : session
          );
        }
      );

      // Optimistically update detail
      queryClient.setQueryData(
        tutoringKeys.detail(sessionId),
        (old: TutoringSessionWithTutor | undefined) => {
          if (!old) return old;
          return { ...old, is_favorite: !old.is_favorite };
        }
      );

      return { previousLists, previousDetail, sessionId };
    },
    onError: (_, __, context) => {
      // Rollback on error
      if (context?.previousLists) {
        context.previousLists.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      if (context?.previousDetail && context?.sessionId) {
        queryClient.setQueryData(tutoringKeys.detail(context.sessionId), context.previousDetail);
      }
    },
    onSettled: (_, __, ___, context) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: tutoringKeys.lists() });
      if (context?.sessionId) {
        queryClient.invalidateQueries({ queryKey: tutoringKeys.detail(context.sessionId) });
      }
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: tutoringKeys.favorites(user.id) });
      }
    },
  });
}

/**
 * Hook to pause a tutoring session
 */
export function usePauseTutoringSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (sessionId: string) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      return pauseTutoringSession(sessionId, user.id);
    },
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: tutoringKeys.detail(sessionId) });
      queryClient.invalidateQueries({ queryKey: tutoringKeys.lists() });
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: tutoringKeys.mysessions(user.id) });
      }
    },
  });
}

/**
 * Hook to activate a tutoring session
 */
export function useActivateTutoringSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (sessionId: string) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      return activateTutoringSession(sessionId, user.id);
    },
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: tutoringKeys.detail(sessionId) });
      queryClient.invalidateQueries({ queryKey: tutoringKeys.lists() });
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: tutoringKeys.mysessions(user.id) });
      }
    },
  });
}
