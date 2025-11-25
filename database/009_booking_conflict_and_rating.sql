-- Migración: Función de Conflictos de Horario y Trigger de Rating
-- Funciones y triggers para validar reservas y actualizar ratings

-- ============================================
-- FUNCIÓN: Verificar conflictos de horario
-- ============================================
CREATE OR REPLACE FUNCTION check_booking_conflict(
  p_session_id UUID,
  p_scheduled_date DATE,
  p_scheduled_time TIME,
  p_duration_minutes INT,
  p_exclude_booking_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INT;
  end_time TIME;
BEGIN
  end_time := p_scheduled_time + (p_duration_minutes || ' minutes')::INTERVAL;

  SELECT COUNT(*) INTO conflict_count
  FROM tutoring_bookings
  WHERE session_id = p_session_id
    AND scheduled_date = p_scheduled_date
    AND status IN ('pending', 'confirmed', 'in_progress')
    AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id)
    AND (
      -- Nuevo horario empieza durante una reserva existente
      (p_scheduled_time >= scheduled_time AND p_scheduled_time < (scheduled_time + (duration_minutes || ' minutes')::INTERVAL))
      -- Nuevo horario termina durante una reserva existente
      OR (end_time > scheduled_time AND end_time <= (scheduled_time + (duration_minutes || ' minutes')::INTERVAL))
      -- Nuevo horario envuelve completamente una reserva existente
      OR (p_scheduled_time <= scheduled_time AND end_time >= (scheduled_time + (duration_minutes || ' minutes')::INTERVAL))
    );

  RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Actualizar ratings automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_session_and_tutor_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo actuar si el rating del estudiante cambió
  IF NEW.student_rating IS NOT NULL AND (OLD.student_rating IS NULL OR NEW.student_rating != OLD.student_rating) THEN
    -- Actualizar rating promedio de la sesión de tutoría
    UPDATE tutoring_sessions
    SET rating = (
      SELECT AVG(student_rating)::NUMERIC(3,2)
      FROM tutoring_bookings
      WHERE session_id = NEW.session_id
        AND status = 'completed'
        AND student_rating IS NOT NULL
    ),
    total_bookings = (
      SELECT COUNT(*)
      FROM tutoring_bookings
      WHERE session_id = NEW.session_id
        AND status = 'completed'
    )
    WHERE id = NEW.session_id;

    -- Actualizar rating promedio del tutor basado en todas sus sesiones
    UPDATE users
    SET rating = (
      SELECT AVG(rating)::NUMERIC(3,2)
      FROM tutoring_sessions
      WHERE tutor_id = NEW.tutor_id
        AND rating > 0
    ),
    total_tutoring_sessions = (
      SELECT COUNT(*)
      FROM tutoring_bookings
      WHERE tutor_id = NEW.tutor_id
        AND status = 'completed'
    )
    WHERE id = NEW.tutor_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger existente si existe
DROP TRIGGER IF EXISTS tutoring_bookings_rating_update ON tutoring_bookings;

-- Crear trigger que se activa al actualizar student_rating
CREATE TRIGGER tutoring_bookings_rating_update
  AFTER UPDATE OF student_rating ON tutoring_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_session_and_tutor_rating();
