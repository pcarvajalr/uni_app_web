import { supabase, handleSupabaseError, unwrapData } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Notification = Database['public']['Tables']['notifications']['Row'];
type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
type NotificationUpdate = Database['public']['Tables']['notifications']['Update'];

// Obtener notificaciones del usuario
export const getUserNotifications = async (userId: string, limit: number = 50) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return unwrapData(data, error);
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    throw error;
  }
};

// Obtener notificaciones no leídas del usuario
export const getUnreadNotifications = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    return unwrapData(data, error);
  } catch (error) {
    console.error('Error obteniendo notificaciones no leídas:', error);
    throw error;
  }
};

// Contar notificaciones no leídas
export const getUnreadCount = async (userId: string) => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      handleSupabaseError(error);
    }

    return count || 0;
  } catch (error) {
    console.error('Error contando notificaciones no leídas:', error);
    throw error;
  }
};

// Marcar notificación como leída
export const markAsRead = async (notificationId: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', notificationId)
      .select()
      .single();

    return unwrapData(data, error);
  } catch (error) {
    console.error('Error marcando notificación como leída:', error);
    throw error;
  }
};

// Marcar todas las notificaciones como leídas
export const markAllAsRead = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      handleSupabaseError(error);
    }

    return true;
  } catch (error) {
    console.error('Error marcando todas las notificaciones como leídas:', error);
    throw error;
  }
};

// Eliminar una notificación
export const deleteNotification = async (notificationId: string) => {
  try {
    const { error } = await supabase.from('notifications').delete().eq('id', notificationId);

    if (error) {
      handleSupabaseError(error);
    }

    return true;
  } catch (error) {
    console.error('Error eliminando notificación:', error);
    throw error;
  }
};

// Eliminar todas las notificaciones del usuario
export const deleteAllNotifications = async (userId: string) => {
  try {
    const { error } = await supabase.from('notifications').delete().eq('user_id', userId);

    if (error) {
      handleSupabaseError(error);
    }

    return true;
  } catch (error) {
    console.error('Error eliminando todas las notificaciones:', error);
    throw error;
  }
};

// Crear una nueva notificación
export const createNotification = async (notification: Omit<NotificationInsert, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase.from('notifications').insert(notification).select().single();

    return unwrapData(data, error);
  } catch (error) {
    console.error('Error creando notificación:', error);
    throw error;
  }
};

// Suscribirse a notificaciones en tiempo real
export const subscribeToNotifications = (userId: string, callback: (notification: Notification) => void) => {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as Notification);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Helpers para crear notificaciones específicas
export const notifyNewMessage = async (userId: string, senderName: string, senderId: string) => {
  return createNotification({
    user_id: userId,
    type: 'message',
    title: 'Nuevo mensaje',
    body: `${senderName} te ha enviado un mensaje`,
    data: { sender_id: senderId },
    action_url: '/messages',
  });
};

export const notifyProductSold = async (sellerId: string, productTitle: string, productId: string) => {
  return createNotification({
    user_id: sellerId,
    type: 'sale',
    title: 'Producto vendido',
    body: `Tu producto "${productTitle}" ha sido vendido`,
    data: { product_id: productId },
    action_url: `/marketplace/${productId}`,
  });
};

export const notifyTutoringBooked = async (tutorId: string, studentName: string, bookingId: string) => {
  return createNotification({
    user_id: tutorId,
    type: 'booking',
    title: 'Nueva reserva de tutoría',
    body: `${studentName} ha reservado una sesión contigo`,
    data: { booking_id: bookingId },
    action_url: '/tutoring/my-sessions',
  });
};

export const notifyTutoringConfirmed = async (studentId: string, tutorName: string, bookingId: string) => {
  return createNotification({
    user_id: studentId,
    type: 'booking',
    title: 'Tutoría confirmada',
    body: `${tutorName} ha confirmado tu reserva`,
    data: { booking_id: bookingId },
    action_url: '/tutoring/my-sessions',
  });
};

export const notifyNewReview = async (userId: string, reviewerName: string, rating: number) => {
  return createNotification({
    user_id: userId,
    type: 'review',
    title: 'Nueva reseña',
    body: `${reviewerName} te ha dejado una reseña de ${rating} estrellas`,
    action_url: '/settings',
  });
};

export const notifySecurityAlert = async (userId: string, alertTitle: string, reportId: string) => {
  return createNotification({
    user_id: userId,
    type: 'security',
    title: 'Alerta de seguridad',
    body: alertTitle,
    data: { report_id: reportId },
    action_url: `/reports/${reportId}`,
  });
};
