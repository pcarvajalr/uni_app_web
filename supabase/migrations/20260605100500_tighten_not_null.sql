-- ============================================
-- MIGRACIÓN: NOT NULL en columnas ya backfilleadas + unique compuesto
-- Sistema multi-universidad (Fase 1) - Plan 1, Task 6
-- ============================================

ALTER TABLE public.coupons            ALTER COLUMN partner_id    SET NOT NULL;
ALTER TABLE public.products           ALTER COLUMN university_id SET NOT NULL;
ALTER TABLE public.tutoring_sessions  ALTER COLUMN university_id SET NOT NULL;
ALTER TABLE public.campus_locations   ALTER COLUMN university_id SET NOT NULL;
ALTER TABLE public.campus_settings    ALTER COLUMN university_id SET NOT NULL;
-- users.university_id se deja NULLABLE hasta el Plan 2 (registro por dominio).
-- reports.university_id se deja NULLABLE (fail-safe para reportes de borde).
-- categories.university_id se deja NULLABLE (NULL = categorías de producto globales).

-- Unique compuesto para settings por universidad
CREATE UNIQUE INDEX IF NOT EXISTS uq_campus_settings_university_key
  ON public.campus_settings(university_id, setting_key);
