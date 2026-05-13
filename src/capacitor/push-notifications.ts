import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import type {
  Notification,
  NotificationActionPerformedEvent,
  PermissionStatus,
} from '@capacitor-firebase/messaging';
import { isNative, isIOS, isAndroid } from './platform';

export type PushPlatform = 'ios' | 'android';

export interface PushHandlers {
  /** Token FCM recibido (mismo formato en iOS y Android via Firebase Messaging SDK). */
  onTokenReceived: (token: string, platform: PushPlatform) => void | Promise<void>;
  /** Notificación recibida con la app en primer plano. */
  onNotificationReceived?: (notification: Notification) => void;
  /** Usuario tocó la notificación (app en background o cerrada). */
  onNotificationTapped?: (event: NotificationActionPerformedEvent) => void;
}

let removeListenersFn: (() => Promise<void>) | null = null;

/**
 * Solicita permisos y registra el dispositivo para recibir push vía FCM.
 * En iOS, Firebase intercambia el APNs token por un FCM token automáticamente.
 * No-op en plataforma web.
 *
 * @returns true si el registro tuvo éxito, false en web o si el usuario denegó.
 */
export async function initializePushNotifications(handlers: PushHandlers): Promise<boolean> {
  if (!isNative) {
    return false;
  }

  let permStatus: PermissionStatus = await FirebaseMessaging.checkPermissions();

  if (permStatus.receive === 'prompt') {
    permStatus = await FirebaseMessaging.requestPermissions();
  }

  if (permStatus.receive !== 'granted') {
    console.warn('[push] permission denied or not granted:', permStatus.receive);
    return false;
  }

  await removeAllListeners();

  const tokenReceivedListener = await FirebaseMessaging.addListener(
    'tokenReceived',
    (event) => {
      const platform: PushPlatform = isIOS ? 'ios' : 'android';
      handlers.onTokenReceived(event.token, platform);
    }
  );

  const receivedListener = await FirebaseMessaging.addListener(
    'notificationReceived',
    (event) => {
      handlers.onNotificationReceived?.(event.notification);
    }
  );

  const tappedListener = await FirebaseMessaging.addListener(
    'notificationActionPerformed',
    (event) => {
      handlers.onNotificationTapped?.(event);
    }
  );

  removeListenersFn = async () => {
    await tokenReceivedListener.remove();
    await receivedListener.remove();
    await tappedListener.remove();
  };

  if (isAndroid) {
    try {
      await FirebaseMessaging.createChannel({
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

  // getToken() dispara también el evento tokenReceived; lo usamos para obtener
  // el token inicial inmediatamente (sin tener que esperar refresh).
  try {
    const { token } = await FirebaseMessaging.getToken();
    if (token) {
      const platform: PushPlatform = isIOS ? 'ios' : 'android';
      await handlers.onTokenReceived(token, platform);
    }
  } catch (err) {
    console.error('[push] getToken failed:', err);
    return false;
  }

  return true;
}

/**
 * Obtiene el FCM token actual del dispositivo, sin disparar listeners ni
 * registrar nada en BD. Útil al hacer logout para identificar qué token
 * eliminar cuando lastTokenRef se perdió por reinicio de app.
 *
 * @returns el token FCM actual, o null si no hay permisos / no es nativo.
 */
export async function getCurrentDeviceToken(): Promise<string | null> {
  if (!isNative) return null;
  try {
    const perm = await FirebaseMessaging.checkPermissions();
    if (perm.receive !== 'granted') return null;
    const { token } = await FirebaseMessaging.getToken();
    return token ?? null;
  } catch {
    return null;
  }
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
      await FirebaseMessaging.removeAllListeners();
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
    await FirebaseMessaging.removeAllDeliveredNotifications();
  } catch (err) {
    console.warn('[push] clearBadgeCount failed:', err);
  }
}
