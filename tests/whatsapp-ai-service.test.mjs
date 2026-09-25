import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { webcrypto } from "node:crypto";
import test from "node:test";
import ts from "typescript";
import * as policy from "../lib/whatsapp-ai-config.ts";
import * as safety from "../lib/whatsapp-ai-safety.ts";
import * as knowledge from "../lib/whatsapp-knowledge.ts";

const source = await readFile(new URL("../lib/whatsapp-ai-service.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const item = {
  id: "nfa", type: "TRAINING", name: "Neurofitness Active", slug: "neurofitness-active", category: "programas",
  description: "Resumen antiguo", details: "Descripción anterior", price: "USD 123,00", checkoutProvider: "HOTMART",
  acquisitionUrl: "https://example.test/checkout/entrenamiento/neurofitness-active",
};
const catalog = {
  websiteUrl: "https://example.test", catalogUrl: "https://example.test/entrenamientos",
  currentCampaign: { ...item, name: "Otra campaña" },
  categories: { programas: [item], cursos: [], neuroretos: [], talleres: [] }, products: [], allItems: [item],
};

function harness({ history = [], configured = true } = {}) {
  const requests = [];
  let configurationReads = 0;
  const settings = {
    whatsappAiModel: "gpt-5.6-luna", whatsappAiGreeting: "Saludo personalizado del administrador",
    whatsappAiInstructions: "Responde siempre en menos de 900 caracteres y usa como máximo un emoji.",
    whatsappAiBusinessHours: "Consultar horarios en la agenda",
  };
  const modules = {
    "../db/repository": { getSettings: async () => settings, getWhatsAppMessages: async () => history },
    "./catalog-service": { getWhatsAppCatalog: async () => catalog, catalogContext: () => "Catálogo dinámico verificado" },
    "./runtime-env": { getRuntimeValues: async () => ({}) },
    "./openai-config": { getOpenAIConfiguration: async () => { configurationReads++; return { apiKey: configured ? "test-key-not-real" : "" }; } },
    "./whatsapp-ai-config": policy,
    "./whatsapp-ai-safety": safety,
    "./whatsapp-knowledge": knowledge,
  };
  const exports = {};
  runInNewContext(outputText, {
    exports, crypto: webcrypto, TextEncoder, AbortSignal, setTimeout,
    require: (specifier) => { assert.ok(modules[specifier], specifier); return modules[specifier]; },
    fetch: async (url, options) => {
      requests.push({ url, ...options, body: JSON.parse(options.body) });
      return { ok: true, status: 200, json: async () => ({ output_text: "El precio registrado es USD 123,00." }) };
    },
  });
  return { ...exports, requests, settings, configurationReads: () => configurationReads };
}

test("la vista previa da el menú completo sin OpenAI ni límites del saludo antiguo", async () => {
  const service = harness({ configured: false });
  const reply = await service.previewWhatsAppReply("Hola, ¿qué ofrecen?");
  for (const entry of knowledge.WHATSAPP_KNOWLEDGE) assert.ok(reply.includes(entry.name), entry.name);
  assert.ok(reply.includes(catalog.catalogUrl));
  assert.equal(service.requests.length, 0);
  assert.equal(service.configurationReads(), 0);
  assert.ok(reply.length <= 3000);
  assert.equal(await service.previewWhatsAppReply("Hola"), service.settings.whatsappAiGreeting);
});

test("cada selección simple recibe su explicación específica también sin OpenAI", async () => {
  const service = harness({ configured: false });
  for (const entry of knowledge.WHATSAPP_KNOWLEDGE) {
    const reply = await service.previewWhatsAppReply(`Me interesa ${entry.name}`);
    assert.ok(reply.includes(entry.proposal), entry.name);
    assert.ok(reply.includes(entry.question), entry.name);
    assert.ok(reply.length <= 2800, `${entry.name}: ${reply.length}`);
  }
  assert.equal(service.requests.length, 0);
});

test("los mensajes recibidos y la vista previa usan la misma explicación y menú", async () => {
  for (const content of ["¿Qué ofrecen?", "¿Qué es Neurofitness Active?"]) {
    const service = harness({ history: [{ direction: "INBOUND", content }] });
    const incoming = await service.generateWhatsAppReply({ id: "conversation-1", phoneNumber: "123456" });
    const preview = await service.previewWhatsAppReply(content);
    assert.equal(incoming, preview);
    assert.equal(service.requests.length, 0);
  }
});

test("una pregunta de precio conserva el historial y recibe contenido editorial y comercio exacto", async () => {
  const history = [
    { direction: "INBOUND", content: "Me interesa Neurofitness Active" },
    { direction: "OUTBOUND", content: "Neurofitness Active trabaja la autogestión." },
    { direction: "INBOUND", content: "¿Y cuánto cuesta?" },
  ];
  const service = harness({ history });
  const reply = await service.generateWhatsAppReply({ id: "conversation-1", phoneNumber: "123456" });
  assert.equal(reply, "El precio registrado es USD 123,00.");
  assert.equal(service.requests.length, 1);
  const { body } = service.requests[0];
  assert.deepEqual(body.input, history.map((message) => ({ role: message.direction === "INBOUND" ? "user" : "assistant", content: message.content })));
  assert.equal(body.model, "gpt-5.6-luna");
  assert.equal(body.store, false);
  assert.match(body.safety_identifier, /^[a-f0-9]{64}$/);
  assert.match(body.instructions, /ESTA CONVERSACIÓN YA ESTÁ EN CURSO/);
  assert.match(body.instructions, /BASE EDITORIAL GDC/);
  assert.ok(body.instructions.includes(item.price));
  assert.ok(body.instructions.includes(item.acquisitionUrl));
  assert.match(body.instructions, /campaña destacada es opcional/);
  assert.match(body.instructions, /no deben.*imponer antiguos límites/s);
  assert.match(body.instructions, /Transforma tu Biocomputadora \(LIBRO\)/);
  assert.match(body.instructions, /SIN CORRESPONDENCIA COMERCIAL VERIFICADA/);
});

test("consultas específicas, comparaciones y referencias numéricas no se sustituyen por plantillas", async () => {
  for (const message of ["¿Cuánto dura Neurofitness Active?", "No quiero Neurotraumas", "Compara Neurofitness y Brain Full Training", "2", "Quiero comprar las cartas"]) {
    const service = harness();
    await service.previewWhatsAppReply(message);
    assert.equal(service.requests.length, 1, message);
    assert.equal(service.requests[0].body.input[0].content, message);
  }
});

test("más información conserva el tema previo y un menú explícito permite cambiarlo", async () => {
  const selectedHistory = [
    { direction: "INBOUND", content: "Me interesa Neurofitness Active" },
    { direction: "OUTBOUND", content: "Neurofitness Active trabaja la autogestión." },
  ];
  for (const content of ["Quiero más información", "información", "más info", "me pueden dar información"]) {
    const service = harness({ history: [...selectedHistory, { direction: "INBOUND", content }] });
    await service.generateWhatsAppReply({ id: "conversation-1", phoneNumber: "123456" });
    assert.equal(service.requests.length, 1, content);
    assert.equal(service.requests[0].body.input.at(-1).content, content);
  }
  for (const content of ["Menú", "¿Qué ofrecen?"]) {
    const service = harness({ configured: false, history: [...selectedHistory, { direction: "INBOUND", content }] });
    const reply = await service.generateWhatsAppReply({ id: "conversation-1", phoneNumber: "123456" });
    assert.ok(reply.includes("Soy Guerrero Soy Luz"));
    assert.equal(service.requests.length, 0);
  }
});

test("tras un simple saludo la petición de información sigue mostrando el menú sin IA", async () => {
  const service = harness({ configured: false, history: [
    { direction: "INBOUND", content: "Hola" },
    { direction: "OUTBOUND", content: policy.DEFAULT_WHATSAPP_GREETING },
    { direction: "INBOUND", content: "Quiero información" },
  ] });
  const reply = await service.generateWhatsAppReply({ id: "conversation-1", phoneNumber: "123456" });
  assert.ok(reply.includes("Soy Guerrero Soy Luz"));
  assert.equal(service.requests.length, 0);
});
