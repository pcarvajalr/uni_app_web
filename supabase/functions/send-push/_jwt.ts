// Genera un access token OAuth2 a partir de la Service Account de Firebase,
// para autenticarse contra la API FCM HTTP v1.
// Cachea el token en memoria del worker hasta su expiración.

interface ServiceAccount {
  client_email: string;
  private_key: string;
  project_id: string;
  token_uri: string;
}

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

let cache: CachedToken | null = null;

export async function getAccessToken(serviceAccount: ServiceAccount): Promise<string> {
  if (cache && cache.expiresAt > Date.now() + 60_000) {
    return cache.accessToken;
  }

  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: serviceAccount.token_uri,
    exp: now + 3600,
    iat: now,
  };

  const header = { alg: 'RS256', typ: 'JWT' };

  const encoder = new TextEncoder();
  const b64 = (data: ArrayBuffer | string) => {
    const bytes = typeof data === 'string' ? encoder.encode(data) : new Uint8Array(data);
    let str = '';
    bytes.forEach((b) => (str += String.fromCharCode(b)));
    return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  };

  const headerB64 = b64(JSON.stringify(header));
  const claimB64 = b64(JSON.stringify(claim));
  const signingInput = `${headerB64}.${claimB64}`;

  const pem = serviceAccount.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    'pkcs8',
    der,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    encoder.encode(signingInput)
  );

  const jwt = `${signingInput}.${b64(signature)}`;

  const tokenResp = await fetch(serviceAccount.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenResp.ok) {
    const text = await tokenResp.text();
    throw new Error(`Failed to get access token: ${tokenResp.status} ${text}`);
  }

  const tokenData = await tokenResp.json();
  cache = {
    accessToken: tokenData.access_token,
    expiresAt: Date.now() + (tokenData.expires_in - 60) * 1000,
  };

  return cache.accessToken;
}
