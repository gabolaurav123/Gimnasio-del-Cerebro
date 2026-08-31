import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getCustomerByEmail, getCustomerById } from "../db/customer-repository";
import { getRuntimeValues } from "./runtime-env";
import { requestIsSameOrigin } from "./auth";

const COOKIE_NAME = "gdc_customer_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export type CustomerSession = { customerId: string; email: string; name: string; expires: number };

function bytesToHex(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function encodePayload(payload: CustomerSession) {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodePayload(encoded: string): CustomerSession | null {
  try {
    const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(binary, (character) => character.charCodeAt(0)))) as CustomerSession;
  } catch { return null; }
}

async function signingSecret() {
  const values = await getRuntimeValues(["SESSION_SECRET"]);
  return values.SESSION_SECRET?.trim() || "";
}

async function signature(value: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return bytesToHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

export async function authenticateCustomer(email: string, password: string) {
  const secret = await signingSecret();
  if (secret.length < 32) return null;
  const customer = await getCustomerByEmail(email);
  if (!customer?.active || !(await bcrypt.compare(password, customer.passwordHash))) return null;
  const payload: CustomerSession = { customerId: customer.id, email: customer.email, name: customer.name, expires: Date.now() + SESSION_TTL_SECONDS * 1000 };
  const encoded = encodePayload(payload);
  return `${encoded}.${await signature(encoded, secret)}`;
}

export async function verifyCustomerSession(token?: string | null): Promise<CustomerSession | null> {
  if (!token) return null;
  const separator = token.lastIndexOf(".");
  if (separator < 1) return null;
  const encoded = token.slice(0, separator);
  const received = token.slice(separator + 1);
  const secret = await signingSecret();
  if (secret.length < 32 || !constantTimeEqual(received, await signature(encoded, secret))) return null;
  const payload = decodePayload(encoded);
  if (!payload || payload.expires < Date.now()) return null;
  const customer = await getCustomerById(payload.customerId);
  if (!customer?.active) return null;
  return { customerId: customer.id, email: customer.email, name: customer.name, expires: payload.expires };
}

function tokenFromCookie(cookie: string) {
  return cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
}

export async function getCustomerSession() {
  const store = await cookies();
  return verifyCustomerSession(store.get(COOKIE_NAME)?.value);
}

export async function getRequestCustomer(request: Request) {
  if (request.method !== "GET" && request.method !== "HEAD" && !requestIsSameOrigin(request)) return null;
  return verifyCustomerSession(tokenFromCookie(request.headers.get("cookie") || ""));
}

export function customerSessionCookie(token: string) {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${process.env.NODE_ENV === "production" ? "; Secure" : ""}; Priority=High`;
}

export function clearCustomerSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}; Priority=High`;
}
