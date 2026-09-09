import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import makeWASocket, {
  Browsers,
  BufferJSON,
  DisconnectReason,
  initAuthCreds,
  makeCacheableSignalKeyStore,
  proto,
} from "@whiskeysockets/baileys";
import postgres from "postgres";
import QRCode from "qrcode";
import pino from "pino";

const logger = pino({ level: process.env.WHATSAPP_LOG_LEVEL || "warn" });
const serviceLog = (event, detail = {}) => console.info(JSON.stringify({ scope: "whatsapp", event, ...detail, at: new Date().toISOString() }));
const safeError = (error) => String(error instanceof Error ? error.message : error || "Error desconocido").replace(/[\r\n]+/g, " ").slice(0, 260);
const maskPhone = (phone) => phone ? `***${String(phone).replace(/\D/g, "").slice(-4)}` : "unknown";

function databaseClient() {
  const url = (process.env.DATABASE_URL || process.env.POSTGRES_URL || "").trim();
  if (!url) throw new Error("DATABASE_URL no está configurada para persistir la sesión de WhatsApp.");
  const hostname = new URL(url).hostname;
  return postgres(url, {
    max: 3,
    prepare: false,
    connect_timeout: 10,
    idle_timeout: 20,
    ssl: ["localhost", "127.0.0.1", "::1"].includes(hostname) ? false : "require",
  });
}

function encryptionKey() {
  const secret = (process.env.SESSION_SECRET || "").trim();
  if (secret.length < 32) throw new Error("SESSION_SECRET debe tener al menos 32 caracteres para cifrar la sesión de WhatsApp.");
  return createHash("sha256").update(`gdc-whatsapp-session:${secret}`).digest();
}

