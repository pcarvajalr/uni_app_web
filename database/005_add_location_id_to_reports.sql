-- Agregar columna location_id a la tabla reports
-- Esta columna vinculará cada reporte con una ubicación del campus

ALTER TABLE public.reports
ADD COLUMN location_id UUID REFERENCES public.campus_locations(id) ON DELETE SET NULL;

-- Crear índice para mejorar el rendimiento de las consultas con JOIN
CREATE INDEX IF NOT EXISTS idx_reports_location_id ON public.reports(location_id);

-- Comentario descriptivo de la columna
COMMENT ON COLUMN public.reports.location_id IS 'ID de la ubicación del campus donde ocurrió el reporte';

-- Actualizar RLS policies si es necesario (opcional, solo si existen policies específicas)
-- Las policies existentes de reports deberían seguir funcionando correctamente
