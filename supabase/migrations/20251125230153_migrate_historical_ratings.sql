-- Migration: Recalculate Historical Ratings
-- This is a one-time data migration to fix ratings that were not updated before the trigger fix
-- Recalculates all session and tutor ratings based on existing student_rating data

-- Recalcular ratings para todas las sesiones que tienen bookings completados
UPDATE tutoring_sessions ts
SET
  rating = (
    SELECT AVG(student_rating)::NUMERIC(3,2)
    FROM tutoring_bookings
    WHERE session_id = ts.id
      AND status = 'completed'
      AND student_rating IS NOT NULL
  ),
  total_bookings = (
    SELECT COUNT(*)
    FROM tutoring_bookings
    WHERE session_id = ts.id
      AND status = 'completed'
  )
WHERE ts.id IN (
  SELECT DISTINCT session_id
  FROM tutoring_bookings
  WHERE status = 'completed'
    AND student_rating IS NOT NULL
);

-- Recalcular ratings de todos los tutores
UPDATE users u
SET
  rating = (
    SELECT AVG(rating)::NUMERIC(3,2)
    FROM tutoring_sessions
    WHERE tutor_id = u.id
      AND rating > 0
  ),
  total_tutoring_sessions = (
    SELECT COUNT(*)
    FROM tutoring_bookings
    WHERE tutor_id = u.id
      AND status = 'completed'
  )
WHERE u.id IN (
  SELECT DISTINCT tutor_id
  FROM tutoring_sessions
  WHERE rating > 0
);
