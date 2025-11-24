import { useState, useEffect, useCallback } from 'react'
import { getReports, type ReportFilters } from '@/services/reports.service'
import type { Database } from '@/types/database.types'
import { mapTypeFromDb, mapPriorityFromDb, mapStatusFromDb, type FrontendReportType, type FrontendPriority, type FrontendStatus } from '@/utils/report-mappers'

// Tipo de reporte en formato frontend
export interface Report {
  id: string
  title: string
  type: FrontendReportType
  description: string
  location: string
  coordinates: { x: number; y: number } | null
  date: string
  time: string
  status: FrontendStatus
  reporter: string
  priority: FrontendPriority
  isAnonymous: boolean
  createdAt: string
  reporterId: string | null
}

type DbReport = Database['public']['Tables']['reports']['Row']

/**
 * Convierte un reporte de la BD al formato del frontend
 */
function mapDbReportToFrontend(dbReport: DbReport): Report {
  const createdAt = new Date(dbReport.created_at || '')

  return {
    id: dbReport.id,
    title: dbReport.title,
    type: mapTypeFromDb(dbReport.type),
    description: dbReport.description,
    location: dbReport.location,
    coordinates: null, // Las coordenadas visuales no se almacenan en BD por ahora
    date: createdAt.toISOString().split('T')[0],
    time: createdAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    status: mapStatusFromDb(dbReport.status),
    reporter: dbReport.is_anonymous ? 'Anónimo' : 'Usuario',
    priority: mapPriorityFromDb(dbReport.priority),
    isAnonymous: dbReport.is_anonymous || false,
    createdAt: dbReport.created_at || '',
    reporterId: dbReport.reporter_id
  }
}

interface UseReportsReturn {
  reports: Report[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Hook para obtener y gestionar la lista de reportes
 * @param filters - Filtros opcionales para los reportes
 * @returns Estado de los reportes, loading, error y función para refetch
 */
export function useReports(filters?: ReportFilters): UseReportsReturn {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await getReports(filters)
      const mappedReports = data.map(mapDbReportToFrontend)

      setReports(mappedReports)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar reportes'))
      console.error('Error cargando reportes:', err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  return {
    reports,
    loading,
    error,
    refetch: fetchReports
  }
}
