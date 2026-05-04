-- =====================================================
-- Migración: Tabla device_tokens para push notifications
-- =====================================================
-- Propósito:
--   Almacenar los tokens FCM/APNs de cada dispositivo asociado
--   a un usuario para poder enviarle notificaciones push.
--   Un usuario puede tener varios dispositivos (móvil + tablet).
--   Un dispositivo puede cambiar de usuario (logout/login).
-- =====================================================

CREATE TABLE IF NOT EXISTS public.device_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token       TEXT NOT NULL,
  platform    TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (token)
);

CREATE INDEX IF NOT EXISTS device_tokens_user_idx
  ON public.device_tokens (user_id);

-- =====================================================
-- RLS — un usuario solo gestiona sus propios tokens
-- =====================================================

ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios ven sus device_tokens"        ON public.device_tokens;
DROP POLICY IF EXISTS "Usuarios insertan sus device_tokens"   ON public.device_tokens;
DROP POLICY IF EXISTS "Usuarios actualizan sus device_tokens" ON public.device_tokens;
DROP POLICY IF EXISTS "Usuarios eliminan sus device_tokens"   ON public.device_tokens;

CREATE POLICY "Usuarios ven sus device_tokens"
  ON public.device_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios insertan sus device_tokens"
  ON public.device_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan sus device_tokens"
  ON public.device_tokens FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios eliminan sus device_tokens"
  ON public.device_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- Trigger para updated_at automático
-- =====================================================

CREATE OR REPLACE FUNCTION public.tg_device_tokens_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_device_tokens_updated_at ON public.device_tokens;
CREATE TRIGGER trg_device_tokens_updated_at
  BEFORE UPDATE ON public.device_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_device_tokens_set_updated_at();
