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
import { needsHumanHandoff } from "./whatsapp-ai-config";

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
    const [settings, catalog] = await Promise.all([getSettings(), getWhatsAppCatalog()]);
    const interest = detectCatalogInterest(input.content, catalog);
    if (interest) {
      await setWhatsAppConversationInterest(conversation.id, interest);
      conversation = { ...conversation, productInterest: interest };
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
    const delay = Math.min(Math.max(Number(settings.whatsappAiResponseDelayMs || 0), 0), 5000);
    if (delay) await wait(delay);
    let reply: string;
    try {
      reply = await generateWhatsAppReply(conversation);
    } catch (error) {
      console.error(JSON.stringify({ scope: "whatsapp", event: "ai_error", error: error instanceof Error ? error.message.replace(/[\r\n]+/g, " ").slice(0, 220) : "unknown" }));
      await setWhatsAppConversationMode(conversation.id, "HUMAN");
      reply = settings.whatsappAiHandoffMessage;
      const sent = await sendWhatsAppMessage(conversation.jid, reply);
      await recordWhatsAppOutgoing({ conversationId: conversation.id, providerMessageId: sent.id, content: reply, senderType: "AI", sentAt: sent.sentAt });
      return { accepted: true, mode: "HUMAN", replied: true, aiError: true };
    }
    const sent = await sendWhatsAppMessage(conversation.jid, reply);
    await recordWhatsAppOutgoing({ conversationId: conversation.id, providerMessageId: sent.id, content: reply, senderType: "AI", sentAt: sent.sentAt });
    return { accepted: true, mode: "AI", replied: true };
  } catch (error) {
    if (!messageRecorded) await releaseWhatsAppEvent(input.providerMessageId).catch(() => undefined);
    throw error;
  }
}
