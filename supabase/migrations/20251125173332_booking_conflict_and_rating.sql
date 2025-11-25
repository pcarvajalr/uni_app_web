-- Migration: Booking Conflict Check and Rating Trigger
-- Functions and triggers to validate bookings and update ratings

-- ============================================
-- FUNCTION: Check for time slot conflicts
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
      -- New time starts during an existing booking
      (p_scheduled_time >= scheduled_time AND p_scheduled_time < (scheduled_time + (duration_minutes || ' minutes')::INTERVAL))
      -- New time ends during an existing booking
      OR (end_time > scheduled_time AND end_time <= (scheduled_time + (duration_minutes || ' minutes')::INTERVAL))
      -- New time completely wraps an existing booking
      OR (p_scheduled_time <= scheduled_time AND end_time >= (scheduled_time + (duration_minutes || ' minutes')::INTERVAL))
    );

  RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Update ratings automatically
-- ============================================
CREATE OR REPLACE FUNCTION update_session_and_tutor_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Only act if student rating changed
  IF NEW.student_rating IS NOT NULL AND (OLD.student_rating IS NULL OR NEW.student_rating != OLD.student_rating) THEN
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

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS tutoring_bookings_rating_update ON tutoring_bookings;

-- Create trigger that fires on student_rating update
CREATE TRIGGER tutoring_bookings_rating_update
  AFTER UPDATE OF student_rating ON tutoring_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_session_and_tutor_rating();
