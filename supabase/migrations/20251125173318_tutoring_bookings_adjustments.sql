-- Migration: Tutoring Bookings Adjustments
-- Add 'rejected' status and additional fields

-- Add 'rejected' status to constraint
ALTER TABLE tutoring_bookings
DROP CONSTRAINT IF EXISTS tutoring_bookings_status_check;

ALTER TABLE tutoring_bookings
ADD CONSTRAINT tutoring_bookings_status_check
CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rejected'));

-- Additional fields for rejections and cancellations
ALTER TABLE tutoring_bookings
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- Indexes for frequent searches
-- Partial index for active bookings (excludes cancelled/rejected/no-show)
CREATE INDEX IF NOT EXISTS idx_bookings_availability
ON tutoring_bookings(session_id, scheduled_date, scheduled_time, status)
WHERE status NOT IN ('cancelled', 'rejected', 'no_show');

-- Index for student searches
CREATE INDEX IF NOT EXISTS idx_bookings_student ON tutoring_bookings(student_id, status);

-- Index for tutor searches
CREATE INDEX IF NOT EXISTS idx_bookings_tutor ON tutoring_bookings(tutor_id, status);
