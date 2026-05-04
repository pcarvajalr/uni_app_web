// Edge function: send-push
//
// Invocada por trigger SQL cuando se inserta una fila en notifications.
// Lee los device_tokens del usuario destinatario y envía push notifications
// vía FCM HTTP v1 (Firebase actúa de proxy a APNs para iOS).
//
// Variables de entorno requeridas:
// - FCM_SERVICE_ACCOUNT_JSON: contenido completo del JSON de Service Account de Firebase
// - SUPABASE_URL (auto)
// - SUPABASE_SERVICE_ROLE_KEY (auto)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0';
import { getAccessToken } from './_jwt.ts';

interface NotificationPayload {
  user_id: string;
  type: string;
  title: string;
  body: string;
  action_url?: string | null;
  data?: Record<string, unknown> | null;
}

interface FcmMessage {
  token: string;
  notification: { title: string; body: string };
  data: Record<string, string>;
  android?: {
    priority: 'HIGH';
    notification: { channel_id: string; sound: 'default' };
  };
  apns?: {
    headers: { 'apns-priority': '10' };
    payload: { aps: { sound: 'default'; badge?: number } };
  };
}

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const serviceAccount = JSON.parse(Deno.env.get('FCM_SERVICE_ACCOUNT_JSON')!);

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let payload: NotificationPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  if (!payload.user_id || !payload.title || !payload.body) {
    return new Response('Missing required fields', { status: 400 });
  }

  const { data: tokens, error: tokensErr } = await supabaseAdmin
    .from('device_tokens')
    .select('token, platform')
    .eq('user_id', payload.user_id);

  if (tokensErr) {
    console.error('Error fetching tokens:', tokensErr);
    return new Response('DB error', { status: 500 });
  }

  if (!tokens || tokens.length === 0) {
    return new Response(JSON.stringify({ sent: 0, reason: 'no tokens' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let accessToken: string;
  try {
    accessToken = await getAccessToken(serviceAccount);
  } catch (err) {
    console.error('Error getting FCM access token:', err);
    return new Response('FCM auth error', { status: 500 });
  }

  const fcmEndpoint = `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`;

  const dataPayload: Record<string, string> = {
    type: payload.type,
    action_url: payload.action_url ?? '',
  };
  if (payload.data) {
    for (const [k, v] of Object.entries(payload.data)) {
      dataPayload[k] = typeof v === 'string' ? v : JSON.stringify(v);
    }
  }

  const sendOne = async (entry: { token: string; platform: string }) => {
    const message: FcmMessage = {
      token: entry.token,
      notification: { title: payload.title, body: payload.body },
      data: dataPayload,
      android: {
        priority: 'HIGH',
        notification: { channel_id: 'default', sound: 'default' },
      },
      apns: {
        headers: { 'apns-priority': '10' },
        payload: { aps: { sound: 'default' } },
      },
    };

    const resp = await fetch(fcmEndpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.warn(`FCM send failed for token ${entry.token.slice(0, 12)}...:`, resp.status, text);

      if (resp.status === 404 || resp.status === 400) {
        try {
          const errorBody = JSON.parse(text);
          const errorCode = errorBody?.error?.details?.[0]?.errorCode;
          if (errorCode === 'UNREGISTERED' || errorCode === 'INVALID_ARGUMENT') {
            await supabaseAdmin.from('device_tokens').delete().eq('token', entry.token);
            console.log('Deleted invalid token:', entry.token.slice(0, 12));
          }
        } catch {
          // Ignorar errores de parseo
        }
      }
      return { token: entry.token, ok: false };
    }
    return { token: entry.token, ok: true };
  };

  const results = await Promise.all(tokens.map(sendOne));
  const sent = results.filter((r) => r.ok).length;

  return new Response(
    JSON.stringify({ sent, total: results.length }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
