/**
 * User Profile Service
 * Handles public profile viewing and privacy settings
 */

import { supabase } from "@/lib/supabase"

export interface PublicUserProfile {
  id: string
  full_name: string
  avatar_url: string | null
  rating: number | null
  total_sales: number | null
  bio: string | null
  is_profile_public: boolean
}

/**
 * Get public profile of a user
 * Returns null if the user has their profile set to private
 */
export async function getPublicProfile(userId: string): Promise<PublicUserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      full_name,
      avatar_url,
      rating,
      total_sales,
      bio,
      is_profile_public
    `)
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching public profile:', error)
    throw new Error("No se pudo cargar el perfil")
  }

  if (!data) {
    return null
  }

  // Return profile data with visibility flag
  // The UI will decide how to handle private profiles
  return {
    id: data.id,
    full_name: data.full_name,
    avatar_url: data.avatar_url,
    rating: data.rating,
    total_sales: data.total_sales,
    bio: data.bio,
    is_profile_public: data.is_profile_public ?? true, // Default to public if null
  }
}

/**
 * Update privacy setting for a user
 */
export async function updatePrivacySetting(userId: string, isPublic: boolean): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ is_profile_public: isPublic })
    .eq('id', userId)

  if (error) {
    console.error('Error updating privacy setting:', error)
    throw new Error("No se pudo actualizar la configuración de privacidad")
  }
}

/**
 * Get current privacy setting for a user
 */
export async function getPrivacySetting(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('is_profile_public')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching privacy setting:', error)
    throw new Error("No se pudo cargar la configuración de privacidad")
  }

  return data?.is_profile_public ?? true // Default to public if null
}
