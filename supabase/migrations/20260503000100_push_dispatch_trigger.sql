-- =====================================================
-- Migración: Trigger que dispara push notifications
-- =====================================================
-- Propósito:
--   Cada vez que se inserta una notificación in-app en
--   public.notifications, invoca asíncronamente la edge
--   function 'send-push' que se encarga de enviar el push
--   nativo via FCM/APNs.
--
--   Usa pg_net.http_post (no bloqueante) para no impactar
--   la latencia del INSERT original.
--
-- Pre-requisitos:
--   - Extensión pg_net habilitada (Dashboard > Database > Extensions).
--   - Secrets en vault.secrets con nombres:
--       'project_url'        -> https://<ref>.supabase.co
--       'service_role_key'   -> service_role JWT del proyecto
--     Crear con: SELECT vault.create_secret('<valor>', '<nombre>', '<descripcion>');
-- =====================================================

CREATE OR REPLACE FUNCTION public.tg_dispatch_push_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, vault
AS $$
DECLARE
  v_url   TEXT;
  v_key   TEXT;
  v_body  JSONB;
BEGIN
  SELECT decrypted_secret INTO v_url
  FROM vault.decrypted_secrets
  WHERE name = 'project_url'
  LIMIT 1;

  SELECT decrypted_secret INTO v_key
  FROM vault.decrypted_secrets
  WHERE name = 'service_role_key'
  LIMIT 1;

  IF v_url IS NULL OR v_key IS NULL THEN
    RAISE WARNING 'push dispatch: secrets project_url o service_role_key no encontrados en vault';
    RETURN NEW;
  END IF;

  v_body := jsonb_build_object(
    'user_id',    NEW.user_id,
    'type',       NEW.type,
    'title',      NEW.title,
    'body',       NEW.body,
    'action_url', NEW.action_url,
    'data',       NEW.data
  );

  PERFORM net.http_post(
    url     := v_url || '/functions/v1/send-push',
    headers := jsonb_build_object(
                 'Content-Type',  'application/json',
                 'Authorization', 'Bearer ' || v_key
               ),
    body    := v_body
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'push dispatch failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_dispatch_push ON public.notifications;
CREATE TRIGGER trg_dispatch_push
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_dispatch_push_notification();
