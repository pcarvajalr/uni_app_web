-- ============================================
-- POLÍTICAS DE STORAGE
-- ============================================
ALTER TABLE public.coupons
ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN public.coupons.image_url IS 'URL de la imagen del cupón almacenada en Supabase Storage (bucket: coupons)';

-- ============================================
-- VERIFICACIÓN PREVIA: is_admin() debe existir
-- ============================================
-- Si esto falla, primero ejecuta 001_create_database.sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'is_admin'
  ) THEN
    RAISE EXCEPTION 'La función is_admin() no existe. Ejecuta 001_create_database.sql primero.';
  END IF;
END $$;

-- ============================================
-- VERIFICACIÓN PREVIA: Buckets deben existir
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'coupons') THEN
    RAISE EXCEPTION 'El bucket "coupons" no existe. Créalo desde la interfaz de Storage primero.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'products') THEN
    RAISE EXCEPTION 'El bucket "products" no existe. Créalo desde la interfaz de Storage primero.';
  END IF;
END $$;

-- ============================================
-- POLÍTICAS PARA BUCKET 'coupons'
-- ============================================

-- Todos pueden ver imágenes de cupones
CREATE POLICY "Todos pueden ver imágenes de cupones"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'coupons'
);

-- Solo admins pueden subir imágenes de cupones
CREATE POLICY "Los admins pueden subir imágenes de cupones"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'coupons'
  AND public.is_admin()
);

-- Solo admins pueden actualizar imágenes de cupones
CREATE POLICY "Los admins pueden actualizar imágenes de cupones"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'coupons'
  AND public.is_admin()
)
WITH CHECK (
  bucket_id = 'coupons'
  AND public.is_admin()
);

-- Solo admins pueden eliminar imágenes de cupones
CREATE POLICY "Los admins pueden eliminar imágenes de cupones"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'coupons'
  AND public.is_admin()
);

-- ============================================
-- POLÍTICAS PARA BUCKET 'products'
-- ============================================

-- Todos pueden ver imágenes de productos
CREATE POLICY "Todos pueden ver imágenes de productos"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'products'
);

-- Usuarios autenticados pueden subir imágenes a su carpeta
CREATE POLICY "Usuarios autenticados pueden subir imágenes de productos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'products'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Usuarios pueden actualizar solo sus propias imágenes
CREATE POLICY "Usuarios pueden actualizar sus propias imágenes de productos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'products'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'products'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Usuarios pueden eliminar solo sus propias imágenes
CREATE POLICY "Usuarios pueden eliminar sus propias imágenes de productos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'products'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- VERIFICACIÓN POST-CREACIÓN
-- ============================================
-- Verifica que todas las políticas fueron creadas correctamente
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'objects'
  AND (
    policyname LIKE '%cupones%'
    OR policyname LIKE '%productos%'
  );

  IF policy_count != 8 THEN
    RAISE WARNING 'Se esperaban 8 políticas pero se encontraron %', policy_count;
  ELSE
    RAISE NOTICE '✓ Las 8 políticas fueron creadas correctamente';
  END IF;
END $$;

-- Listar todas las políticas creadas
SELECT
  policyname,
  cmd as operacion,
  roles
FROM pg_policies
WHERE tablename = 'objects'
AND (
  policyname LIKE '%cupones%'
  OR policyname LIKE '%productos%'
)
ORDER BY policyname;

-- ============================================
-- SIGUIENTE PASO
-- ============================================
-- Después de ejecutar este script:
-- 1. Verifica que no haya errores en los logs de Supabase
-- 2. Prueba el login en tu aplicación
-- 3. Prueba subir una imagen a products o coupons (si tienes permisos)
