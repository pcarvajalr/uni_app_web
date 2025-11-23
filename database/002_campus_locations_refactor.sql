-- ============================================
-- MIGRACIÓN: Sistema de Ubicaciones del Campus
-- ============================================
-- Esta migración modifica el sistema de ubicaciones del campus para:
-- 1. Usar coordenadas porcentuales en vez de POINT geográfico
-- 2. Agregar soporte para iconos personalizados
-- 3. Crear configuración global para la imagen del mapa
-- 4. Configurar buckets de Supabase Storage

-- ============================================
-- 1. LIMPIAR DATOS EXISTENTES
-- ============================================

-- ADVERTENCIA: Esto eliminará todos los registros existentes en campus_locations
-- Si necesitas conservar datos, comenta esta línea y ajusta manualmente después
DELETE FROM public.campus_locations;

-- ============================================
-- 2. MODIFICAR TABLA campus_locations
-- ============================================

-- Eliminar constraint CHECK existente de 'type'
-- Ahora los tipos serán dinámicos desde la tabla categories
ALTER TABLE public.campus_locations
DROP CONSTRAINT IF EXISTS campus_locations_type_check;

-- Eliminar columna de coordenadas geográficas
ALTER TABLE public.campus_locations
DROP COLUMN IF EXISTS coordinates;

-- Agregar columnas de coordenadas porcentuales (0-100%)
-- Representan la posición X,Y relativa a la imagen del mapa
ALTER TABLE public.campus_locations
ADD COLUMN coordinate_x NUMERIC(5,2) CHECK (coordinate_x >= 0 AND coordinate_x <= 100),
ADD COLUMN coordinate_y NUMERIC(5,2) CHECK (coordinate_y >= 0 AND coordinate_y <= 100);

-- Agregar columna de icono (nombre del icono de Lucide React)
ALTER TABLE public.campus_locations
ADD COLUMN icon TEXT;

-- Hacer las coordenadas requeridas
ALTER TABLE public.campus_locations
ALTER COLUMN coordinate_x SET NOT NULL,
ALTER COLUMN coordinate_y SET NOT NULL;

-- Agregar constraint para validar que el type existe en categories
-- (esto se puede hacer después de tener datos, por ahora es opcional)
-- ALTER TABLE public.campus_locations
-- ADD CONSTRAINT fk_location_type
-- FOREIGN KEY (type) REFERENCES public.categories(name);

-- ============================================
-- 3. CREAR TABLA campus_settings
-- ============================================

-- Tabla para configuración global del sistema de mapas
CREATE TABLE IF NOT EXISTS public.campus_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL, -- Ej: 'map_image_url', 'campus_name', etc.
  setting_value TEXT, -- Valor de la configuración
  description TEXT, -- Descripción de qué hace este setting
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuración inicial para la imagen del mapa
INSERT INTO public.campus_settings (setting_key, setting_value, description)
VALUES (
  'map_image_url',
  '/university-campus-map-layout-with-buildings-and-pa.jpg',
  'URL de la imagen del mapa del campus universitario'
) ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- 4. CONFIGURAR SUPABASE STORAGE BUCKETS
-- ============================================

-- Crear bucket para imágenes del mapa del campus
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'campus-maps',
  'campus-maps',
  true, -- Público para que todos puedan ver
  5242880, -- 5MB límite
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]
) ON CONFLICT (id) DO NOTHING;

-- Crear bucket para imágenes de ubicaciones individuales
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'locations',
  'locations',
  true, -- Público para que todos puedan ver
  2097152, -- 2MB límite
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. POLÍTICAS RLS PARA campus_settings
-- ============================================

-- Habilitar RLS
ALTER TABLE public.campus_settings ENABLE ROW LEVEL SECURITY;

-- Todos pueden leer la configuración
CREATE POLICY "Todos pueden leer configuración del campus"
ON public.campus_settings FOR SELECT
USING (true);

-- Solo admins pueden insertar configuración
CREATE POLICY "Solo admins pueden crear configuración del campus"
ON public.campus_settings FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Solo admins pueden actualizar configuración
CREATE POLICY "Solo admins pueden actualizar configuración del campus"
ON public.campus_settings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Solo admins pueden eliminar configuración
CREATE POLICY "Solo admins pueden eliminar configuración del campus"
ON public.campus_settings FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- ============================================
-- 6. POLÍTICAS DE STORAGE
-- ============================================

-- BUCKET: campus-maps
-- Solo admins pueden subir/actualizar imágenes del mapa
CREATE POLICY "Solo admins pueden subir mapas del campus"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'campus-maps'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Solo admins pueden actualizar mapas del campus"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'campus-maps'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Solo admins pueden eliminar mapas del campus"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'campus-maps'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Todos pueden ver mapas del campus"
ON storage.objects FOR SELECT
USING (bucket_id = 'campus-maps');

-- BUCKET: locations
-- Solo admins pueden subir/actualizar imágenes de ubicaciones
CREATE POLICY "Solo admins pueden subir imágenes de ubicaciones"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'locations'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Solo admins pueden actualizar imágenes de ubicaciones"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'locations'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Solo admins pueden eliminar imágenes de ubicaciones"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'locations'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Todos pueden ver imágenes de ubicaciones"
ON storage.objects FOR SELECT
USING (bucket_id = 'locations');

-- ============================================
-- 7. FUNCIÓN TRIGGER PARA updated_at
-- ============================================

-- Trigger para actualizar updated_at en campus_settings
CREATE OR REPLACE FUNCTION public.update_campus_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER campus_settings_updated_at
BEFORE UPDATE ON public.campus_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_campus_settings_updated_at();

-- ============================================
-- NOTAS DE EJECUCIÓN
-- ============================================
-- 1. Ejecutar este script en el SQL Editor de Supabase
-- 2. Verificar que los buckets se crearon correctamente en Storage
-- 3. Regenerar los tipos de TypeScript:
--    npx supabase gen types typescript --project-id [PROJECT_ID] > src/types/database.types.ts
-- 4. Si hay datos existentes en campus_locations, necesitarás migrarlos manualmente
--    convirtiendo las coordenadas POINT a porcentajes
