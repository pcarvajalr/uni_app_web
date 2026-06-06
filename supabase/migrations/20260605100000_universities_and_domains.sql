-- ============================================
-- MIGRACIÓN: universities + university_domains
-- Sistema multi-universidad (Fase 1) - Plan 1, Task 1
-- ============================================

CREATE TABLE IF NOT EXISTS public.universities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  city        TEXT,
  address     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.university_domains (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id  UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  domain         TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT university_domains_domain_unique UNIQUE (domain)
);

CREATE INDEX IF NOT EXISTS idx_university_domains_university_id
  ON public.university_domains(university_id);

-- Trigger updated_at (la función update_updated_at_column ya existe en el esquema)
DROP TRIGGER IF EXISTS set_universities_updated_at ON public.universities;
CREATE TRIGGER set_universities_updated_at
  BEFORE UPDATE ON public.universities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.university_domains ENABLE ROW LEVEL SECURITY;

-- universities: lectura para todos (catálogo no sensible), escritura solo admin
DROP POLICY IF EXISTS "Todos pueden ver universidades" ON public.universities;
CREATE POLICY "Todos pueden ver universidades"
  ON public.universities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins gestionan universidades" ON public.universities;
CREATE POLICY "Admins gestionan universidades"
  ON public.universities FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- university_domains: lectura para todos, escritura solo admin
DROP POLICY IF EXISTS "Todos pueden ver dominios" ON public.university_domains;
CREATE POLICY "Todos pueden ver dominios"
  ON public.university_domains FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins gestionan dominios" ON public.university_domains;
CREATE POLICY "Admins gestionan dominios"
  ON public.university_domains FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());
