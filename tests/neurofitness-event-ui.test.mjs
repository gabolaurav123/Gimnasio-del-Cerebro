import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("el evento es visible en la navegación principal y móvil", async () => {
  const chrome = await read("../app/components/SiteChrome.tsx");
  const styles = await read("../app/globals.css");
  assert.match(chrome, /href: "\/reto-neurofitness", label: "Evento", featured: true/);
  assert.match(chrome, /nav-event-link/);
  assert.match(styles, /\.desktop-nav \.nav-event-link/);
  assert.match(styles, /\.mobile-menu \.nav-event-link/);
  assert.ok(chrome.indexOf('label: "Evento"') < chrome.indexOf('label: "Inicio"'), "Evento debe aparecer antes de Inicio");
});

test("el reto explica cada etapa y no repite métricas inválidas", async () => {
  const challenge = await read("../app/components/NeurofitnessChallenge.tsx");
  const completeRoute = await read("../app/api/neurofitness/complete/route.ts");
  assert.match(challenge, /"briefing"/);
  assert.match(challenge, /Entendido, comenzar/);
  assert.match(challenge, /errorAction === "complete"/);
  assert.match(challenge, /"Reiniciar reto"/);
  assert.match(completeRoute, /\.int\(\)\.min\(0\)\.max\(5000\)/);
  assert.doesNotMatch(completeRoute, /\.min\(80\)\.max\(5000\)/);
});

test("el anuncio se configura para aparecer en cada recarga", async () => {
  const repository = await read("../db/repository.ts");
  const settings = await read("../app/components/NeurofitnessSettings.tsx");
  const popup = await read("../app/components/NeurofitnessPopup.tsx");
  assert.match(repository, /neurofitnessPopupFrequency: "always"/);
  assert.match(settings, /En cada recarga/);
  assert.match(popup, /dismissedThisLoadRef/);
});
