import { Preferences } from '@capacitor/preferences';

/**
 * Guarda un valor en el almacenamiento local
 */
export const setItem = async (key: string, value: any) => {
  try {
    const stringValue = JSON.stringify(value);
    await Preferences.set({ key, value: stringValue });
    return { success: true };
  } catch (error) {
    console.error('Error al guardar en storage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

/**
 * Obtiene un valor del almacenamiento local
 */
export const getItem = async <T = any>(key: string): Promise<T | null> => {
  try {
    const { value } = await Preferences.get({ key });
    if (value === null) return null;
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Error al leer del storage:', error);
    return null;
  }
};

/**
 * Elimina un valor del almacenamiento local
 */
export const removeItem = async (key: string) => {
  try {
    await Preferences.remove({ key });
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar del storage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

/**
 * Limpia todo el almacenamiento local
 */
export const clear = async () => {
  try {
    await Preferences.clear();
    return { success: true };
  } catch (error) {
    console.error('Error al limpiar storage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

/**
 * Obtiene todas las claves almacenadas
 */
export const getAllKeys = async (): Promise<string[]> => {
  try {
    const { keys } = await Preferences.keys();
    return keys;
  } catch (error) {
    console.error('Error al obtener claves del storage:', error);
    return [];
  }
};
