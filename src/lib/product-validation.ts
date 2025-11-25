import { z } from 'zod';

/**
 * Esquema de validación para creación de productos
 * Requisitos:
 * - Título: 5-100 caracteres
 * - Descripción: 10-1000 caracteres
 * - Precio: mayor a 0, máximo 999,999,999
 * - Categoría: requerida
 * - Condición: requerida
 * - Ubicación: requerida
 * - Imágenes: 1-5 archivos, tamaño máximo 5MB cada uno
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const createProductSchema = z.object({
  title: z
    .string({
      required_error: 'El título es requerido',
    })
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(100, 'El título no puede exceder 100 caracteres'),

  description: z
    .string({
      required_error: 'La descripción es requerida',
    })
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(1000, 'La descripción no puede exceder 1000 caracteres'),

  price: z
    .number({
      required_error: 'El precio es requerido',
      invalid_type_error: 'El precio debe ser un número',
    })
    .positive('El precio debe ser mayor a 0')
    .max(999999999, 'El precio es demasiado alto')
    .multipleOf(0.01, 'El precio debe tener máximo 2 decimales'),

  category_id: z
    .string({
      required_error: 'La categoría es requerida',
    })
    .uuid('Categoría inválida'),

  condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor'], {
    required_error: 'La condición es requerida',
    invalid_type_error: 'Condición inválida',
  }),

  location: z
    .string({
      required_error: 'La ubicación es requerida',
    })
    .min(3, 'La ubicación debe tener al menos 3 caracteres')
    .max(100, 'La ubicación no puede exceder 100 caracteres'),

  is_negotiable: z.boolean().default(true),

  tags: z
    .array(z.string())
    .max(10, 'Máximo 10 etiquetas permitidas')
    .optional(),
});

export type CreateProductFormData = z.infer<typeof createProductSchema>;

/**
 * Valida un archivo de imagen
 * @param file - Archivo a validar
 * @returns Objeto con el resultado de la validación
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Validar tipo de archivo
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de archivo no permitido. Solo se permiten imágenes JPEG, PNG y WebP',
    };
  }

  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    return {
      valid: false,
      error: `El archivo ${file.name} es demasiado grande (${sizeMB}MB). Máximo permitido: 5MB`,
    };
  }

  return { valid: true };
}

/**
 * Valida un array de archivos de imagen
 * @param files - Array de archivos a validar
 * @returns Objeto con el resultado de la validación
 */
export function validateImageFiles(files: File[]): {
  valid: boolean;
  error?: string;
} {
  // Validar cantidad
  if (files.length === 0) {
    return {
      valid: false,
      error: 'Debes subir al menos 1 imagen',
    };
  }

  if (files.length > 5) {
    return {
      valid: false,
      error: 'Máximo 5 imágenes permitidas',
    };
  }

  // Validar cada archivo
  for (const file of files) {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return validation;
    }
  }

  return { valid: true };
}

/**
 * Formatea un precio en formato COP (Peso Colombiano)
 * @param price - Precio a formatear
 * @returns Precio formateado
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Traduce el estado de condición del producto
 * @param condition - Condición del producto
 * @returns Texto traducido
 */
export function translateCondition(
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor'
): string {
  const translations = {
    new: 'Nuevo',
    like_new: 'Como nuevo',
    good: 'Bueno',
    fair: 'Regular',
    poor: 'Malo',
  };
  return translations[condition];
}
