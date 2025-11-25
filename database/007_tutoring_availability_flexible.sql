-- Migración: Disponibilidad Flexible para Tutorías
-- Agregar columna para rangos de disponibilidad flexibles
-- Formato: {"monday": [{"start": "09:00", "end": "14:00"}, {"start": "16:00", "end": "20:00"}], ...}

ALTER TABLE tutoring_sessions
ADD COLUMN IF NOT EXISTS availability_ranges JSONB DEFAULT '{}';

COMMENT ON COLUMN tutoring_sessions.availability_ranges IS
'Rangos de disponibilidad flexibles. Keys: monday-sunday. Values: array de {start, end} en formato HH:MM';

-- Índice GIN para búsquedas eficientes en JSONB
CREATE INDEX IF NOT EXISTS idx_tutoring_sessions_availability_ranges
ON tutoring_sessions USING GIN (availability_ranges);
