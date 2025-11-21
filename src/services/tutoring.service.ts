import { supabase, handleSupabaseError, unwrapData } from '../lib/supabase';
import type { Database } from '../types/database.types';

type TutoringSession = Database['public']['Tables']['tutoring_sessions']['Row'];
type TutoringSessionInsert = Database['public']['Tables']['tutoring_sessions']['Insert'];
type TutoringSessionUpdate = Database['public']['Tables']['tutoring_sessions']['Update'];
type TutoringBooking = Database['public']['Tables']['tutoring_bookings']['Row'];
type TutoringBookingInsert = Database['public']['Tables']['tutoring_bookings']['Insert'];
type TutoringBookingUpdate = Database['public']['Tables']['tutoring_bookings']['Update'];

export interface TutoringSessionWithTutor extends TutoringSession {
  tutor: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    rating: number;
    total_tutoring_sessions: number;
    career: string | null;
  };
  category: {
    id: string;
    name: string;
    icon: string | null;
  } | null;
}

export interface TutoringBookingWithDetails extends TutoringBooking {
  session: TutoringSessionWithTutor;
  tutor: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    phone: string | null;
  };
  student: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    phone: string | null;
  };
}

export interface TutoringFilters {
  category_id?: string;
  subject?: string;
  mode?: 'presential' | 'online' | 'both';
  min_price?: number;
  max_price?: number;
  search?: string;
  tutor_id?: string;
}

// Obtener todas las sesiones de tutoría con filtros
export const getTutoringSessions = async (filters?: TutoringFilters) => {
  try {
    let query = supabase
      .from('tutoring_sessions')
      .select(
        `
        *,
        tutor:users!tutoring_sessions_tutor_id_fkey(
          id,
          full_name,
          avatar_url,
          rating,
          total_tutoring_sessions,
          career
        ),
        category:categories(
          id,
          name,
          icon
        )
      `
      )
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id);
    }

    if (filters?.subject) {
      query = query.ilike('subject', `%${filters.subject}%`);
    }

    if (filters?.mode) {
      query = query.or(`mode.eq.${filters.mode},mode.eq.both`);
    }

    if (filters?.min_price !== undefined) {
      query = query.gte('price_per_hour', filters.min_price);
    }

    if (filters?.max_price !== undefined) {
      query = query.lte('price_per_hour', filters.max_price);
    }

    if (filters?.tutor_id) {
      query = query.eq('tutor_id', filters.tutor_id);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,subject.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    return unwrapData(data, error);
  } catch (error) {
    console.error('Error obteniendo sesiones de tutoría:', error);
    throw error;
  }
};

// Obtener una sesión por ID
export const getTutoringSessionById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('tutoring_sessions')
      .select(
        `
        *,
        tutor:users!tutoring_sessions_tutor_id_fkey(
          id,
          full_name,
          avatar_url,
          rating,
          total_tutoring_sessions,
          career,
          phone
        ),
        category:categories(
          id,
          name,
          icon
        )
      `
      )
      .eq('id', id)
      .single();

    return unwrapData(data, error);
  } catch (error) {
    console.error('Error obteniendo sesión de tutoría:', error);
    throw error;
  }
};

// Crear una nueva sesión de tutoría
export const createTutoringSession = async (
  session: Omit<TutoringSessionInsert, 'id' | 'created_at' | 'updated_at'>
) => {
  try {
    const { data, error } = await supabase.from('tutoring_sessions').insert(session).select().single();

    return unwrapData(data, error);
  } catch (error) {
    console.error('Error creando sesión de tutoría:', error);
    throw error;
  }
};

// Actualizar una sesión de tutoría
export const updateTutoringSession = async (id: string, updates: TutoringSessionUpdate) => {
  try {
    const { data, error } = await supabase.from('tutoring_sessions').update(updates).eq('id', id).select().single();

    return unwrapData(data, error);
  } catch (error) {
    console.error('Error actualizando sesión de tutoría:', error);
    throw error;
  }
};

