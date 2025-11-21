import { Toast } from '@capacitor/toast';

/**
 * Muestra un mensaje toast corto
 */
export const showToast = async (text: string, duration: 'short' | 'long' = 'short') => {
  try {
    await Toast.show({
      text,
      duration,
      position: 'bottom',
    });
    return { success: true };
  } catch (error) {
    console.error('Error al mostrar toast:', error);
    // Fallback para web: usar alert o console
    if (typeof window !== 'undefined') {
      console.log(`Toast: ${text}`);
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

/**
 * Muestra un mensaje de éxito
 */
export const showSuccess = (text: string) => showToast(text, 'short');

/**
 * Muestra un mensaje de error
 */
export const showError = (text: string) => showToast(text, 'long');

/**
 * Muestra un mensaje informativo
 */
export const showInfo = (text: string) => showToast(text, 'short');
