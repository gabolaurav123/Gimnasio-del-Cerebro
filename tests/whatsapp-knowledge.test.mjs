import assert from "node:assert/strict";
import test from "node:test";
import {
  WHATSAPP_KNOWLEDGE,
  buildWhatsAppKnowledgeMenu,
  buildWhatsAppKnowledgeReply,
  getWhatsAppKnowledgeSelection,
  matchWhatsAppKnowledge,
  normalizeKnowledgeText,
  publishedKnowledgeItem,
  whatsAppKnowledgeContext,
} from "../lib/whatsapp-knowledge.ts";

const expectedIds = [
  "super-cerebro", "neurofitness-active", "neurotraumas", "brain-full-training",
  "neuroconstelaciones", "neuroconstelaciones-holograficas-express", "algoritmos-pedagogicos",
  "neurotrainer", "cartas-neurofitness", "libro-transforma", "libro-guerrero",
];

function entry(id) {
  const found = WHATSAPP_KNOWLEDGE.find((item) => item.id === id);
  assert.ok(found, `Missing editorial entry: ${id}`);
  return found;
}

function item({ name, slug, type = "TRAINING", ...rest }) {
  return {
    id: slug, type, category: type === "TRAINING" ? "programas" : "productos", name, slug,
    description: "Descripción antigua del catálogo", details: "", price: "USD 123,45",
    checkoutProvider: "HOTMART", acquisitionUrl: `https://sitio-de-prueba.example/adquirir/${slug}`,
    ...rest,
  };
}

function catalog(allItems = []) {
  return {
    websiteUrl: "https://dominio-configurado.example",
    catalogUrl: "https://dominio-configurado.example/entrenamientos?origen=whatsapp",
    currentCampaign: null,
    categories: { programas: [], cursos: [], neuroretos: [], talleres: [] },
    products: allItems.filter((record) => record.type === "PRODUCT"),
    allItems,
  };
}

