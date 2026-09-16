import { ensureDatabase } from "./repository";
import {
  calculateNeurofitnessScores,
  NEUROFITNESS_CONSENT_VERSION,
  NEUROFITNESS_VERSION,
  safeRankingName,
  sha256Hex,
  type NeurofitnessRawMetrics,
  type NeurofitnessScores,
} from "../lib/neurofitness";

type AttemptRow = Record<string, unknown>;

export class NeurofitnessDataError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
    this.name = "NeurofitnessDataError";
  }
}

export type NeurofitnessLeaderboardEntry = {
  position: number;
  name: string;
  total: number;
};

export type NeurofitnessAdminLead = {
  id: string;
  name: string;
  phone: string;
  alias: string | null;
  total: number;
  bestDomain: string;
  marketingConsent: boolean;
  rankingConsent: boolean;
  whatsappStatus: string;
  createdAt: string;
};

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function rowScores(row: AttemptRow): NeurofitnessScores {
  const domain = String(row.best_domain || "focus") as NeurofitnessScores["bestDomain"];
  return {
    focus: Number(row.focus_score || 0),
    control: Number(row.control_score || 0),
    memory: Number(row.memory_score || 0),
    flexibility: Number(row.flexibility_score || 0),
    total: Number(row.total_score || 0),
    bestDomain: domain,
  };
}

async function getAttemptWithToken(id: string, token: string) {
  const db = await ensureDatabase();
  const row = await db.prepare(`SELECT * FROM neurofitness_attempts WHERE id = ? LIMIT 1`).bind(id).first<AttemptRow>();
  if (!row || String(row.token_hash) !== await sha256Hex(token)) throw new NeurofitnessDataError("El intento no es válido o ya expiró.", 404);
  const createdAt = Date.parse(String(row.created_at || ""));
  if (!Number.isFinite(createdAt) || Date.now() - createdAt > 2 * 60 * 60_000) throw new NeurofitnessDataError("El intento expiró. Inicia un reto nuevo.", 410);
  return { db, row };
}

export async function createNeurofitnessAttempt(campaignKey: string) {
  const db = await ensureDatabase();
  const abandonedCutoff = new Date(Date.now() - 24 * 60 * 60_000).toISOString();
  const unclaimedCutoff = new Date(Date.now() - 7 * 24 * 60 * 60_000).toISOString();
  await db.batch([
    db.prepare(`DELETE FROM neurofitness_attempts WHERE status IN ('STARTED', 'INVALID') AND created_at < ?`).bind(abandonedCutoff),
    db.prepare(`DELETE FROM neurofitness_attempts WHERE status = 'COMPLETED' AND created_at < ?`).bind(unclaimedCutoff),
  ]);
  const id = crypto.randomUUID();
  const token = randomToken();
  const tokenHash = await sha256Hex(token);
  const seed = crypto.getRandomValues(new Uint32Array(1))[0] & 0x7fffffff;
  const startedAt = new Date().toISOString();
  await db.prepare(`INSERT INTO neurofitness_attempts (id, campaign_key, version, token_hash, seed, status, started_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'STARTED', ?, ?, ?)`)
    .bind(id, campaignKey, NEUROFITNESS_VERSION, tokenHash, seed, startedAt, startedAt, startedAt).run();
  return { id, token, seed, startedAt };
}

export async function completeNeurofitnessAttempt(input: { id: string; token: string; metrics: NeurofitnessRawMetrics }) {
  const { db, row } = await getAttemptWithToken(input.id, input.token);
  const status = String(row.status);
  if (status === "COMPLETED" || status === "CLAIMED") return { ready: true, scores: rowScores(row) };
  if (status !== "STARTED") throw new NeurofitnessDataError("Este intento ya no puede completarse.", 409);

  const now = new Date();
  const startedAt = new Date(String(row.started_at));
  const durationMs = now.getTime() - startedAt.getTime();
  if (!Number.isFinite(durationMs) || durationMs < 50_000 || durationMs > 10 * 60_000) {
    await db.prepare(`UPDATE neurofitness_attempts SET status = 'INVALID', updated_at = ? WHERE id = ? AND status = 'STARTED'`).bind(now.toISOString(), input.id).run();
    throw new NeurofitnessDataError("El tiempo del reto no es válido. Inicia un nuevo intento.", 409);
  }

  const scores = calculateNeurofitnessScores(input.metrics);
  const metricsJson = JSON.stringify(input.metrics);
  if (metricsJson.length > 8_000) throw new NeurofitnessDataError("Las métricas del reto son demasiado extensas.");
  await db.prepare(`UPDATE neurofitness_attempts SET status = 'COMPLETED', metrics_json = ?, focus_score = ?, control_score = ?, memory_score = ?, flexibility_score = ?, total_score = ?, best_domain = ?, duration_ms = ?, completed_at = ?, updated_at = ? WHERE id = ? AND status = 'STARTED'`)
    .bind(metricsJson, scores.focus, scores.control, scores.memory, scores.flexibility, scores.total, scores.bestDomain, durationMs, now.toISOString(), now.toISOString(), input.id).run();
  return { ready: true, scores };
}

