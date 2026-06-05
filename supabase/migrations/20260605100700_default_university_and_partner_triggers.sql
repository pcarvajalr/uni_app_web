-- ============================================
-- MIGRACIÓN: triggers de relleno por defecto (campus_locations, campus_settings, coupons)
-- Sistema multi-universidad (Fase 1) - Plan 1, Task 7b
-- ============================================
-- Garantizan que las columnas NOT NULL nuevas se completen aunque el cliente no las envíe:
--  - campus_locations.university_id <- universidad del admin autenticado (si NULL)
--  - campus_settings.university_id  <- universidad del admin autenticado (si NULL)
--  - coupons.partner_id             <- aliado por defecto "Promociones generales" (si NULL)
-- En el Plan 3 la UI envía valores explícitos y estos triggers no sobrescriben (solo actúan si NULL).

-- campus_locations
CREATE OR REPLACE FUNCTION public.set_campus_location_university()
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

DROP TRIGGER IF EXISTS trg_set_campus_location_university ON public.campus_locations;
CREATE TRIGGER trg_set_campus_location_university
  BEFORE INSERT ON public.campus_locations
  FOR EACH ROW EXECUTE FUNCTION public.set_campus_location_university();

-- campus_settings
CREATE OR REPLACE FUNCTION public.set_campus_setting_university()
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

DROP TRIGGER IF EXISTS trg_set_campus_setting_university ON public.campus_settings;
CREATE TRIGGER trg_set_campus_setting_university
  BEFORE INSERT ON public.campus_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_campus_setting_university();

-- coupons
CREATE OR REPLACE FUNCTION public.set_coupon_default_partner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.partner_id IS NULL THEN
    SELECT id INTO NEW.partner_id
    FROM public.partners WHERE is_default = true LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_coupon_default_partner ON public.coupons;
CREATE TRIGGER trg_set_coupon_default_partner
  BEFORE INSERT ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.set_coupon_default_partner();
