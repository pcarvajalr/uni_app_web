-- ============================================
-- MIGRACIÓN: RLS de aislamiento por universidad
-- Sistema multi-universidad (Fase 1) - Plan 1, Task 7
-- ============================================
-- Estrategia: para cada tabla con lectura abierta, eliminar TODAS las políticas
-- SELECT existentes (a prueba de nombres) y crear la nueva política de aislamiento.
-- Las políticas de INSERT/UPDATE/DELETE (ownership / admin) se conservan.

-- Helper para eliminar todas las políticas SELECT de una tabla
DO $$
DECLARE
  tname text;
  p record;
BEGIN
  FOREACH tname IN ARRAY ARRAY[
    'products','tutoring_sessions','campus_locations','campus_settings','categories','reports','coupons'
  ]
  LOOP
    FOR p IN
      SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = tname AND cmd = 'SELECT'
    LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, tname);
    END LOOP;
  END LOOP;
END $$;

-- PRODUCTS
CREATE POLICY "Ver productos de su universidad"
  ON public.products FOR SELECT
  USING (
    status <> 'deleted'
    AND (university_id = public.current_user_university_id() OR public.is_admin())
  );

-- TUTORING_SESSIONS
CREATE POLICY "Ver sesiones de su universidad"
  ON public.tutoring_sessions FOR SELECT
  USING (
    status = 'active'
    AND (university_id = public.current_user_university_id() OR public.is_admin())
  );

-- CAMPUS_LOCATIONS
CREATE POLICY "Ver ubicaciones de su universidad"
  ON public.campus_locations FOR SELECT
  USING (university_id = public.current_user_university_id() OR public.is_admin());

-- CAMPUS_SETTINGS
CREATE POLICY "Ver configuración de su universidad"
  ON public.campus_settings FOR SELECT
  USING (university_id = public.current_user_university_id() OR public.is_admin());

-- CATEGORIES (globales NULL + las de su universidad + admin)
CREATE POLICY "Ver categorías de su universidad y globales"
  ON public.categories FOR SELECT
  USING (
    university_id IS NULL
    OR university_id = public.current_user_university_id()
    OR public.is_admin()
  );

-- REPORTS
CREATE POLICY "Ver reportes de su universidad"
  ON public.reports FOR SELECT
  USING (university_id = public.current_user_university_id() OR public.is_admin());

-- COUPONS (alcance vía partner: de su universidad o global) + admin
CREATE POLICY "Ver cupones por alcance del aliado"
  ON public.coupons FOR SELECT
  USING (
    public.is_admin()
    OR (
      is_active = true AND valid_until > now()
      AND EXISTS (
        SELECT 1 FROM public.partners p
        WHERE p.id = coupons.partner_id
          AND (p.university_id IS NULL
               OR p.university_id = public.current_user_university_id())
      )
    )
  );

-- PARTNERS (política SELECT que depende del helper; no se creó en la Task 2)
DROP POLICY IF EXISTS "Ver aliados de su universidad y globales" ON public.partners;
CREATE POLICY "Ver aliados de su universidad y globales"
  ON public.partners FOR SELECT
  USING (
    university_id IS NULL
    OR university_id = public.current_user_university_id()
    OR public.is_admin()
  );

-- ============================================
-- AUTO-VERIFICACIÓN: exactamente 1 política SELECT por tabla aislada
-- (el push falla si quedó alguna política permisiva antigua)
-- ============================================
DO $$
DECLARE
  tname text;
  n int;
BEGIN
  FOREACH tname IN ARRAY ARRAY[
    'products','tutoring_sessions','campus_locations','campus_settings',
    'categories','reports','coupons','partners'
  ]
  LOOP
    SELECT count(*) INTO n FROM pg_policies
    WHERE schemaname = 'public' AND tablename = tname AND cmd = 'SELECT';
    IF n <> 1 THEN
      RAISE EXCEPTION 'Tabla % tiene % políticas SELECT (esperado 1)', tname, n;
    END IF;
  END LOOP;
  RAISE NOTICE 'RLS de aislamiento OK (1 política SELECT por tabla)';
END $$;
