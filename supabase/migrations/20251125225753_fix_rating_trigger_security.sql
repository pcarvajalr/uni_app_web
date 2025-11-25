-- Migration: Fix Rating Trigger Security Context
-- Problem: Trigger runs with user permissions, RLS blocks updates
-- Solution: Run trigger function with elevated privileges using SECURITY DEFINER

-- Drop existing trigger
DROP TRIGGER IF EXISTS tutoring_bookings_rating_update ON tutoring_bookings;

-- Recreate function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION update_session_and_tutor_rating()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only act if student rating changed
  IF NEW.student_rating IS NOT NULL AND
     (OLD.student_rating IS NULL OR NEW.student_rating != OLD.student_rating) THEN

    -- Update session average rating
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

    -- Update tutor average rating based on all their sessions
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

-- Recreate trigger that fires on student_rating update
CREATE TRIGGER tutoring_bookings_rating_update
  AFTER UPDATE OF student_rating ON tutoring_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_session_and_tutor_rating();

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
