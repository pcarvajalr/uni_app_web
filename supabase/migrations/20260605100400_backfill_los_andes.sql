-- ============================================
-- MIGRACIÓN: backfill idempotente (no destructivo)
-- Sistema multi-universidad (Fase 1) - Plan 1, Task 5
-- ============================================

-- 1) Universidad de Los Andes
INSERT INTO public.universities (name, city)
SELECT 'Universidad de Los Andes', 'Bogotá'
WHERE NOT EXISTS (
  SELECT 1 FROM public.universities WHERE name = 'Universidad de Los Andes'
);

-- 2) Dominio uniandes.edu.co
INSERT INTO public.university_domains (university_id, domain)
SELECT u.id, 'uniandes.edu.co'
FROM public.universities u
WHERE u.name = 'Universidad de Los Andes'
  AND NOT EXISTS (
    SELECT 1 FROM public.university_domains WHERE domain = 'uniandes.edu.co'
  );

-- 3) Aliado global por defecto "Promociones generales"
INSERT INTO public.partners (name, logo_url, is_default, university_id)
SELECT 'Promociones generales', NULL, true, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.partners WHERE is_default = true
);

-- 4) Asignar todos los usuarios existentes a Los Andes (sin importar dominio)
UPDATE public.users
SET university_id = (SELECT id FROM public.universities WHERE name = 'Universidad de Los Andes')
WHERE university_id IS NULL;

-- 5) Asignar contenido existente a Los Andes
UPDATE public.products
SET university_id = (SELECT id FROM public.universities WHERE name = 'Universidad de Los Andes')
WHERE university_id IS NULL;

UPDATE public.tutoring_sessions
SET university_id = (SELECT id FROM public.universities WHERE name = 'Universidad de Los Andes')
WHERE university_id IS NULL;

UPDATE public.campus_locations
SET university_id = (SELECT id FROM public.universities WHERE name = 'Universidad de Los Andes')
WHERE university_id IS NULL;

UPDATE public.campus_settings
SET university_id = (SELECT id FROM public.universities WHERE name = 'Universidad de Los Andes')
WHERE university_id IS NULL;

UPDATE public.reports
SET university_id = (SELECT id FROM public.universities WHERE name = 'Universidad de Los Andes')
WHERE university_id IS NULL;

-- 6) Categorías: location y tutoring/both -> Los Andes; product queda global (NULL)
UPDATE public.categories
SET university_id = (SELECT id FROM public.universities WHERE name = 'Universidad de Los Andes')
WHERE university_id IS NULL
  AND type IN ('location','tutoring','both');

-- 7) Cupones existentes -> Promociones generales
UPDATE public.coupons
SET partner_id = (SELECT id FROM public.partners WHERE is_default = true)
WHERE partner_id IS NULL;

-- ============================================
-- AUTO-VERIFICACIÓN (el push falla si el backfill quedó incompleto)
-- ============================================
DO $$
DECLARE
  v_andes uuid;
  v_default_partner uuid;
  n bigint;
BEGIN
  SELECT id INTO v_andes FROM public.universities WHERE name = 'Universidad de Los Andes';
  IF v_andes IS NULL THEN
    RAISE EXCEPTION 'Backfill: no existe "Universidad de Los Andes"';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.university_domains WHERE domain = 'uniandes.edu.co') THEN
    RAISE EXCEPTION 'Backfill: falta el dominio uniandes.edu.co';
  END IF;

  SELECT id INTO v_default_partner FROM public.partners WHERE is_default = true;
  IF v_default_partner IS NULL THEN
    RAISE EXCEPTION 'Backfill: no existe el aliado por defecto "Promociones generales"';
  END IF;

  SELECT count(*) INTO n FROM public.users WHERE university_id IS NULL;
  IF n > 0 THEN RAISE EXCEPTION 'Backfill: % usuarios sin universidad', n; END IF;

  SELECT count(*) INTO n FROM public.products WHERE university_id IS NULL;
  IF n > 0 THEN RAISE EXCEPTION 'Backfill: % productos sin universidad', n; END IF;

  SELECT count(*) INTO n FROM public.tutoring_sessions WHERE university_id IS NULL;
  IF n > 0 THEN RAISE EXCEPTION 'Backfill: % tutorías sin universidad', n; END IF;

  SELECT count(*) INTO n FROM public.campus_locations WHERE university_id IS NULL;
  IF n > 0 THEN RAISE EXCEPTION 'Backfill: % ubicaciones sin universidad', n; END IF;

  SELECT count(*) INTO n FROM public.campus_settings WHERE university_id IS NULL;
  IF n > 0 THEN RAISE EXCEPTION 'Backfill: % settings sin universidad', n; END IF;

  SELECT count(*) INTO n FROM public.coupons WHERE partner_id IS NULL;
  IF n > 0 THEN RAISE EXCEPTION 'Backfill: % cupones sin aliado', n; END IF;

  SELECT count(*) INTO n FROM public.categories WHERE university_id IS NULL AND type <> 'product';
  IF n > 0 THEN RAISE EXCEPTION 'Backfill: % categorías no-producto sin universidad', n; END IF;

  RAISE NOTICE 'Backfill OK: Los Andes=%, aliado por defecto=%', v_andes, v_default_partner;
END $$;
