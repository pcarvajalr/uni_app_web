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
  show_contact_info: boolean
  phone: string | null
  email: string | null
}

export interface PrivacySettings {
  is_profile_public: boolean
  show_contact_info: boolean
}

/**
 * Get public profile of a user
 * Returns null if the user has their profile set to private
 */
export async function getPublicProfile(userId: string): Promise<PublicUserProfile | null> {
  // Use type assertion to allow show_contact_info field (may not be in generated types yet)
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, avatar_url, rating, total_sales, bio, is_profile_public, show_contact_info, phone, email')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching public profile:', error)
    throw new Error("No se pudo cargar el perfil")
  }

  if (!data) {
    return null
  }

  // Cast to any to access show_contact_info which may not be in types yet
  const userData = data as any
  const showContact = userData.show_contact_info ?? false

  // Return profile data with visibility flags
  // Only include contact info if show_contact_info is true
  return {
    id: userData.id,
    full_name: userData.full_name,
    avatar_url: userData.avatar_url,
    rating: userData.rating,
    total_sales: userData.total_sales,
    bio: userData.bio,
    is_profile_public: userData.is_profile_public ?? true,
    show_contact_info: showContact,
    phone: showContact ? userData.phone : null,
    email: showContact ? userData.email : null,
  }
}

/**
 * Update privacy setting for a user (profile visibility)
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
 * Update contact info visibility setting for a user
 * Note: Requires 'show_contact_info' column in users table
 * Run: ALTER TABLE users ADD COLUMN show_contact_info BOOLEAN DEFAULT false;
 */
export async function updateShowContactSetting(userId: string, showContact: boolean): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ show_contact_info: showContact } as any)
    .eq('id', userId)

  if (error) {
    // If column doesn't exist, fail silently (column not yet added to DB)
    if (error.code === '42703' || error.code === 'PGRST204' || error.message?.includes('show_contact_info')) {
      console.warn('Column show_contact_info does not exist in users table. Run: ALTER TABLE users ADD COLUMN show_contact_info BOOLEAN DEFAULT false;')
      return
    }
    console.error('Error updating show contact setting:', error)
    throw new Error("No se pudo actualizar la configuración de contacto")
  }
}

/**
 * Get current privacy setting for a user (profile visibility)
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

/**
 * Get all privacy settings for a user
 */
export async function getPrivacySettings(userId: string): Promise<PrivacySettings> {
  const { data, error } = await supabase
    .from('users')
    .select('is_profile_public, show_contact_info')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching privacy settings:', error)
    throw new Error("No se pudo cargar la configuración de privacidad")
  }

  // Cast to any to access show_contact_info which may not be in types yet
  const userData = data as any

  return {
    is_profile_public: userData?.is_profile_public ?? true,
    show_contact_info: userData?.show_contact_info ?? false,
  }
}
