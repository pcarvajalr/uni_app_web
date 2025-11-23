import { supabase, handleSupabaseError, unwrapData } from '../lib/supabase'
import type { Database } from '../types/database.types'

type CampusLocation = Database['public']['Tables']['campus_locations']['Row']
type CampusLocationInsert = Database['public']['Tables']['campus_locations']['Insert']
type CampusLocationUpdate = Database['public']['Tables']['campus_locations']['Update']

/**
 * Obtiene todas las ubicaciones del campus
 */
export const getCampusLocations = async (): Promise<CampusLocation[]> => {
  try {
    const { data, error } = await supabase
      .from('campus_locations')
      .select('*')
      .order('name')
    return unwrapData(data, error)
  } catch (error) {
    console.error('Error obteniendo ubicaciones del campus:', error)
    throw error
  }
}

/**
 * Obtiene una ubicación del campus por ID
 */
export const getCampusLocationById = async (id: string): Promise<CampusLocation> => {
  try {
    const { data, error } = await supabase
      .from('campus_locations')
      .select('*')
      .eq('id', id)
      .single()
    return unwrapData(data, error)
  } catch (error) {
    console.error('Error obteniendo ubicación del campus:', error)
    throw error
  }
}

/**
 * Crea una nueva ubicación del campus
 * Solo usuarios admin pueden crear ubicaciones (validado por RLS)
 */
export const createCampusLocation = async (
  location: Omit<CampusLocationInsert, 'id' | 'created_at' | 'updated_at'>
): Promise<CampusLocation> => {
  try {
    const { data, error } = await supabase
      .from('campus_locations')
      .insert(location)
      .select()
      .single()
    return unwrapData(data, error)
  } catch (error) {
    console.error('Error creando ubicación del campus:', error)
    throw error
  }
}

/**
 * Actualiza una ubicación del campus existente
 * Solo usuarios admin pueden actualizar ubicaciones (validado por RLS)
 */
export const updateCampusLocation = async (
  id: string,
  updates: Omit<CampusLocationUpdate, 'id' | 'created_at'>
): Promise<CampusLocation> => {
  try {
    const { data, error } = await supabase
      .from('campus_locations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    return unwrapData(data, error)
  } catch (error) {
    console.error('Error actualizando ubicación del campus:', error)
    throw error
  }
}

/**
 * Elimina una ubicación del campus
 * Solo usuarios admin pueden eliminar ubicaciones (validado por RLS)
 */
export const deleteCampusLocation = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('campus_locations')
      .delete()
      .eq('id', id)

    if (error) handleSupabaseError(error)
  } catch (error) {
    console.error('Error eliminando ubicación del campus:', error)
    throw error
  }
}

/**
 * Obtiene ubicaciones del campus filtradas por tipo
 */
export const getCampusLocationsByType = async (type: string): Promise<CampusLocation[]> => {
  try {
    const { data, error } = await supabase
      .from('campus_locations')
      .select('*')
      .eq('type', type)
      .order('name')
    return unwrapData(data, error)
  } catch (error) {
    console.error('Error obteniendo ubicaciones por tipo:', error)
    throw error
  }
}

/**
 * Busca ubicaciones del campus por nombre o descripción
 */
export const searchCampusLocations = async (query: string): Promise<CampusLocation[]> => {
  try {
    const { data, error } = await supabase
      .from('campus_locations')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('name')
    return unwrapData(data, error)
  } catch (error) {
    console.error('Error buscando ubicaciones del campus:', error)
    throw error
  }
}
