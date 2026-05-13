import { useEffect, useRef } from 'react';
import {
  initializePushNotifications,
  removeAllListeners,
  clearBadgeCount,
  getCurrentDeviceToken,
} from '../capacitor/push-notifications';
import { upsertDeviceToken, deleteDeviceToken } from '../services/device-tokens.service';
import { isNative } from '../capacitor/platform';

/**
 * Hook que gestiona el ciclo de vida de las push notifications:
 * - Cuando hay userId: solicita permisos, registra dispositivo, guarda token en BD.
 * - Cuando se desloguea: elimina el token de BD y limpia listeners.
 *
 * Debe llamarse UNA SOLA VEZ en el árbol (dentro de AuthProvider).
 */
export function usePushNotifications(userId: string | null) {
  const lastTokenRef = useRef<string | null>(null);
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isNative) return;

    const previousUserId = lastUserIdRef.current;
    lastUserIdRef.current = userId;

    if (!userId && previousUserId) {
      const refToken = lastTokenRef.current;
      lastTokenRef.current = null;
      // Si el ref se perdió por reinicio de app, leer el token actual del SO
      // para asegurarnos de borrar el correcto y no dejar tokens huérfanos.
      (async () => {
        const tokenToDelete = refToken ?? (await getCurrentDeviceToken());
        if (tokenToDelete) {
          await deleteDeviceToken(tokenToDelete).catch((err) =>
            console.warn('[push] deleteDeviceToken on logout failed:', err)
          );
        }
      })();
      removeAllListeners().catch(() => undefined);
      return;
    }

    if (userId && userId !== previousUserId) {
      clearBadgeCount();

      initializePushNotifications({
        onTokenReceived: async (token, platform) => {
          lastTokenRef.current = token;
          try {
            await upsertDeviceToken({ userId, token, platform });
            console.log('[push] token registrado en BD');
          } catch (err) {
            console.error('[push] no se pudo guardar token:', err);
          }
        },
        onNotificationReceived: (notification) => {
          console.log('[push] notif recibida en foreground:', notification);
        },
        onNotificationTapped: (event) => {
          const data = event.notification.data as Record<string, unknown> | undefined;
          const url = data?.action_url;
          if (typeof url === 'string' && url.startsWith('/')) {
            window.location.assign(url);
          }
        },
      }).catch((err) => {
        console.error('[push] init failed:', err);
      });
    }
  }, [userId]);

  useEffect(() => {
    return () => {
      removeAllListeners().catch(() => undefined);
    };
  }, []);
}
