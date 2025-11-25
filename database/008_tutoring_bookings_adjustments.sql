-- Migración: Ajustes en Tutoring Bookings
-- Agregar estado 'rejected' y campos adicionales

-- Agregar estado 'rejected' al constraint de status
ALTER TABLE tutoring_bookings
DROP CONSTRAINT IF EXISTS tutoring_bookings_status_check;

ALTER TABLE tutoring_bookings
ADD CONSTRAINT tutoring_bookings_status_check
CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rejected'));

-- Campos adicionales para rechazos y cancelaciones
ALTER TABLE tutoring_bookings
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- Índices para búsquedas frecuentes
-- Índice parcial para reservas activas (excluye canceladas/rechazadas/no-show)
CREATE INDEX IF NOT EXISTS idx_bookings_availability
ON tutoring_bookings(session_id, scheduled_date, scheduled_time, status)
WHERE status NOT IN ('cancelled', 'rejected', 'no_show');

-- Índice para búsquedas por estudiante
CREATE INDEX IF NOT EXISTS idx_bookings_student ON tutoring_bookings(student_id, status);

-- Índice para búsquedas por tutor
CREATE INDEX IF NOT EXISTS idx_bookings_tutor ON tutoring_bookings(tutor_id, status);
