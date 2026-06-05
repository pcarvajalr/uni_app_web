import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type University = Database['public']['Tables']['universities']['Row'];
type UniversityDomain = Database['public']['Tables']['university_domains']['Row'];

export interface UniversityLookup {
  university_id: string;
  name: string;
}

export interface UniversityDataCounts {
  users_count: number;
  partners_count: number;
  coupons_count: number;
  products_count: number;
  sessions_count: number;
  locations_count: number;
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

// ============================================
// CRUD de universidades (admin)
// ============================================

export const getUniversities = async (): Promise<University[]> => {
  const { data, error } = await supabase
    .from('universities')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return data ?? [];
};

export const createUniversity = async (
  values: { name: string; city?: string | null; address?: string | null }
): Promise<University> => {
  const { data, error } = await supabase
    .from('universities')
    .insert(values)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateUniversity = async (
  id: string,
  values: Partial<{ name: string; city: string | null; address: string | null }>
): Promise<University> => {
  const { data, error } = await supabase
    .from('universities')
    .update(values)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getUniversityDataCounts = async (
  universityId: string
): Promise<UniversityDataCounts> => {
  const { data, error } = await supabase.rpc('university_data_counts', {
    p_university_id: universityId,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return {
    users_count: Number(row?.users_count ?? 0),
    partners_count: Number(row?.partners_count ?? 0),
    coupons_count: Number(row?.coupons_count ?? 0),
    products_count: Number(row?.products_count ?? 0),
    sessions_count: Number(row?.sessions_count ?? 0),
    locations_count: Number(row?.locations_count ?? 0),
  };
};

export const deleteUniversity = async (universityId: string): Promise<void> => {
  const { error } = await supabase.rpc('delete_university', {
    p_university_id: universityId,
  });
  if (error) throw error; // el mensaje del RPC incluye el detalle de qué impide borrar
};

// ============================================
// Dominios
// ============================================

export const getUniversityDomains = async (
  universityId: string
): Promise<UniversityDomain[]> => {
  const { data, error } = await supabase
    .from('university_domains')
    .select('*')
    .eq('university_id', universityId)
    .order('domain', { ascending: true });
  if (error) throw error;
  return data ?? [];
};

export const addUniversityDomain = async (
  universityId: string,
  domain: string
): Promise<UniversityDomain> => {
  const normalized = domain.trim().toLowerCase().replace(/^@/, '');
  const { data, error } = await supabase
    .from('university_domains')
    .insert({ university_id: universityId, domain: normalized })
    .select()
    .single();
  if (error) throw error; // unique violation => dominio ya usado por otra universidad
  return data;
};

export const removeUniversityDomain = async (domainId: string): Promise<void> => {
  const { error } = await supabase
    .from('university_domains')
    .delete()
    .eq('id', domainId);
  if (error) throw error;
};
