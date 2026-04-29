import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  subscribeToNotifications,
} from '@/services/notifications.service';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (userId: string, limit: number) =>
    [...notificationKeys.all, 'list', userId, limit] as const,
  unreadCount: (userId: string) =>
    [...notificationKeys.all, 'unread-count', userId] as const,
};

export function useNotifications(userId: string | undefined, limit = 20) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: notificationKeys.list(userId ?? '', limit),
    queryFn: () => getUserNotifications(userId as string, limit),
    enabled: !!userId,
    staleTime: 15_000,
  });

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToNotifications(userId, () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list(userId, limit) });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount(userId) });
    });

    return unsubscribe;
  }, [userId, limit, queryClient]);

  return query;
}

export function useUnreadNotificationsCount(userId: string | undefined) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(userId ?? ''),
    queryFn: () => getUnreadCount(userId as string),
    enabled: !!userId,
    staleTime: 15_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useMarkNotificationAsRead(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => markAsRead(notificationId),
    onSuccess: () => {
      if (!userId) return;
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllNotificationsAsRead(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllAsRead(userId as string),
    onSuccess: () => {
      if (!userId) return;
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useDeleteNotification(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => deleteNotification(notificationId),
    onSuccess: () => {
      if (!userId) return;
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
