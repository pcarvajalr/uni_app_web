import { supabase, handleSupabaseError, unwrapData } from '../lib/supabase';
import type { Database } from '../types/database.types';
import type {
  TutoringFilters,
  TutoringSessionWithTutor,
  TutoringBookingWithDetails,
  BookingStatus,
  BookingFilters,
  CreateSessionFormData,
  BookingReview,
  DayOfWeek,
} from '../types/tutoring.types';
import { parseAvailableHours, stringifyAvailableHours } from '../lib/availability-utils';
import { canTransition, getTimestampFieldForStatus } from '../lib/booking-states';

type TutoringSessionInsert = Database['public']['Tables']['tutoring_sessions']['Insert'];
type TutoringSessionUpdate = Database['public']['Tables']['tutoring_sessions']['Update'];
type TutoringBookingInsert = Database['public']['Tables']['tutoring_bookings']['Insert'];
type TutoringBookingUpdate = Database['public']['Tables']['tutoring_bookings']['Update'];

// Re-export types for backward compatibility
export type { TutoringSessionWithTutor, TutoringBookingWithDetails, TutoringFilters };

// Obtener todas las sesiones de tutoría con filtros
export const getTutoringSessions = async (
  filters?: TutoringFilters,
  currentUserId?: string
): Promise<TutoringSessionWithTutor[]> => {
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

    // Exclude own sessions if requested
    if (filters?.exclude_own && currentUserId) {
      query = query.neq('tutor_id', currentUserId);
    }

    // Filter by minimum rating
    if (filters?.min_rating !== undefined) {
      query = query.gte('rating', filters.min_rating);
    }

    const { data, error } = await query;
    let sessions = unwrapData(data, error) as TutoringSessionWithTutor[];

    // Filter by availability day (client-side since available_hours is JSON)
    if (filters?.availability_day) {
      sessions = sessions.filter((session) => {
        const hours = parseAvailableHours(session.available_hours);
        const daySlots = hours[filters.availability_day!];
        return daySlots && daySlots.length > 0;
      });
    }

    // Add favorite status if user is logged in
    if (currentUserId) {
      const { data: favorites } = await supabase
        .from('favorites')
        .select('tutoring_session_id')
        .eq('user_id', currentUserId)
        .eq('item_type', 'tutoring_session');

      const favoriteIds = new Set(favorites?.map((f) => f.tutoring_session_id) || []);

      sessions = sessions.map((session) => ({
        ...session,
        is_favorite: favoriteIds.has(session.id),
      }));

      // Filter only favorites if requested
      if (filters?.only_favorites) {
        sessions = sessions.filter((session) => session.is_favorite);
      }
    }

    return sessions;
  } catch (error) {
    console.error('Error obteniendo sesiones de tutoría:', error);
    throw error;
  }
};

// Obtener una sesión por ID
export const getTutoringSessionById = async (
  id: string,
  currentUserId?: string
): Promise<TutoringSessionWithTutor> => {
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

    let session = unwrapData(data, error) as TutoringSessionWithTutor;

    // Check if favorite for current user
    if (currentUserId) {
      const { data: favorite } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', currentUserId)
        .eq('tutoring_session_id', id)
        .eq('item_type', 'tutoring_session')
        .single();

      session = { ...session, is_favorite: !!favorite };
    }

    return session;
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

// ==================== BOOKING FUNCTIONS ====================

// Check for booking conflicts
export const checkBookingConflict = async (
  sessionId: string,
  scheduledDate: string,
  scheduledTime: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('tutoring_bookings')
      .select('id')
      .eq('session_id', sessionId)
      .eq('scheduled_date', scheduledDate)
      .eq('scheduled_time', scheduledTime)
      .not('status', 'in', '("cancelled","no_show")')
      .limit(1);

    if (error) {
      console.error('Error checking booking conflict:', error);
      return true; // Assume conflict on error to be safe
    }

    return (data?.length ?? 0) > 0;
  } catch (error) {
    console.error('Error checking booking conflict:', error);
    return true;
  }
};

