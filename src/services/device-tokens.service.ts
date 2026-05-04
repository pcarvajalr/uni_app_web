import { supabase } from '../lib/supabase';

export type DevicePlatform = 'ios' | 'android';

/**
 * Registra o actualiza un device token para el usuario actual.
 * Si el token ya existe en otra cuenta (cambio de usuario en el mismo
 * dispositivo), lo reasigna al usuario actual gracias al UNIQUE (token).
 */
export async function upsertDeviceToken(params: {
  userId: string;
  token: string;
  platform: DevicePlatform;
}): Promise<void> {
  const { userId, token, platform } = params;

  const { error } = await supabase
    .from('device_tokens')
    .upsert(
      {
        user_id: userId,
        token,
        platform,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'token' }
    );

  if (error) {
    console.error('[device-tokens] upsert failed:', error);
    throw error;
  }
}

/**
 * Elimina un device token específico (al cerrar sesión).
 */
export async function deleteDeviceToken(token: string): Promise<void> {
  const { error } = await supabase
    .from('device_tokens')
    .delete()
    .eq('token', token);

  if (error) {
    console.error('[device-tokens] delete failed:', error);
    throw error;
  }
}