export async function claimNeurofitnessAttempt(input: {
  id: string;
  token: string;
  name: string;
  phone: string;
  rankingAlias?: string | null;
  marketingConsent: boolean;
  rankingConsent: boolean;
  sourceEvent: string;
}) {
  const { db, row } = await getAttemptWithToken(input.id, input.token);
  let attemptStatus = String(row.status);
  if (attemptStatus === "CLAIMING") {
    const claimUpdatedAt = Date.parse(String(row.updated_at || ""));
    if (!Number.isFinite(claimUpdatedAt) || Date.now() - claimUpdatedAt < 2 * 60_000) {
      throw new NeurofitnessDataError("El resultado se está registrando. Inténtalo nuevamente en un momento.", 409);
    }
    const recovered = await db.prepare(`UPDATE neurofitness_attempts SET status = 'COMPLETED', updated_at = ? WHERE id = ? AND status = 'CLAIMING' AND updated_at = ? RETURNING id`)
      .bind(new Date().toISOString(), input.id, String(row.updated_at || "")).first<{ id: string }>();
    if (!recovered) throw new NeurofitnessDataError("El resultado se está registrando. Inténtalo nuevamente en un momento.", 409);
    attemptStatus = "COMPLETED";
  }
  if (!['COMPLETED', 'CLAIMED'].includes(attemptStatus)) throw new NeurofitnessDataError("Completa primero los cuatro desafíos.", 409);
  let reservedClaim = false;
  if (attemptStatus === "COMPLETED") {
    const reserved = await db.prepare(`UPDATE neurofitness_attempts SET status = 'CLAIMING', updated_at = ? WHERE id = ? AND status = 'COMPLETED' RETURNING id`)
      .bind(new Date().toISOString(), input.id).first<{ id: string }>();
    if (!reserved) throw new NeurofitnessDataError("El resultado se está registrando. Inténtalo nuevamente en un momento.", 409);
    reservedClaim = true;
  }
  const campaignKey = String(row.campaign_key);
  const phoneHash = await sha256Hex(`${campaignKey}:${input.phone}`);
  const now = new Date().toISOString();
  const rankingAlias = input.rankingConsent ? safeRankingName(input.name, input.rankingAlias) : null;

  try {
    let participant: AttemptRow | null = null;
    if (attemptStatus === "CLAIMED") {
      const linkedParticipantId = String(row.participant_id || "");
      if (!linkedParticipantId) throw new NeurofitnessDataError("Este resultado ya fue registrado.", 409);
      participant = await db.prepare(`SELECT * FROM neurofitness_participants WHERE id = ? LIMIT 1`).bind(linkedParticipantId).first<AttemptRow>();
      if (!participant || String(participant.phone_hash) !== phoneHash) {
        throw new NeurofitnessDataError("Este resultado ya fue registrado con otro WhatsApp.", 409);
      }
    } else {
      participant = await db.prepare(`SELECT * FROM neurofitness_participants WHERE campaign_key = ? AND phone_hash = ? LIMIT 1`)
        .bind(campaignKey, phoneHash).first<AttemptRow>();
    }
    if (!participant) {
      const participantId = crypto.randomUUID();
      await db.prepare(`INSERT OR IGNORE INTO neurofitness_participants (id, campaign_key, name, ranking_alias, phone, phone_hash, best_attempt_id, result_consent_at, marketing_consent_at, ranking_consent_at, consent_version, source_event, whatsapp_delivery_status, whatsapp_attempt_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?)`)
        .bind(participantId, campaignKey, input.name, rankingAlias, input.phone, phoneHash, input.id, now, input.marketingConsent ? now : null, input.rankingConsent ? now : null, NEUROFITNESS_CONSENT_VERSION, input.sourceEvent, input.id, now, now).run();
      participant = await db.prepare(`SELECT * FROM neurofitness_participants WHERE campaign_key = ? AND phone_hash = ? LIMIT 1`)
        .bind(campaignKey, phoneHash).first<AttemptRow>();
    }
    if (!participant) throw new NeurofitnessDataError("No pudimos guardar el registro. Inténtalo nuevamente.", 500);

    const participantId = String(participant.id);
    const currentScores = rowScores(row);
    const attemptDeliveryStatus = String(row.whatsapp_delivery_status || "PENDING");
    await db.batch([
      db.prepare(`UPDATE neurofitness_participants SET name = ?, ranking_alias = ?, phone = ?, best_attempt_id = CASE WHEN COALESCE((SELECT total_score FROM neurofitness_attempts WHERE id = neurofitness_participants.best_attempt_id), -1) < ? THEN ? ELSE best_attempt_id END, result_consent_at = ?, marketing_consent_at = ?, ranking_consent_at = ?, consent_version = ?, source_event = ?, whatsapp_delivery_status = ?, whatsapp_attempt_id = ?, whatsapp_delivery_error = NULL, updated_at = ? WHERE id = ?`)
        .bind(input.name, rankingAlias, input.phone, currentScores.total, input.id, now, input.marketingConsent ? now : null, input.rankingConsent ? now : null, NEUROFITNESS_CONSENT_VERSION, input.sourceEvent, attemptDeliveryStatus === "SENT" ? "SENT" : "PENDING", input.id, now, participantId),
      db.prepare(`UPDATE neurofitness_attempts SET status = 'CLAIMED', participant_id = ?, claimed_at = COALESCE(claimed_at, ?), updated_at = ? WHERE id = ? AND status = ?`)
        .bind(participantId, now, now, input.id, attemptStatus === "COMPLETED" ? "CLAIMING" : "CLAIMED"),
    ]);

    const refreshedParticipant = await db.prepare(`SELECT * FROM neurofitness_participants WHERE id = ? LIMIT 1`).bind(participantId).first<AttemptRow>() || participant;
    const bestScoreRow = await db.prepare(`SELECT * FROM neurofitness_attempts WHERE id = ? LIMIT 1`).bind(String(refreshedParticipant.best_attempt_id)).first<AttemptRow>() || row;
    const rankingScores = rowScores(bestScoreRow);
    const rankRow = input.rankingConsent
      ? await db.prepare(`SELECT COUNT(*) AS count FROM neurofitness_participants p JOIN neurofitness_attempts a ON a.id = p.best_attempt_id WHERE p.campaign_key = ? AND p.ranking_consent_at IS NOT NULL AND a.status = 'CLAIMED' AND a.total_score > ?`).bind(campaignKey, rankingScores.total).first<{ count: number }>()
      : null;
    const participantCountRow = await db.prepare(`SELECT COUNT(*) AS count FROM neurofitness_participants p JOIN neurofitness_attempts a ON a.id = p.best_attempt_id WHERE p.campaign_key = ? AND p.ranking_consent_at IS NOT NULL AND a.status = 'CLAIMED'`).bind(campaignKey).first<{ count: number }>();
    const deliveryCutoff = new Date(Date.now() - 2 * 60_000).toISOString();
    const deliveryReservation = await db.prepare(`UPDATE neurofitness_attempts SET whatsapp_delivery_status = 'SENDING', whatsapp_delivery_started_at = ?, whatsapp_delivery_error = NULL, updated_at = ? WHERE id = ? AND (whatsapp_delivery_status IN ('PENDING', 'FAILED') OR (whatsapp_delivery_status = 'SENDING' AND whatsapp_delivery_started_at < ?)) RETURNING id`)
      .bind(now, now, input.id, deliveryCutoff).first<{ id: string }>();
    return {
      participantId,
      campaignKey,
      scores: currentScores,
      rankingScores,
      isPersonalBest: String(refreshedParticipant.best_attempt_id) === input.id,
      rank: input.rankingConsent ? Number(rankRow?.count || 0) + 1 : null,
      participantCount: Number(participantCountRow?.count || 0),
      shouldSendWhatsApp: Boolean(deliveryReservation),
      whatsappDeliveryStatus: deliveryReservation ? "SENDING" : attemptDeliveryStatus,
    };
  } catch (error) {
    if (reservedClaim) {
      await db.prepare(`UPDATE neurofitness_attempts SET status = 'COMPLETED', updated_at = ? WHERE id = ? AND status = 'CLAIMING'`).bind(new Date().toISOString(), input.id).run().catch(() => undefined);
    }
    throw error;
  }
}

