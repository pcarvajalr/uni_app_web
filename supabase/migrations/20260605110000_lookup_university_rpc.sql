-- ============================================
-- MIGRACIÓN: RPC lookup de universidad por email (pre-registro)
-- Sistema multi-universidad (Fase 1) - Plan 2, Task 1
-- ============================================

CREATE OR REPLACE FUNCTION public.lookup_university_by_email(p_email text)
RETURNS TABLE (university_id uuid, name text)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT u.id, u.name
  FROM public.university_domains d
  JOIN public.universities u ON u.id = d.university_id
  WHERE d.domain = lower(split_part(p_email, '@', 2))
  LIMIT 1;
$$;

-- Accesible antes de tener sesión (registro) y también autenticado
GRANT EXECUTE ON FUNCTION public.lookup_university_by_email(text) TO anon, authenticated;
