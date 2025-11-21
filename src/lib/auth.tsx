import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase, getUserProfile } from './supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// Tipo del perfil extendido del usuario
type UserProfile = Database['public']['Tables']['users']['Row'];

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  studentId?: string;
  career?: string;
  semester?: number;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  rating?: number;
  total_sales?: number;
  total_tutoring_sessions?: number;
  is_verified?: boolean;
  is_tutor?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar perfil completo del usuario
  const loadUserProfile = async (authUser: SupabaseUser) => {
    try {
      const userProfile = await getUserProfile(authUser.id);

      if (userProfile) {
        setProfile(userProfile);

        // Mapear perfil a formato User (mantener compatibilidad con componentes existentes)
        setUser({
          id: userProfile.id,
          name: userProfile.full_name,
          email: userProfile.email,
          role: userProfile.role,
          studentId: userProfile.student_id || undefined,
          career: userProfile.career || undefined,
          semester: userProfile.semester || undefined,
          phone: userProfile.phone || undefined,
          avatar_url: userProfile.avatar_url || undefined,
          bio: userProfile.bio || undefined,
          rating: userProfile.rating,
          total_sales: userProfile.total_sales,
          total_tutoring_sessions: userProfile.total_tutoring_sessions,
          is_verified: userProfile.is_verified,
          is_tutor: userProfile.is_tutor,
        });
      }
    } catch (error) {
      console.error('Error cargando perfil de usuario:', error);
    }
  };

  // Inicializar sesión al cargar la aplicación
  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);

      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);

      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        await loadUserProfile(data.user);
      }
    } catch (error: any) {
      console.error('Error en login:', error);

      // Mensajes de error más amigables
      if (error.message?.includes('Invalid login credentials')) {
        throw new Error('Credenciales inválidas. Verifica tu email y contraseña.');
      } else if (error.message?.includes('Email not confirmed')) {
        throw new Error('Por favor, confirma tu email antes de iniciar sesión.');
      } else {
        throw new Error(error.message || 'Error al iniciar sesión');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        throw error;
      }

      // Nota: El perfil se crea automáticamente con el trigger on_auth_user_created
      // Si el usuario necesita confirmar su email, data.user existirá pero no podrá iniciar sesión hasta confirmar

      if (data.user) {
        // Si la confirmación de email está deshabilitada, cargar perfil inmediatamente
        if (data.session) {
          await loadUserProfile(data.user);
        }
      }
    } catch (error: any) {
      console.error('Error en registro:', error);

      // Mensajes de error más amigables
      if (error.message?.includes('User already registered')) {
        throw new Error('Este email ya está registrado. Intenta iniciar sesión.');
      } else if (error.message?.includes('Password should be at least')) {
        throw new Error('La contraseña debe tener al menos 6 caracteres.');
      } else {
        throw new Error(error.message || 'Error al registrarse');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error: any) {
      console.error('Error en logout:', error);
      throw new Error(error.message || 'Error al cerrar sesión');
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      throw new Error('No hay usuario autenticado');
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setProfile(data);

        // Actualizar también el estado user
        setUser({
          ...user,
          name: data.full_name,
          role: data.role,
          studentId: data.student_id || undefined,
          career: data.career || undefined,
          semester: data.semester || undefined,
          phone: data.phone || undefined,
          avatar_url: data.avatar_url || undefined,
          bio: data.bio || undefined,
          rating: data.rating,
          is_verified: data.is_verified,
          is_tutor: data.is_tutor,
        });
      }
    } catch (error: any) {
      console.error('Error actualizando perfil:', error);
      throw new Error(error.message || 'Error al actualizar perfil');
    }
  };

  const value = {
    user,
    profile,
    session,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user && !!session,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
