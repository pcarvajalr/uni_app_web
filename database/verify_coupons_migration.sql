-- ============================================
-- SCRIPT DE VERIFICACIÓN: Migración de Cupones
-- ============================================
-- Ejecuta este script para verificar que la migración se completó correctamente
-- Todos los queries deben retornar resultados exitosos

-- ============================================
-- 1. VERIFICAR COLUMNA IMAGE_URL
-- ============================================
SELECT
  '✅ Verificación 1: Columna image_url' AS test,
  CASE
    WHEN EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'coupons'
        AND column_name = 'image_url'
    ) THEN '✅ PASS - La columna image_url existe'
    ELSE '❌ FAIL - La columna image_url NO existe'
  END AS resultado,
  (
    SELECT data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'coupons'
      AND column_name = 'image_url'
  ) AS tipo_dato;

-- ============================================
-- 2. VERIFICAR BUCKET DE STORAGE
-- ============================================
SELECT
  '✅ Verificación 2: Bucket coupons' AS test,
  CASE
    WHEN EXISTS (
      SELECT 1
      FROM storage.buckets
      WHERE name = 'coupons'
    ) THEN '✅ PASS - El bucket coupons existe'
    ELSE '❌ FAIL - El bucket coupons NO existe. Créalo desde la interfaz de Storage.'
  END AS resultado,
  (
    SELECT
      CASE
        WHEN public THEN '✅ Público'
        ELSE '⚠️ Privado (debería ser público)'
      END
    FROM storage.buckets
    WHERE name = 'coupons'
  ) AS visibilidad,
  (
    SELECT file_size_limit
    FROM storage.buckets
    WHERE name = 'coupons'
  ) AS limite_tamanio;

-- ============================================
-- 3. VERIFICAR POLÍTICAS RLS
-- ============================================
SELECT
  '✅ Verificación 3: Políticas RLS' AS test,
  COUNT(*) AS total_politicas,
  CASE
    WHEN COUNT(*) >= 4 THEN '✅ PASS - Las 4 políticas están activas'
    WHEN COUNT(*) > 0 THEN '⚠️ PARCIAL - Solo ' || COUNT(*) || ' políticas encontradas (esperadas: 4)'
    ELSE '❌ FAIL - No hay políticas configuradas'
  END AS resultado
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%cupones%';

-- ============================================
-- 4. DETALLE DE POLÍTICAS
-- ============================================
SELECT
  '📋 Detalle de políticas' AS seccion,
  policyname AS nombre_politica,
  cmd AS comando,
  CASE
    WHEN cmd = 'SELECT' THEN '✅ Todos pueden ver'
    WHEN cmd = 'INSERT' THEN '✅ Admins pueden subir'
    WHEN cmd = 'UPDATE' THEN '✅ Admins pueden actualizar'
    WHEN cmd = 'DELETE' THEN '✅ Admins pueden eliminar'
    ELSE '❓ Comando desconocido'
  END AS descripcion
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%cupones%'
ORDER BY cmd;

-- ============================================
-- 5. VERIFICAR FUNCIÓN is_admin()
-- ============================================
SELECT
  '✅ Verificación 4: Función is_admin()' AS test,
  CASE
    WHEN EXISTS (
      SELECT 1
      FROM pg_proc
      WHERE proname = 'is_admin'
    ) THEN '✅ PASS - La función is_admin() existe'
    ELSE '❌ FAIL - La función is_admin() NO existe. Revisa 001_create_database.sql'
  END AS resultado;

-- ============================================
-- 6. PRUEBA DE LECTURA DE CUPONES
-- ============================================
SELECT
  '📊 Cupones en la base de datos' AS seccion,
  COUNT(*) AS total_cupones,
  COUNT(image_url) AS con_imagen,
  COUNT(*) - COUNT(image_url) AS sin_imagen,
  CASE
    WHEN COUNT(*) > 0 THEN '✅ Hay cupones en la BD'
    ELSE 'ℹ️ No hay cupones todavía (esto es normal si acabas de migrar)'
  END AS estado
FROM public.coupons;

-- ============================================
-- 7. RESUMEN FINAL
-- ============================================
SELECT
  '🎉 RESUMEN FINAL' AS titulo,
  CASE
    WHEN (
      -- Verificar columna
      EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'coupons' AND column_name = 'image_url'
      )
      AND
      -- Verificar bucket
      EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'coupons'
      )
      AND
      -- Verificar políticas (al menos 4)
      (SELECT COUNT(*) FROM pg_policies
       WHERE tablename = 'objects' AND policyname LIKE '%cupones%') >= 4
      AND
      -- Verificar función is_admin
      EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'is_admin'
      )
    ) THEN '✅✅✅ MIGRACIÓN COMPLETADA EXITOSAMENTE ✅✅✅'
    ELSE '⚠️ MIGRACIÓN INCOMPLETA - Revisa los resultados anteriores'
  END AS resultado,
  '🚀 Ahora puedes crear cupones desde Configuración' AS siguiente_paso;

-- ============================================
-- INFORMACIÓN ADICIONAL
-- ============================================
SELECT
  'ℹ️ Información adicional' AS seccion,
  'Para crear un cupón de prueba, ve a Configuración → Gestión de Cupones' AS instruccion_1,
  'Para ver cupones, ve a la página de Cupones en la aplicación' AS instruccion_2,
  'Si ves errores arriba, consulta README_MIGRATION.md sección Troubleshooting' AS instruccion_3;
