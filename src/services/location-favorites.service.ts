import { supabase, handleSupabaseError, unwrapData } from '@/lib/supabase'

/**
 * Marcar/desmarcar una ubicación como favorita
 * @param locationId - ID de la ubicación
 * @param userId - ID del usuario
 * @returns true si se marcó como favorito, false si se desmarcó
 */
export const toggleLocationFavorite = async (locationId: string, userId: string): Promise<boolean> => {
  try {
    // Verificar si ya existe
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('campus_location_id', locationId)
      .eq('item_type', 'location')
      .single()

    if (existing) {
      // Eliminar favorito
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', existing.id)

      if (error) {
        handleSupabaseError(error)
      }

      return false // No es favorito
    } else {
      // Agregar favorito
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: userId,
          campus_location_id: locationId,
          item_type: 'location',
        })

      if (error) {
        handleSupabaseError(error)
      }

      return true // Es favorito
    }
  } catch (error) {
    console.error('Error toggling favorito de ubicación:', error)
    throw error
  }
}

/**
 * Obtener ubicaciones favoritas del usuario
 * @param userId - ID del usuario
 * @returns Array de favoritos con información completa de la ubicación
 */
export const getUserFavoriteLocations = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select(
        `
        *,
        campus_location:campus_locations!favorites_campus_location_id_fkey(*)
      `
      )
      .eq('user_id', userId)
      .eq('item_type', 'location')
      .order('created_at', { ascending: false })

    return unwrapData(data, error)
  } catch (error) {
    console.error('Error obteniendo ubicaciones favoritas:', error)
    throw error
  }
}

/**
 * Verificar si una ubicación es favorita del usuario
 * @param locationId - ID de la ubicación
 * @param userId - ID del usuario
 * @returns true si es favorita, false si no
 */
export const isLocationFavorite = async (locationId: string, userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('campus_location_id', locationId)
      .eq('item_type', 'location')
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 es "no rows returned", que es válido
      handleSupabaseError(error)
    }

    return !!data
  } catch (error) {
    console.error('Error verificando favorito de ubicación:', error)
    return false
  }
}

/**
 * Obtener IDs de ubicaciones favoritas del usuario
 * @param userId - ID del usuario
 * @returns Array de IDs de ubicaciones favoritas
 */
export const getUserFavoriteLocationIds = async (userId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('campus_location_id')
      .eq('user_id', userId)
      .eq('item_type', 'location')

    if (error) {
      handleSupabaseError(error)
    }

    return (data || [])
      .map((fav) => fav.campus_location_id)
      .filter((id): id is string => id !== null)
  } catch (error) {
    console.error('Error obteniendo IDs de ubicaciones favoritas:', error)
    return []
  }
}
