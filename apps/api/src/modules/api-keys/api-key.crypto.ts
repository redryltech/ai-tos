import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

export interface EncryptedSecret {
  ciphertext: string;
  nonce: string;
  authTag: string;
}

/** Derive a 32-byte AES key from the configured secret. */
export function deriveEncryptionKey(secret: string): Buffer {
  return createHash('sha256').update(secret, 'utf8').digest();
}

export function encryptSecret(plaintext: string, secret: string): EncryptedSecret {
  const key = deriveEncryptionKey(secret);
  const nonce = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, nonce);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    ciphertext: encrypted.toString('base64'),
    nonce: nonce.toString('base64'),
    authTag: authTag.toString('base64'),
  };
}

export function decryptSecret(payload: EncryptedSecret, secret: string): string {
  const key = deriveEncryptionKey(secret);
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(payload.nonce, 'base64'));
  decipher.setAuthTag(Buffer.from(payload.authTag, 'base64'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, 'base64')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

export function keyLast4(plaintext: string): string {
  const trimmed = plaintext.trim();
  if (trimmed.length < 4) return trimmed.padStart(4, '*');
  return trimmed.slice(-4);
}
