const CRED_ID_KEY = 'webauthnCredId';
const ENABLED_KEY = 'biometricEnabled';

export const isWebAuthnSupported = () =>
  typeof window !== 'undefined' &&
  !!window.PublicKeyCredential &&
  typeof navigator.credentials?.create === 'function';

export const isBiometricEnabled = () => localStorage.getItem(ENABLED_KEY) === 'true';

const randomBytes = (len) => {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return bytes;
};

const toBase64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const fromBase64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

// Registers a platform authenticator (fingerprint/face) as a local unlock
// credential. There is no server, so the "security boundary" is the same as
// the PIN: a successful local verification is the unlock signal.
export const registerBiometric = async () => {
  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: randomBytes(32),
      rp: { name: 'Budget Tracker' },
      user: { id: randomBytes(16), name: 'local-user', displayName: 'Budget Tracker' },
      pubKeyCredParams: [{ alg: -7, type: 'public-key' }, { alg: -257, type: 'public-key' }],
      authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
      timeout: 60000,
    },
  });
  if (!credential) throw new Error('Registration failed');
  localStorage.setItem(CRED_ID_KEY, toBase64(credential.rawId));
  localStorage.setItem(ENABLED_KEY, 'true');
};

export const disableBiometric = () => {
  localStorage.removeItem(CRED_ID_KEY);
  localStorage.setItem(ENABLED_KEY, 'false');
};

export const verifyBiometric = async () => {
  const credIdB64 = localStorage.getItem(CRED_ID_KEY);
  if (!credIdB64) return false;
  try {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: randomBytes(32),
        allowCredentials: [{ id: fromBase64(credIdB64), type: 'public-key' }],
        userVerification: 'required',
        timeout: 60000,
      },
    });
    return !!assertion;
  } catch {
    return false;
  }
};
