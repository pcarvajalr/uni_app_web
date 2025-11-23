import { supabase, handleSupabaseError, unwrapData } from '../lib/supabase'
import type { Database } from '../types/database.types'

type Category = Database['public']['Tables']['categories']['Row']
type CategoryInsert = Database['public']['Tables']['categories']['Insert']
type CategoryUpdate = Database['public']['Tables']['categories']['Update']

/**
 * Obtiene todas las categorías de tipo ubicación
 */
export const getLocationCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('type', 'location')
      .order('name')
    return unwrapData(data, error)
  } catch (error) {
    console.error('Error obteniendo categorías de ubicación:', error)
    throw error
  }
}

/**
 * Crea una nueva categoría de ubicación
 */
export const createLocationCategory = async (
  category: Omit<CategoryInsert, 'id' | 'created_at' | 'type'>
): Promise<Category> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert({ ...category, type: 'location' })
      .select()
      .single()
    return unwrapData(data, error)
  } catch (error) {
    console.error('Error creando categoría de ubicación:', error)
    throw error
  }
}

/**
 * Actualiza una categoría de ubicación existente
 */
export const updateLocationCategory = async (
  id: string,
  updates: Omit<CategoryUpdate, 'id' | 'type'>
): Promise<Category> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .eq('type', 'location')
      .select()
      .single()
    return unwrapData(data, error)
  } catch (error) {
    console.error('Error actualizando categoría de ubicación:', error)
    throw error
  }
}

/**
 * Valida si una categoría de ubicación está en uso
 */
export const isLocationCategoryInUse = async (categoryName: string): Promise<boolean> => {
  try {
    // Verificar si existe alguna ubicación que use esta categoría
    // La tabla campus_locations tiene un campo 'type' que almacena el nombre de la categoría
    const { data, error } = await supabase
      .from('campus_locations')
      .select('id')
      .eq('type', categoryName)
      .limit(1)

    if (error) {
      console.error('Error validando uso de categoría:', error)
      return false // En caso de error, permitir la eliminación
    }

    return (data && data.length > 0) ?? false
  } catch (error) {
    console.error('Error validando uso de categoría de ubicación:', error)
    return false // En caso de error, permitir la eliminación
  }
}

/**
 * Elimina una categoría de ubicación
 */
export const deleteLocationCategory = async (id: string): Promise<void> => {
  try {
    // Primero obtener el nombre de la categoría para validar su uso
    const { data: category, error: fetchError } = await supabase
      .from('categories')
      .select('name')
      .eq('id', id)
      .eq('type', 'location')
      .single()

    if (fetchError) {
      console.error('Error obteniendo categoría:', fetchError)
      throw new Error('No se pudo encontrar la categoría')
    }

    // Validar si está en uso
    const inUse = await isLocationCategoryInUse(category.name)

    if (inUse) {
      throw new Error('No se puede eliminar esta categoría porque está siendo utilizada por ubicaciones existentes')
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('type', 'location')

    if (error) handleSupabaseError(error)
  } catch (error) {
    console.error('Error eliminando categoría de ubicación:', error)
    throw error
  }
}
