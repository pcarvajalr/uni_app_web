-- ============================================
-- MIGRACIÓN: helper de universidad + triggers de asignación
-- Sistema multi-universidad (Fase 1) - Plan 1, Task 4
-- ============================================

-- Devuelve la universidad del usuario autenticado actual
CREATE OR REPLACE FUNCTION public.current_user_university_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT university_id FROM public.users WHERE id = auth.uid();
$$;

-- Setea products.university_id desde el vendedor si viene NULL
CREATE OR REPLACE FUNCTION public.set_product_university()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.university_id IS NULL THEN
    SELECT university_id INTO NEW.university_id
    FROM public.users WHERE id = NEW.seller_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_product_university ON public.products;
CREATE TRIGGER trg_set_product_university
  BEFORE INSERT ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_product_university();

-- Setea tutoring_sessions.university_id desde el tutor si viene NULL
CREATE OR REPLACE FUNCTION public.set_session_university()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.university_id IS NULL THEN
    SELECT university_id INTO NEW.university_id
    FROM public.users WHERE id = NEW.tutor_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_session_university ON public.tutoring_sessions;
CREATE TRIGGER trg_set_session_university
  BEFORE INSERT ON public.tutoring_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_session_university();

-- Setea reports.university_id desde el autor autenticado si viene NULL
-- (cubre reportes anónimos: el usuario sigue autenticado)
CREATE OR REPLACE FUNCTION public.set_report_university()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.university_id IS NULL THEN
    SELECT university_id INTO NEW.university_id
    FROM public.users WHERE id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_report_university ON public.reports;
CREATE TRIGGER trg_set_report_university
  BEFORE INSERT ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.set_report_university();
