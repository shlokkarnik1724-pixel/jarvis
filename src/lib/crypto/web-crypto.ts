/**
 * Client-side AES-GCM encryption helpers for vault metadata and roast/toast bodies.
 */

function toBase64(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < view.length; i += 1) {
    binary += String.fromCharCode(view[i]!);
  }
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 120_000,
      hash: "SHA-256",
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  salt: string;
}

export async function encryptText(
  plaintext: string,
  passphrase: string
): Promise<EncryptedPayload> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plaintext)
  );

  return {
    ciphertext: toBase64(encrypted),
    iv: toBase64(iv),
    salt: toBase64(salt),
  };
}

export async function decryptText(
  payload: EncryptedPayload,
  passphrase: string
): Promise<string> {
  const key = await deriveKey(passphrase, fromBase64(payload.salt));
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(payload.iv) },
    key,
    fromBase64(payload.ciphertext)
  );
  return new TextDecoder().decode(decrypted);
}

/** Pack salt into iv field for compact DB storage: salt.iv */
export function packIvSalt(iv: string, salt: string): string {
  return `${salt}.${iv}`;
}

export function unpackIvSalt(packed: string): { salt: string; iv: string } {
  const [salt, iv] = packed.split(".");
  if (!salt || !iv) {
    throw new Error("Invalid packed IV/salt");
  }
  return { salt, iv };
}
