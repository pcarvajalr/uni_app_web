-- Migración: Corregir RLS de tutoring_sessions
-- Problema: Los tutores no pueden ver sus propias sesiones pausadas
-- Solución: Permitir que tutores vean TODAS sus sesiones, no solo las activas

-- 1. Eliminar política restrictiva actual
DROP POLICY IF EXISTS "Todos pueden ver sesiones activas" ON public.tutoring_sessions;

-- 2. Crear nueva política: sesiones activas para todos + todas las sesiones propias para tutores
CREATE POLICY "Usuarios pueden ver sesiones activas o propias"
  ON public.tutoring_sessions FOR SELECT
  USING (
    status = 'active'
    OR auth.uid() = tutor_id
  );

-- 3. Verificar que la política de bookings existe
-- Si no existe, crearla:
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

-- Verificación: Mostrar políticas actuales
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('tutoring_sessions', 'tutoring_bookings')
ORDER BY tablename, policyname;
