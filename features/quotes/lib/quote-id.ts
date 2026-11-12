/**
 * Human-facing quote codes: "GT-" + 5 unambiguous base-32 characters
 * (Crockford alphabet, no I/L/O/U). ~33^5 ≈ 39M combinations — collisions are
 * handled by the repository, which retries on the unique-PK constraint.
 */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // 32 chars, no I L O U

export function generateQuoteId(): string {
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `GT-${code}`;
}

/** True for a well-formed quote code, e.g. "GT-7Q3KD". */
export function isQuoteId(value: string): boolean {
  return /^GT-[0-9A-HJKMNP-TV-Z]{5}$/.test(value);
}
