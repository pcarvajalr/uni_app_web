/**
 * React Query hooks para mensajes de contacto (admin).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getContactMessages,
  markContactMessageAsRead,
  getUnreadContactCount,
} from "@/services/contact-messages.service"

// Query keys
export const contactMessageKeys = {
  all: ['contact-messages'] as const,
  list: () => [...contactMessageKeys.all, 'list'] as const,
  unreadCount: () => [...contactMessageKeys.all, 'unread-count'] as const,
}

export function useContactMessages(enabled = true) {
  return useQuery({
    queryKey: contactMessageKeys.list(),
    queryFn: getContactMessages,
    enabled,
    staleTime: 15000,
    refetchInterval: 30000,
  })
}

export function useUnreadContactCount(enabled = true) {
  return useQuery({
    queryKey: contactMessageKeys.unreadCount(),
    queryFn: getUnreadContactCount,
    enabled,
    staleTime: 15000,
    refetchInterval: 30000,
  })
}

export function useMarkContactMessageAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markContactMessageAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactMessageKeys.all })
    },
  })
}
