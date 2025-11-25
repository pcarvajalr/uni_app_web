-- Migración: Corregir RLS de tutoring_sessions
-- Problema: Los tutores no pueden ver sus propias sesiones (incluyendo pausadas)
-- Solución: Permitir que tutores vean TODAS sus sesiones, no solo las activas

-- 1. Eliminar política restrictiva actual (si existe)
DROP POLICY IF EXISTS "Todos pueden ver sesiones activas" ON public.tutoring_sessions;

-- 2. Crear o reemplazar la política de SELECT para tutoring_sessions
DO $$
BEGIN
  -- Eliminar la política si existe para recrearla
  DROP POLICY IF EXISTS "Usuarios pueden ver sesiones activas o propias" ON public.tutoring_sessions;

  -- Crear nueva política
  CREATE POLICY "Usuarios pueden ver sesiones activas o propias"
    ON public.tutoring_sessions FOR SELECT
    USING (
      status = 'active'
      OR auth.uid() = tutor_id
    );
END $$;

-- 3. Verificar que la política de bookings existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'tutoring_bookings'
    AND policyname = 'Los usuarios pueden ver sus propias reservas'
  ) THEN
    CREATE POLICY "Los usuarios pueden ver sus propias reservas"
      ON public.tutoring_bookings FOR SELECT
      USING (auth.uid() = student_id OR auth.uid() = tutor_id);
  END IF;
END $$;
