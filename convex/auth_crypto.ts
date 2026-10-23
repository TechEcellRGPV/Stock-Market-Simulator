/**
 * Cryptographic Password Hashing and Verification for Participant Accounts
 * Uses native Web Crypto PBKDF2 (SHA-256) with 10,000 iterations and 128-bit random salt.
 * Compatible with Convex serverless runtime without external binary dependencies.
 */

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array {
  const match = hex.match(/.{1,2}/g);
  if (!match) return new Uint8Array();
  return new Uint8Array(match.map((byte) => parseInt(byte, 16)));
}

export async function hashPassword(
  password: string,
  saltHex?: string,
): Promise<{ hashHex: string; saltHex: string }> {
  const salt = saltHex
    ? fromHex(saltHex)
    : crypto.getRandomValues(new Uint8Array(16));

  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: 25000,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  );

  return {
    hashHex: toHex(new Uint8Array(derivedBits)),
    saltHex: toHex(salt),
  };
}

export async function verifyPassword(
  password: string,
  storedHashHex: string,
  storedSaltHex: string,
): Promise<boolean> {
  const result = await hashPassword(password, storedSaltHex);
  return result.hashHex === storedHashHex;
}
