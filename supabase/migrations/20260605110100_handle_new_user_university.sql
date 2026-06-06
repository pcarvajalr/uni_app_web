-- ============================================
-- MIGRACIÓN: handle_new_user asigna university_id por dominio
-- Sistema multi-universidad (Fase 1) - Plan 2, Task 2
-- ============================================
-- Reemplaza la función (el trigger on_auth_user_created ya existe y se mantiene).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_university_id uuid;
BEGIN
  SELECT d.university_id INTO v_university_id
  FROM public.university_domains d
  WHERE d.domain = lower(split_part(NEW.email, '@', 2))
  LIMIT 1;

  INSERT INTO public.users (id, email, full_name, avatar_url, student_id, campus, university_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    NEW.raw_user_meta_data->>'avatar_url',
    NULLIF(NEW.raw_user_meta_data->>'student_id', ''),
    NULLIF(NEW.raw_user_meta_data->>'campus', ''),
    v_university_id
  );
  RETURN NEW;
END;
$$;