// Eliminar (soft delete) una sesión de tutoría
export const deleteTutoringSession = async (id: string) => {
  try {
    const { error } = await supabase.from('tutoring_sessions').update({ status: 'deleted' }).eq('id', id);

    if (error) {
      handleSupabaseError(error);
    }

    return true;
  } catch (error) {
    console.error('Error eliminando sesión de tutoría:', error);
    throw error;
  }
};

// Crear una reserva de tutoría
export const createTutoringBooking = async (
  booking: Omit<TutoringBookingInsert, 'id' | 'created_at' | 'updated_at'>
) => {
  try {
    const { data, error } = await supabase.from('tutoring_bookings').insert(booking).select().single();

    return unwrapData(data, error);
  } catch (error) {
    console.error('Error creando reserva de tutoría:', error);
    throw error;
  }
};

// Actualizar una reserva de tutoría
export const updateTutoringBooking = async (id: string, updates: TutoringBookingUpdate) => {
  try {
    const { data, error } = await supabase.from('tutoring_bookings').update(updates).eq('id', id).select().single();

    return unwrapData(data, error);
  } catch (error) {
    console.error('Error actualizando reserva de tutoría:', error);
    throw error;
  }
};

// Obtener reservas del estudiante
export const getStudentBookings = async (studentId: string) => {
  try {
    const { data, error } = await supabase
      .from('tutoring_bookings')
      .select(
        `
        *,
        session:tutoring_sessions!tutoring_bookings_session_id_fkey(
          *,
          tutor:users!tutoring_sessions_tutor_id_fkey(
            id,
            full_name,
            avatar_url,
            rating,
            total_tutoring_sessions,
            career
          ),
          category:categories(
            id,
            name,
            icon
          )
        ),
        tutor:users!tutoring_bookings_tutor_id_fkey(
          id,
          full_name,
          avatar_url,
          phone
        ),
        student:users!tutoring_bookings_student_id_fkey(
          id,
          full_name,
          avatar_url,
          phone
        )
      `
      )
      .eq('student_id', studentId)
      .order('scheduled_date', { ascending: false });

    return unwrapData(data, error);
  } catch (error) {
    console.error('Error obteniendo reservas del estudiante:', error);
    throw error;
  }
};

// Obtener reservas del tutor
export const getTutorBookings = async (tutorId: string) => {
  try {
    const { data, error } = await supabase
      .from('tutoring_bookings')
      .select(
        `
        *,
        session:tutoring_sessions!tutoring_bookings_session_id_fkey(
          *,
          category:categories(
            id,
            name,
            icon
          )
        ),
        student:users!tutoring_bookings_student_id_fkey(
          id,
          full_name,
          avatar_url,
          phone,
          student_id,
          career
        )
      `
      )
      .eq('tutor_id', tutorId)
      .order('scheduled_date', { ascending: false });

    return unwrapData(data, error);
  } catch (error) {
    console.error('Error obteniendo reservas del tutor:', error);
    throw error;
  }
};

// Agregar/quitar sesión de tutoría de favoritos
export const toggleTutoringFavorite = async (sessionId: string, userId: string) => {
  try {
    // Verificar si ya existe
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('tutoring_session_id', sessionId)
      .eq('item_type', 'tutoring_session')
      .single();

    if (existing) {
      // Eliminar favorito
      const { error } = await supabase.from('favorites').delete().eq('id', existing.id);

      if (error) {
        handleSupabaseError(error);
      }

      return false; // No es favorito
    } else {
      // Agregar favorito
      const { error } = await supabase.from('favorites').insert({
        user_id: userId,
        tutoring_session_id: sessionId,
        item_type: 'tutoring_session',
      });

      if (error) {
        handleSupabaseError(error);
      }

      return true; // Es favorito
    }
  } catch (error) {
    console.error('Error toggling favorito de tutoría:', error);
    throw error;
  }
};

// Obtener categorías de tutorías
export const getTutoringCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .in('type', ['tutoring', 'both'])
      .order('name');

    return unwrapData(data, error);
  } catch (error) {
    console.error('Error obteniendo categorías de tutorías:', error);
    throw error;
  }
};
