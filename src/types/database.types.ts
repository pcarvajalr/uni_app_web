export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          phone: string | null
          student_id: string | null
          career: string | null
          semester: number | null
          campus: string | null
          bio: string | null
          rating: number
          total_sales: number
          total_tutoring_sessions: number
          is_verified: boolean
          is_tutor: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          avatar_url?: string | null
          phone?: string | null
          student_id?: string | null
          career?: string | null
          semester?: number | null
          campus?: string | null
          bio?: string | null
          rating?: number
          total_sales?: number
          total_tutoring_sessions?: number
          is_verified?: boolean
          is_tutor?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          phone?: string | null
          student_id?: string | null
          career?: string | null
          semester?: number | null
          campus?: string | null
          bio?: string | null
          rating?: number
          total_sales?: number
          total_tutoring_sessions?: number
          is_verified?: boolean
          is_tutor?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          type: 'product' | 'tutoring' | 'both'
          icon: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'product' | 'tutoring' | 'both'
          icon?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'product' | 'tutoring' | 'both'
          icon?: string | null
          description?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          seller_id: string
          category_id: string | null
          title: string
          description: string
          price: number
          images: string[]
          condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor' | null
          status: 'available' | 'sold' | 'reserved' | 'deleted'
          location: string | null
          views: number
          favorites_count: number
          is_negotiable: boolean
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          category_id?: string | null
          title: string
          description: string
          price: number
          images?: string[]
          condition?: 'new' | 'like_new' | 'good' | 'fair' | 'poor' | null
          status?: 'available' | 'sold' | 'reserved' | 'deleted'
          location?: string | null
          views?: number
          favorites_count?: number
          is_negotiable?: boolean
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          category_id?: string | null
          title?: string
          description?: string
          price?: number
          images?: string[]
          condition?: 'new' | 'like_new' | 'good' | 'fair' | 'poor' | null
          status?: 'available' | 'sold' | 'reserved' | 'deleted'
          location?: string | null
          views?: number
          favorites_count?: number
          is_negotiable?: boolean
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          product_id: string
          seller_id: string
          buyer_id: string
          amount: number
          status: 'pending' | 'completed' | 'cancelled' | 'refunded'
          payment_method: string | null
          notes: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          seller_id: string
          buyer_id: string
          amount: number
          status?: 'pending' | 'completed' | 'cancelled' | 'refunded'
          payment_method?: string | null
          notes?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          seller_id?: string
          buyer_id?: string
          amount?: number
          status?: 'pending' | 'completed' | 'cancelled' | 'refunded'
          payment_method?: string | null
          notes?: string | null
          completed_at?: string | null
          created_at?: string
        }
      }
      tutoring_sessions: {
        Row: {
          id: string
          tutor_id: string
          category_id: string | null
          subject: string
          title: string
          description: string
          price_per_hour: number
          duration_minutes: number
          mode: 'presential' | 'online' | 'both'
          location: string | null
          meeting_url: string | null
          max_students: number
          available_days: string[]
          available_hours: string | null
          status: 'active' | 'paused' | 'deleted'
          rating: number
          total_bookings: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tutor_id: string
          category_id?: string | null
          subject: string
          title: string
          description: string
          price_per_hour: number
          duration_minutes: number
          mode: 'presential' | 'online' | 'both'
          location?: string | null
          meeting_url?: string | null
          max_students?: number
          available_days?: string[]
          available_hours?: string | null
          status?: 'active' | 'paused' | 'deleted'
          rating?: number
          total_bookings?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tutor_id?: string
          category_id?: string | null
          subject?: string
          title?: string
          description?: string
          price_per_hour?: number
          duration_minutes?: number
          mode?: 'presential' | 'online' | 'both'
          location?: string | null
          meeting_url?: string | null
          max_students?: number
          available_days?: string[]
          available_hours?: string | null
          status?: 'active' | 'paused' | 'deleted'
          rating?: number
          total_bookings?: number
          created_at?: string
          updated_at?: string
        }
      }
      tutoring_bookings: {
        Row: {
          id: string
          session_id: string
          tutor_id: string
          student_id: string
          scheduled_date: string
          scheduled_time: string
          duration_minutes: number
          total_price: number
          status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          meeting_url: string | null
          location: string | null
          notes: string | null
          student_rating: number | null
          student_review: string | null
          tutor_notes: string | null
          confirmed_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          tutor_id: string
          student_id: string
          scheduled_date: string
          scheduled_time: string
          duration_minutes: number
          total_price: number
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          meeting_url?: string | null
          location?: string | null
          notes?: string | null
          student_rating?: number | null
          student_review?: string | null
          tutor_notes?: string | null
          confirmed_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          tutor_id?: string
          student_id?: string
          scheduled_date?: string
          scheduled_time?: string
          duration_minutes?: number
          total_price?: number
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          meeting_url?: string | null
          location?: string | null
          notes?: string | null
          student_rating?: number | null
          student_review?: string | null
          tutor_notes?: string | null
          confirmed_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          reporter_id: string | null
          type: 'security' | 'emergency' | 'maintenance' | 'lost_found' | 'other'
          category: string | null
          title: string
          description: string
          location: string
          location_coordinates: string | null
          images: string[]
          priority: 'low' | 'medium' | 'high' | 'critical'
          status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'rejected'
          assigned_to: string | null
          is_anonymous: boolean
          resolution_notes: string | null
          resolved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reporter_id?: string | null
          type: 'security' | 'emergency' | 'maintenance' | 'lost_found' | 'other'
          category?: string | null
          title: string
          description: string
          location: string
          location_coordinates?: string | null
          images?: string[]
          priority?: 'low' | 'medium' | 'high' | 'critical'
          status?: 'open' | 'in_progress' | 'resolved' | 'closed' | 'rejected'
          assigned_to?: string | null
          is_anonymous?: boolean
          resolution_notes?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string | null
          type?: 'security' | 'emergency' | 'maintenance' | 'lost_found' | 'other'
          category?: string | null
          title?: string
          description?: string
          location?: string
          location_coordinates?: string | null
          images?: string[]
          priority?: 'low' | 'medium' | 'high' | 'critical'
          status?: 'open' | 'in_progress' | 'resolved' | 'closed' | 'rejected'
          assigned_to?: string | null
          is_anonymous?: boolean
          resolution_notes?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'message' | 'sale' | 'booking' | 'review' | 'system' | 'security'
          title: string
          body: string
          data: Json | null
          image_url: string | null
          action_url: string | null
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'message' | 'sale' | 'booking' | 'review' | 'system' | 'security'
          title: string
          body: string
          data?: Json | null
          image_url?: string | null
          action_url?: string | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'message' | 'sale' | 'booking' | 'review' | 'system' | 'security'
          title?: string
          body?: string
          data?: Json | null
          image_url?: string | null
          action_url?: string | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
      coupons: {
        Row: {
          id: string
          code: string
          title: string
          description: string | null
          discount_type: 'percentage' | 'fixed_amount'
          discount_value: number
          min_purchase_amount: number
          max_discount_amount: number | null
          usage_limit: number | null
          usage_per_user: number
          used_count: number
          applicable_to: 'products' | 'tutoring' | 'both' | null
          category_ids: string[]
          valid_from: string
          valid_until: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          title: string
          description?: string | null
          discount_type: 'percentage' | 'fixed_amount'
          discount_value: number
          min_purchase_amount?: number
          max_discount_amount?: number | null
          usage_limit?: number | null
          usage_per_user?: number
          used_count?: number
          applicable_to?: 'products' | 'tutoring' | 'both' | null
          category_ids?: string[]
          valid_from?: string
          valid_until: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          title?: string
          description?: string | null
          discount_type?: 'percentage' | 'fixed_amount'
          discount_value?: number
          min_purchase_amount?: number
          max_discount_amount?: number | null
          usage_limit?: number | null
          usage_per_user?: number
          used_count?: number
          applicable_to?: 'products' | 'tutoring' | 'both' | null
          category_ids?: string[]
          valid_from?: string
          valid_until?: string
          is_active?: boolean
          created_at?: string
        }
      }
      user_coupons: {
        Row: {
          id: string
          user_id: string
          coupon_id: string
          used_count: number
          last_used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          coupon_id: string
          used_count?: number
          last_used_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          coupon_id?: string
          used_count?: number
          last_used_at?: string | null
          created_at?: string
        }
      }
      campus_locations: {
        Row: {
          id: string
          name: string
          type: 'building' | 'cafeteria' | 'library' | 'lab' | 'office' | 'parking' | 'sports' | 'other'
          description: string | null
          building: string | null
          floor: string | null
          coordinates: string
          address: string | null
          phone: string | null
          email: string | null
          opening_hours: Json | null
          images: string[]
          amenities: string[]
          is_accessible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'building' | 'cafeteria' | 'library' | 'lab' | 'office' | 'parking' | 'sports' | 'other'
          description?: string | null
          building?: string | null
          floor?: string | null
          coordinates: string
          address?: string | null
          phone?: string | null
          email?: string | null
          opening_hours?: Json | null
          images?: string[]
          amenities?: string[]
          is_accessible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'building' | 'cafeteria' | 'library' | 'lab' | 'office' | 'parking' | 'sports' | 'other'
          description?: string | null
          building?: string | null
          floor?: string | null
          coordinates?: string
          address?: string | null
          phone?: string | null
          email?: string | null
          opening_hours?: Json | null
          images?: string[]
          amenities?: string[]
          is_accessible?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string
          product_id: string | null
          tutoring_session_id: string | null
          content: string
          images: string[]
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id: string
          product_id?: string | null
          tutoring_session_id?: string | null
          content: string
          images?: string[]
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string
          product_id?: string | null
          tutoring_session_id?: string | null
          content?: string
          images?: string[]
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          item_type: 'product' | 'tutoring_session'
          product_id: string | null
          tutoring_session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_type: 'product' | 'tutoring_session'
          product_id?: string | null
          tutoring_session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          item_type?: 'product' | 'tutoring_session'
          product_id?: string | null
          tutoring_session_id?: string | null
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          reviewer_id: string
          reviewee_id: string
          sale_id: string | null
          booking_id: string | null
          rating: number
          comment: string | null
          type: 'seller' | 'buyer' | 'tutor' | 'student'
          created_at: string
        }
        Insert: {
          id?: string
          reviewer_id: string
          reviewee_id: string
          sale_id?: string | null
          booking_id?: string | null
          rating: number
          comment?: string | null
          type: 'seller' | 'buyer' | 'tutor' | 'student'
          created_at?: string
        }
        Update: {
          id?: string
          reviewer_id?: string
          reviewee_id?: string
          sale_id?: string | null
          booking_id?: string | null
          rating?: number
          comment?: string | null
          type?: 'seller' | 'buyer' | 'tutor' | 'student'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
