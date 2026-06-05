import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Partner = Database['public']['Tables']['partners']['Row'];
type PartnerInsert = Database['public']['Tables']['partners']['Insert'];
type PartnerUpdate = Database['public']['Tables']['partners']['Update'];

export type { Partner };

// Todos los aliados visibles para el admin (de cualquier universidad + globales)
export const getAllPartners = async (): Promise<Partner[]> => {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .order('is_default', { ascending: false })
    .order('name', { ascending: true });
  if (error) throw error;
  return data ?? [];
};

// Aliados de una universidad específica
export const getPartnersByUniversity = async (universityId: string): Promise<Partner[]> => {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('university_id', universityId)
    .order('name', { ascending: true });
  if (error) throw error;
  return data ?? [];
};

// Aliados globales (sin universidad), incluido "Promociones generales"
export const getGlobalPartners = async (): Promise<Partner[]> => {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .is('university_id', null)
    .order('is_default', { ascending: false })
    .order('name', { ascending: true });
  if (error) throw error;
  return data ?? [];
};

export const createPartner = async (values: PartnerInsert): Promise<Partner> => {
  const { data, error } = await supabase.from('partners').insert(values).select().single();
  if (error) throw error;
  return data;
};

export const updatePartner = async (id: string, values: PartnerUpdate): Promise<Partner> => {
  const { data, error } = await supabase
    .from('partners')
    .update(values)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deletePartner = async (id: string): Promise<void> => {
  const { error } = await supabase.from('partners').delete().eq('id', id);
  if (error) throw error; // is_default no se puede borrar (validar en UI)
};

// Subir logo al bucket 'partners' (patrón análogo a uploadCouponImage)
export const uploadPartnerLogo = async (file: File, partnerName: string): Promise<string> => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Tipo de archivo no válido. Solo JPG, PNG o WebP');
  }
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('La imagen es demasiado grande. Máximo 2MB');
  }
  const ext = file.name.split('.').pop();
  const safeName = partnerName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const filePath = `partners/${safeName}_${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('partners').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from('partners').getPublicUrl(filePath);
  return data.publicUrl;
};
