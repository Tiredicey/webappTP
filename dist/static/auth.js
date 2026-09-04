// Real credential handling using the Web Crypto API.
// The PIN is never stored. Only a PBKDF2-HMAC-SHA256 digest and its random
// salt are persisted in localStorage. Verification is constant-time.

const STORE_KEY = 'isdemo.credential.v1';
const ITERATIONS = 210000; // OWASP PBKDF2-HMAC-SHA256 guidance
const KEY_BITS = 256;
const SALT_BYTES = 16;

export const MAX_FAILS = 5;
export const LOCKOUT_MS = 30000;

function b64(bytes) {
  let s = '';
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s);
}

function unb64(str) {
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function cryptoAvailable() {
  return !!(window.crypto && window.crypto.subtle && window.crypto.getRandomValues);
}

async function derive(pin, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    KEY_BITS
  );
  return new Uint8Array(bits);
}

function readStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function writeStore(obj) {
  localStorage.setItem(STORE_KEY, JSON.stringify(obj));
}

export function isEnrolled() {
  const s = readStore();
  return !!(s && s.hash && s.salt);
}

export function iterations() {
  return ITERATIONS;
}

export async function enroll(pin) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const t0 = performance.now();
  const hash = await derive(pin, salt);
  const ms = Math.round(performance.now() - t0);
  writeStore({
    v: 1,
    algo: 'PBKDF2-HMAC-SHA256',
    iterations: ITERATIONS,
    salt: b64(salt),
    hash: b64(hash),
    fails: 0,
    lockUntil: 0,
    createdAt: Date.now(),
  });
  return { ms, salt: b64(salt), hash: b64(hash) };
}

// Constant-time comparison: always walks the full length.
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export function lockState() {
  const s = readStore();
  if (!s) return { locked: false, remainingMs: 0, fails: 0 };
  const now = Date.now();
  const remaining = (s.lockUntil || 0) - now;
  return {
    locked: remaining > 0,
    remainingMs: Math.max(0, remaining),
    fails: s.fails || 0,
  };
}

export async function verify(pin) {
  const s = readStore();
  if (!s) return { ok: false, reason: 'not-enrolled' };

  const now = Date.now();
  if ((s.lockUntil || 0) > now) {
    return {
      ok: false,
      reason: 'locked',
      remainingMs: s.lockUntil - now,
    };
  }

  const salt = unb64(s.salt);
  const expected = unb64(s.hash);
  const t0 = performance.now();
  const actual = await derive(pin, salt);
  const ms = Math.round(performance.now() - t0);

  if (timingSafeEqual(expected, actual)) {
    s.fails = 0;
    s.lockUntil = 0;
    writeStore(s);
    return { ok: true, ms };
  }

  s.fails = (s.fails || 0) + 1;
  let lockedNow = false;
  if (s.fails >= MAX_FAILS) {
    s.lockUntil = now + LOCKOUT_MS;
    s.fails = 0;
    lockedNow = true;
  }
  writeStore(s);
  return {
    ok: false,
    reason: lockedNow ? 'locked' : 'wrong',
    fails: lockedNow ? MAX_FAILS : s.fails,
    ms,
  };
}

export function reset() {
  localStorage.removeItem(STORE_KEY);
}

export function storeDebug() {
  const s = readStore();
  if (!s) return null;
  return {
    algo: s.algo,
    iterations: s.iterations,
    salt: s.salt,
    hash: s.hash.slice(0, 22) + '...',
    fullHashLen: unb64(s.hash).length,
  };
}

// ---- Platform biometric via WebAuthn ----
// Uses the real WebAuthn API. On Android/Chrome this surfaces the device
// fingerprint or face prompt when a platform authenticator is available.

const CRED_KEY = 'isdemo.webauthn.v1';

export async function biometricAvailable() {
  if (!window.PublicKeyCredential) return { ok: false, reason: 'no-webauthn' };
  if (!window.isSecureContext) return { ok: false, reason: 'insecure-context' };
  try {
    const ok = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return ok ? { ok: true } : { ok: false, reason: 'no-platform-authenticator' };
  } catch (e) {
    return { ok: false, reason: 'query-failed' };
  }
}

export function biometricEnrolled() {
  return !!localStorage.getItem(CRED_KEY);
}

export async function biometricEnroll() {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const userId = crypto.getRandomValues(new Uint8Array(16));
  const cred = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: 'ISDemo', id: location.hostname },
      user: { id: userId, name: 'isdemo-user', displayName: 'ISDemo User' },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },   // ES256
        { type: 'public-key', alg: -257 }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred',
      },
      timeout: 60000,
      attestation: 'none',
    },
  });
  if (!cred) throw new Error('Enrollment returned no credential');
  localStorage.setItem(CRED_KEY, b64(cred.rawId));
  return { id: b64(cred.rawId).slice(0, 20) + '...' };
}

export async function biometricVerify() {
  const stored = localStorage.getItem(CRED_KEY);
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const publicKey = {
    challenge,
    rpId: location.hostname,
    userVerification: 'required',
    timeout: 60000,
  };
  if (stored) {
    publicKey.allowCredentials = [
      { type: 'public-key', id: unb64(stored), transports: ['internal'] },
    ];
  }
  const assertion = await navigator.credentials.get({ publicKey });
  if (!assertion) throw new Error('No assertion returned');
  return { id: b64(assertion.rawId).slice(0, 20) + '...' };
}