export async function markNeurofitnessWhatsAppDelivery(input: { participantId: string; attemptId: string; status: "SENT" | "FAILED" | "SKIPPED"; messageId?: string | null; error?: string | null }) {
  const db = await ensureDatabase();
  const now = new Date().toISOString();
  await db.batch([
    db.prepare(`UPDATE neurofitness_attempts SET whatsapp_delivery_status = ?, whatsapp_message_id = ?, whatsapp_delivery_error = ?, whatsapp_delivered_at = ?, updated_at = ? WHERE id = ?`)
      .bind(input.status, input.messageId || null, input.error?.slice(0, 300) || null, input.status === "SENT" ? now : null, now, input.attemptId),
    db.prepare(`UPDATE neurofitness_participants SET whatsapp_delivery_status = ?, whatsapp_message_id = ?, whatsapp_delivery_error = ?, whatsapp_delivered_at = ?, updated_at = ? WHERE id = ? AND whatsapp_attempt_id = ?`)
      .bind(input.status, input.messageId || null, input.error?.slice(0, 300) || null, input.status === "SENT" ? now : null, now, input.participantId, input.attemptId),
  ]);
}

export async function getNeurofitnessLeaderboard(campaignKey: string, limit = 10): Promise<NeurofitnessLeaderboardEntry[]> {
  const db = await ensureDatabase();
  const result = await db.prepare(`SELECT p.ranking_alias, a.total_score FROM neurofitness_participants p JOIN neurofitness_attempts a ON a.id = p.best_attempt_id WHERE p.campaign_key = ? AND p.ranking_consent_at IS NOT NULL AND a.status = 'CLAIMED' ORDER BY a.total_score DESC, a.completed_at ASC LIMIT ?`)
    .bind(campaignKey, Math.min(Math.max(limit, 1), 100)).all<AttemptRow>();
  let previousScore: number | null = null;
  let position = 0;
  return result.results.map((entry, index) => {
    const total = Number(entry.total_score || 0);
    if (previousScore === null || total !== previousScore) position = index + 1;
    previousScore = total;
    return { position, name: String(entry.ranking_alias || "Participante"), total };
  });
}

