-- =====================================================
-- Migración: Corregir action_url de notificaciones de mensaje
-- =====================================================
-- Propósito:
--   El trigger original de mensajes apuntaba a `/messages`,
--   ruta que no existe en el router del frontend y termina
--   redirigiendo al home.
--
--   Esta migración:
--     1. Reemplaza la función para que el action_url apunte
--        al tab de mensajes de la página correspondiente:
--          - product_id IS NOT NULL          → /marketplace/my-sales?tab=mensajes
--          - tutoring_session_id IS NOT NULL → /tutoring/my-sessions?tab=messages
--          - cualquier otro caso             → /notifications (fallback seguro)
--     2. Hace backfill de notificaciones de mensaje ya creadas
--        que aún tienen action_url='/messages'.
-- =====================================================

CREATE OR REPLACE FUNCTION public.tg_notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_name TEXT;
  v_action_url  TEXT;
BEGIN
  IF NEW.sender_id = NEW.recipient_id THEN
    RETURN NEW;
  END IF;

  SELECT full_name INTO v_sender_name
  FROM public.users
  WHERE id = NEW.sender_id;

  v_action_url := CASE
    WHEN NEW.product_id IS NOT NULL          THEN '/marketplace/my-sales?tab=mensajes'
    WHEN NEW.tutoring_session_id IS NOT NULL THEN '/tutoring/my-sessions?tab=messages'
    ELSE '/notifications'
  END;

  INSERT INTO public.notifications (user_id, type, title, body, action_url, data)
  VALUES (
    NEW.recipient_id,
    'message',
    'Nuevo mensaje',
    COALESCE(v_sender_name, 'Alguien') || ' te ha enviado un mensaje',
    v_action_url,
    jsonb_build_object(
      'sender_id', NEW.sender_id,
      'message_id', NEW.id,
      'product_id', NEW.product_id,
      'tutoring_session_id', NEW.tutoring_session_id
    )
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

-- =====================================================
-- Backfill: notificaciones de mensaje ya creadas
-- =====================================================

UPDATE public.notifications
SET action_url = CASE
  WHEN data->>'product_id' IS NOT NULL          THEN '/marketplace/my-sales?tab=mensajes'
  WHEN data->>'tutoring_session_id' IS NOT NULL THEN '/tutoring/my-sessions?tab=messages'
  ELSE '/notifications'
END
WHERE type = 'message'
  AND (action_url = '/messages' OR action_url IS NULL);
