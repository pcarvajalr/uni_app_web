export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      campus_locations: {
        Row: {
          address: string | null
          amenities: string[] | null
          building: string | null
          coordinate_x: number
          coordinate_y: number
          created_at: string | null
          description: string | null
          email: string | null
          floor: string | null
          icon: string | null
          id: string
          images: string[] | null
          is_accessible: boolean | null
          name: string
          opening_hours: Json | null
          phone: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          building?: string | null
          coordinate_x: number
          coordinate_y: number
          created_at?: string | null
          description?: string | null
          email?: string | null
          floor?: string | null
          icon?: string | null
          id?: string
          images?: string[] | null
          is_accessible?: boolean | null
          name: string
          opening_hours?: Json | null
          phone?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          building?: string | null
          coordinate_x?: number
          coordinate_y?: number
          created_at?: string | null
          description?: string | null
          email?: string | null
          floor?: string | null
          icon?: string | null
          id?: string
          images?: string[] | null
          is_accessible?: boolean | null
          name?: string
          opening_hours?: Json | null
          phone?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      campus_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campus_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          applicable_to: string | null
          category_ids: string[] | null
          code: string
          created_at: string | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          image_url: string | null
          is_active: boolean | null
          max_discount_amount: number | null
          min_purchase_amount: number | null
          title: string
          usage_limit: number | null
          usage_per_user: number | null
          used_count: number | null
          valid_from: string | null
          valid_until: string
        }
        Insert: {
          applicable_to?: string | null
          category_ids?: string[] | null
          code: string
          created_at?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_purchase_amount?: number | null
          title: string
          usage_limit?: number | null
          usage_per_user?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until: string
        }
        Update: {
          applicable_to?: string | null
          category_ids?: string[] | null
          code?: string
          created_at?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_purchase_amount?: number | null
          title?: string
          usage_limit?: number | null
          usage_per_user?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          campus_location_id: string | null
          created_at: string | null
          id: string
          item_type: string
          product_id: string | null
          tutoring_session_id: string | null
          user_id: string
        }
        Insert: {
          campus_location_id?: string | null
          created_at?: string | null
          id?: string
          item_type: string
          product_id?: string | null
          tutoring_session_id?: string | null
          user_id: string
        }
        Update: {
          campus_location_id?: string | null
          created_at?: string | null
          id?: string
          item_type?: string
          product_id?: string | null
          tutoring_session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_campus_location_id_fkey"
            columns: ["campus_location_id"]
            isOneToOne: false
            referencedRelation: "campus_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_tutoring_session_id_fkey"
            columns: ["tutoring_session_id"]
            isOneToOne: false
            referencedRelation: "tutoring_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          images: string[] | null
          is_read: boolean | null
          product_id: string | null
          read_at: string | null
          recipient_id: string
          sender_id: string
          tutoring_session_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          images?: string[] | null
          is_read?: boolean | null
          product_id?: string | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
          tutoring_session_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          images?: string[] | null
          is_read?: boolean | null
          product_id?: string | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          tutoring_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_tutoring_session_id_fkey"
            columns: ["tutoring_session_id"]
            isOneToOne: false
            referencedRelation: "tutoring_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string
          created_at: string | null
          data: Json | null
          id: string
          image_url: string | null
          is_read: boolean | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          body: string
          created_at?: string | null
          data?: Json | null
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          body?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          condition: string | null
          created_at: string | null
          description: string
          favorites_count: number | null
          id: string
          images: string[] | null
          is_negotiable: boolean | null
          location: string | null
          price: number
          seller_id: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          category_id?: string | null
          condition?: string | null
          created_at?: string | null
          description: string
          favorites_count?: number | null
          id?: string
          images?: string[] | null
          is_negotiable?: boolean | null
          location?: string | null
          price: number
          seller_id: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          category_id?: string | null
          condition?: string | null
          created_at?: string | null
          description?: string
          favorites_count?: number | null
          id?: string
          images?: string[] | null
          is_negotiable?: boolean | null
          location?: string | null
          price?: number
          seller_id?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          assigned_to: string | null
          category: string | null
          created_at: string | null
          description: string
          id: string
          images: string[] | null
          is_anonymous: boolean | null
          location: string
          location_coordinates: unknown
          location_id: string | null
          priority: string | null
          reporter_id: string | null
          resolution_notes: string | null
          resolved_at: string | null
          status: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          description: string
          id?: string
          images?: string[] | null
          is_anonymous?: boolean | null
          location: string
          location_coordinates?: unknown
          location_id?: string | null
          priority?: string | null
          reporter_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          description?: string
          id?: string
          images?: string[] | null
          is_anonymous?: boolean | null
          location?: string
          location_coordinates?: unknown
          location_id?: string | null
          priority?: string | null
          reporter_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "campus_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string | null
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          reviewee_id: string
          reviewer_id: string
          sale_id: string | null
          type: string
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          reviewee_id: string
          reviewer_id: string
          sale_id?: string | null
          type: string
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          reviewee_id?: string
          reviewer_id?: string
          sale_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "tutoring_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          amount: number
          buyer_id: string
          completed_at: string | null
          created_at: string | null
          id: string
          notes: string | null
          payment_method: string | null
          product_id: string
          seller_id: string
          status: string | null
        }
        Insert: {
          amount: number
          buyer_id: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          product_id: string
          seller_id: string
          status?: string | null
        }
        Update: {
          amount?: number
          buyer_id?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          product_id?: string
          seller_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tutoring_bookings: {
        Row: {
          completed_at: string | null
          confirmed_at: string | null
          created_at: string | null
          duration_minutes: number
          id: string
          location: string | null
          meeting_url: string | null
          notes: string | null
          scheduled_date: string
          scheduled_time: string
          session_id: string
          status: string | null
          student_id: string
          student_rating: number | null
          student_review: string | null
          total_price: number
          tutor_id: string
          tutor_notes: string | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          duration_minutes: number
          id?: string
          location?: string | null
          meeting_url?: string | null
          notes?: string | null
          scheduled_date: string
          scheduled_time: string
          session_id: string
          status?: string | null
          student_id: string
          student_rating?: number | null
          student_review?: string | null
          total_price: number
          tutor_id: string
          tutor_notes?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          duration_minutes?: number
          id?: string
          location?: string | null
          meeting_url?: string | null
          notes?: string | null
          scheduled_date?: string
          scheduled_time?: string
          session_id?: string
          status?: string | null
          student_id?: string
          student_rating?: number | null
          student_review?: string | null
          total_price?: number
          tutor_id?: string
          tutor_notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tutoring_bookings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "tutoring_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutoring_bookings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutoring_bookings_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tutoring_sessions: {
        Row: {
          available_days: string[] | null
          available_hours: string | null
          category_id: string | null
          created_at: string | null
          description: string
          duration_minutes: number
          id: string
          location: string | null
          max_students: number | null
          meeting_url: string | null
          mode: string
          price_per_hour: number
          rating: number | null
          status: string | null
          subject: string
          title: string
          total_bookings: number | null
          tutor_id: string
          updated_at: string | null
        }
        Insert: {
          available_days?: string[] | null
          available_hours?: string | null
          category_id?: string | null
          created_at?: string | null
          description: string
          duration_minutes: number
          id?: string
          location?: string | null
          max_students?: number | null
          meeting_url?: string | null
          mode: string
          price_per_hour: number
          rating?: number | null
          status?: string | null
          subject: string
          title: string
          total_bookings?: number | null
          tutor_id: string
          updated_at?: string | null
        }
        Update: {
          available_days?: string[] | null
          available_hours?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string
          duration_minutes?: number
          id?: string
          location?: string | null
          max_students?: number | null
          meeting_url?: string | null
          mode?: string
          price_per_hour?: number
          rating?: number | null
          status?: string | null
          subject?: string
          title?: string
          total_bookings?: number | null
          tutor_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tutoring_sessions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutoring_sessions_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_coupons: {
        Row: {
          coupon_id: string
          created_at: string | null
          id: string
          last_used_at: string | null
          used_count: number | null
          user_id: string
        }
        Insert: {
          coupon_id: string
          created_at?: string | null
          id?: string
          last_used_at?: string | null
          used_count?: number | null
          user_id: string
        }
        Update: {
          coupon_id?: string
          created_at?: string | null
          id?: string
          last_used_at?: string | null
          used_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_coupons_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_coupons_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          campus: string | null
          career: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_profile_public: boolean | null
          is_tutor: boolean | null
          is_verified: boolean | null
          phone: string | null
          rating: number | null
          role: string
          semester: number | null
          student_id: string | null
          total_sales: number | null
          total_tutoring_sessions: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          campus?: string | null
          career?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          is_profile_public?: boolean | null
          is_tutor?: boolean | null
          is_verified?: boolean | null
          phone?: string | null
          rating?: number | null
          role?: string
          semester?: number | null
          student_id?: string | null
          total_sales?: number | null
          total_tutoring_sessions?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          campus?: string | null
          career?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_profile_public?: boolean | null
          is_tutor?: boolean | null
          is_verified?: boolean | null
          phone?: string | null
          rating?: number | null
          role?: string
          semester?: number | null
          student_id?: string | null
          total_sales?: number | null
          total_tutoring_sessions?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
