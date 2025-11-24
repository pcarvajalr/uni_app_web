-- ============================================
-- MIGRACIÓN: Soporte de imágenes para cupones
-- ============================================
-- Descripción: Añade campo image_url a la tabla coupons y configura políticas de storage
--
-- IMPORTANTE: Antes de ejecutar este SQL, debes crear el bucket 'coupons' manualmente
-- desde la interfaz de Supabase Storage. Ver instrucciones en README_MIGRATION.md

-- ============================================
-- 1. AÑADIR CAMPO IMAGE_URL A LA TABLA COUPONS
-- ============================================

ALTER TABLE public.coupons
ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN public.coupons.image_url IS 'URL de la imagen del cupón almacenada en Supabase Storage (bucket: coupons)';

-- ============================================
-- 2. POLÍTICAS DE STORAGE PARA BUCKET 'coupons'
-- ============================================
-- Nota: Estas políticas solo funcionarán si el bucket 'coupons' ya existe
-- Si obtienes un error, primero crea el bucket desde la interfaz de Storage

-- Eliminar políticas existentes si existen (para poder re-ejecutar el script)
DROP POLICY IF EXISTS "Todos pueden ver imágenes de cupones" ON storage.objects;
DROP POLICY IF EXISTS "Los admins pueden subir imágenes de cupones" ON storage.objects;
DROP POLICY IF EXISTS "Los admins pueden actualizar imágenes de cupones" ON storage.objects;
DROP POLICY IF EXISTS "Los admins pueden eliminar imágenes de cupones" ON storage.objects;

-- Permitir a todos ver las imágenes (bucket público)
CREATE POLICY "Todos pueden ver imágenes de cupones"
ON storage.objects FOR SELECT
USING (bucket_id = 'coupons');

-- Solo administradores pueden subir imágenes
CREATE POLICY "Los admins pueden subir imágenes de cupones"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'coupons'
  AND public.is_admin()
);

-- Solo administradores pueden actualizar imágenes
CREATE POLICY "Los admins pueden actualizar imágenes de cupones"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'coupons'
  AND public.is_admin()
);

-- Solo administradores pueden eliminar imágenes
CREATE POLICY "Los admins pueden eliminar imágenes de cupones"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'coupons'
  AND public.is_admin()
);

-- ============================================
-- 3. VERIFICACIÓN (Opcional)
-- ============================================
-- Ejecuta estas queries para verificar que todo está configurado correctamente:

-- Verificar que la columna image_url existe
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'coupons' AND column_name = 'image_url';

-- Verificar que el bucket existe
-- SELECT id, name, public, file_size_limit, allowed_mime_types
-- FROM storage.buckets
-- WHERE name = 'coupons';

-- Verificar que las políticas están activas
-- SELECT policyname, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'objects' AND policyname LIKE '%cupones%';
