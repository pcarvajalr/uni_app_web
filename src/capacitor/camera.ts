import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

/**
 * Toma una foto con la cámara del dispositivo
 */
export const takePhoto = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
    });

    return {
      success: true,
      uri: image.webPath,
      format: image.format,
    };
  } catch (error) {
    console.error('Error al tomar foto:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

/**
 * Selecciona una imagen de la galería
 */
export const pickImage = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
    });

    return {
      success: true,
      uri: image.webPath,
      format: image.format,
    };
  } catch (error) {
    console.error('Error al seleccionar imagen:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

/**
 * Muestra un diálogo para elegir entre cámara o galería
 */
export const pickImageWithPrompt = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt,
    });

    return {
      success: true,
      uri: image.webPath,
      format: image.format,
    };
  } catch (error) {
    console.error('Error al seleccionar imagen:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};