test("la base editorial tiene once opciones completas y dos libros, sin duplicados", () => {
  assert.deepEqual(WHATSAPP_KNOWLEDGE.map((record) => record.id), expectedIds);
  assert.equal(new Set(WHATSAPP_KNOWLEDGE.map((record) => record.id)).size, 11);
  for (const record of WHATSAPP_KNOWLEDGE) {
    for (const field of ["name", "emoji", "summary", "situation", "proposal", "question"]) {
      assert.equal(typeof record[field], "string", `${record.id}.${field}`);
      assert.ok(record[field].trim(), `${record.id}.${field}`);
    }
    assert.ok(record.aliases.length > 0, record.id);
    assert.ok(record.practice.length > 0, record.id);
    assert.doesNotMatch(JSON.stringify(record), /&#x20;|\[16:50,|Martha Rodriguez:/);
  }
  assert.deepEqual(WHATSAPP_KNOWLEDGE.filter((record) => record.kind === "BOOK").map((record) => record.id), ["libro-transforma", "libro-guerrero"]);
  assert.equal(entry("cartas-neurofitness").kind, "TOOL");
});

test("el menú incluye las once opciones, el enlace configurado completo y cabe en WhatsApp", () => {
  const current = catalog();
  const menu = buildWhatsAppKnowledgeMenu(current);
  for (const record of WHATSAPP_KNOWLEDGE) assert.ok(menu.includes(`*${record.name}:*`), record.id);
  assert.ok(menu.includes(current.catalogUrl));
  assert.doesNotMatch(menu, /seenode\.app|chatgpt\.site/);
  assert.match(menu, /consultas con Marisa Cardozo/);
  assert.match(menu, /BioShield/);
  assert.match(menu, /Cuéntame qué quieres trabajar/);
  assert.ok(menu.length <= 2800, `Menu length ${menu.length} exceeds normalizer limit 2800`);
  assert.ok(menu.length <= 3000, "Menu exceeds transport limit");
});

test("todas las explicaciones fijas son completas y respetan el límite de 2800 caracteres", () => {
  for (const record of WHATSAPP_KNOWLEDGE) {
    const reply = buildWhatsAppKnowledgeReply(record, catalog());
    assert.ok(reply.includes(`*${record.name}*`), record.id);
    assert.match(reply, /¿Qué propone\?/);
    assert.match(reply, /¿Qué practicas\?/);
    assert.ok(reply.endsWith(record.question), record.id);
    assert.ok(reply.length <= 2800, `${record.id}: ${reply.length} characters`);
    assert.match(reply, /consultar con el equipo su disponibilidad y el enlace correcto/);
    assert.doesNotMatch(reply, /https?:\/\//, record.id);
  }
});

test("Super Cerebro integra tres entrenamientos y los datos de 45 clases son exclusivos de Express", () => {
  const superCerebro = entry("super-cerebro");
  for (const title of ["Neurofitness Active", "Neurotraumas", "Brain Full Training"]) assert.ok(superCerebro.proposal.includes(title));
  const express = entry("neuroconstelaciones-holograficas-express");
  for (const fact of ["45 clases", "La Rueda del Alma", "El Reloj Emocional", "Tarjetas Holográficas", "acceso vitalicio", "Hotmart"]) assert.ok(express.format.includes(fact), fact);
  for (const record of WHATSAPP_KNOWLEDGE.filter((record) => record !== express)) {
    assert.doesNotMatch(JSON.stringify(record), /45 clases|Tarjetas Holográficas|acceso vitalicio/);
  }
  assert.match(entry("algoritmos-pedagogicos").format, /continuidad semanal/);
});

test("la normalización admite tildes, comillas y separadores sin coincidencias parciales", () => {
  assert.equal(normalizeKnowledgeText('  Cartas “5 Pasos · 9 Retos” '), "cartas 5 pasos 9 retos");
  assert.equal(normalizeKnowledgeText("ALGORITMOS-PEDAGÓGICOS"), "algoritmos pedagogicos");
  for (const [message, id] of [
    ["Háblame de ALGORITMOS PEDAGÓGICOS", "algoritmos-pedagogicos"],
    ["Cartas: 5 Pasos · 9 Retos", "cartas-neurofitness"],
    ["Quiero Brainful Training", "brain-full-training"],
    ["¿Qué es BFT?", "brain-full-training"],
    ["Supercerebro", "super-cerebro"],
    ["Formación de Neuroentrenadores", "neurotrainer"],
    ["Transforma tu bio-computadora", "libro-transforma"],
    ["Quisiera Soy Guerrero Soy Luz", "libro-guerrero"],
  ]) assert.equal(matchWhatsAppKnowledge(message)?.id, id, message);
  for (const message of ["alpinismo", "renfa", "supercerebros", "brainfulness", ""]) assert.equal(matchWhatsAppKnowledge(message), undefined, message);
});

test("cada alias explícito identifica su opción editorial", () => {
  for (const record of WHATSAPP_KNOWLEDGE) {
    for (const alias of record.aliases) assert.equal(matchWhatsAppKnowledge(alias)?.id, record.id, `${record.id}: ${alias}`);
  }
});

test("los alias largos distinguen las cartas y Express de los programas base", () => {
  assert.equal(matchWhatsAppKnowledge("Cartas Neurofitness Active")?.id, "cartas-neurofitness");
  assert.equal(matchWhatsAppKnowledge("Neuroconstelaciones Holográficas Express")?.id, "neuroconstelaciones-holograficas-express");
  assert.equal(matchWhatsAppKnowledge("Neurotrainer – Maestría en Neurofitness Active")?.id, "neurotrainer");
  for (const message of [
    "Neurofitness Active Express", "Neurotraumas Express", "Maestría Neurotraumas",
    "Super Cerebro — Master Class", "Super Cerebro masterclass",
    "Taller Neuroconstelaciones Holográficas", "Neuroconstelaciones Holográficas",
  ]) assert.equal(matchWhatsAppKnowledge(message), undefined, message);
});

test("la selección fija admite nombres y pedidos de información breves", () => {
  for (const record of WHATSAPP_KNOWLEDGE) assert.equal(getWhatsAppKnowledgeSelection(record.name)?.id, record.id, record.name);
  for (const [message, id] of [
    ["Hola, me interesa Neurofitness Active", "neurofitness-active"],
    ["¿Qué es Brain Full Training?", "brain-full-training"],
    ["Quiero información sobre Neurotraumas", "neurotraumas"],
    ["Cuéntame sobre el libro Soy Guerrero Soy Luz por favor", "libro-guerrero"],
    ["Háblame de el programa Super Cerebro", "super-cerebro"],
    ["Elijo Algoritmos Pedagógicos", "algoritmos-pedagogicos"],
    ["Quiero información sobre las cartas Neurofitness Active", "cartas-neurofitness"],
  ]) assert.equal(getWhatsAppKnowledgeSelection(message)?.id, id, message);
});

test("preguntas específicas, comparaciones, negaciones y seguimientos conservan la ruta contextual", () => {
  for (const message of [
    "¿Cuánto cuesta Neurofitness Active?", "¿Cuánto dura Neurotraumas?", "¿Dónde compro las cartas?",
    "¿Y cuánto cuesta?", "¿Y los horarios?", "Quiero pagar Super Cerebro",
    "No quiero Neurofitness Active", "No me interesa Neurotraumas", "Ya tengo Neurofitness Active",
    "Neurofitness Active o Brain Full Training", "Compara Neurotraumas y Neurofitness Active",
    "Quiero información sobre Neurotraumas y su precio", "Neurofitness Active Express", "Hola", "2",
  ]) assert.equal(getWhatsAppKnowledgeSelection(message), undefined, message);
});

test("las compras exactas conservan precio y URL dinámicos sin reconstruirlos", () => {
  const exact = item({ name: "Neurofitness Active", slug: "neurofitness-active", acquisitionUrl: "https://compras.example/nfa?v=vigente#confirmar" });
  const current = catalog([exact]);
  const matched = publishedKnowledgeItem(entry("neurofitness-active"), current);
  assert.equal(matched, exact);
  assert.ok(buildWhatsAppKnowledgeReply(entry("neurofitness-active"), current).includes(exact.acquisitionUrl));
  const context = whatsAppKnowledgeContext(current);
  assert.ok(context.includes(`Precio: ${exact.price}. Enlace exacto: ${exact.acquisitionUrl}`));
});

test("las cartas se corresponden con Cartas Neurofitness Active del catálogo de productos", () => {
  const cards = item({ name: "Cartas Neurofitness Active", slug: "cartas-neurofitness-active", type: "PRODUCT" });
  const sameNameTraining = { ...cards, type: "TRAINING" };
  assert.equal(publishedKnowledgeItem(entry("cartas-neurofitness"), catalog([sameNameTraining, cards])), cards);
});

test("el libro Transforma nunca hereda el checkout del curso homónimo", () => {
  const course = item({ name: "Transforma tu Biocomputadora", slug: "transforma-tu-biocomputadora" });
  assert.equal(publishedKnowledgeItem(entry("libro-transforma"), catalog([course])), undefined);
  const reply = buildWhatsAppKnowledgeReply(entry("libro-transforma"), catalog([course]));
  assert.match(reply, /es un libro/);
  assert.ok(!reply.includes(course.acquisitionUrl));
  const book = { ...course, type: "PRODUCT", acquisitionUrl: "https://compras.example/libro-transforma" };
  assert.equal(publishedKnowledgeItem(entry("libro-transforma"), catalog([course, book])), book);
});

test("Super Cerebro no hereda Master Class ni una campaña ajena", () => {
  const masterClass = item({ name: "Super Cerebro — Master Class", slug: "super-cerebro-master-class" });
  const otherCampaign = item({ name: "Neurofitness Active", slug: "neurofitness-active" });
  const current = { ...catalog([masterClass, otherCampaign]), currentCampaign: otherCampaign };
  assert.equal(publishedKnowledgeItem(entry("super-cerebro"), current), undefined);
  const reply = buildWhatsAppKnowledgeReply(entry("super-cerebro"), current);
  assert.ok(!reply.includes(masterClass.acquisitionUrl));
  assert.ok(!reply.includes(otherCampaign.acquisitionUrl));
});

test("Holográficas Express no hereda precio ni enlace de un taller o programa parecido", () => {
  const oldProgram = item({ name: "Neuroconstelaciones Holográficas", slug: "neuroconstelaciones-holograficas" });
  const workshop = item({ name: "Taller Neuroconstelaciones Holográficas", slug: "taller-neuroconstelaciones-holograficas" });
  const current = catalog([oldProgram, workshop]);
  for (const id of ["neuroconstelaciones", "neuroconstelaciones-holograficas-express"]) {
    assert.equal(publishedKnowledgeItem(entry(id), current), undefined, id);
    assert.ok(!buildWhatsAppKnowledgeReply(entry(id), current).includes(oldProgram.acquisitionUrl));
    assert.ok(!buildWhatsAppKnowledgeReply(entry(id), current).includes(workshop.acquisitionUrl));
  }
});

test("el contexto atribuye los marcos al GDC y distingue contenido de disponibilidad comercial", () => {
  const context = whatsAppKnowledgeContext(catalog());
  assert.match(context, /descripciones prevalecen sobre resúmenes antiguos/);
  assert.match(context, /Precios, fechas y URLs proceden exclusivamente del catálogo dinámico del producto exacto/);
  assert.match(context, /Transforma tu Biocomputadora \(LIBRO\)/);
  assert.match(context, /Soy Guerrero Soy Luz \(LIBRO\)/);
  assert.equal((context.match(/SIN CORRESPONDENCIA COMERCIAL VERIFICADA/g) || []).length, 11);
  assert.match(context, /no mecanismos científicos demostrados ni tratamientos médicos/);
  assert.match(context, /no como tratamiento clínico probado ni promesa de eliminar traumas/);
  assert.match(context, /No responsabilizar a alguien de haber causado un trauma o enfermedad/);
});
