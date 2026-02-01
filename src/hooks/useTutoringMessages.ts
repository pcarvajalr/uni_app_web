/**
 * React Query hooks for tutoring messages
 * T050-T051: Hooks for messaging functionality
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  sendTutoringMessage,
  getTutoringMessages,
  getTutoringMessagesGroupedByStudent,
  getAllUserConversations,
  markMessagesAsRead,
  getUnreadMessageCount,
  getUnreadMessageCountForSession,
  type MessageWithSender,
  type ConversationGroup,
} from "@/services/tutoring-messages.service"

// Query keys
export const messageKeys = {
  all: ['tutoring-messages'] as const,
  conversation: (sessionId: string, userId: string, otherUserId: string) =>
    [...messageKeys.all, 'conversation', sessionId, userId, otherUserId] as const,
  grouped: (sessionId: string, tutorId: string) =>
    [...messageKeys.all, 'grouped', sessionId, tutorId] as const,
  userConversations: (userId: string) =>
    [...messageKeys.all, 'user-conversations', userId] as const,
  unreadCount: (userId: string) =>
    [...messageKeys.all, 'unread-count', userId] as const,
  unreadCountSession: (sessionId: string, userId: string) =>
    [...messageKeys.all, 'unread-count-session', sessionId, userId] as const,
}

/**
 * T050: Hook to fetch messages for a conversation with polling support
 */
export function useTutoringMessages(params: {
  tutoring_session_id?: string
  user_id: string
  other_user_id: string
  enabled?: boolean
  refetchInterval?: number
}) {
  const { tutoring_session_id, user_id, other_user_id, enabled = true, refetchInterval = 10000 } = params

  return useQuery({
    queryKey: tutoring_session_id
      ? messageKeys.conversation(tutoring_session_id, user_id, other_user_id)
      : [...messageKeys.all, 'all-messages', user_id, other_user_id],
    queryFn: () => getTutoringMessages({
      tutoring_session_id,
      user_id,
      other_user_id,
    }),
    enabled: enabled && !!user_id && !!other_user_id,
    refetchInterval, // Poll every 10 seconds by default
    staleTime: 5000, // Consider data stale after 5 seconds
  })
}

/**
 * Hook to fetch messages grouped by student (for tutors)
 */
export function useTutoringMessagesGrouped(params: {
  tutoring_session_id: string
  tutor_id: string
  enabled?: boolean
}) {
  const { tutoring_session_id, tutor_id, enabled = true } = params

  return useQuery({
    queryKey: messageKeys.grouped(tutoring_session_id, tutor_id),
    queryFn: () => getTutoringMessagesGroupedByStudent({
      tutoring_session_id,
      tutor_id,
    }),
    enabled: enabled && !!tutoring_session_id && !!tutor_id,
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Hook to fetch all conversations for a user
 */
export function useUserConversations(user_id: string, enabled = true) {
  return useQuery({
    queryKey: messageKeys.userConversations(user_id),
    queryFn: () => getAllUserConversations(user_id),
    enabled: enabled && !!user_id,
    staleTime: 30000,
    refetchInterval: 30000, // Poll every 30 seconds
  })
}

/**
 * Hook to get unread message count
 */
export function useUnreadMessageCount(user_id: string, enabled = true) {
  return useQuery({
    queryKey: messageKeys.unreadCount(user_id),
    queryFn: () => getUnreadMessageCount(user_id),
    enabled: enabled && !!user_id,
    staleTime: 10000,
    refetchInterval: 15000, // Poll every 15 seconds
  })
}

/**
 * Hook to get unread message count for a specific session
 */
export function useUnreadMessageCountForSession(params: {
  tutoring_session_id: string
  user_id: string
  enabled?: boolean
}) {
  const { tutoring_session_id, user_id, enabled = true } = params

  return useQuery({
    queryKey: messageKeys.unreadCountSession(tutoring_session_id, user_id),
    queryFn: () => getUnreadMessageCountForSession({
      tutoring_session_id,
      user_id,
    }),
    enabled: enabled && !!tutoring_session_id && !!user_id,
    staleTime: 10000,
    refetchInterval: 15000,
  })
}

/**
 * T051: Mutation hook to send a message
 */
export function useSendTutoringMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sendTutoringMessage,
    onSuccess: (data, variables) => {
      // Invalidate session-specific queries only if tutoring_session_id exists
      if (variables.tutoring_session_id) {
        queryClient.invalidateQueries({
          queryKey: messageKeys.conversation(
            variables.tutoring_session_id,
            variables.sender_id,
            variables.recipient_id
          ),
        })
        queryClient.invalidateQueries({
          queryKey: messageKeys.conversation(
            variables.tutoring_session_id,
            variables.recipient_id,
            variables.sender_id
          ),
        })
        queryClient.invalidateQueries({
          queryKey: messageKeys.grouped(variables.tutoring_session_id, variables.recipient_id),
        })
        queryClient.invalidateQueries({
          queryKey: messageKeys.unreadCountSession(variables.tutoring_session_id, variables.recipient_id),
        })
      }

      // Invalidate user conversations
      queryClient.invalidateQueries({
        queryKey: messageKeys.userConversations(variables.sender_id),
      })
      queryClient.invalidateQueries({
        queryKey: messageKeys.userConversations(variables.recipient_id),
      })

      // Invalidate unread counts
      queryClient.invalidateQueries({
        queryKey: messageKeys.unreadCount(variables.recipient_id),
      })

      // Invalidate all-messages query (for conversations without session filter)
      queryClient.invalidateQueries({
        queryKey: [...messageKeys.all, 'all-messages', variables.sender_id, variables.recipient_id],
      })
      queryClient.invalidateQueries({
        queryKey: [...messageKeys.all, 'all-messages', variables.recipient_id, variables.sender_id],
      })
    },
  })
}

/**
 * Mutation hook to mark messages as read
 */
export function useMarkMessagesAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markMessagesAsRead,
    onSuccess: (_, variables) => {
      // Invalidate unread counts
      queryClient.invalidateQueries({
        queryKey: messageKeys.unreadCount(variables.recipient_id),
      })

      // Solo invalidar queries específicas de sesión si tutoring_session_id existe
      if (variables.tutoring_session_id) {
        queryClient.invalidateQueries({
          queryKey: messageKeys.unreadCountSession(variables.tutoring_session_id, variables.recipient_id),
        })

        // Invalidate conversation
        queryClient.invalidateQueries({
          queryKey: messageKeys.conversation(
            variables.tutoring_session_id,
            variables.recipient_id,
            variables.sender_id
          ),
        })

        // Invalidate grouped messages
        queryClient.invalidateQueries({
          queryKey: messageKeys.grouped(variables.tutoring_session_id, variables.recipient_id),
        })
      }

      // Invalidate all-messages query (for conversations without session filter)
      queryClient.invalidateQueries({
        queryKey: [...messageKeys.all, 'all-messages', variables.recipient_id, variables.sender_id],
      })

      // Invalidate user conversations
      queryClient.invalidateQueries({
        queryKey: messageKeys.userConversations(variables.recipient_id),
      })
    },
  })
}
