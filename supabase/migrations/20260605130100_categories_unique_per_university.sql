-- ============================================
-- MIGRACIÓN: categorías únicas por universidad (no globalmente)
-- Sistema multi-universidad (Fase 1)
-- ============================================
-- Problema: categories.name tenía un UNIQUE global ("categories_name_key"),
-- lo que impedía que dos universidades tuvieran una materia con el mismo
-- nombre (p. ej. "Matemáticas"). El seed al crear una universidad fallaba con
-- 23505 (duplicate key violates "categories_name_key").
--
-- Solución: el nombre deja de ser único global y pasa a ser único POR
-- universidad. Las categorías globales (university_id IS NULL, usadas por
-- productos) conservan unicidad de nombre entre ellas.

-- 1) Eliminar cualquier UNIQUE existente sobre (name). El nombre real del
--    constraint puede variar entre entornos; se busca dinámicamente.
DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.categories'::regclass
      AND contype = 'u'
      AND pg_get_constraintdef(oid) ILIKE '%(name)%'
  LOOP
    EXECUTE format('ALTER TABLE public.categories DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

-- 2) Único por universidad: dentro de una misma universidad no se repiten nombres.
CREATE UNIQUE INDEX IF NOT EXISTS categories_university_name_uniq
  ON public.categories (university_id, name)
  WHERE university_id IS NOT NULL;

-- 3) Único entre categorías globales (university_id IS NULL).
CREATE UNIQUE INDEX IF NOT EXISTS categories_global_name_uniq
  ON public.categories (name)
  WHERE university_id IS NULL;
