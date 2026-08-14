import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("la Home conserva la propuesta central y usa contenido persistente", async () => {
  const page = await read("../app/(public)/page.tsx");
  assert.match(page, /Entrena tu cerebro/);
  assert.match(page, /getTrainings\(\)/);
  assert.match(page, /getPosts\(\)/);
  assert.doesNotMatch(page, /codex-preview|SkeletonPreview/);
});

test("el formulario público guarda contactos en el CRM", async () => {
  const [form, route, repository] = await Promise.all([read("../app/components/PublicUI.tsx"), read("../app/api/contact/route.ts"), read("../db/repository.ts")]);
  assert.match(form, /fetch\("\/api\/contact"/);
  assert.match(route, /createContact/);
  assert.match(repository, /website_contact/);
  assert.match(repository, /contact_activities/);
});

test("la sesión administrativa usa cookie HttpOnly y contraseña bcrypt", async () => {
  const auth = await read("../lib/auth.ts");
  assert.match(auth, /bcrypt\.compare/);
  assert.match(auth, /HttpOnly/);
  assert.match(auth, /SameSite=Lax/);
  assert.match(auth, /SESSION_SECRET/);
});

test("todos los enlaces públicos de WhatsApp usan el número oficial", async () => {
  const whatsapp = await read("../lib/whatsapp.ts");
  assert.match(whatsapp, /543813004167/);
});
