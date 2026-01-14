/**
 * React Query hooks for marketplace messages
 * Handles messaging functionality for marketplace products
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  sendMarketplaceMessage,
  getMarketplaceMessages,
  getMarketplaceConversations,
  markMarketplaceMessagesAsRead,
  getUnreadMarketplaceCount,
} from "@/services/marketplace-messages.service"

// Query keys
export const marketplaceMessageKeys = {
  all: ['marketplace-messages'] as const,
  conversation: (productId: string, userId: string, otherUserId: string) =>
    [...marketplaceMessageKeys.all, 'conversation', productId, userId, otherUserId] as const,
  userConversations: (userId: string) =>
    [...marketplaceMessageKeys.all, 'user-conversations', userId] as const,
  unreadCount: (userId: string) =>
    [...marketplaceMessageKeys.all, 'unread-count', userId] as const,
}

/**
 * Hook to fetch messages for a conversation about a product
 */
export function useMarketplaceMessages(params: {
  product_id: string
  user_id: string
  other_user_id: string
  enabled?: boolean
  refetchInterval?: number
}) {
  const { product_id, user_id, other_user_id, enabled = true, refetchInterval = 5000 } = params

  return useQuery({
    queryKey: marketplaceMessageKeys.conversation(product_id, user_id, other_user_id),
    queryFn: () => getMarketplaceMessages({
      product_id,
      user_id,
      other_user_id,
    }),
    enabled: enabled && !!product_id && !!user_id && !!other_user_id,
    refetchInterval, // Poll every 5 seconds by default
    staleTime: 3000, // Consider data stale after 3 seconds
  })
}

/**
 * Hook to fetch all marketplace conversations for a user
 */
export function useMarketplaceConversations(user_id: string, enabled = true) {
  return useQuery({
    queryKey: marketplaceMessageKeys.userConversations(user_id),
    queryFn: () => getMarketplaceConversations(user_id),
    enabled: enabled && !!user_id,
    staleTime: 30000,
    refetchInterval: 30000, // Poll every 30 seconds
  })
}

/**
 * Hook to get unread marketplace message count
 */
export function useUnreadMarketplaceCount(user_id: string, enabled = true) {
  return useQuery({
    queryKey: marketplaceMessageKeys.unreadCount(user_id),
    queryFn: () => getUnreadMarketplaceCount(user_id),
    enabled: enabled && !!user_id,
    staleTime: 10000,
    refetchInterval: 15000, // Poll every 15 seconds
  })
}

/**
 * Mutation hook to send a marketplace message
 */
export function useSendMarketplaceMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sendMarketplaceMessage,
    onSuccess: (data, variables) => {
      // Invalidate conversation query
      queryClient.invalidateQueries({
        queryKey: marketplaceMessageKeys.conversation(
          variables.product_id,
          variables.sender_id,
          variables.recipient_id
        ),
      })

      // Also invalidate the reverse conversation (for the recipient)
      queryClient.invalidateQueries({
        queryKey: marketplaceMessageKeys.conversation(
          variables.product_id,
          variables.recipient_id,
          variables.sender_id
        ),
      })

      // Invalidate user conversations
      queryClient.invalidateQueries({
        queryKey: marketplaceMessageKeys.userConversations(variables.sender_id),
      })
      queryClient.invalidateQueries({
        queryKey: marketplaceMessageKeys.userConversations(variables.recipient_id),
      })

      // Invalidate unread counts
      queryClient.invalidateQueries({
        queryKey: marketplaceMessageKeys.unreadCount(variables.recipient_id),
      })
    },
  })
}

/**
 * Mutation hook to mark marketplace messages as read
 */
export function useMarkMarketplaceMessagesAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markMarketplaceMessagesAsRead,
    onSuccess: (_, variables) => {
      // Invalidate unread counts
      queryClient.invalidateQueries({
        queryKey: marketplaceMessageKeys.unreadCount(variables.recipient_id),
      })

      // Invalidate conversation
      queryClient.invalidateQueries({
        queryKey: marketplaceMessageKeys.conversation(
          variables.product_id,
          variables.recipient_id,
          variables.sender_id
        ),
      })

      // Invalidate user conversations
      queryClient.invalidateQueries({
        queryKey: marketplaceMessageKeys.userConversations(variables.recipient_id),
      })
    },
  })
}
