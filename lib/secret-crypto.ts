/**
 * Client-side crypto for the zero-knowledge "secret note" feature.
 *
 * All encryption/decryption happens in the browser via the Web Crypto API.
 * The server only ever receives:
 *   - ciphertext (base64 AES-GCM of JSON { title, content })
 *   - salt (base64, fixed per passphrase)
 *   - iv (base64, fresh per encryption)
 *   - verifier (base64 SHA-256 of a *separately* derived key — proves the
 *     passphrase is known without granting any ability to decrypt)
 *
 * Do NOT import this module from server code; `crypto.subtle` here is the
 * browser implementation and keys must never leave the client.
 */

export const SECRET_NOTE_PLACEHOLDER_TITLE = "Secret note";

const PBKDF2_ITERATIONS = 600_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

export type SecretPayload = {
  title: string;
  content: string;
};

export type SecretEnvelope = {
  ciphertext: string;
  iv: string;
};

/** Thrown when decryption fails — in practice this means a wrong passphrase. */
export class SecretDecryptError extends Error {
  constructor() {
    super("Could not decrypt. The passphrase is likely wrong.");
    this.name = "SecretDecryptError";
  }
}

function toBase64(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of view) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function generateSalt(): string {
  const salt = new Uint8Array(SALT_BYTES);
  crypto.getRandomValues(salt);
  return toBase64(salt);
}

/**
 * Derive PBKDF2 bits with a domain-separated salt so the encryption key and
 * the verifier key can never be confused for one another.
 */
async function deriveBits(
  passphrase: string,
  saltB64: string,
  domain: "enc" | "verify",
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const salt = fromBase64(saltB64);
  const domainBytes = encoder.encode(domain);
  const domainSalt = new Uint8Array(salt.length + domainBytes.length);
  domainSalt.set(salt);
  domainSalt.set(domainBytes, salt.length);

  return crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: domainSalt,
      iterations: PBKDF2_ITERATIONS,
    },
    baseKey,
    256,
  );
}

export type DerivedSecretKeys = {
  /** AES-GCM key used to encrypt/decrypt the note payload. Keep in memory only. */
  encKey: CryptoKey;
  /** base64 SHA-256 of the verifier key bits — safe to store server-side. */
  verifier: string;
};

export async function deriveKeys(
  passphrase: string,
  saltB64: string,
): Promise<DerivedSecretKeys> {
  const [encBits, verifyBits] = await Promise.all([
    deriveBits(passphrase, saltB64, "enc"),
    deriveBits(passphrase, saltB64, "verify"),
  ]);

  const encKey = await crypto.subtle.importKey(
    "raw",
    encBits,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
  const verifierHash = await crypto.subtle.digest("SHA-256", verifyBits);

  return { encKey, verifier: toBase64(verifierHash) };
}

export async function encryptPayload(
  encKey: CryptoKey,
  payload: SecretPayload,
): Promise<SecretEnvelope> {
  const iv = new Uint8Array(IV_BYTES);
  crypto.getRandomValues(iv);
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    encKey,
    plaintext,
  );
  return { ciphertext: toBase64(ciphertext), iv: toBase64(iv) };
}

export async function decryptPayload(
  encKey: CryptoKey,
  ciphertextB64: string,
  ivB64: string,
): Promise<SecretPayload> {
  let plaintext: ArrayBuffer;
  try {
    plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromBase64(ivB64) },
      encKey,
      fromBase64(ciphertextB64),
    );
  } catch {
    throw new SecretDecryptError();
  }

  const parsed: unknown = JSON.parse(new TextDecoder().decode(plaintext));
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as SecretPayload).title !== "string" ||
    typeof (parsed as SecretPayload).content !== "string"
  ) {
    throw new SecretDecryptError();
  }
  return parsed as SecretPayload;
}
