-- =====================================================
-- Migración: Sistema de notificaciones
-- =====================================================
-- Propósito:
--   Versionar la tabla `notifications` (creada previamente
--   en remoto sin migración local), aplicar RLS y definir
--   los 5 triggers transaccionales que generan notificaciones
--   automáticamente para el usuario destinatario:
--     1. Nuevo mensaje recibido           (messages INSERT)
--     2. Producto vendido                 (sales INSERT)
--     3. Nueva reserva de tutoría         (tutoring_bookings INSERT)
--     4. Cambio de estado de reserva      (tutoring_bookings UPDATE)
--     5. Nueva reseña recibida            (reviews INSERT)
--
--   Las funciones son SECURITY DEFINER y nunca propagan
--   excepciones al flujo padre: si la inserción de la
--   notificación falla, el evento original no se rompe.
-- =====================================================

-- =====================================================
-- 1. Tabla notifications (idempotente)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  action_url  TEXT,
  image_url   TEXT,
  data        JSONB,
  is_read     BOOLEAN DEFAULT FALSE,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_unread_idx
  ON public.notifications (user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS notifications_user_created_idx
  ON public.notifications (user_id, created_at DESC);

-- =====================================================
-- 2. RLS — cada usuario solo ve/modifica/elimina las suyas
-- =====================================================

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios ven sus notificaciones"      ON public.notifications;
DROP POLICY IF EXISTS "Usuarios actualizan sus notificaciones" ON public.notifications;
DROP POLICY IF EXISTS "Usuarios eliminan sus notificaciones"   ON public.notifications;

CREATE POLICY "Usuarios ven sus notificaciones"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan sus notificaciones"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios eliminan sus notificaciones"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- INSERT no expone política para usuarios:
-- los registros se crean exclusivamente por triggers SECURITY DEFINER.

-- =====================================================
-- 3. Trigger: nuevo mensaje recibido
-- =====================================================

CREATE OR REPLACE FUNCTION public.tg_notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_name TEXT;
BEGIN
  -- No notificar si el receptor es el mismo remitente (defensivo)
  IF NEW.sender_id = NEW.recipient_id THEN
    RETURN NEW;
  END IF;

  SELECT full_name INTO v_sender_name
  FROM public.users
  WHERE id = NEW.sender_id;

  INSERT INTO public.notifications (user_id, type, title, body, action_url, data)
  VALUES (
    NEW.recipient_id,
    'message',
    'Nuevo mensaje',
    COALESCE(v_sender_name, 'Alguien') || ' te ha enviado un mensaje',
    '/messages',
    jsonb_build_object(
      'sender_id', NEW.sender_id,
      'message_id', NEW.id,
      'product_id', NEW.product_id,
      'tutoring_session_id', NEW.tutoring_session_id
    )
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- No romper el INSERT del mensaje si la notificación falla
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_message ON public.messages;
CREATE TRIGGER trg_notify_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_notify_new_message();

-- =====================================================
-- 4. Trigger: producto vendido
-- =====================================================

CREATE OR REPLACE FUNCTION public.tg_notify_product_sold()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product_title TEXT;
BEGIN
  SELECT title INTO v_product_title
  FROM public.products
  WHERE id = NEW.product_id;

  INSERT INTO public.notifications (user_id, type, title, body, action_url, data)
  VALUES (
    NEW.seller_id,
    'sale',
    'Producto vendido',
    'Tu producto "' || COALESCE(v_product_title, 'sin título') || '" ha sido vendido',
    '/marketplace/' || NEW.product_id::TEXT,
    jsonb_build_object(
      'sale_id', NEW.id,
      'product_id', NEW.product_id,
      'buyer_id', NEW.buyer_id,
      'amount', NEW.amount
    )
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_product_sold ON public.sales;
CREATE TRIGGER trg_notify_product_sold
  AFTER INSERT ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_notify_product_sold();

-- =====================================================
-- 5. Trigger: nueva reserva de tutoría (al tutor)
-- =====================================================

CREATE OR REPLACE FUNCTION public.tg_notify_tutoring_booked()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_name TEXT;
  v_session_title TEXT;
BEGIN
  SELECT full_name INTO v_student_name
  FROM public.users
  WHERE id = NEW.student_id;

  SELECT title INTO v_session_title
  FROM public.tutoring_sessions
  WHERE id = NEW.session_id;

  INSERT INTO public.notifications (user_id, type, title, body, action_url, data)
  VALUES (
    NEW.tutor_id,
    'booking',
    'Nueva reserva de tutoría',
    COALESCE(v_student_name, 'Un estudiante')
      || ' ha reservado "' || COALESCE(v_session_title, 'tu sesión') || '"',
    '/tutoring/my-sessions',
    jsonb_build_object(
      'booking_id', NEW.id,
      'session_id', NEW.session_id,
      'student_id', NEW.student_id,
      'scheduled_date', NEW.scheduled_date,
      'scheduled_time', NEW.scheduled_time
    )
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_tutoring_booked ON public.tutoring_bookings;
CREATE TRIGGER trg_notify_tutoring_booked
  AFTER INSERT ON public.tutoring_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_notify_tutoring_booked();

-- =====================================================
-- 6. Trigger: cambio de estado de reserva (al estudiante)
-- =====================================================
-- Notifica al estudiante cuando el tutor confirma, rechaza
-- o cancela la reserva. Solo se dispara si status realmente cambió.

CREATE OR REPLACE FUNCTION public.tg_notify_tutoring_status_changed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tutor_name TEXT;
  v_title TEXT;
  v_body TEXT;
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  IF NEW.status NOT IN ('confirmed', 'rejected', 'cancelled', 'completed') THEN
    RETURN NEW;
  END IF;

  SELECT full_name INTO v_tutor_name
  FROM public.users
  WHERE id = NEW.tutor_id;

  v_title := CASE NEW.status
    WHEN 'confirmed' THEN 'Tutoría confirmada'
    WHEN 'rejected'  THEN 'Tutoría rechazada'
    WHEN 'cancelled' THEN 'Tutoría cancelada'
    WHEN 'completed' THEN 'Tutoría completada'
  END;

  v_body := CASE NEW.status
    WHEN 'confirmed' THEN COALESCE(v_tutor_name, 'El tutor') || ' ha confirmado tu reserva'
    WHEN 'rejected'  THEN COALESCE(v_tutor_name, 'El tutor') || ' ha rechazado tu reserva'
    WHEN 'cancelled' THEN 'Tu reserva fue cancelada'
    WHEN 'completed' THEN 'Tu sesión con ' || COALESCE(v_tutor_name, 'el tutor') || ' fue completada'
  END;

  INSERT INTO public.notifications (user_id, type, title, body, action_url, data)
  VALUES (
    NEW.student_id,
    'booking',
    v_title,
    v_body,
    '/tutoring/my-sessions',
    jsonb_build_object(
      'booking_id', NEW.id,
      'session_id', NEW.session_id,
      'tutor_id', NEW.tutor_id,
      'status', NEW.status
    )
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_tutoring_status_changed ON public.tutoring_bookings;
CREATE TRIGGER trg_notify_tutoring_status_changed
  AFTER UPDATE OF status ON public.tutoring_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_notify_tutoring_status_changed();

-- =====================================================
-- 7. Trigger: nueva reseña recibida
-- =====================================================

CREATE OR REPLACE FUNCTION public.tg_notify_new_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reviewer_name TEXT;
BEGIN
  IF NEW.reviewer_id = NEW.reviewee_id THEN
    RETURN NEW;
  END IF;

  SELECT full_name INTO v_reviewer_name
  FROM public.users
  WHERE id = NEW.reviewer_id;

  INSERT INTO public.notifications (user_id, type, title, body, action_url, data)
  VALUES (
    NEW.reviewee_id,
    'review',
    'Nueva reseña',
    COALESCE(v_reviewer_name, 'Alguien')
      || ' te ha dejado una reseña de ' || NEW.rating::TEXT || ' estrellas',
    '/profile',
    jsonb_build_object(
      'review_id', NEW.id,
      'reviewer_id', NEW.reviewer_id,
      'rating', NEW.rating,
      'review_type', NEW.type,
      'sale_id', NEW.sale_id,
      'booking_id', NEW.booking_id
    )
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_review ON public.reviews;
CREATE TRIGGER trg_notify_new_review
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_notify_new_review();

-- =====================================================
-- 8. Realtime — habilitar replicación para suscripciones
-- =====================================================
-- Permite que el frontend reciba INSERTs en tiempo real
-- vía supabase.channel('notifications:<user_id>').

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;
