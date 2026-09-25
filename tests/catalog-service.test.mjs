import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import test from "node:test";
import ts from "typescript";
import * as knowledge from "../lib/whatsapp-knowledge.ts";

const source = await readFile(new URL("../lib/catalog-service.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const categories = [
  { key: "programas", label: "Programas" }, { key: "cursos", label: "Cursos" },
  { key: "neuroretos", label: "Neuroretos" }, { key: "talleres", label: "Talleres" },
];

function harness({ trainings = [], products = [], settings = {}, origin = "https://catalogo.example" } = {}) {
  const calls = [];
  const modules = {
    "../db/repository": {
      getTrainings: async () => { calls.push("trainings"); return trainings; },
      getProducts: async () => { calls.push("products"); return products; },
      getSettings: async () => settings,
    },
    "./training-categories": { trainingCategories: categories, trainingBelongsTo: (record, category) => record.category === category },
    "./product-routes": { productCatalogActionPath: (slug) => `/productos/${slug}` },
    "./site-url": { getSiteOrigin: async () => origin },
    "./whatsapp-knowledge": knowledge,
  };
  const exports = {};
  runInNewContext(outputText, {
    exports,
    require: (specifier) => { assert.ok(modules[specifier], `Unexpected dependency: ${specifier}`); return modules[specifier]; },
  }, { filename: "catalog-service.test.js" });
  return { ...exports, calls };
}

function item(name, slug, overrides = {}) {
  return {
    id: slug, name, slug, type: "TRAINING", category: "programas",
    description: `Descripción anterior de ${name}`, details: `Detalle anterior de ${name}`,
    price: "USD 99,00", checkoutProvider: "HOTMART", acquisitionUrl: `https://catalogo.example/adquirir/${slug}`,
    ...overrides,
  };
}

function catalog(allItems, currentCampaign = null) {
  return {
    websiteUrl: "https://catalogo.example", catalogUrl: "https://catalogo.example/entrenamientos",
    categories: Object.fromEntries(categories.map(({ key }) => [key, allItems.filter((record) => record.type === "TRAINING" && record.category === key)])),
    products: allItems.filter((record) => record.type === "PRODUCT"),
    allItems, currentCampaign,
  };
}

test("el interés real elige Express aunque el programa base figure primero", () => {
  const service = harness();
  for (const [name, slug] of [["Neurofitness Active", "neurofitness-active"], ["Neurotraumas", "neurotraumas"]]) {
    const base = item(name, slug);
    const express = item(`${name} Express`, `${slug}-express`, { category: "cursos" });
    const current = catalog([base, express]);
    assert.equal(service.detectCatalogInterest(`Quiero información de ${name} Express`, current), express.name);
    assert.equal(service.detectCatalogInterest(name, current), base.name);
  }
});

test("el interés escoge el nombre más específico normalizando tildes y puntuación", () => {
  const service = harness();
  const base = item("Neuroconstelaciones", "neuroconstelaciones");
  const holographic = item("Neuroconstelaciones Holográficas", "neuroconstelaciones-holograficas");
  const express = item("Neuroconstelaciones Holográficas Express", "neuroconstelaciones-holograficas-express");
  const current = catalog([base, holographic, express]);
  for (const message of ["Me interesa: NEUROCONSTELACIONES-HOLOGRÁFICAS-EXPRESS", "¿Neuroconstelaciones Holograficas Express?", "neuroconstelaciones/holográficas/express"]) {
    assert.equal(service.detectCatalogInterest(message, current), express.name, message);
  }
  assert.equal(service.detectCatalogInterest("neuroconstelacionesholograficas", current), null);
});

test("una edición Express no publicada no se registra como interés en el programa base", () => {
  const service = harness();
  for (const [name, slug] of [["Neurofitness Active", "neurofitness-active"], ["Neurotraumas", "neurotraumas"]]) {
    const base = item(name, slug);
    assert.notEqual(service.detectCatalogInterest(`Me interesa ${name} Express`, catalog([base])), base.name, name);
  }
});

test("Super Cerebro conserva su identidad sin caer en una campaña distinta", () => {
  const service = harness();
  const campaign = item("Neurofitness Active", "neurofitness-active");
  const current = catalog([campaign], campaign);
  assert.equal(service.detectCatalogInterest("¿Qué es Super Cerebro?", current), "Super Cerebro");
  assert.equal(service.detectCatalogInterest("Supercerebro", current), "Super Cerebro");
  assert.equal(service.detectCatalogInterest("Hola, quiero información", current), null);
});

test("las cartas no se confunden con Neurofitness Active", () => {
  const service = harness();
  const base = item("Neurofitness Active", "neurofitness-active");
  const cards = item("Cartas Neurofitness Active", "cartas-neurofitness-active", { type: "PRODUCT", category: "productos" });
  const current = catalog([base, cards]);
  assert.equal(service.detectCatalogInterest("Quiero las Cartas Neurofitness Active", current), cards.name);
  assert.equal(service.detectCatalogInterest("Cartas “5 Pasos · 9 Retos”", current), knowledge.WHATSAPP_KNOWLEDGE.find((record) => record.id === "cartas-neurofitness").name);
});

test("el contexto sustituye resúmenes canónicos antiguos por la descripción editorial incluso en campaña", () => {
  const service = harness();
  const bft = item("Brain Full Training", "brain-full-training", {
    description: "DESCRIPCIÓN OBSOLETA: paquete de Neurofitness, Neurotraumas y Algoritmos.",
    details: "DETALLE OBSOLETO: incluye todos los programas y garantiza memoria perfecta.",
  });
  const cards = item("Cartas Neurofitness Active", "cartas-neurofitness-active", {
    type: "PRODUCT", category: "productos", description: "CARTAS OBSOLETAS: juego genérico de atención.",
  });
  const context = service.catalogContext(catalog([bft, cards], bft));
  for (const id of ["brain-full-training", "cartas-neurofitness"]) {
    const editorial = knowledge.WHATSAPP_KNOWLEDGE.find((record) => record.id === id);
    assert.ok(context.includes(editorial.summary), id);
  }
  assert.doesNotMatch(context, /DESCRIPCIÓN OBSOLETA|DETALLE OBSOLETO|CARTAS OBSOLETAS|memoria perfecta/);
  for (const record of [bft, cards]) {
    assert.ok(context.includes(record.price), record.name);
    assert.ok(context.includes(record.acquisitionUrl), record.name);
  }
});

test("el contexto conserva descripciones propias de cursos o variantes sin equivalencia editorial", () => {
  const service = harness();
  const course = item("Transforma tu Biocomputadora", "transforma-tu-biocomputadora", { category: "cursos", description: "CURSO HOMÓNIMO: información propia de su edición en video." });
  const express = item("Neurofitness Active Express", "neurofitness-active-express", { category: "cursos", description: "EXPRESS: contenido específico de esta versión." });
  const unknown = item("Taller de ejemplo", "taller-de-ejemplo", { category: "talleres", description: "CONTENIDO DEL TALLER publicado por administración." });
  const context = service.catalogContext(catalog([course, express, unknown]));
  for (const record of [course, express, unknown]) assert.ok(context.includes(record.description), record.name);
  assert.ok(!context.includes(knowledge.WHATSAPP_KNOWLEDGE.find((record) => record.id === "libro-transforma").summary));
});

test("el catálogo real conserva categorías, campaña y URLs de origen sin servicios externos", async () => {
  const training = {
    id: "training-nfa", name: "Neurofitness Active", slug: "neurofitness-active", category: "programas",
    shortDescription: "Resumen guardado", fullDescription: "Detalle guardado", priceCents: 12300, currency: "USD", checkoutProvider: "HOTMART",
  };
  const product = {
    id: "cards", name: "Cartas Neurofitness Active", slug: "cartas-neurofitness-active", description: "Cartas guardadas",
    dashboardContent: "Contenido de las cartas", priceCents: 0, priceLabel: "Consultar precio", currency: "USD", checkoutProvider: "HOTMART",
  };
  const service = harness({ trainings: [training], products: [product], settings: { whatsappCatalogPath: "/oferta-actual", whatsappCurrentCampaignSlug: training.slug } });
  const current = await service.getWhatsAppCatalog();
  assert.equal(current.catalogUrl, "https://catalogo.example/oferta-actual");
  assert.equal(current.currentCampaign.slug, training.slug);
  assert.equal(current.categories.programas.length, 1);
  assert.equal(current.categories.cursos.length, 0);
  assert.equal(current.products[0].price, "Consultar precio");
  assert.equal(current.allItems[0].acquisitionUrl, "https://catalogo.example/checkout/entrenamiento/neurofitness-active");
  assert.equal(current.products[0].acquisitionUrl, "https://catalogo.example/productos/cartas-neurofitness-active");
  assert.deepEqual(service.calls.sort(), ["products", "trainings"]);
});
