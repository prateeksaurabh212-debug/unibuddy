/**
 * Password hashing and verification using Node crypto (scrypt).
 * No external deps; stored as "saltHex:hashHex" in User.passwordHash.
 */

import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SALT_LEN = 16;
const KEY_LEN = 64;
const COST = 16384;

function toHex(buf: Buffer): string {
  return buf.toString("hex");
}

function fromHex(hex: string): Buffer {
  return Buffer.from(hex, "hex");
}

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LEN);
  const hash = scryptSync(password, salt, KEY_LEN, { N: COST });
  return `${toHex(salt)}:${toHex(hash)}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length !== 2) return false;
  const [saltHex, hashHex] = parts;
  if (!saltHex || !hashHex) return false;
  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = fromHex(saltHex);
    expected = fromHex(hashHex);
  } catch {
    return false;
  }
  const actual = scryptSync(password, salt, KEY_LEN, { N: COST });
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}
