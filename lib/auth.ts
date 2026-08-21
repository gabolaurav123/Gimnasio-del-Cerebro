import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getAdminUserByEmail, getAdminUserById, type AdminRole } from "../db/repository";
import { getRuntimeValues } from "./runtime-env";

const COOKIE_NAME = "gdc_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

export type AdminSession = {
  userId: string;
  email: string;
  role: AdminRole;
  expires: number;
};

async function secret() {
  const values = await getRuntimeValues(["SESSION_SECRET"]);
  return values.SESSION_SECRET?.trim() ?? "";
}

function bytesToHex(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function encodePayload(payload: AdminSession) {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodePayload(encoded: string): AdminSession | null {
  try {
    const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as AdminSession;
  } catch {
    return null;
  }
}

async function signature(value: string, signingSecret: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(signingSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return bytesToHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

export async function authenticate(email: string, password: string) {
  const signingSecret = await secret();
  if (signingSecret.length < 32) return null;
  const user = await getAdminUserByEmail(email);
  if (!user?.active || !(await bcrypt.compare(password, user.passwordHash))) return null;
  const payload: AdminSession = { userId: user.id, email: user.email, role: user.role, expires: Date.now() + SESSION_TTL_SECONDS * 1000 };
  const encoded = encodePayload(payload);
  return `${encoded}.${await signature(encoded, signingSecret)}`;
}

export async function verifySession(token?: string | null): Promise<AdminSession | null> {
  if (!token) return null;
  const separator = token.lastIndexOf(".");
  if (separator < 1) return null;
  const encoded = token.slice(0, separator);
  const received = token.slice(separator + 1);
  const signingSecret = await secret();
  if (signingSecret.length < 32) return null;
  const expected = await signature(encoded, signingSecret);
  if (!constantTimeEqual(received, expected)) return null;
  const payload = decodePayload(encoded);
  if (!payload || payload.expires < Date.now() || !payload.userId) return null;
  const user = await getAdminUserById(payload.userId);
  if (!user?.active) return null;
  return { userId: user.id, email: user.email, role: user.role, expires: payload.expires };
}

function tokenFromCookie(cookie: string) {
  return cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
}

export async function getAdminSession() {
  const store = await cookies();
  return verifySession(store.get(COOKIE_NAME)?.value);
}

export async function isAdmin() {
  return Boolean(await getAdminSession());
}

export function requestIsSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return request.headers.get("sec-fetch-site") !== "cross-site";
  try {
    const originHost = new URL(origin).host.toLowerCase();
    const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
    const requestHost = (forwardedHost || request.headers.get("host") || new URL(request.url).host).toLowerCase();
    return originHost === requestHost;
  } catch {
    return false;
  }
}

export async function getRequestAdmin(request: Request, roles?: AdminRole[]) {
  if (request.method !== "GET" && request.method !== "HEAD" && !requestIsSameOrigin(request)) return null;
  const session = await verifySession(tokenFromCookie(request.headers.get("cookie") ?? ""));
  if (!session || (roles?.length && !roles.includes(session.role))) return null;
  return session;
}

export async function requestIsAdmin(request: Request, roles?: AdminRole[]) {
  return Boolean(await getRequestAdmin(request, roles));
}

export function sessionCookie(token: string) {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}${process.env.NODE_ENV === "production" ? "; Secure" : ""}; Priority=High`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}; Priority=High`;
}
