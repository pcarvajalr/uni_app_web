-- ============================================
-- MIGRACIÓN: partners (aliados) + bucket storage
-- Sistema multi-universidad (Fase 1) - Plan 1, Task 2
-- NOTA: la política SELECT de partners (depende de current_user_university_id)
--       se crea en la migración de RLS (Task 7), tras existir el helper.
-- ============================================

CREATE TABLE IF NOT EXISTS public.partners (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id  UUID REFERENCES public.universities(id) ON DELETE CASCADE, -- NULL = global
  name           TEXT NOT NULL,
  logo_url       TEXT,
  address        TEXT,
  notes          TEXT,
  is_default     BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT partners_logo_required CHECK (is_default OR logo_url IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_partners_university_id ON public.partners(university_id);
-- Solo puede existir un aliado por defecto ("Promociones generales")
CREATE UNIQUE INDEX IF NOT EXISTS uq_partners_single_default
  ON public.partners(is_default) WHERE is_default;

DROP TRIGGER IF EXISTS set_partners_updated_at ON public.partners;
CREATE TRIGGER set_partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins gestionan aliados" ON public.partners;
CREATE POLICY "Admins gestionan aliados"
  ON public.partners FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Storage bucket para logos de aliados
INSERT INTO storage.buckets (id, name, public)
VALUES ('partners', 'partners', true)
ON CONFLICT (id) DO NOTHING;

-- Lectura pública de logos; escritura solo admin
DROP POLICY IF EXISTS "Logos de aliados visibles" ON storage.objects;
CREATE POLICY "Logos de aliados visibles"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'partners');

DROP POLICY IF EXISTS "Admins suben logos de aliados" ON storage.objects;
CREATE POLICY "Admins suben logos de aliados"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'partners' AND public.is_admin());

DROP POLICY IF EXISTS "Admins actualizan logos de aliados" ON storage.objects;
CREATE POLICY "Admins actualizan logos de aliados"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'partners' AND public.is_admin());

DROP POLICY IF EXISTS "Admins eliminan logos de aliados" ON storage.objects;
CREATE POLICY "Admins eliminan logos de aliados"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'partners' AND public.is_admin());
