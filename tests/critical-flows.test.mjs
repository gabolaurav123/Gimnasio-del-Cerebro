import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("la Home conserva la propuesta central y usa contenido persistente", async () => {
  const page = await read("../app/(public)/page.tsx");
  assert.match(page, /Entrena tu cerebro/);
  assert.match(page, /getTrainings\(\)/);
  assert.match(page, /getPosts\(\)/);
  assert.match(page, /getTestimonials\(\)/);
  assert.match(page, /trainings\.slice\(0, 3\)/);
  assert.match(page, /Ver m.s entrenamientos/);
  assert.doesNotMatch(page, /codex-preview|SkeletonPreview/);
});

test("el acceso administrativo no conserva la navegacion publica", async () => {
  const [shell, login] = await Promise.all([
    read("../app/components/PublicShell.tsx"),
    read("../app/(public)/login/page.tsx"),
  ]);
  assert.match(shell, /pathname === "\/login"/);
  assert.match(shell, /auth-main/);
  assert.match(login, /login-back/);
  assert.match(login, /href="\/"/);
});

test("la Home muestra los cuatro testimonios reales con sus videos", async () => {
  const [stories, repository] = await Promise.all([
    read("../app/components/TestimonialStories.tsx"),
    read("../db/repository.ts"),
  ]);
  assert.match(stories, /Historias reales/);
  assert.match(stories, /youtube-nocookie\.com\/embed/);
  for (const videoId of ["Cjujway89xA", "UmwJehaf-ok", "4dAdgpQGDNs", "trgHVER5gds"]) {
    assert.match(repository, new RegExp(videoId));
  }
});

test("el formulario público guarda contactos en el CRM", async () => {
  const [form, route, repository] = await Promise.all([read("../app/components/PublicUI.tsx"), read("../app/api/contact/route.ts"), read("../db/repository.ts")]);
  assert.match(form, /fetch\("\/api\/contact"/);
  assert.match(route, /createContact/);
  assert.match(route, /public-contact/);
  assert.match(form, /form-honeypot/);
  assert.match(repository, /website_contact/);
  assert.match(repository, /contact_activities/);
});

test("la sesión administrativa usa cookie HttpOnly y contraseña bcrypt", async () => {
  const auth = await read("../lib/auth.ts");
  assert.match(auth, /bcrypt\.compare/);
  assert.match(auth, /HttpOnly/);
  assert.match(auth, /SameSite=Strict/);
  assert.match(auth, /constantTimeEqual/);
  assert.match(auth, /getAdminUserById/);
  assert.match(auth, /SESSION_SECRET/);
});

test("los permisos administrativos se validan en el servidor", async () => {
  const [users, posts, contacts] = await Promise.all([
    read("../app/api/admin/users/route.ts"),
    read("../app/api/admin/posts/route.ts"),
    read("../app/api/admin/contacts/route.ts"),
  ]);
  assert.match(users, /SUPERADMIN/);
  assert.match(posts, /SUPERADMIN.*EDITOR/);
  assert.match(contacts, /SUPERADMIN.*COMERCIAL/);
});

test("el blog admite imágenes y un asistente editorial opcional", async () => {
  const [manager, repository, aiRoute] = await Promise.all([
    read("../app/components/AdminUI.tsx"),
    read("../db/repository.ts"),
    read("../app/api/admin/ai/blog-draft/route.ts"),
  ]);
  assert.match(manager, /imageFile/);
  assert.match(manager, /Generar borrador con OpenAI/);
  assert.match(repository, /image = \?/);
  assert.match(aiRoute, /OPENAI_API_KEY/);
  assert.match(aiRoute, /store: false/);
});

test("las páginas internas usan un encabezado sólido y cabeceras de seguridad", async () => {
  const [chrome, config] = await Promise.all([read("../app/components/SiteChrome.tsx"), read("../next.config.ts")]);
  assert.match(chrome, /site-header--solid/);
  assert.match(config, /Content-Security-Policy/);
  assert.match(config, /frame-ancestors 'none'/);
  assert.match(config, /X-Content-Type-Options/);
});

test("todos los enlaces públicos de WhatsApp usan el número oficial", async () => {
  const whatsapp = await read("../lib/whatsapp.ts");
  assert.match(whatsapp, /543813004167/);
});

test("el servidor Node de Seenode no carga cloudflare:workers al iniciar", async () => {
  const [repository, auth, media, runtime, packageJson] = await Promise.all([
    read("../db/repository.ts"),
    read("../lib/auth.ts"),
    read("../app/api/admin/media/route.ts"),
    read("../lib/runtime-env.ts"),
    read("../package.json"),
  ]);
  assert.doesNotMatch(repository, /from ["']cloudflare:workers["']/);
  assert.doesNotMatch(auth, /from ["']cloudflare:workers["']/);
  assert.doesNotMatch(media, /from ["']cloudflare:workers["']/);
  assert.match(runtime, /await import\("cloudflare:workers"\)/);
  assert.match(runtime, /navigator\.userAgent === "Cloudflare-Workers"/);
  assert.match(runtime, /if \(!isCloudflareWorker\(\)\) return \{\};/);
  assert.match(repository, /getRuntimeDatabase/);
  const databaseRuntime = await read("../db/runtime.ts");
  assert.match(databaseRuntime, /@vite-ignore/);
  assert.match(databaseRuntime, /nodePostgresPackage/);
  assert.match(packageJson, /"postgres"/);
});
