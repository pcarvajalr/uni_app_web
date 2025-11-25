import { supabase, handleSupabaseError, unwrapData } from '../lib/supabase'
import type { Database } from '../types/database.types'

type Category = Database['public']['Tables']['categories']['Row']
type CategoryInsert = Database['public']['Tables']['categories']['Insert']
type CategoryUpdate = Database['public']['Tables']['categories']['Update']

/**
 * Obtiene todas las categorías de tipo tutoring (materias)
 */
export const getTutoringSubjects = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('type', 'tutoring')
      .order('name')
    return unwrapData(data, error)
  } catch (error) {
    console.error('Error obteniendo materias de tutoría:', error)
    throw error
  }
}

/**
 * Crea una nueva materia de tutoría
 */
export const createTutoringSubject = async (
  subject: Omit<CategoryInsert, 'id' | 'created_at' | 'type'>
): Promise<Category> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert({ ...subject, type: 'tutoring' })
      .select()
      .single()
    return unwrapData(data, error)
  } catch (error) {
    console.error('Error creando materia de tutoría:', error)
    throw error
  }
}

/**
 * Actualiza una materia de tutoría existente
 */
export const updateTutoringSubject = async (
  id: string,
  updates: Omit<CategoryUpdate, 'id' | 'type'>
): Promise<Category> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .eq('type', 'tutoring')
      .select()
      .single()
    return unwrapData(data, error)
  } catch (error) {
    console.error('Error actualizando materia de tutoría:', error)
    throw error
  }
}

/**
 * Valida si una materia de tutoría está en uso
 */
export const isTutoringSubjectInUse = async (subjectName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('tutoring_sessions')
      .select('id')
      .ilike('subject', `%${subjectName}%`)
      .limit(1)

    if (error) {
      console.error('Error validando uso de materia:', error)
      return false
    }

    return (data && data.length > 0) ?? false
  } catch (error) {
    console.error('Error validando uso de materia de tutoría:', error)
    return false
  }
}

/**
 * Elimina una materia de tutoría
 */
export const deleteTutoringSubject = async (id: string): Promise<void> => {
  try {
    const { data: subject, error: fetchError } = await supabase
      .from('categories')
      .select('name')
      .eq('id', id)
      .eq('type', 'tutoring')
      .single()

    if (fetchError) {
      console.error('Error obteniendo materia:', fetchError)
      throw new Error('No se pudo encontrar la materia')
    }

    const inUse = await isTutoringSubjectInUse(subject.name)

    if (inUse) {
      throw new Error('No se puede eliminar esta materia porque está siendo utilizada por tutorías existentes')
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('type', 'tutoring')

    if (error) handleSupabaseError(error)
  } catch (error) {
    console.error('Error eliminando materia de tutoría:', error)
    throw error
  }
}
