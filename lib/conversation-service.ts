import {
  claimWhatsAppEvent,
  getSettings,
  recordWhatsAppIncoming,
  recordWhatsAppOutgoing,
  releaseWhatsAppEvent,
  setWhatsAppConversationInterest,
  setWhatsAppConversationMode,
} from "../db/repository";
import { detectCatalogInterest, getWhatsAppCatalog } from "./catalog-service";
import { sendWhatsAppMessage } from "./whatsapp-bridge";
import { generateWhatsAppReply } from "./whatsapp-ai-service";
import { buildWhatsAppUnavailableReply, CRISIS_RESPONSE, getWhatsAppGreeting, isCrisisMessage, isWhatsAppGreeting, isOptOutRequest, needsHumanHandoff } from "./whatsapp-ai-config";
import { getSiteOrigin } from "./site-url";

export type IncomingWhatsAppMessage = {
  providerMessageId: string;
  jid: string;
  phoneNumber: string;
  contactName: string;
  content: string;
  receivedAt: string;
};

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export async function processIncomingWhatsApp(input: IncomingWhatsAppMessage) {
  if (!(await claimWhatsAppEvent(input.providerMessageId))) return { accepted: true, duplicate: true };
  let messageRecorded = false;
  try {
    let conversation = await recordWhatsAppIncoming(input);
    if (!conversation) throw new Error("No se pudo crear la conversación.");
    messageRecorded = true;
    const settings = await getSettings();
    if (isCrisisMessage(input.content)) {
      await setWhatsAppConversationMode(conversation.id, "HUMAN");
      const sent = await sendWhatsAppMessage(conversation.jid, CRISIS_RESPONSE);
      await recordWhatsAppOutgoing({ conversationId: conversation.id, providerMessageId: sent.id, content: CRISIS_RESPONSE, senderType: "AI", sentAt: sent.sentAt });
      return { accepted: true, mode: "HUMAN", replied: true, crisis: true };
    }
    if (isOptOutRequest(input.content)) {
      await setWhatsAppConversationMode(conversation.id, "HUMAN");
      const reply = "Entendido. Las respuestas automáticas quedaron detenidas. Si deseas reactivarlas, indícalo expresamente.";
      const sent = await sendWhatsAppMessage(conversation.jid, reply);
      await recordWhatsAppOutgoing({ conversationId: conversation.id, providerMessageId: sent.id, content: reply, senderType: "AI", sentAt: sent.sentAt });
      return { accepted: true, mode: "HUMAN", replied: true, optedOut: true };
    }
    if (conversation.mode === "HUMAN") return { accepted: true, mode: "HUMAN", replied: false };
    if (needsHumanHandoff(input.content)) {
      await setWhatsAppConversationMode(conversation.id, "HUMAN");
      const reply = settings.whatsappAiHandoffMessage;
      const sent = await sendWhatsAppMessage(conversation.jid, reply);
      await recordWhatsAppOutgoing({ conversationId: conversation.id, providerMessageId: sent.id, content: reply, senderType: "AI", sentAt: sent.sentAt });
      return { accepted: true, mode: "HUMAN", replied: true };
    }
    if (settings.whatsappAiEnabled !== "true") return { accepted: true, mode: "AI", replied: false };
    if (isWhatsAppGreeting(input.content)) {
      const reply = getWhatsAppGreeting(settings);
      const sent = await sendWhatsAppMessage(conversation.jid, reply);
      await recordWhatsAppOutgoing({ conversationId: conversation.id, providerMessageId: sent.id, content: reply, senderType: "AI", sentAt: sent.sentAt });
      return { accepted: true, mode: "AI", replied: true, greeting: true };
    }
    const delay = Math.min(Math.max(Number(settings.whatsappAiResponseDelayMs || 0), 0), 5000);
    if (delay) await wait(delay);
    let reply: string;
    try {
      const catalog = await getWhatsAppCatalog();
      const interest = detectCatalogInterest(input.content, catalog);
      if (interest) {
        await setWhatsAppConversationInterest(conversation.id, interest);
        conversation = { ...conversation, productInterest: interest };
      }
      reply = await generateWhatsAppReply(conversation);
    } catch (error) {
      console.error(JSON.stringify({ scope: "whatsapp", event: "ai_error", error: error instanceof Error ? error.message.replace(/[\r\n]+/g, " ").slice(0, 220) : "unknown" }));
      // A temporary provider failure must not permanently disable the assistant.
      reply = buildWhatsAppUnavailableReply(await getSiteOrigin());
      const sent = await sendWhatsAppMessage(conversation.jid, reply);
      await recordWhatsAppOutgoing({ conversationId: conversation.id, providerMessageId: sent.id, content: reply, senderType: "AI", sentAt: sent.sentAt });
      return { accepted: true, mode: "AI", replied: true, aiError: true };
    }
    const sent = await sendWhatsAppMessage(conversation.jid, reply);
    await recordWhatsAppOutgoing({ conversationId: conversation.id, providerMessageId: sent.id, content: reply, senderType: "AI", sentAt: sent.sentAt });
    return { accepted: true, mode: "AI", replied: true };
  } catch (error) {
    if (!messageRecorded) await releaseWhatsAppEvent(input.providerMessageId).catch(() => undefined);
    throw error;
  }
}
