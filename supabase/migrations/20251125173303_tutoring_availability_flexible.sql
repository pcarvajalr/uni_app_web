-- Migration: Flexible Availability for Tutoring
-- Add column for flexible availability ranges
-- Format: {"monday": [{"start": "09:00", "end": "14:00"}, {"start": "16:00", "end": "20:00"}], ...}

ALTER TABLE tutoring_sessions
ADD COLUMN IF NOT EXISTS availability_ranges JSONB DEFAULT '{}';

COMMENT ON COLUMN tutoring_sessions.availability_ranges IS
'Flexible availability ranges. Keys: monday-sunday. Values: array of {start, end} in HH:MM format';

-- GIN index for efficient JSONB searches
CREATE INDEX IF NOT EXISTS idx_tutoring_sessions_availability_ranges
ON tutoring_sessions USING GIN (availability_ranges);
