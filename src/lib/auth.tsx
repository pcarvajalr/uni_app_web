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
  is_deleted?: boolean;
  deleted_at?: string;
  deletion_scheduled_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{
    success: boolean;
    message: string;
    needsEmailVerification: boolean;
  } | undefined>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInGracePeriod: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sistema de caché persistente para perfiles de usuario
interface ProfileCache {
  profile: UserProfile;
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const CACHE_KEY_PREFIX = 'uni-app-profile-';

// Funciones helper para caché persistente en localStorage
function getProfileFromCache(userId: string): UserProfile | null {
  try {
    const key = `${CACHE_KEY_PREFIX}${userId}`;
    const cached = localStorage.getItem(key);

    if (!cached) return null;

    const { profile, timestamp }: ProfileCache = JSON.parse(cached);

    // Verificar si el caché está expirado
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Error leyendo caché de perfil:', error);
    return null;
  }
}

function setProfileToCache(userId: string, profile: UserProfile): void {
  try {
    const key = `${CACHE_KEY_PREFIX}${userId}`;
    const cache: ProfileCache = {
      profile,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cache));
  } catch (error) {
    console.error('Error guardando caché de perfil:', error);
  }
}

function clearProfileCache(userId: string): void {
  try {
    const key = `${CACHE_KEY_PREFIX}${userId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error limpiando caché de perfil:', error);
  }
}

// Helper para mapear UserProfile a User
function mapProfileToUser(userProfile: UserProfile): User {
  // Access deletion fields with type assertion (they may not be in the type yet)
  const profileAny = userProfile as any;

  return {
    id: userProfile.id,
    name: userProfile.full_name,
    email: userProfile.email,
    role: userProfile.role as 'user' | 'admin',
    studentId: userProfile.student_id || undefined,
    career: userProfile.career || undefined,
    semester: userProfile.semester ?? undefined,
    phone: userProfile.phone || undefined,
    avatar_url: userProfile.avatar_url || undefined,
    is_deleted: profileAny.is_deleted || false,
    deleted_at: profileAny.deleted_at || undefined,
    deletion_scheduled_at: profileAny.deletion_scheduled_at || undefined,
    bio: userProfile.bio || undefined,
    rating: userProfile.rating ?? undefined,
    total_sales: userProfile.total_sales ?? undefined,
    total_tutoring_sessions: userProfile.total_tutoring_sessions ?? undefined,
    is_verified: userProfile.is_verified ?? undefined,
    is_tutor: userProfile.is_tutor ?? undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar perfil completo del usuario con caché persistente
  const loadUserProfile = async (authUser: SupabaseUser) => {
    // Verificar caché persistente primero
    const cachedProfile = getProfileFromCache(authUser.id);
    if (cachedProfile) {
      setProfile(cachedProfile);
      setUser(mapProfileToUser(cachedProfile));
      return;
    }

    try {
      const userProfile = await getUserProfile(authUser.id);

      if (userProfile) {
        // Guardar en caché persistente
        setProfileToCache(authUser.id, userProfile);

        setProfile(userProfile);
        setUser(mapProfileToUser(userProfile));
      }
    } catch (error) {
      console.error('Error cargando perfil de usuario:', error);
      // El caché expirado ya fue verificado arriba, no hacer nada adicional
    }
  };

  // Inicializar sesión al cargar la aplicación
  useEffect(() => {
    // IMPORTANTE: Registrar listener ANTES de getSession() para evitar race conditions
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // React setState es seguro en componentes desmontados, NO abortar
      setSession(session);

      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
      }

      setIsLoading(false);
    });

    // Obtener sesión inicial DESPUÉS de registrar el listener
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        // No verificar mounted aquí - React setState es seguro
        setSession(session);

        if (session?.user) {
          await loadUserProfile(session.user);
        }
      } catch (error) {
        console.error('Error inicializando autenticación:', error);
      } finally {
        // SIEMPRE ejecutar setIsLoading(false), incluso si el componente está desmontado
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
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

      // Verificar que el email esté confirmado
      if (data.user && !data.user.email_confirmed_at) {
        // Cerrar la sesión inmediatamente si el email no está confirmado
        await supabase.auth.signOut();
        throw new Error('Por favor, confirma tu email antes de iniciar sesión. Revisa tu bandeja de entrada (y spam).');
      }

      if (data.user) {
        await loadUserProfile(data.user);
      }
    } catch (error: any) {
      console.error('Error en login:', error);

      // Mensajes de error más amigables
      if (error.message?.includes('Invalid login credentials')) {
        throw new Error('Credenciales inválidas. Verifica tu email y contraseña.');
      } else if (error.message?.includes('Email not confirmed') || error.message?.includes('confirma tu email')) {
        throw new Error('Por favor, confirma tu email antes de iniciar sesión. Revisa tu bandeja de entrada (y spam).');
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
          // Configurar URL de redirección después de confirmar email
          // Usar URL de producción en lugar de window.location.origin para apps móviles
          emailRedirectTo: `${import.meta.env.VITE_APP_URL || window.location.origin}/auth`,
        },
      });

      if (error) {
        throw error;
      }

      // Nota: El perfil se crea automáticamente con el trigger on_auth_user_created
      // El usuario DEBE confirmar su email antes de poder iniciar sesión

      // No iniciar sesión automáticamente - el usuario debe verificar su email primero
      // Mostrar mensaje de éxito en el componente de registro

      return {
        success: true,
        message: 'Cuenta creada exitosamente. Por favor verifica tu email antes de iniciar sesión.',
        needsEmailVerification: !data.session, // Si no hay sesión, necesita verificar email
      };
    } catch (error: any) {
      console.error('Error en registro:', error);

      // Mensajes de error más amigables
      if (error.message?.includes('User already registered')) {
        throw new Error('Este email ya está registrado. Intenta iniciar sesión.');
      } else if (error.message?.includes('Password should be at least')) {
        throw new Error('La contraseña debe tener al menos 8 caracteres.');
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

      // Limpiar caché persistente al cerrar sesión
      if (user?.id) {
        clearProfileCache(user.id);
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
        // Actualizar caché persistente con los nuevos datos
        setProfileToCache(user.id, data);

        setProfile(data);
        setUser(mapProfileToUser(data));
      }
    } catch (error: any) {
      console.error('Error actualizando perfil:', error);
      throw new Error(error.message || 'Error al actualizar perfil');
    }
  };

  // Calculate if user is in grace period (deleted but can still recover)
  const isInGracePeriod = !!(
    user?.is_deleted &&
    user?.deletion_scheduled_at &&
    new Date(user.deletion_scheduled_at) > new Date()
  );

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
    isInGracePeriod,
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
