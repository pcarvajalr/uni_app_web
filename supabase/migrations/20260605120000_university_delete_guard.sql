-- ============================================
-- MIGRACIÓN: guarda de eliminación de universidades
-- Sistema multi-universidad (Fase 1) - Plan 3, Task 1
-- ============================================

-- Conteo de datos asociados a una universidad (para el mensaje de bloqueo)
CREATE OR REPLACE FUNCTION public.university_data_counts(p_university_id uuid)
RETURNS TABLE (
  users_count       bigint,
  partners_count    bigint,
  coupons_count     bigint,
  products_count    bigint,
  sessions_count    bigint,
  locations_count   bigint
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    (SELECT count(*) FROM public.users             WHERE university_id = p_university_id),
    (SELECT count(*) FROM public.partners          WHERE university_id = p_university_id),
    (SELECT count(*) FROM public.coupons c JOIN public.partners p ON p.id = c.partner_id
       WHERE p.university_id = p_university_id),
    (SELECT count(*) FROM public.products          WHERE university_id = p_university_id),
    (SELECT count(*) FROM public.tutoring_sessions WHERE university_id = p_university_id),
    (SELECT count(*) FROM public.campus_locations  WHERE university_id = p_university_id);
$$;

GRANT EXECUTE ON FUNCTION public.university_data_counts(uuid) TO authenticated;

-- Elimina una universidad solo si NO tiene datos asociados; si tiene, levanta excepción con detalle.
CREATE OR REPLACE FUNCTION public.delete_university(p_university_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c RECORD;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden eliminar universidades';
  END IF;

  SELECT * INTO c FROM public.university_data_counts(p_university_id);

  IF (c.users_count + c.partners_count + c.coupons_count
      + c.products_count + c.sessions_count + c.locations_count) > 0 THEN
    RAISE EXCEPTION 'No se puede eliminar: % usuarios, % aliados, % cupones, % productos, % tutorías, % ubicaciones',
      c.users_count, c.partners_count, c.coupons_count, c.products_count, c.sessions_count, c.locations_count;
  END IF;

  -- Sin datos: eliminar (los dominios caen por ON DELETE CASCADE)
  DELETE FROM public.universities WHERE id = p_university_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_university(uuid) TO authenticated;
