-- ============================================
-- MIGRACIÓN: contact_messages + notificación a admins
-- Sistema multi-universidad (Fase 1) - Plan 4, Task 1
-- ============================================

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  phone       TEXT NOT NULL,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','read')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Cualquiera (incluido anónimo del login) puede enviar un mensaje
DROP POLICY IF EXISTS "Cualquiera puede enviar contacto" ON public.contact_messages;
CREATE POLICY "Cualquiera puede enviar contacto"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

-- Solo admins pueden ver/actualizar
DROP POLICY IF EXISTS "Admins ven contactos" ON public.contact_messages;
CREATE POLICY "Admins ven contactos"
  ON public.contact_messages FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins actualizan contactos" ON public.contact_messages;
CREATE POLICY "Admins actualizan contactos"
  ON public.contact_messages FOR UPDATE
  USING (public.is_admin());

-- Privilegios de tabla para los roles de Supabase
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE ON public.contact_messages TO authenticated;

-- Notifica a todos los admins al recibir un contacto (in-app; el push lo dispara trg_dispatch_push)
CREATE OR REPLACE FUNCTION public.tg_notify_admins_contact()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, data)
  SELECT u.id,
         'system',
         'Nuevo mensaje de contacto',
         'De: ' || NEW.email || ' · Tel: ' || NEW.phone,
         jsonb_build_object('contact_message_id', NEW.id, 'email', NEW.email, 'phone', NEW.phone)
  FROM public.users u
  WHERE u.role = 'admin';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admins_contact ON public.contact_messages;
CREATE TRIGGER trg_notify_admins_contact
  AFTER INSERT ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.tg_notify_admins_contact();