function seal(value) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const plaintext = Buffer.from(JSON.stringify(value, BufferJSON.replacer), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`;
}

function unseal(value) {
  const [ivValue, tagValue, encryptedValue] = String(value || "").split(".");
  if (!ivValue || !tagValue || !encryptedValue) throw new Error("La sesión persistida tiene un formato inválido.");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivValue, "base64url"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  const plaintext = Buffer.concat([decipher.update(Buffer.from(encryptedValue, "base64url")), decipher.final()]).toString("utf8");
  return JSON.parse(plaintext, BufferJSON.reviver);
}

async function ensureSessionTables(sql) {
  await sql.unsafe(`CREATE TABLE IF NOT EXISTS whatsapp_auth_credentials (id TEXT PRIMARY KEY, encrypted_value TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
  await sql.unsafe(`CREATE TABLE IF NOT EXISTS whatsapp_auth_keys (category TEXT NOT NULL, key_id TEXT NOT NULL, encrypted_value TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (category, key_id))`);
  await sql.unsafe(`CREATE TABLE IF NOT EXISTS whatsapp_session_metadata (id TEXT PRIMARY KEY, phone_number TEXT, account_name TEXT, last_connected_at TEXT, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
}

async function createDatabaseAuthState(sql) {
  const rows = await sql.unsafe(`SELECT encrypted_value FROM whatsapp_auth_credentials WHERE id = $1 LIMIT 1`, ["primary"]);
  const creds = rows[0]?.encrypted_value ? unseal(rows[0].encrypted_value) : initAuthCreds();
  const keys = {
    get: async (category, ids) => {
      if (!ids.length) return {};
      const stored = await sql.unsafe(`SELECT key_id, encrypted_value FROM whatsapp_auth_keys WHERE category = $1 AND key_id = ANY($2::text[])`, [category, ids]);
      const result = {};
      for (const row of stored) {
        let value = unseal(row.encrypted_value);
        if (category === "app-state-sync-key" && value) value = proto.Message.AppStateSyncKeyData.fromObject(value);
        result[row.key_id] = value;
      }
      return result;
    },
    set: async (data) => {
      await sql.begin(async (transaction) => {
        for (const [category, entries] of Object.entries(data)) {
          for (const [keyId, value] of Object.entries(entries || {})) {
            if (value == null) {
              await transaction.unsafe(`DELETE FROM whatsapp_auth_keys WHERE category = $1 AND key_id = $2`, [category, keyId]);
            } else {
              await transaction.unsafe(`INSERT INTO whatsapp_auth_keys (category, key_id, encrypted_value, updated_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) ON CONFLICT (category, key_id) DO UPDATE SET encrypted_value = EXCLUDED.encrypted_value, updated_at = CURRENT_TIMESTAMP`, [category, keyId, seal(value)]);
            }
          }
        }
      });
    },
  };
  const saveCreds = async () => {
    await sql.unsafe(`INSERT INTO whatsapp_auth_credentials (id, encrypted_value, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP) ON CONFLICT (id) DO UPDATE SET encrypted_value = EXCLUDED.encrypted_value, updated_at = CURRENT_TIMESTAMP`, ["primary", seal(creds)]);
  };
  return { state: { creds, keys }, saveCreds };
}

function statusCodeFrom(error) {
  return Number(error?.output?.statusCode || error?.data?.statusCode || error?.statusCode || 0);
}

function extractMessageText(message) {
  if (!message || typeof message !== "object") return "";
  return String(
    message.conversation
      || message.extendedTextMessage?.text
      || message.imageMessage?.caption
      || message.videoMessage?.caption
      || message.documentMessage?.caption
      || extractMessageText(message.ephemeralMessage?.message)
      || extractMessageText(message.viewOnceMessage?.message)
      || extractMessageText(message.viewOnceMessageV2?.message)
      || "",
  ).trim();
}

function normalizePhoneFromJid(jid) {
  return String(jid || "").split("@")[0].split(":")[0].replace(/\D/g, "");
}

function json(response, statusCode, payload) {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" });
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 64 * 1024) throw new Error("Solicitud demasiado grande.");
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export async function startWhatsAppBridge({ port, applicationPort, token }) {
  let sql = null;
  let socket = null;
  let connectPromise = null;
  let reconnectTimer = null;
  let generation = 0;
  let metadata = { phoneNumber: null, accountName: null, lastConnectedAt: null };
  const state = {
    available: false,
    state: "initializing",
    qr: null,
    qrExpiresAt: null,
    phoneNumber: null,
    accountName: null,
    lastConnectedAt: null,
    serviceStartedAt: new Date().toISOString(),
    recoveredSession: false,
    error: null,
  };

  const publicStatus = () => ({ ...state });
  const updateState = (next) => Object.assign(state, next);

  async function clearPersistedSession() {
    if (!sql) return;
    await sql.begin(async (transaction) => {
      await transaction.unsafe(`DELETE FROM whatsapp_auth_keys`);
      await transaction.unsafe(`DELETE FROM whatsapp_auth_credentials`);
      await transaction.unsafe(`DELETE FROM whatsapp_session_metadata WHERE id = $1`, ["primary"]);
    });
    metadata = { phoneNumber: null, accountName: null, lastConnectedAt: null };
  }

  async function saveMetadata() {
    if (!sql) return;
    await sql.unsafe(`INSERT INTO whatsapp_session_metadata (id, phone_number, account_name, last_connected_at, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) ON CONFLICT (id) DO UPDATE SET phone_number = EXCLUDED.phone_number, account_name = EXCLUDED.account_name, last_connected_at = EXCLUDED.last_connected_at, updated_at = CURRENT_TIMESTAMP`, ["primary", metadata.phoneNumber, metadata.accountName, metadata.lastConnectedAt]);
  }

  async function forwardInbound(message) {
    const remoteJid = String(message.key?.remoteJid || "");
    const content = extractMessageText(message.message);
    if (!remoteJid || !content || message.key?.fromMe || remoteJid.endsWith("@g.us") || remoteJid === "status@broadcast" || remoteJid.endsWith("@broadcast")) return;
    const providerMessageId = String(message.key?.id || "");
    if (!providerMessageId) return;
    const timestampValue = Number(message.messageTimestamp || Date.now() / 1000);
    const receivedAt = new Date(timestampValue > 10_000_000_000 ? timestampValue : timestampValue * 1000).toISOString();
    serviceLog("message_received", { id: providerMessageId.slice(-12), from: maskPhone(normalizePhoneFromJid(remoteJid)) });
    try {
      const response = await fetch(`http://127.0.0.1:${applicationPort}/api/internal/whatsapp/inbound`, {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify({ providerMessageId, jid: remoteJid, phoneNumber: normalizePhoneFromJid(remoteJid), contactName: String(message.pushName || ""), content, receivedAt }),
        signal: AbortSignal.timeout(65_000),
      });
      if (!response.ok) serviceLog("inbound_processing_error", { status: response.status });
    } catch (error) {
      serviceLog("inbound_processing_error", { error: safeError(error) });
    }
  }

  function closeCurrentSocket() {
    generation += 1;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = null;
    const current = socket;
    socket = null;
    try { current?.end?.(new Error("Reinicio controlado de la conexión")); } catch { /* Socket already closed. */ }
  }

  async function connect(recoveredSession = false) {
    if (!sql) throw new Error("El almacenamiento de sesión todavía no está listo.");
    if (state.state === "connected" && socket) return publicStatus();
    if (connectPromise) return connectPromise;
    connectPromise = (async () => {
      closeCurrentSocket();
      const currentGeneration = generation;
      updateState({ available: true, state: recoveredSession ? "reconnecting" : "initializing", qr: null, qrExpiresAt: null, error: null, recoveredSession });
      const { state: authState, saveCreds } = await createDatabaseAuthState(sql);
      updateState({ state: authState.creds.registered ? "connecting" : "generating_qr" });
      const nextSocket = makeWASocket({
        auth: { creds: authState.creds, keys: makeCacheableSignalKeyStore(authState.keys, logger) },
        browser: Browsers.macOS("Gimnasio del Cerebro"),
        logger,
        markOnlineOnConnect: false,
        syncFullHistory: false,
        generateHighQualityLinkPreview: false,
        shouldSyncHistoryMessage: () => false,
        getMessage: async () => undefined,
      });
      socket = nextSocket;
      nextSocket.ev.on("creds.update", async () => {
        try { await saveCreds(); } catch (error) { serviceLog("session_save_error", { error: safeError(error) }); }
      });
      nextSocket.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify") return;
        for (const message of messages) await forwardInbound(message);
      });
      nextSocket.ev.on("connection.update", async (update) => {
        if (currentGeneration !== generation) return;
        if (update.qr) {
          const hadQr = Boolean(state.qr);
          updateState({ state: "generating_qr", error: null });
          try {
            const qr = await QRCode.toDataURL(update.qr, { errorCorrectionLevel: "M", margin: 2, width: 520 });
            if (currentGeneration !== generation) return;
            updateState({ state: "qr_available", qr, qrExpiresAt: new Date(Date.now() + 20_000).toISOString(), error: null });
            serviceLog(hadQr ? "qr_updated" : "qr_generated");
          } catch (error) {
            updateState({ state: "error", qr: null, qrExpiresAt: null, error: "No se pudo representar el código QR. Inténtalo nuevamente." });
            serviceLog("qr_render_error", { error: safeError(error) });
          }
        }
        if (update.connection === "connecting" && !update.qr) updateState({ state: "connecting", error: null });
        if (update.connection === "open") {
          const phoneNumber = normalizePhoneFromJid(nextSocket.user?.id) || metadata.phoneNumber;
          metadata = { phoneNumber, accountName: nextSocket.user?.name || metadata.accountName || "Cuenta de WhatsApp", lastConnectedAt: new Date().toISOString() };
          updateState({ state: "connected", qr: null, qrExpiresAt: null, phoneNumber: metadata.phoneNumber, accountName: metadata.accountName, lastConnectedAt: metadata.lastConnectedAt, recoveredSession, error: null });
          await saveMetadata().catch((error) => serviceLog("metadata_save_error", { error: safeError(error) }));
          serviceLog(recoveredSession ? "session_recovered" : "connected", { account: maskPhone(metadata.phoneNumber) });
        }
        if (update.connection === "close") {
          const statusCode = statusCodeFrom(update.lastDisconnect?.error);
          socket = null;
          if (statusCode === DisconnectReason.loggedOut) {
            await clearPersistedSession().catch((error) => serviceLog("session_clear_error", { error: safeError(error) }));
            updateState({ state: "disconnected", qr: null, qrExpiresAt: null, phoneNumber: null, accountName: null, lastConnectedAt: null, recoveredSession: false, error: "WhatsApp invalidó o cerró la sesión. Vincula el número nuevamente." });
            serviceLog("logged_out");
            return;
          }
          updateState({ state: "reconnecting", qr: null, qrExpiresAt: null, error: "La conexión se interrumpió. Estamos intentando recuperarla." });
          serviceLog("reconnecting", { code: statusCode || "unknown" });
          reconnectTimer = setTimeout(() => connect(true).catch((error) => {
            updateState({ state: "error", error: safeError(error) });
            serviceLog("reconnect_error", { error: safeError(error) });
          }), 1800);
        }
      });
      return publicStatus();
    })().catch((error) => {
      updateState({ available: true, state: "error", qr: null, qrExpiresAt: null, error: safeError(error) });
      serviceLog("start_error", { error: safeError(error) });
      throw error;
    }).finally(() => { connectPromise = null; });
    return connectPromise;
  }

  async function disconnect() {
    const current = socket;
    generation += 1;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = null;
    socket = null;
    try { await current?.logout?.(); } catch { try { current?.end?.(new Error("Desconexión solicitada")); } catch { /* Already closed. */ } }
    await clearPersistedSession();
    updateState({ available: true, state: "disconnected", qr: null, qrExpiresAt: null, phoneNumber: null, accountName: null, lastConnectedAt: null, recoveredSession: false, error: null });
    serviceLog("disconnected");
    return publicStatus();
  }

  async function reconnect() {
    closeCurrentSocket();
    updateState({ state: "reconnecting", qr: null, qrExpiresAt: null, error: null });
    return connect(true);
  }

  function authorized(request) {
    const supplied = String(request.headers.authorization || "").replace(/^Bearer\s+/i, "");
    const expected = Buffer.from(token);
    const received = Buffer.from(supplied);
    return expected.length === received.length && expected.length > 0 && timingSafeEqual(expected, received);
  }

  const server = createServer(async (request, response) => {
    if (!authorized(request)) return json(response, 401, { error: "No autorizado" });
    const url = new URL(request.url || "/", "http://127.0.0.1");
    try {
      if (request.method === "GET" && url.pathname === "/status") return json(response, 200, publicStatus());
      if (request.method === "POST" && url.pathname === "/connect") return json(response, 202, await connect(false));
      if (request.method === "POST" && url.pathname === "/reconnect") return json(response, 202, await reconnect());
      if (request.method === "POST" && url.pathname === "/disconnect") return json(response, 200, await disconnect());
      if (request.method === "POST" && url.pathname === "/test") {
        if (!socket || state.state !== "connected") return json(response, 409, { error: "WhatsApp no está conectado." });
        const results = metadata.phoneNumber ? await socket.onWhatsApp(metadata.phoneNumber) : [];
        if (metadata.phoneNumber && (!results || !results.length)) return json(response, 502, { error: "WhatsApp no confirmó la cuenta conectada." });
        return json(response, 200, { ok: true, checkedAt: new Date().toISOString() });
      }
      if (request.method === "POST" && url.pathname === "/send") {
        if (!socket || state.state !== "connected") return json(response, 409, { error: "WhatsApp no está conectado." });
        const body = await readJson(request);
        const text = String(body.text || "").trim();
        const rawJid = String(body.jid || "").trim();
        const jid = rawJid.includes("@") ? rawJid : `${rawJid.replace(/\D/g, "")}@s.whatsapp.net`;
        if (!/^\d+(?::\d+)?@(s\.whatsapp\.net|lid)$/.test(jid) || !text || text.length > 3000) return json(response, 400, { error: "Destinatario o mensaje inválido." });
        const sent = await socket.sendMessage(jid, { text });
        serviceLog("message_sent", { id: String(sent?.key?.id || "").slice(-12), to: maskPhone(normalizePhoneFromJid(jid)) });
        return json(response, 200, { id: sent?.key?.id || null, sentAt: new Date().toISOString() });
      }
      return json(response, 404, { error: "Ruta no encontrada" });
    } catch (error) {
      serviceLog("request_error", { path: url.pathname, error: safeError(error) });
      return json(response, 500, { error: safeError(error) });
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => resolve());
  });
  serviceLog("service_started", { port });

  (async () => {
    try {
      sql = databaseClient();
      await ensureSessionTables(sql);
      const storedMetadata = await sql.unsafe(`SELECT phone_number, account_name, last_connected_at FROM whatsapp_session_metadata WHERE id = $1 LIMIT 1`, ["primary"]);
      if (storedMetadata[0]) metadata = { phoneNumber: storedMetadata[0].phone_number || null, accountName: storedMetadata[0].account_name || null, lastConnectedAt: storedMetadata[0].last_connected_at || null };
      const auth = await createDatabaseAuthState(sql);
      updateState({ available: true, state: "disconnected", phoneNumber: metadata.phoneNumber, accountName: metadata.accountName, lastConnectedAt: metadata.lastConnectedAt, error: null });
      if (auth.state.creds.registered) await connect(true);
    } catch (error) {
      updateState({ available: false, state: "error", error: safeError(error) });
      serviceLog("initialization_error", { error: safeError(error) });
    }
  })();

  return {
    close: async () => {
      closeCurrentSocket();
      await new Promise((resolve) => server.close(() => resolve()));
      await sql?.end?.({ timeout: 5 });
    },
  };
}
