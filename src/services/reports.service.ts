import { supabase, handleSupabaseError } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Report = Database['public']['Tables']['reports']['Row'];
type ReportInsert = Database['public']['Tables']['reports']['Insert'];
type ReportUpdate = Database['public']['Tables']['reports']['Update'];

export interface ReportWithReporter extends Report {
  reporter: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    student_id: string | null;
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

    if (error) {
      handleSupabaseError(error);
    }

    return data as ReportWithReporter[];
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
        )
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      handleSupabaseError(error);
    }

    return data as ReportWithReporter;
  } catch (error) {
    console.error('Error obteniendo reporte:', error);
    throw error;
  }
};

// Crear un nuevo reporte
export const createReport = async (report: Omit<ReportInsert, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase.from('reports').insert(report).select().single();

    if (error) {
      handleSupabaseError(error);
    }

    return data as Report;
  } catch (error) {
    console.error('Error creando reporte:', error);
    throw error;
  }
};

// Actualizar un reporte
export const updateReport = async (id: string, updates: ReportUpdate) => {
  try {
    const { data, error } = await supabase.from('reports').update(updates).eq('id', id).select().single();

    if (error) {
      handleSupabaseError(error);
    }

    return data as Report;
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

    if (error) {
      handleSupabaseError(error);
    }

    return data as Report;
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

    if (statusError) {
      handleSupabaseError(statusError);
    }

    // Contar por prioridad
    const { data: priorityData, error: priorityError } = await supabase
      .from('reports')
      .select('priority')
      .eq('status', 'open');

    if (priorityError) {
      handleSupabaseError(priorityError);
    }

    // Contar por tipo
    const { data: typeData, error: typeError } = await supabase
      .from('reports')
      .select('type')
      .in('status', ['open', 'in_progress']);

    if (typeError) {
      handleSupabaseError(typeError);
    }

    // Calcular estadísticas
    const stats = {
      total: statusData?.length || 0,
      byStatus: {
        open: statusData?.filter((r) => r.status === 'open').length || 0,
        in_progress: statusData?.filter((r) => r.status === 'in_progress').length || 0,
        resolved: statusData?.filter((r) => r.status === 'resolved').length || 0,
      },
      byPriority: {
        critical: priorityData?.filter((r) => r.priority === 'critical').length || 0,
        high: priorityData?.filter((r) => r.priority === 'high').length || 0,
        medium: priorityData?.filter((r) => r.priority === 'medium').length || 0,
        low: priorityData?.filter((r) => r.priority === 'low').length || 0,
      },
      byType: {
        security: typeData?.filter((r) => r.type === 'security').length || 0,
        emergency: typeData?.filter((r) => r.type === 'emergency').length || 0,
        maintenance: typeData?.filter((r) => r.type === 'maintenance').length || 0,
        lost_found: typeData?.filter((r) => r.type === 'lost_found').length || 0,
        other: typeData?.filter((r) => r.type === 'other').length || 0,
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
        )
      `
      )
      .in('status', ['open', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      handleSupabaseError(error);
    }

    // TODO: Implementar filtrado por distancia en el backend con PostGIS
    return data as ReportWithReporter[];
  } catch (error) {
    console.error('Error obteniendo reportes cercanos:', error);
    throw error;
  }
};
