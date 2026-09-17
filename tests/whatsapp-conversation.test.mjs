import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import test from "node:test";
import ts from "typescript";
import * as policy from "../lib/whatsapp-ai-config.ts";
import { whatsAppGenerationOptions } from "../lib/whatsapp-ai-safety.ts";

// Run the real conversation orchestrator with isolated database/provider
// adapters. No WhatsApp messages, database writes or OpenAI requests leave tests.
const source = await readFile(new URL("../lib/conversation-service.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });

function harness({ mode = "AI", enabled = true, failAI = false, duplicate = false, greeting = policy.DEFAULT_WHATSAPP_GREETING } = {}) {
  const state = { mode, failAI, sent: [], recorded: [], modeChanges: [], aiCalls: 0, catalogCalls: 0 };
  const conversation = () => ({ id: "conversation-1", jid: "test@s.whatsapp.net", phoneNumber: "123456789", mode: state.mode, productInterest: null });
  const modules = {
    "../db/repository": {
      claimWhatsAppEvent: async () => !duplicate,
      getSettings: async () => ({ whatsappAiEnabled: String(enabled), whatsappAiResponseDelayMs: "0", whatsappAiGreeting: greeting, whatsappAiHandoffMessage: "El equipo continuará tu consulta." }),
      recordWhatsAppIncoming: async () => conversation(),
      recordWhatsAppOutgoing: async (message) => state.recorded.push(message),
      releaseWhatsAppEvent: async () => undefined,
      setWhatsAppConversationInterest: async () => undefined,
      setWhatsAppConversationMode: async (_id, nextMode) => { state.modeChanges.push(nextMode); state.mode = nextMode; },
    },
    "./catalog-service": {
      getWhatsAppCatalog: async () => { state.catalogCalls += 1; return {}; },
      detectCatalogInterest: () => null,
    },
    "./whatsapp-bridge": {
      sendWhatsAppMessage: async (_jid, message) => { state.sent.push(message); return { id: `out-${state.sent.length}`, sentAt: new Date().toISOString() }; },
    },
    "./whatsapp-ai-service": {
      generateWhatsAppReply: async () => { state.aiCalls += 1; if (state.failAI) throw new Error("Upstream unavailable"); return "Puedes consultar los horarios en la agenda."; },
    },
    "./whatsapp-ai-config": policy,
    "./site-url": { getSiteOrigin: async () => "https://gimnasiodelcerebro.com" },
  };
  const exports = {};
  runInNewContext(outputText, {
    exports,
    require: (specifier) => { assert.ok(modules[specifier], `Unexpected dependency ${specifier}`); return modules[specifier]; },
    setTimeout,
    console: { error() {} },
  }, { filename: "conversation-service.test.js" });
  return {
    state,
    receive: (content) => exports.processIncomingWhatsApp({ providerMessageId: `in-${state.sent.length}`, jid: "test@s.whatsapp.net", phoneNumber: "123456789", contactName: "Prueba", content, receivedAt: new Date().toISOString() }),
  };
}

test("Hola recibe la bienvenida con consultas y catálogo aunque OpenAI no esté disponible", async () => {
  const { state, receive } = harness({ failAI: true });
  const result = await receive("¡Hola! 👋");
  assert.equal(result.greeting, true);
  assert.equal(state.aiCalls, 0);
  assert.equal(state.catalogCalls, 0);
  assert.equal(state.mode, "AI");
  assert.equal(state.sent.length, 1);
  assert.match(state.sent[0], /Consultas o sesiones/);
  assert.match(state.sent[0], /Programas, cursos, neuroretos o talleres/);
  assert.match(state.sent[0], /BioShield/);
  assert.equal(state.recorded[0].content, state.sent[0]);
});

test("el saludo configurado desde administración se conserva", async () => {
  const greeting = "¡Hola! ¿Buscas una consulta, un programa o un producto?";
  const { state, receive } = harness({ greeting });
  await receive("Buenas tardes");
  assert.equal(state.sent[0], greeting);
});

test("una pregunta concreta conserva su contexto y se envía a la IA", async () => {
  const { state, receive } = harness();
  await receive("Hola, quiero una consulta con la doctora Marisa");
  assert.equal(state.aiCalls, 1);
  assert.equal(state.sent[0], "Puedes consultar los horarios en la agenda.");
});

test("un fallo temporal ofrece enlaces y permite responder al siguiente mensaje", async () => {
  const { state, receive } = harness({ failAI: true });
  const result = await receive("¿Cuánto dura Neurofitness Active?");
  assert.equal(result.aiError, true);
  assert.equal(result.mode, "AI");
  assert.equal(state.modeChanges.length, 0);
  assert.match(state.sent[0], /https:\/\/gimnasiodelcerebro\.com\/agenda/);
  assert.doesNotMatch(state.sent[0], /qued[oó].*atenci[oó]n humana/i);
  state.failAI = false;
  await receive("¿Puedo consultar los horarios?");
  assert.equal(state.aiCalls, 2);
  assert.equal(state.sent.length, 2);
});

test("una conversación atendida por una persona no se reactiva por un saludo", async () => {
  const { state, receive } = harness({ mode: "HUMAN" });
  const result = await receive("Hola");
  assert.equal(result.replied, false);
  assert.equal(state.sent.length, 0);
  assert.equal(state.modeChanges.length, 0);
});

test("se respetan la desactivación global y los eventos duplicados", async () => {
  for (const options of [{ enabled: false }, { duplicate: true }]) {
    const { state, receive } = harness(options);
    await receive("Hola");
    assert.equal(state.sent.length, 0);
    assert.equal(state.aiCalls, 0);
  }
});

test("pedidos de atención humana, bajas y crisis siguen deteniendo la IA", async () => {
  for (const message of ["Quiero hablar con una persona", "STOP", "No quiero vivir"]) {
    const { state, receive } = harness();
    const result = await receive(message);
    assert.equal(result.mode, "HUMAN", message);
    assert.equal(state.mode, "HUMAN", message);
    assert.equal(state.sent.length, 1, message);
    assert.equal(state.aiCalls, 0, message);
  }
});

test("la bienvenida distingue saludos y preguntas generales de consultas específicas", () => {
  for (const message of ["Hola", "hola buenos días", "¡Buenas tardes! 😊", "Quiero información", "Hola, ¿qué ofrecen?", "¿Cuáles son sus servicios?"]) {
    assert.equal(policy.isGeneralWhatsAppEnquiry(message), true, message);
  }
  for (const message of ["Hola, quiero información del gorro", "¿Qué cursos tienen?", "Necesito una consulta", "No quiero recibir mensajes", "Quiero hablar con una persona", "hola 123", ""]) {
    assert.equal(policy.isGeneralWhatsAppEnquiry(message), false, message);
  }
});

test("el modelo Luna no agota el presupuesto breve en razonamiento oculto", () => {
  assert.equal(whatsAppGenerationOptions("gpt-5.6-luna").reasoning.effort, "none");
  assert.equal(whatsAppGenerationOptions("gpt-5.6-luna").max_output_tokens, 1200);
  assert.equal(whatsAppGenerationOptions("gpt-4.1-mini").reasoning, undefined);
});
