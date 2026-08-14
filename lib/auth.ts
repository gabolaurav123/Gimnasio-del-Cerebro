import bcrypt from "bcryptjs";
import { env } from "cloudflare:workers";
import { cookies } from "next/headers";

const COOKIE_NAME = "gdc_admin_session";

function config() {
  const values = env as unknown as { ADMIN_EMAIL?: string; ADMIN_PASSWORD_HASH?: string; SESSION_SECRET?: string };
  return { email: values.ADMIN_EMAIL ?? "", passwordHash: values.ADMIN_PASSWORD_HASH ?? "", secret: values.SESSION_SECRET ?? "" };
}

function bytesToHex(bytes: ArrayBuffer) { return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join(""); }

async function signature(value: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return bytesToHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

export async function authenticate(email: string, password: string) {
  const auth = config();
  if (!auth.email || !auth.passwordHash || !auth.secret) return null;
  if (email.trim().toLowerCase() !== auth.email.trim().toLowerCase()) return null;
  if (!(await bcrypt.compare(password, auth.passwordHash))) return null;
  const expires = Date.now() + 1000 * 60 * 60 * 8;
  const payload = `${auth.email}.${expires}`;
  return `${payload}.${await signature(payload, auth.secret)}`;
}

export async function verifySession(token?: string | null) {
  if (!token) return false;
  const lastDot = token.lastIndexOf(".");
  if (lastDot < 1) return false;
  const payload = token.slice(0, lastDot);
  const received = token.slice(lastDot + 1);
  const [, expires] = payload.split(".");
  const auth = config();
  if (!auth.secret || Number(expires) < Date.now()) return false;
  return received === await signature(payload, auth.secret);
}

export async function isAdmin() {
  const store = await cookies();
  return verifySession(store.get(COOKIE_NAME)?.value);
}

export function sessionCookie(token: string) {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}

export function clearSessionCookie() { return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`; }

export async function requestIsAdmin(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const token = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  return verifySession(token);
}