export async function getNeurofitnessAdminOverview(campaignKey: string) {
  const db = await ensureDatabase();
  const [participants, completed, average, recent, rankingParticipants, leaderboard] = await Promise.all([
    db.prepare(`SELECT COUNT(*) AS count FROM neurofitness_participants p JOIN neurofitness_attempts a ON a.id = p.best_attempt_id WHERE p.campaign_key = ? AND a.status = 'CLAIMED'`).bind(campaignKey).first<{ count: number }>(),
    db.prepare(`SELECT COUNT(*) AS count FROM neurofitness_attempts WHERE campaign_key = ? AND status IN ('COMPLETED', 'CLAIMED')`).bind(campaignKey).first<{ count: number }>(),
    db.prepare(`SELECT AVG(total_score) AS average FROM neurofitness_attempts WHERE campaign_key = ? AND status = 'CLAIMED'`).bind(campaignKey).first<{ average: number | null }>(),
    db.prepare(`SELECT p.id, p.name, p.phone, p.ranking_alias, p.marketing_consent_at, p.ranking_consent_at, p.whatsapp_delivery_status, p.created_at, a.total_score, a.best_domain FROM neurofitness_participants p JOIN neurofitness_attempts a ON a.id = p.best_attempt_id WHERE p.campaign_key = ? AND a.status = 'CLAIMED' ORDER BY p.created_at DESC LIMIT 100`).bind(campaignKey).all<AttemptRow>(),
    db.prepare(`SELECT COUNT(*) AS count FROM neurofitness_participants p JOIN neurofitness_attempts a ON a.id = p.best_attempt_id WHERE p.campaign_key = ? AND p.ranking_consent_at IS NOT NULL AND a.status = 'CLAIMED'`).bind(campaignKey).first<{ count: number }>(),
    getNeurofitnessLeaderboard(campaignKey, 10),
  ]);
  const leads: NeurofitnessAdminLead[] = recent.results.map((entry) => ({
    id: String(entry.id),
    name: String(entry.name),
    phone: String(entry.phone),
    alias: entry.ranking_alias ? String(entry.ranking_alias) : null,
    total: Number(entry.total_score || 0),
    bestDomain: String(entry.best_domain || "focus"),
    marketingConsent: Boolean(entry.marketing_consent_at),
    rankingConsent: Boolean(entry.ranking_consent_at),
    whatsappStatus: String(entry.whatsapp_delivery_status || "PENDING"),
    createdAt: String(entry.created_at),
  }));
  return {
    participants: Number(participants?.count || 0),
    completed: Number(completed?.count || 0),
    average: Math.round(Number(average?.average || 0)),
    rankingParticipants: Number(rankingParticipants?.count || 0),
    leads,
    leaderboard,
  };
}
