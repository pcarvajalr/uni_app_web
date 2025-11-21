import { Geolocation } from '@capacitor/geolocation';

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

/**
 * Obtiene la ubicación actual del dispositivo
 */
export const getCurrentPosition = async (): Promise<{
  success: boolean;
  location?: Location;
  error?: string;
}> => {
  try {
    const coordinates = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    return {
      success: true,
      location: {
        latitude: coordinates.coords.latitude,
        longitude: coordinates.coords.longitude,
        accuracy: coordinates.coords.accuracy,
        altitude: coordinates.coords.altitude,
        altitudeAccuracy: coordinates.coords.altitudeAccuracy,
        heading: coordinates.coords.heading,
        speed: coordinates.coords.speed,
      },
    };
  } catch (error) {
    console.error('Error al obtener ubicación:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

/**
 * Verifica si hay permisos de geolocalización
 */
export const checkPermissions = async () => {
  try {
    const status = await Geolocation.checkPermissions();
    return {
      success: true,
      hasPermission: status.location === 'granted',
      status: status.location,
    };
  } catch (error) {
    console.error('Error al verificar permisos:', error);
    return {
      success: false,
      hasPermission: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

/**
 * Solicita permisos de geolocalización
 */
export const requestPermissions = async () => {
  try {
    const status = await Geolocation.requestPermissions();
    return {
      success: true,
      granted: status.location === 'granted',
      status: status.location,
    };
  } catch (error) {
    console.error('Error al solicitar permisos:', error);
    return {
      success: false,
      granted: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};
