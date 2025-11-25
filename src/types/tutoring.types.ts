import type { Database } from './database.types';

// Base types from database
export type TutoringSession = Database['public']['Tables']['tutoring_sessions']['Row'];
export type TutoringSessionInsert = Database['public']['Tables']['tutoring_sessions']['Insert'];
export type TutoringSessionUpdate = Database['public']['Tables']['tutoring_sessions']['Update'];
export type TutoringBooking = Database['public']['Tables']['tutoring_bookings']['Row'];
export type TutoringBookingInsert = Database['public']['Tables']['tutoring_bookings']['Insert'];
export type TutoringBookingUpdate = Database['public']['Tables']['tutoring_bookings']['Update'];
export type Category = Database['public']['Tables']['categories']['Row'];

// Available hours JSON schema
export type SlotRange =
  | '06:00-10:00'
  | '10:00-14:00'
  | '14:00-18:00'
  | '18:00-22:00';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface AvailableHours {
  monday?: SlotRange[];
  tuesday?: SlotRange[];
  wednesday?: SlotRange[];
  thursday?: SlotRange[];
  friday?: SlotRange[];
  saturday?: SlotRange[];
  sunday?: SlotRange[];
}

// Display labels for days in Spanish
export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

// Slot labels for display
export const SLOT_LABELS: Record<SlotRange, string> = {
  '06:00-10:00': '6:00 AM - 10:00 AM',
  '10:00-14:00': '10:00 AM - 2:00 PM',
  '14:00-18:00': '2:00 PM - 6:00 PM',
  '18:00-22:00': '6:00 PM - 10:00 PM',
};

// All available slots
export const ALL_SLOTS: SlotRange[] = [
  '06:00-10:00',
  '10:00-14:00',
  '14:00-18:00',
  '18:00-22:00',
];

// All days of week
export const ALL_DAYS: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

// Session mode types
export type SessionMode = 'presential' | 'online' | 'both';

export const MODE_LABELS: Record<SessionMode, string> = {
  presential: 'Presencial',
  online: 'Virtual',
  both: 'Presencial y Virtual',
};

// Session status types
export type SessionStatus = 'active' | 'paused' | 'deleted';

// Booking status types
export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  in_progress: 'En Progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No Asistió',
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-gray-100 text-gray-800',
};

// Extended types with relations
export interface TutorInfo {
  id: string;
  full_name: string;
  avatar_url: string | null;
  rating: number | null;
  total_tutoring_sessions: number | null;
  career: string | null;
  phone?: string | null;
}

export interface CategoryInfo {
  id: string;
  name: string;
  icon: string | null;
}

export interface TutoringSessionWithTutor extends TutoringSession {
  tutor: TutorInfo;
  category: CategoryInfo | null;
  is_favorite?: boolean;
}

export interface StudentInfo {
  id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  student_id?: string | null;
  career?: string | null;
}

export interface TutoringBookingWithDetails extends TutoringBooking {
  session: TutoringSessionWithTutor;
  tutor: TutorInfo;
  student: StudentInfo;
}

// Filter types for queries
export interface TutoringFilters {
  category_id?: string;
  subject?: string;
  mode?: SessionMode;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  search?: string;
  tutor_id?: string;
  availability_day?: DayOfWeek;
  only_favorites?: boolean;
  exclude_own?: boolean;
}

export interface BookingFilters {
  status?: BookingStatus | BookingStatus[];
  from_date?: string;
  to_date?: string;
}

// Form data types
export interface CreateSessionFormData {
  title: string;
  description: string;
  subject: string;
  category_id?: string;
  price_per_hour: number;
  duration_minutes: number;
  mode: SessionMode;
  location?: string;
  meeting_url?: string;
  max_students?: number;
  available_hours: AvailableHours;
}

export interface CreateBookingFormData {
  session_id: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  notes?: string;
}

// Review types
export interface BookingReview {
  rating: number;
  review?: string;
}