// Create booking with conflict validation
export const createBookingWithValidation = async (
  sessionId: string,
  studentId: string,
  scheduledDate: string,
  scheduledTime: string,
  durationMinutes: number,
  notes?: string
) => {
  try {
    // First, get session details
    const session = await getTutoringSessionById(sessionId);

    // Validate student is not booking own session
    if (session.tutor_id === studentId) {
      throw new Error('No puedes reservar tu propia sesión de tutoría');
    }

    // Check for conflicts
    const hasConflict = await checkBookingConflict(sessionId, scheduledDate, scheduledTime);
    if (hasConflict) {
      throw new Error('Este horario ya está reservado. Por favor selecciona otro.');
    }

    // Calculate total price
    const totalPrice = (durationMinutes / 60) * session.price_per_hour;

    // Create booking
    const { data, error } = await supabase
      .from('tutoring_bookings')
      .insert({
        session_id: sessionId,
        student_id: studentId,
        tutor_id: session.tutor_id,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        duration_minutes: durationMinutes,
        total_price: totalPrice,
        status: 'pending',
        location: session.location,
        meeting_url: session.meeting_url,
        notes,
      })
      .select()
      .single();

    return unwrapData(data, error);
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

// Update booking status with validation
export const updateBookingStatus = async (
  bookingId: string,
  newStatus: BookingStatus,
  currentUserId: string
): Promise<TutoringBookingWithDetails> => {
  try {
    // Get current booking
    const { data: booking, error: fetchError } = await supabase
      .from('tutoring_bookings')
      .select('*, student_id, tutor_id, status')
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      throw new Error('Reserva no encontrada');
    }

    // Validate user is involved in booking
    if (booking.student_id !== currentUserId && booking.tutor_id !== currentUserId) {
      throw new Error('No tienes permiso para modificar esta reserva');
    }

    // Validate state transition
    const currentStatus = booking.status as BookingStatus;
    if (!canTransition(currentStatus, newStatus)) {
      throw new Error(`No se puede cambiar de ${currentStatus} a ${newStatus}`);
    }

    // Prepare update data
    const updateData: TutoringBookingUpdate = { status: newStatus };

    // Add timestamp for specific transitions
    const timestampField = getTimestampFieldForStatus(newStatus);
    if (timestampField) {
      updateData[timestampField] = new Date().toISOString();
    }

    // Update booking
    const { data, error } = await supabase
      .from('tutoring_bookings')
      .update(updateData)
      .eq('id', bookingId)
      .select(
        `
        *,
        session:tutoring_sessions!tutoring_bookings_session_id_fkey(
          *,
          tutor:users!tutoring_sessions_tutor_id_fkey(
            id, full_name, avatar_url, rating, total_tutoring_sessions, career
          ),
          category:categories(id, name, icon)
        ),
        tutor:users!tutoring_bookings_tutor_id_fkey(id, full_name, avatar_url, phone),
        student:users!tutoring_bookings_student_id_fkey(id, full_name, avatar_url, phone)
      `
      )
      .single();

    return unwrapData(data, error) as TutoringBookingWithDetails;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

// Cancel booking
export const cancelBooking = async (
  bookingId: string,
  currentUserId: string
): Promise<TutoringBookingWithDetails> => {
  return updateBookingStatus(bookingId, 'cancelled', currentUserId);
};

// Confirm booking (tutor only)
export const confirmBooking = async (
  bookingId: string,
  tutorId: string
): Promise<TutoringBookingWithDetails> => {
  return updateBookingStatus(bookingId, 'confirmed', tutorId);
};

// Reject booking (tutor only) - same as cancel
export const rejectBooking = async (
  bookingId: string,
  tutorId: string
): Promise<TutoringBookingWithDetails> => {
  return updateBookingStatus(bookingId, 'cancelled', tutorId);
};

// Start session (tutor only)
export const startSession = async (
  bookingId: string,
  tutorId: string
): Promise<TutoringBookingWithDetails> => {
  return updateBookingStatus(bookingId, 'in_progress', tutorId);
};

// Complete session (tutor only)
export const completeSession = async (
  bookingId: string,
  tutorId: string
): Promise<TutoringBookingWithDetails> => {
  return updateBookingStatus(bookingId, 'completed', tutorId);
};

// Mark no-show (tutor only)
export const markNoShow = async (
  bookingId: string,
  tutorId: string
): Promise<TutoringBookingWithDetails> => {
  return updateBookingStatus(bookingId, 'no_show', tutorId);
};

// Get tutor bookings with status filter
export const getTutorBookingsWithFilter = async (
  tutorId: string,
  filters?: BookingFilters
): Promise<TutoringBookingWithDetails[]> => {
  try {
    let query = supabase
      .from('tutoring_bookings')
      .select(
        `
        *,
        session:tutoring_sessions!tutoring_bookings_session_id_fkey(
          *,
          tutor:users!tutoring_sessions_tutor_id_fkey(
            id, full_name, avatar_url, rating, total_tutoring_sessions, career
          ),
          category:categories(id, name, icon)
        ),
        student:users!tutoring_bookings_student_id_fkey(
          id, full_name, avatar_url, phone, student_id, career
        )
      `
      )
      .eq('tutor_id', tutorId)
      .order('scheduled_date', { ascending: false });

    // Apply status filter
    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    }

    // Apply date range filter
    if (filters?.from_date) {
      query = query.gte('scheduled_date', filters.from_date);
    }
    if (filters?.to_date) {
      query = query.lte('scheduled_date', filters.to_date);
    }

    const { data, error } = await query;
    return unwrapData(data, error) as TutoringBookingWithDetails[];
  } catch (error) {
    console.error('Error getting tutor bookings:', error);
    throw error;
  }
};

// Get student bookings with status filter
export const getStudentBookingsWithFilter = async (
  studentId: string,
  filters?: BookingFilters
): Promise<TutoringBookingWithDetails[]> => {
  try {
    let query = supabase
      .from('tutoring_bookings')
      .select(
        `
        *,
        session:tutoring_sessions!tutoring_bookings_session_id_fkey(
          *,
          tutor:users!tutoring_sessions_tutor_id_fkey(
            id, full_name, avatar_url, rating, total_tutoring_sessions, career
          ),
          category:categories(id, name, icon)
        ),
        tutor:users!tutoring_bookings_tutor_id_fkey(id, full_name, avatar_url, phone),
        student:users!tutoring_bookings_student_id_fkey(id, full_name, avatar_url, phone)
      `
      )
      .eq('student_id', studentId)
      .order('scheduled_date', { ascending: false });

    // Apply status filter
    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    }

    // Apply date range filter
    if (filters?.from_date) {
      query = query.gte('scheduled_date', filters.from_date);
    }
    if (filters?.to_date) {
      query = query.lte('scheduled_date', filters.to_date);
    }

    const { data, error } = await query;
    return unwrapData(data, error) as TutoringBookingWithDetails[];
  } catch (error) {
    console.error('Error getting student bookings:', error);
    throw error;
  }
};

// ==================== REVIEW FUNCTIONS ====================

// Add review to completed booking
export const addBookingReview = async (
  bookingId: string,
  studentId: string,
  review: BookingReview
): Promise<void> => {
  try {
    // Validate booking exists and belongs to student
    const { data: booking, error: fetchError } = await supabase
      .from('tutoring_bookings')
      .select('id, student_id, status, student_rating')
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      throw new Error('Reserva no encontrada');
    }

    if (booking.student_id !== studentId) {
      throw new Error('Solo puedes calificar tus propias reservas');
    }

    if (booking.status !== 'completed') {
      throw new Error('Solo puedes calificar sesiones completadas');
    }

    if (booking.student_rating !== null) {
      throw new Error('Ya has calificado esta sesión');
    }

    // Validate rating
    if (review.rating < 1 || review.rating > 5) {
      throw new Error('La calificación debe estar entre 1 y 5');
    }

    // Update booking with review
    const { error: updateError } = await supabase
      .from('tutoring_bookings')
      .update({
        student_rating: review.rating,
        student_review: review.review || null,
      })
      .eq('id', bookingId);

    if (updateError) {
      handleSupabaseError(updateError);
    }

    // Update session average rating
    await updateSessionRating(booking.id);
  } catch (error) {
    console.error('Error adding booking review:', error);
    throw error;
  }
};

