import { useState } from 'react'
import { createReport, type ReportInsert } from '@/services/reports.service'
import { useAuth } from '@/lib/auth'
import { mapTypeToDb, mapPriorityToDb, type FrontendReportType, type FrontendPriority } from '@/utils/report-mappers'

export interface CreateReportData {
  title: string
  type: FrontendReportType
  description: string
  location: string
  priority: FrontendPriority
  anonymous: boolean
}

interface UseCreateReportReturn {
  createNewReport: (data: CreateReportData) => Promise<void>
  isCreating: boolean
  error: Error | null
  success: boolean
  reset: () => void
}

/**
 * Hook para crear nuevos reportes
 * Maneja el estado de creación, errores y éxito
 */
export function useCreateReport(): UseCreateReportReturn {
  const { user } = useAuth()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [success, setSuccess] = useState(false)

  const createNewReport = async (data: CreateReportData) => {
    try {
      setIsCreating(true)
      setError(null)
      setSuccess(false)

      // Mapear los datos del frontend al formato de la BD
      const reportData: ReportInsert = {
        title: data.title,
        type: mapTypeToDb(data.type),
        description: data.description,
        location: data.location,
        priority: mapPriorityToDb(data.priority),
        is_anonymous: data.anonymous,
        // Si es anónimo o no hay usuario, reporter_id será null
        reporter_id: data.anonymous ? null : (user?.id || null),
        status: 'open'
      }

      await createReport(reportData)
      setSuccess(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error('Error al crear el reporte')
      setError(errorMessage)
      console.error('Error creando reporte:', err)
      throw errorMessage
    } finally {
      setIsCreating(false)
    }
  }

  const reset = () => {
    setError(null)
    setSuccess(false)
  }

  return {
    createNewReport,
    isCreating,
    error,
    success,
    reset
  }
}
