// Stateless admin session tokens, signed with HMAC-SHA256 via the Web Crypto
// API so this works in both the Edge middleware runtime and normal Node API
// routes without needing a session store or database.

const COOKIE_NAME = "blakash_admin_session";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error("Set ADMIN_SESSION_SECRET (or at least ADMIN_PASSWORD) in your environment.");
  }
  return secret;
}

async function hmac(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSessionToken(): Promise<string> {
  const secret = getSecret();
  const expires = Date.now() + MAX_AGE_MS;
  const signature = await hmac(String(expires), secret);
  return `${expires}.${signature}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [expiresStr, signature] = token.split(".");
  if (!expiresStr || !signature) return false;
  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;
  try {
    const secret = getSecret();
    const expected = await hmac(expiresStr, secret);
    return timingSafeEqual(expected, signature);
  } catch {
    return false;
  }
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

export { COOKIE_NAME, MAX_AGE_MS };
