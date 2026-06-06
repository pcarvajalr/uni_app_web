-- ============================================
-- MIGRACIÓN: columnas university_id / partner_id (nullable)
-- Sistema multi-universidad (Fase 1) - Plan 1, Task 3
-- ============================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES public.universities(id);

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES public.universities(id);

ALTER TABLE public.tutoring_sessions
  ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES public.universities(id);

ALTER TABLE public.campus_locations
  ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES public.universities(id);

ALTER TABLE public.campus_settings
  ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES public.universities(id);

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES public.universities(id);

ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES public.universities(id);

ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES public.partners(id);

-- Índices para los filtros por universidad
CREATE INDEX IF NOT EXISTS idx_users_university_id ON public.users(university_id);
CREATE INDEX IF NOT EXISTS idx_products_university_id ON public.products(university_id);
CREATE INDEX IF NOT EXISTS idx_tutoring_sessions_university_id ON public.tutoring_sessions(university_id);
CREATE INDEX IF NOT EXISTS idx_campus_locations_university_id ON public.campus_locations(university_id);
CREATE INDEX IF NOT EXISTS idx_categories_university_id ON public.categories(university_id);
CREATE INDEX IF NOT EXISTS idx_reports_university_id ON public.reports(university_id);
CREATE INDEX IF NOT EXISTS idx_coupons_partner_id ON public.coupons(partner_id);

-- campus_settings: el setting_key deja de ser único global y pasa a único por universidad.
-- El nombre real del constraint puede variar; se elimina cualquier UNIQUE existente sobre (setting_key).
DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.campus_settings'::regclass
      AND contype = 'u'
      AND pg_get_constraintdef(oid) ILIKE '%(setting_key)%'
  LOOP
    EXECUTE format('ALTER TABLE public.campus_settings DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;
-- El unique compuesto (university_id, setting_key) se crea en Task 6, tras backfill + NOT NULL.
