import { supabase } from '../lib/supabase'

/**
 * Tipo de bucket disponibles en Supabase Storage
 */
export type StorageBucket = 'campus-maps' | 'locations' | 'avatars' | 'products'

/**
 * Resultado de una operación de upload
 */
export interface UploadResult {
  success: boolean
  url?: string
  path?: string
  error?: string
}

/**
 * Sube un archivo a un bucket específico de Supabase Storage
 * @param bucket - Nombre del bucket
 * @param file - Archivo a subir (File o Blob)
 * @param path - Ruta/nombre del archivo en el bucket (opcional, se genera automáticamente si no se proporciona)
 * @returns Resultado con URL pública del archivo o error
 */
export const uploadFile = async (
  bucket: StorageBucket,
  file: File | Blob,
  path?: string
): Promise<UploadResult> => {
  try {
    // Generar nombre único si no se proporciona path
    const fileName = path || `${Date.now()}-${Math.random().toString(36).substring(7)}`

    // Determinar extensión del archivo
    let extension = ''
    if (file instanceof File) {
      const parts = file.name.split('.')
      extension = parts.length > 1 ? `.${parts[parts.length - 1]}` : ''
    } else {
      // Para Blobs, intentar obtener extensión del tipo MIME
      const mimeType = file.type
      if (mimeType.includes('jpeg') || mimeType.includes('jpg')) extension = '.jpg'
      else if (mimeType.includes('png')) extension = '.png'
      else if (mimeType.includes('webp')) extension = '.webp'
    }

    const filePath = fileName.includes('.') ? fileName : `${fileName}${extension}`

    // Subir archivo
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false // No sobrescribir archivos existentes
      })

    if (error) {
      console.error('Error subiendo archivo:', error)
      return {
        success: false,
        error: error.message
      }
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path
    }
  } catch (error) {
    console.error('Error en uploadFile:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Sube una imagen del mapa del campus
 * @param file - Archivo de imagen
 * @returns Resultado con URL pública de la imagen
 */
export const uploadMapImage = async (file: File | Blob): Promise<UploadResult> => {
  try {
    // Generar nombre único para el mapa
    const timestamp = Date.now()
    const fileName = `campus-map-${timestamp}`

    return await uploadFile('campus-maps', file, fileName)
  } catch (error) {
    console.error('Error subiendo imagen del mapa:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Sube una imagen de una ubicación específica
 * @param file - Archivo de imagen
 * @param locationId - ID de la ubicación (opcional, para organización)
 * @returns Resultado con URL pública de la imagen
 */
export const uploadLocationImage = async (
  file: File | Blob,
  locationId?: string
): Promise<UploadResult> => {
  try {
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(7)
    const prefix = locationId ? `location-${locationId}` : 'location'
    const fileName = `${prefix}-${timestamp}-${randomStr}`

    return await uploadFile('locations', file, fileName)
  } catch (error) {
    console.error('Error subiendo imagen de ubicación:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Sube una imagen de producto al bucket 'products'
 * Las imágenes se organizan en carpetas por usuario para cumplir con las políticas RLS
 * @param file - Archivo de imagen
 * @param userId - ID del usuario propietario del producto
 * @returns Resultado con URL pública de la imagen
 */
export const uploadProductImage = async (
  file: File | Blob,
  userId: string
): Promise<UploadResult> => {
  try {
    // Generar nombre único
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(7)

    // Determinar extensión del archivo
    let extension = ''
    if (file instanceof File) {
      const parts = file.name.split('.')
      extension = parts.length > 1 ? `.${parts[parts.length - 1]}` : ''
    } else {
      // Para Blobs, intentar obtener extensión del tipo MIME
      const mimeType = file.type
      if (mimeType.includes('jpeg') || mimeType.includes('jpg')) extension = '.jpg'
      else if (mimeType.includes('png')) extension = '.png'
      else if (mimeType.includes('webp')) extension = '.webp'
    }

    const fileName = `product-${timestamp}-${randomStr}${extension}`
    // Estructura de carpetas requerida por las políticas RLS: {userId}/{filename}
    const filePath = `${userId}/${fileName}`

    return await uploadFile('products', file, filePath)
  } catch (error) {
    console.error('Error subiendo imagen de producto:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Elimina un archivo de un bucket
 * @param bucket - Nombre del bucket
 * @param path - Ruta del archivo en el bucket
 * @returns true si se eliminó correctamente, false en caso contrario
 */
export const deleteFile = async (
  bucket: StorageBucket,
  path: string
): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error('Error eliminando archivo:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error en deleteFile:', error)
    return false
  }
}

/**
 * Obtiene la URL pública de un archivo
 * @param bucket - Nombre del bucket
 * @param path - Ruta del archivo en el bucket
 * @returns URL pública del archivo
 */
export const getPublicUrl = (bucket: StorageBucket, path: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Valida que un archivo sea una imagen y esté dentro del límite de tamaño
 * @param file - Archivo a validar
 * @param maxSizeMB - Tamaño máximo en MB (default: 5MB)
 * @returns Objeto con isValid y error message si no es válido
 */
export const validateImageFile = (
  file: File,
  maxSizeMB: number = 5
): { isValid: boolean; error?: string } => {
  // Validar tipo de archivo
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'El archivo debe ser una imagen (JPG, PNG o WebP)'
    }
  }

  // Validar tamaño
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `El archivo debe ser menor a ${maxSizeMB}MB`
    }
  }

  return { isValid: true }
}

/**
 * Convierte un File/Blob a base64 (útil para previews)
 * @param file - Archivo a convertir
 * @returns Promise con string base64
 */
export const fileToBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
