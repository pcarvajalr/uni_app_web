import { supabase } from '../lib/supabase';

export interface UniversityLookup {
  university_id: string;
  name: string;
}

/**
 * Resuelve la universidad a partir del dominio del correo.
 * Devuelve null si el dominio no está registrado.
 */
export const lookupUniversityByEmail = async (
  email: string
): Promise<UniversityLookup | null> => {
  const { data, error } = await supabase.rpc('lookup_university_by_email', {
    p_email: email,
  });

  if (error) {
    console.error('Error consultando universidad por email:', error);
    throw error;
  }

  // El RPC devuelve un set de filas (0 o 1)
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;

  return {
    university_id: row.university_id,
    name: row.name,
  };
};
