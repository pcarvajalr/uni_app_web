import { supabase, handleSupabaseError, unwrapData } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Report = Database['public']['Tables']['reports']['Row'];
export type ReportInsert = Database['public']['Tables']['reports']['Insert'];
export type ReportUpdate = Database['public']['Tables']['reports']['Update'];

export interface ReportWithReporter extends Report {
  reporter: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    student_id: string | null;
  } | null;
  campus_location: {
    id: string;
    name: string;
    type: string;
    coordinate_x: number | null;
    coordinate_y: number | null;
    description: string | null;
    floor: string | null;
    icon: string | null;
  } | null;
}

export interface ReportFilters {
  type?: 'security' | 'emergency' | 'maintenance' | 'lost_found' | 'other';
  status?: 'open' | 'in_progress' | 'resolved' | 'closed' | 'rejected';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  reporter_id?: string;
}

// Obtener todos los reportes con filtros
export const getReports = async (filters?: ReportFilters) => {
  try {
    let query = supabase
      .from('reports')
      .select(
        `
        *,
        reporter:users!reports_reporter_id_fkey(
          id,
          full_name,
          avatar_url,
          student_id
        ),
        campus_location:campus_locations!reports_location_id_fkey(
          id,
          name,
          type,
          coordinate_x,
          coordinate_y,
          description,
          floor,
          icon
        )
      `
      )
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }

    if (filters?.reporter_id) {
      query = query.eq('reporter_id', filters.reporter_id);
    }

    const { data, error } = await query;

    return unwrapData(data, error);
  } catch (error) {
    console.error('Error obteniendo reportes:', error);
    throw error;
  }
};

// Obtener un reporte por ID
export const getReportById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select(
        `
        *,
        reporter:users!reports_reporter_id_fkey(
          id,
          full_name,
          avatar_url,
          student_id,
          phone
        ),
        campus_location:campus_locations!reports_location_id_fkey(
          id,
          name,
          type,
          coordinate_x,
          coordinate_y,
          description,
          floor,
          icon
        )
      `
      )
      .eq('id', id)
      .single();

    return unwrapData(data, error);
  } catch (error) {
    console.error('Error obteniendo reporte:', error);
    throw error;
  }
};

// Crear un nuevo reporte
export const createReport = async (report: Omit<ReportInsert, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase.from('reports').insert(report).select().single();

    return unwrapData(data, error);
  } catch (error) {
    console.error('Error creando reporte:', error);
    throw error;
  }
};

// Actualizar un reporte
export const updateReport = async (id: string, updates: ReportUpdate) => {
  try {
    const { data, error } = await supabase.from('reports').update(updates).eq('id', id).select().single();

    return unwrapData(data, error);
  } catch (error) {
    console.error('Error actualizando reporte:', error);
    throw error;
  }
};

// Cambiar estado de un reporte
export const updateReportStatus = async (
  id: string,
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'rejected',
  resolutionNotes?: string
) => {
  try {
    const updates: ReportUpdate = {
      status,
    };

    if (status === 'resolved' || status === 'closed') {
      updates.resolved_at = new Date().toISOString();

      if (resolutionNotes) {
        updates.resolution_notes = resolutionNotes;
      }
    }

    const { data, error } = await supabase.from('reports').update(updates).eq('id', id).select().single();

    return unwrapData(data, error);
  } catch (error) {
    console.error('Error actualizando estado del reporte:', error);
    throw error;
  }
};

// Obtener estadísticas de reportes
export const getReportStats = async () => {
  try {
    // Contar por estado
    const { data: statusData, error: statusError } = await supabase
      .from('reports')
      .select('status')
      .not('status', 'eq', 'closed');

    const validatedStatusData = unwrapData(statusData, statusError);

    // Contar por prioridad
    const { data: priorityData, error: priorityError } = await supabase
      .from('reports')
      .select('priority')
      .eq('status', 'open');

    const validatedPriorityData = unwrapData(priorityData, priorityError);

    // Contar por tipo
    const { data: typeData, error: typeError } = await supabase
      .from('reports')
      .select('type')
      .in('status', ['open', 'in_progress']);

    const validatedTypeData = unwrapData(typeData, typeError);

    // Calcular estadísticas
    const stats = {
      total: validatedStatusData.length,
      byStatus: {
        open: validatedStatusData.filter((r) => r.status === 'open').length,
        in_progress: validatedStatusData.filter((r) => r.status === 'in_progress').length,
        resolved: validatedStatusData.filter((r) => r.status === 'resolved').length,
      },
      byPriority: {
        critical: validatedPriorityData.filter((r) => r.priority === 'critical').length,
        high: validatedPriorityData.filter((r) => r.priority === 'high').length,
        medium: validatedPriorityData.filter((r) => r.priority === 'medium').length,
        low: validatedPriorityData.filter((r) => r.priority === 'low').length,
      },
      byType: {
        security: validatedTypeData.filter((r) => r.type === 'security').length,
        emergency: validatedTypeData.filter((r) => r.type === 'emergency').length,
        maintenance: validatedTypeData.filter((r) => r.type === 'maintenance').length,
        lost_found: validatedTypeData.filter((r) => r.type === 'lost_found').length,
        other: validatedTypeData.filter((r) => r.type === 'other').length,
      },
    };

    return stats;
  } catch (error) {
    console.error('Error obteniendo estadísticas de reportes:', error);
    throw error;
  }
};

// Obtener reportes cercanos a una ubicación (requiere coordenadas)
export const getNearbyReports = async (latitude: number, longitude: number, radiusKm: number = 1) => {
  try {
    // Esta funcionalidad requeriría una función de PostGIS en el backend
    // Por ahora, obtener todos los reportes activos
    const { data, error } = await supabase
      .from('reports')
      .select(
        `
        *,
        reporter:users!reports_reporter_id_fkey(
          id,
          full_name,
          avatar_url
        ),
        campus_location:campus_locations!reports_location_id_fkey(
          id,
          name,
          type,
          coordinate_x,
          coordinate_y,
          description,
          floor,
          icon
        )
      `
      )
      .in('status', ['open', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(50);

    // TODO: Implementar filtrado por distancia en el backend con PostGIS
    return unwrapData(data, error);
  } catch (error) {
    console.error('Error obteniendo reportes cercanos:', error);
    throw error;
  }
};
