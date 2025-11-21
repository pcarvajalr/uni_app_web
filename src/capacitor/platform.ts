import { Capacitor } from '@capacitor/core';

/**
 * Detecta si la aplicación está corriendo en una plataforma nativa
 */
export const isNative = Capacitor.isNativePlatform();

/**
 * Detecta si la aplicación está corriendo en un navegador web
 */
export const isWeb = !isNative;

/**
 * Detecta si la aplicación está corriendo en iOS
 */
export const isIOS = Capacitor.getPlatform() === 'ios';

/**
 * Detecta si la aplicación está corriendo en Android
 */
export const isAndroid = Capacitor.getPlatform() === 'android';

/**
 * Obtiene el nombre de la plataforma actual
 */
export const getPlatform = () => Capacitor.getPlatform();

/**
 * Ejecuta código solo en plataformas nativas
 */
export const onlyNative = <T>(callback: () => T): T | undefined => {
  if (isNative) {
    return callback();
  }
  return undefined;
};

/**
 * Ejecuta código solo en web
 */
export const onlyWeb = <T>(callback: () => T): T | undefined => {
  if (isWeb) {
    return callback();
  }
  return undefined;
};
