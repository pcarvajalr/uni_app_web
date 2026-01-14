/**
 * React Query hooks for user profile
 * Handles public profile viewing and privacy settings
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getPublicProfile,
  updatePrivacySetting,
  getPrivacySetting,
} from "@/services/user-profile.service"

// Query keys
export const userProfileKeys = {
  all: ['user-profile'] as const,
  publicProfile: (userId: string) =>
    [...userProfileKeys.all, 'public', userId] as const,
  privacySetting: (userId: string) =>
    [...userProfileKeys.all, 'privacy', userId] as const,
}

/**
 * Hook to fetch public profile of a user
 */
export function usePublicProfile(userId: string | null, enabled = true) {
  return useQuery({
    queryKey: userProfileKeys.publicProfile(userId || ''),
    queryFn: () => getPublicProfile(userId!),
    enabled: enabled && !!userId,
    staleTime: 60000, // 1 minute
  })
}

/**
 * Hook to get current user's privacy setting
 */
export function usePrivacySetting(userId: string, enabled = true) {
  return useQuery({
    queryKey: userProfileKeys.privacySetting(userId),
    queryFn: () => getPrivacySetting(userId),
    enabled: enabled && !!userId,
    staleTime: 60000, // 1 minute
  })
}

/**
 * Mutation hook to update privacy setting
 */
export function useUpdatePrivacySetting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, isPublic }: { userId: string; isPublic: boolean }) =>
      updatePrivacySetting(userId, isPublic),
    onSuccess: (_, variables) => {
      // Invalidate privacy setting query
      queryClient.invalidateQueries({
        queryKey: userProfileKeys.privacySetting(variables.userId),
      })
      // Also invalidate public profile since visibility changed
      queryClient.invalidateQueries({
        queryKey: userProfileKeys.publicProfile(variables.userId),
      })
    },
  })
}