// Helper to update session average rating
const updateSessionRating = async (bookingId: string): Promise<void> => {
  try {
    // Get session ID from booking
    const { data: booking } = await supabase
      .from('tutoring_bookings')
      .select('session_id')
      .eq('id', bookingId)
      .single();

    if (!booking) return;

    // Calculate new average rating
    const { data: ratings } = await supabase
      .from('tutoring_bookings')
      .select('student_rating')
      .eq('session_id', booking.session_id)
      .not('student_rating', 'is', null);

    if (ratings && ratings.length > 0) {
      const avgRating =
        ratings.reduce((sum, r) => sum + (r.student_rating || 0), 0) / ratings.length;

      await supabase
        .from('tutoring_sessions')
        .update({
          rating: Math.round(avgRating * 10) / 10,
          total_bookings: ratings.length,
        })
        .eq('id', booking.session_id);
    }
  } catch (error) {
    console.error('Error updating session rating:', error);
  }
};

// Get reviews for a session
export const getSessionReviews = async (
  sessionId: string
): Promise<Array<{
  id: string;
  student_rating: number;
  student_review: string | null;
  completed_at: string | null;
  student: { full_name: string; avatar_url: string | null };
}>> => {
  try {
    const { data, error } = await supabase
      .from('tutoring_bookings')
      .select(
        `
        id,
        student_rating,
        student_review,
        completed_at,
        student:users!tutoring_bookings_student_id_fkey(full_name, avatar_url)
      `
      )
      .eq('session_id', sessionId)
      .eq('status', 'completed')
      .not('student_rating', 'is', null)
      .order('completed_at', { ascending: false });

    return unwrapData(data, error) as any;
  } catch (error) {
    console.error('Error getting session reviews:', error);
    throw error;
  }
};

