-- ============================================
-- MIGRACIÓN: Sistema de Favoritos para Ubicaciones del Campus
-- ============================================
-- Esta migración extiende el sistema de favoritos para soportar:
-- 1. Ubicaciones del campus como items favoritos
-- 2. Relación con la tabla campus_locations
-- 3. Constraints apropiados para evitar duplicados

-- ============================================
-- 1. AGREGAR COLUMNA PARA CAMPUS LOCATIONS
-- ============================================

-- Agregar columna para referenciar ubicaciones del campus
ALTER TABLE public.favorites
ADD COLUMN campus_location_id UUID REFERENCES public.campus_locations(id) ON DELETE CASCADE;

-- ============================================
-- 2. ACTUALIZAR CONSTRAINT DE item_type
-- ============================================

-- Eliminar el constraint CHECK existente de item_type
ALTER TABLE public.favorites
DROP CONSTRAINT IF EXISTS favorites_item_type_check;

-- Crear nuevo constraint que incluye 'location'
ALTER TABLE public.favorites
ADD CONSTRAINT favorites_item_type_check
CHECK (item_type IN ('product', 'tutoring_session', 'location'));

-- ============================================
-- 3. ACTUALIZAR CONSTRAINT DE VALIDACIÓN
-- ============================================

-- Eliminar el constraint CHECK existente de validación de columnas
ALTER TABLE public.favorites
DROP CONSTRAINT IF EXISTS favorites_check;

-- Crear nuevo constraint que valida correctamente los tres tipos
ALTER TABLE public.favorites
ADD CONSTRAINT favorites_check
CHECK (
  (item_type = 'product' AND product_id IS NOT NULL AND tutoring_session_id IS NULL AND campus_location_id IS NULL) OR
  (item_type = 'tutoring_session' AND tutoring_session_id IS NOT NULL AND product_id IS NULL AND campus_location_id IS NULL) OR
  (item_type = 'location' AND campus_location_id IS NOT NULL AND product_id IS NULL AND tutoring_session_id IS NULL)
);

-- ============================================
-- 4. AGREGAR CONSTRAINT UNIQUE PARA LOCATIONS
-- ============================================

-- Evitar que un usuario marque la misma ubicación como favorita múltiples veces
ALTER TABLE public.favorites
ADD CONSTRAINT favorites_user_location_unique
UNIQUE(user_id, item_type, campus_location_id);

-- ============================================
-- 5. CREAR ÍNDICE PARA MEJORAR RENDIMIENTO
-- ============================================

-- Índice para búsquedas rápidas de favoritos de ubicaciones por usuario
CREATE INDEX IF NOT EXISTS idx_favorites_user_location
ON public.favorites(user_id, campus_location_id)
WHERE item_type = 'location';

-- Índice para búsquedas por ubicación (útil para contar favoritos)
CREATE INDEX IF NOT EXISTS idx_favorites_location
ON public.favorites(campus_location_id)
WHERE item_type = 'location';

-- ============================================
-- NOTAS DE EJECUCIÓN
-- ============================================
-- 1. Ejecutar este script en el SQL Editor de Supabase
-- 2. Verificar que los constraints se crearon correctamente
-- 3. Regenerar los tipos de TypeScript:
--    npx supabase gen types typescript --project-id [PROJECT_ID] > src/types/database.types.generated.ts
-- 4. Las políticas RLS existentes de favorites ya cubren este nuevo tipo
-- 5. No se requiere migración de datos ya que location es un tipo nuevo
