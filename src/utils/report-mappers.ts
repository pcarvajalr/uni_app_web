/**
 * Utilidades para mapear datos de reportes entre frontend (español) y backend (inglés)
 */

import type { Database } from '@/types/database.types'

// Tipos de la base de datos
type DbReportType = Database['public']['Tables']['reports']['Row']['type']
type DbReportPriority = Database['public']['Tables']['reports']['Row']['priority']
type DbReportStatus = Database['public']['Tables']['reports']['Row']['status']

// Tipos del frontend
export type FrontendReportType = 'robo' | 'vandalismo' | 'sospechoso' | 'emergencia'
export type FrontendPriority = 'alta' | 'media' | 'baja'
export type FrontendStatus = 'activo' | 'investigando' | 'resuelto'

/**
 * Mapea el tipo de reporte del frontend al formato de la base de datos
 */
export function mapTypeToDb(frontendType: FrontendReportType): DbReportType {
  const typeMap: Record<FrontendReportType, DbReportType> = {
    'robo': 'security',
    'vandalismo': 'security',
    'sospechoso': 'security',
    'emergencia': 'emergency'
  }
  return typeMap[frontendType]
}

/**
 * Mapea el tipo de reporte de la BD al formato del frontend
 * Para reportes de seguridad, retorna 'sospechoso' por defecto
 */
export function mapTypeFromDb(dbType: DbReportType): FrontendReportType {
  const reverseMap: Record<DbReportType, FrontendReportType> = {
    'security': 'sospechoso',
    'emergency': 'emergencia',
    'maintenance': 'sospechoso',  // Fallback a sospechoso
    'lost_found': 'sospechoso',    // Fallback a sospechoso
    'other': 'sospechoso'          // Fallback a sospechoso
  }
  return reverseMap[dbType]
}

/**
 * Mapea la prioridad del frontend al formato de la base de datos
 */
export function mapPriorityToDb(frontendPriority: FrontendPriority): DbReportPriority {
  const priorityMap: Record<FrontendPriority, DbReportPriority> = {
    'baja': 'low',
    'media': 'medium',
    'alta': 'high'
  }
  return priorityMap[frontendPriority]
}

/**
 * Mapea la prioridad de la BD al formato del frontend
 */
export function mapPriorityFromDb(dbPriority: DbReportPriority): FrontendPriority {
  if (!dbPriority) return 'media' // Valor por defecto

  const reversePriorityMap: Record<NonNullable<DbReportPriority>, FrontendPriority> = {
    'low': 'baja',
    'medium': 'media',
    'high': 'alta',
    'critical': 'alta'  // Mapeamos critical a alta en el frontend
  }
  return reversePriorityMap[dbPriority]
}

/**
 * Mapea el estado del frontend al formato de la base de datos
 */
export function mapStatusToDb(frontendStatus: FrontendStatus): DbReportStatus {
  const statusMap: Record<FrontendStatus, DbReportStatus> = {
    'activo': 'open',
    'investigando': 'in_progress',
    'resuelto': 'resolved'
  }
  return statusMap[frontendStatus]
}

/**
 * Mapea el estado de la BD al formato del frontend
 */
export function mapStatusFromDb(dbStatus: DbReportStatus): FrontendStatus {
  if (!dbStatus) return 'activo' // Valor por defecto

  const reverseStatusMap: Record<NonNullable<DbReportStatus>, FrontendStatus> = {
    'open': 'activo',
    'in_progress': 'investigando',
    'resolved': 'resuelto',
    'closed': 'resuelto',      // Mapeamos closed a resuelto
    'rejected': 'activo'       // Mapeamos rejected a activo
  }
  return reverseStatusMap[dbStatus]
}

/**
 * Obtiene el label en español para mostrar en la UI
 */
export function getTypeLabel(type: FrontendReportType): string {
  const labels: Record<FrontendReportType, string> = {
    'robo': 'Robo',
    'vandalismo': 'Vandalismo',
    'sospechoso': 'Actividad Sospechosa',
    'emergencia': 'Emergencia'
  }
  return labels[type]
}

/**
 * Obtiene el label en español para la prioridad
 */
export function getPriorityLabel(priority: FrontendPriority): string {
  const labels: Record<FrontendPriority, string> = {
    'baja': 'Baja',
    'media': 'Media',
    'alta': 'Alta'
  }
  return labels[priority]
}

/**
 * Obtiene el label en español para el estado
 */
export function getStatusLabel(status: FrontendStatus): string {
  const labels: Record<FrontendStatus, string> = {
    'activo': 'Activo',
    'investigando': 'En Investigación',
    'resuelto': 'Resuelto'
  }
  return labels[status]
}