// ==================== SESSION MANAGEMENT FUNCTIONS ====================

// Pause tutoring session
export const pauseTutoringSession = async (
  sessionId: string,
  tutorId: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('tutoring_sessions')
      .update({ status: 'paused' })
      .eq('id', sessionId)
      .eq('tutor_id', tutorId);

    if (error) {
      handleSupabaseError(error);
    }
  } catch (error) {
    console.error('Error pausing tutoring session:', error);
    throw error;
  }
};

// Activate tutoring session
export const activateTutoringSession = async (
  sessionId: string,
  tutorId: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('tutoring_sessions')
      .update({ status: 'active' })
      .eq('id', sessionId)
      .eq('tutor_id', tutorId);

    if (error) {
      handleSupabaseError(error);
    }
  } catch (error) {
    console.error('Error activating tutoring session:', error);
    throw error;
  }
};

// Get tutor's own sessions (including paused)
export const getMyTutoringSessions = async (
  tutorId: string
): Promise<TutoringSessionWithTutor[]> => {
  try {
    const { data, error } = await supabase
      .from('tutoring_sessions')
      .select(
        `
        *,
        tutor:users!tutoring_sessions_tutor_id_fkey(
          id, full_name, avatar_url, rating, total_tutoring_sessions, career
        ),
        category:categories(id, name, icon)
      `
      )
      .eq('tutor_id', tutorId)
      .in('status', ['active', 'paused'])
      .order('created_at', { ascending: false });

    return unwrapData(data, error, 'getMyTutoringSessions') as TutoringSessionWithTutor[];
  } catch (error) {
    console.error('Error getting my tutoring sessions:', error);
    throw error;
  }
};

// ==================== FAVORITES FUNCTIONS ====================

// Get user's favorite tutoring sessions
export const getUserTutoringFavorites = async (
  userId: string
): Promise<TutoringSessionWithTutor[]> => {
  try {
    // Get favorite session IDs
    const { data: favorites, error: favError } = await supabase
      .from('favorites')
      .select('tutoring_session_id')
      .eq('user_id', userId)
      .eq('item_type', 'tutoring_session');

    if (favError) {
      handleSupabaseError(favError);
    }

    if (!favorites || favorites.length === 0) {
      return [];
    }

    const sessionIds = favorites.map((f) => f.tutoring_session_id).filter(Boolean) as string[];

    // Get session details
    const { data, error } = await supabase
      .from('tutoring_sessions')
      .select(
        `
        *,
        tutor:users!tutoring_sessions_tutor_id_fkey(
          id, full_name, avatar_url, rating, total_tutoring_sessions, career
        ),
        category:categories(id, name, icon)
      `
      )
      .in('id', sessionIds)
      .eq('status', 'active');

    const sessions = unwrapData(data, error) as TutoringSessionWithTutor[];
    return sessions.map((s) => ({ ...s, is_favorite: true }));
  } catch (error) {
    console.error('Error getting user tutoring favorites:', error);
    throw error;
  }
};

// Check if session is favorite
export const isSessionFavorite = async (
  sessionId: string,
  userId: string
): Promise<boolean> => {
  try {
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('tutoring_session_id', sessionId)
      .eq('item_type', 'tutoring_session')
      .single();

    return !!data;
  } catch {
    return false;
  }
};

// Get booked slots for a session on a specific date
export const getBookedSlots = async (
  sessionId: string,
  date: string
): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('tutoring_bookings')
      .select('scheduled_time')
      .eq('session_id', sessionId)
      .eq('scheduled_date', date)
      .not('status', 'in', '("cancelled","no_show")');

    if (error) {
      console.error('Error getting booked slots:', error);
      return [];
    }

    return data?.map((b) => b.scheduled_time) || [];
  } catch (error) {
    console.error('Error getting booked slots:', error);
    return [];
  }
};
