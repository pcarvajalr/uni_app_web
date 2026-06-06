import { supabase, handleSupabaseError, unwrapData } from '../lib/supabase'
import type { Database } from '../types/database.types'

type CampusSetting = Database['public']['Tables']['campus_settings']['Row']
type CampusSettingInsert = Database['public']['Tables']['campus_settings']['Insert']
type CampusSettingUpdate = Database['public']['Tables']['campus_settings']['Update']

/**
 * Obtiene la URL de la imagen del mapa del campus
 */
export const getMapImageUrl = async (universityId?: string): Promise<string> => {
  try {
    let query = supabase
      .from('campus_settings')
      .select('setting_value')
      .eq('setting_key', 'map_image_url')
    if (universityId) query = query.eq('university_id', universityId)
    const { data, error } = await query.single()

    if (error) {
      console.error('Error obteniendo URL del mapa:', error)
      // Retornar imagen por defecto si no existe en BD
      return '/university-campus-map-layout-with-buildings-and-pa.jpg'
    }

    return data?.setting_value || '/university-campus-map-layout-with-buildings-and-pa.jpg'
  } catch (error) {
    console.error('Error obteniendo URL del mapa:', error)
    return '/university-campus-map-layout-with-buildings-and-pa.jpg'
  }
}

/**
 * Actualiza la URL de la imagen del mapa del campus
 * Solo usuarios admin pueden actualizar (validado por RLS)
 */
export const updateMapImageUrl = async (
  imageUrl: string,
  universityId?: string
): Promise<CampusSetting> => {
  try {
    // Intentar actualizar si existe (para esa universidad si se especifica)
    let findQuery = supabase
      .from('campus_settings')
      .select('id')
      .eq('setting_key', 'map_image_url')
    if (universityId) findQuery = findQuery.eq('university_id', universityId)
    const { data: existingData, error: fetchError } = await findQuery.single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 es el código para "no encontrado", cualquier otro error es problema
      throw fetchError
    }

    if (existingData) {
      // Actualizar existente por id (preciso)
      const { data, error } = await supabase
        .from('campus_settings')
        .update({
          setting_value: imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingData.id)
        .select()
        .single()
      return unwrapData(data, error)
    } else {
      // Crear nuevo registro si no existe.
      // Si no se pasa universityId, el trigger BEFORE INSERT usa la universidad del admin.
      const { data, error } = await supabase
        .from('campus_settings')
        .insert({
          setting_key: 'map_image_url',
          setting_value: imageUrl,
          description: 'URL de la imagen del mapa del campus universitario',
          ...(universityId ? { university_id: universityId } : {})
        } as CampusSettingInsert)
        .select()
        .single()
      return unwrapData(data, error)
    }
  } catch (error) {
    console.error('Error actualizando URL del mapa:', error)
    throw error
  }
}

/**
 * Obtiene todas las configuraciones del campus
 */
export const getAllCampusSettings = async (): Promise<CampusSetting[]> => {
  try {
    const { data, error } = await supabase
      .from('campus_settings')
      .select('*')
      .order('setting_key')
    return unwrapData(data, error)
  } catch (error) {
    console.error('Error obteniendo configuraciones del campus:', error)
    throw error
  }
}

/**
 * Obtiene una configuración específica por su clave
 */
export const getCampusSettingByKey = async (key: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('campus_settings')
      .select('setting_value')
      .eq('setting_key', key)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No encontrado
        return null
      }
      throw error
    }

    return data?.setting_value || null
  } catch (error) {
    console.error(`Error obteniendo configuración ${key}:`, error)
    return null
  }
}

/**
 * Actualiza o crea una configuración del campus
 * Solo usuarios admin pueden actualizar (validado por RLS)
 */
export const updateCampusSetting = async (
  key: string,
  value: string,
  description?: string
): Promise<CampusSetting> => {
  try {
    // Verificar si existe
    const { data: existingData, error: fetchError } = await supabase
      .from('campus_settings')
      .select('id')
      .eq('setting_key', key)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    if (existingData) {
      // Actualizar
      const updateData: any = {
        setting_value: value,
        updated_at: new Date().toISOString()
      }
      if (description) {
        updateData.description = description
      }

      const { data, error } = await supabase
        .from('campus_settings')
        .update(updateData)
        .eq('setting_key', key)
        .select()
        .single()
      return unwrapData(data, error)
    } else {
      // Crear
      const { data, error } = await supabase
        .from('campus_settings')
        // university_id lo completa el trigger BEFORE INSERT (universidad del admin)
        .insert({
          setting_key: key,
          setting_value: value,
          description: description || ''
        } as CampusSettingInsert)
        .select()
        .single()
      return unwrapData(data, error)
    }
  } catch (error) {
    console.error('Error actualizando configuración del campus:', error)
    throw error
  }
}
