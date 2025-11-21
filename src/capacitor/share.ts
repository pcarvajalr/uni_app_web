import { Share } from '@capacitor/share';

export interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
  dialogTitle?: string;
}

/**
 * Comparte contenido usando el diálogo nativo del sistema
 */
export const share = async (options: ShareOptions) => {
  try {
    await Share.share({
      title: options.title,
      text: options.text,
      url: options.url,
      dialogTitle: options.dialogTitle || 'Compartir',
    });
    return { success: true };
  } catch (error) {
    console.error('Error al compartir:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

/**
 * Comparte texto simple
 */
export const shareText = (text: string, title?: string) => {
  return share({ text, title });
};

/**
 * Comparte una URL
 */
export const shareUrl = (url: string, title?: string, text?: string) => {
  return share({ url, title, text });
};
