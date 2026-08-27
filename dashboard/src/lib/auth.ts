// Uses the Web Crypto API (globalThis.crypto) instead of Node's `crypto` module
// because this code is imported by middleware.ts, which runs on the Edge Runtime.
const encoder = new TextEncoder();

export const SESSION_COOKIE = "admin_session";

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function sessionToken(): Promise<string> {
  return sha256Hex(process.env.ADMIN_PASSWORD ?? "");
}

export function isValidPassword(input: string): boolean {
  if (!process.env.ADMIN_PASSWORD) return false;
  return input === process.env.ADMIN_PASSWORD;
}

export async function isValidSession(cookieValue: string | undefined): Promise<boolean> {
  if (!cookieValue || !process.env.ADMIN_PASSWORD) return false;
  return cookieValue === (await sessionToken());
}
