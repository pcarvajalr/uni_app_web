-- ============================================
-- CONFIGURACIÓN DE STORAGE PARA PRODUCTOS
-- ============================================
-- Descripción: Configura políticas de storage para el bucket 'products' del marketplace
--
-- ⚠️ IMPORTANTE: Antes de ejecutar este SQL, debes crear el bucket 'products' manualmente
-- desde la interfaz de Supabase Storage. Ver instrucciones detalladas en README_SETUP_PRODUCTS.md
--
-- Pasos rápidos:
-- 1. Ve a Storage en tu dashboard de Supabase
-- 2. Clic en "New bucket"
-- 3. Configura:
--    - Name: products
--    - Public: ✅ Sí
--    - File size limit: 5242880 (5MB)
--    - Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp
-- 4. Luego ejecuta este script SQL para crear las políticas

-- ============================================
-- POLÍTICAS DE STORAGE PARA BUCKET 'products'
-- ============================================
-- Nota: Estas políticas solo funcionarán si el bucket 'products' ya existe
-- Si obtienes un error, primero crea el bucket desde la interfaz de Storage

-- Eliminar políticas existentes si existen (para poder re-ejecutar el script)
DROP POLICY IF EXISTS "Usuarios autenticados pueden subir imágenes de productos" ON storage.objects;
DROP POLICY IF EXISTS "Todos pueden ver imágenes de productos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus propias imágenes de productos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus propias imágenes de productos" ON storage.objects;

-- Permitir a usuarios autenticados subir imágenes de productos a su propia carpeta
CREATE POLICY "Usuarios autenticados pueden subir imágenes de productos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'products' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir a todos ver imágenes de productos (bucket público)
CREATE POLICY "Todos pueden ver imágenes de productos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

-- Permitir a usuarios eliminar solo sus propias imágenes
CREATE POLICY "Usuarios pueden eliminar sus propias imágenes de productos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'products' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir a usuarios actualizar solo sus propias imágenes
CREATE POLICY "Usuarios pueden actualizar sus propias imágenes de productos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'products' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Para verificar que las políticas se crearon correctamente, ejecuta:
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%productos%';

COMMENT ON TABLE storage.buckets IS 'Bucket products: Almacena imágenes de productos del marketplace';
