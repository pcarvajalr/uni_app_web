import { PushNotifications } from '@capacitor/push-notifications';
import type {
  PushNotificationSchema,
  ActionPerformed,
  Token,
  PermissionStatus,
} from '@capacitor/push-notifications';
import { isNative, isIOS, isAndroid } from './platform';

export type PushPlatform = 'ios' | 'android';

export interface PushHandlers {
  /** Token recibido del SO (FCM en Android, APNs token en iOS). */
  onTokenReceived: (token: string, platform: PushPlatform) => void | Promise<void>;
  /** Notificación recibida con la app en primer plano. */
  onNotificationReceived?: (notification: PushNotificationSchema) => void;
  /** Usuario tocó la notificación (app en background o cerrada). */
  onNotificationTapped?: (action: ActionPerformed) => void;
  /** Error en el registro (e.g. permisos denegados, falta config nativa). */
  onRegistrationError?: (error: { error: string }) => void;
}

let removeListenersFn: (() => Promise<void>) | null = null;

/**
 * Solicita permisos y registra el dispositivo para recibir push.
 * No-op en plataforma web.
 *
 * @returns true si el registro se inició correctamente, false en web o si el usuario denegó.
 */
export async function initializePushNotifications(handlers: PushHandlers): Promise<boolean> {
  if (!isNative) {
    return false;
  }

  let permStatus: PermissionStatus = await PushNotifications.checkPermissions();

  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions();
  }

  if (permStatus.receive !== 'granted') {
    console.warn('[push] permission denied or not granted:', permStatus.receive);
    return false;
  }

  await removeAllListeners();

  const registrationListener = await PushNotifications.addListener(
    'registration',
    (token: Token) => {
      const platform: PushPlatform = isIOS ? 'ios' : 'android';
      handlers.onTokenReceived(token.value, platform);
    }
  );

  const errorListener = await PushNotifications.addListener(
    'registrationError',
    (err) => {
      console.error('[push] registrationError:', err);
      handlers.onRegistrationError?.(err);
    }
  );

  const receivedListener = await PushNotifications.addListener(
    'pushNotificationReceived',
    (notification) => {
      handlers.onNotificationReceived?.(notification);
    }
  );

  const tappedListener = await PushNotifications.addListener(
    'pushNotificationActionPerformed',
    (action) => {
      handlers.onNotificationTapped?.(action);
    }
  );

  removeListenersFn = async () => {
    await registrationListener.remove();
    await errorListener.remove();
    await receivedListener.remove();
    await tappedListener.remove();
  };

  await PushNotifications.register();

  if (isAndroid) {
    try {
      await PushNotifications.createChannel({
        id: 'default',
        name: 'General',
        description: 'Notificaciones de mensajes, ventas, tutorías y reseñas',
        importance: 4,
        visibility: 1,
        sound: 'default',
        lights: true,
        vibration: true,
      });
    } catch (err) {
      console.warn('[push] createChannel failed (no crítico):', err);
    }
  }

  return true;
}

/**
 * Limpia todos los listeners registrados. Llamar al hacer logout.
 */
export async function removeAllListeners(): Promise<void> {
  if (removeListenersFn) {
    await removeListenersFn();
    removeListenersFn = null;
  }
  if (isNative) {
    try {
      await PushNotifications.removeAllListeners();
    } catch {
      // No crítico
    }
  }
}

/**
 * Limpia las notificaciones entregadas (resetea badge en iOS).
 */
export async function clearBadgeCount(): Promise<void> {
  if (!isIOS) return;
  try {
    await PushNotifications.removeAllDeliveredNotifications();
  } catch (err) {
    console.warn('[push] clearBadgeCount failed:', err);
  }
}
