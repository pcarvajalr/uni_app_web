-- ============================================
-- MIGRACIÓN: seed de materias al crear universidad + sync por nombre
-- Sistema multi-universidad (Fase 1) - Plan 3, Task 2
-- ============================================
-- Plantilla del seed = materias (type IN ('tutoring','both')) de "Universidad de Los Andes".
-- Los tipos de ubicación NO se siembran (cada universidad los crea desde cero).

CREATE OR REPLACE FUNCTION public.seed_university_subjects()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_template_uni uuid;
BEGIN
  SELECT id INTO v_template_uni FROM public.universities
  WHERE name = 'Universidad de Los Andes' LIMIT 1;

  IF v_template_uni IS NULL OR v_template_uni = NEW.id THEN
    RETURN NEW; -- sin plantilla o es la propia plantilla
  END IF;

  INSERT INTO public.categories (name, type, icon, description, university_id)
  SELECT c.name, c.type, c.icon, c.description, NEW.id
  FROM public.categories c
  WHERE c.university_id = v_template_uni
    AND c.type IN ('tutoring','both')
    AND NOT EXISTS (
      SELECT 1 FROM public.categories x
      WHERE x.university_id = NEW.id AND x.name = c.name
    );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_seed_university_subjects ON public.universities;
CREATE TRIGGER trg_seed_university_subjects
  AFTER INSERT ON public.universities
  FOR EACH ROW EXECUTE FUNCTION public.seed_university_subjects();

-- Sincroniza una categoría (materia o tipo de ubicación) por nombre hacia las demás universidades
CREATE OR REPLACE FUNCTION public.sync_category_by_name(p_category_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  src public.categories%ROWTYPE;
  inserted_count integer := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden sincronizar categorías';
  END IF;

  SELECT * INTO src FROM public.categories WHERE id = p_category_id;
  IF src.id IS NULL OR src.university_id IS NULL THEN
    RAISE EXCEPTION 'Categoría inválida o global (no sincronizable)';
  END IF;

  INSERT INTO public.categories (name, type, icon, description, university_id)
  SELECT src.name, src.type, src.icon, src.description, u.id
  FROM public.universities u
  WHERE u.id <> src.university_id
    AND NOT EXISTS (
      SELECT 1 FROM public.categories x
      WHERE x.university_id = u.id AND x.name = src.name
    );

  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RETURN inserted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_category_by_name(uuid) TO authenticated;
