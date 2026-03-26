import { randomBytes } from "crypto";
import { argon2Verify, argon2id } from "hash-wasm";

/** Argon2id (hash-wasm / WASM) — preferível a bcrypt para novos sistemas. */
export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16);
  return argon2id({
    password: plain,
    salt,
    parallelism: 1,
    iterations: 4,
    memorySize: 65536,
    hashLength: 32,
    outputType: "encoded",
  });
}

export async function verifyPassword(
  plain: string,
  encoded: string
): Promise<boolean> {
  try {
    return await argon2Verify({ password: plain, hash: encoded });
  } catch {
    return false;
  }
}
