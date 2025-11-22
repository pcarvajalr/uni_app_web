import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// Validar que las variables de entorno estén configuradas
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan variables de entorno de Supabase. ' +
    'Asegúrate de configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env'
  );
}

// Crear cliente de Supabase con tipos generados automáticamente
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'uni-app-auth',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  db: {
    schema: 'public',
  },
});

// Helper para manejar errores de Supabase de forma consistente
export const handleSupabaseError = (error: any): never => {
  console.error('Supabase error:', error);

  if (error.message) {
    throw new Error(error.message);
  }

  throw new Error('Ha ocurrido un error inesperado');
};

// Helper para extraer datos de respuesta de Supabase con manejo de errores
export function unwrapData<T>(data: T | null, error: any): T {
  if (error) {
    handleSupabaseError(error);
  }
  if (data === null) {
    throw new Error('No se encontraron datos');
  }
  return data;
}

// Helper para agregar timeout a promesas
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operationName: string = 'Operación'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`${operationName} excedió el tiempo límite de ${timeoutMs / 1000}s`)),
        timeoutMs
      )
    ),
  ]);
}

// Helper para verificar si hay una sesión activa
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    handleSupabaseError(error);
  }

  return data.session;
};

// Helper para obtener el usuario actual
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    handleSupabaseError(error);
  }

  return data.user;
};

// Helper para obtener el perfil completo del usuario
export const getUserProfile = async (userId?: string) => {
  const uid = userId || (await getCurrentUser())?.id;

  if (!uid) {
    throw new Error('No hay usuario autenticado');
  }

  try {
    const queryPromise = supabase
      .from('users')
      .select('*')
      .eq('id', uid)
      .single();

    // Aplicar timeout de 1 segundos a la query
    const { data, error } = await withTimeout(queryPromise, 1000, 'Query getUserProfile');

    return unwrapData(data, error);
  } catch (error: any) {
    console.error('Error o timeout en getUserProfile():', error.message);
    throw error;
  }
};

// Types para facilitar el uso en toda la aplicación
export type SupabaseClient = typeof supabase;
export type { Database } from '../types/database.types';
