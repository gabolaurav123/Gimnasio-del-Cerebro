import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getUsableOpenAIKey, hasUsableOpenAIKey } from "../lib/openai-config.ts";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("la configuración de IA rechaza valores de ejemplo", () => {
  assert.equal(getUsableOpenAIKey("PEGA_AQUI_TU_CLAVE_DE_OPENAI"), null);
  assert.equal(hasUsableOpenAIKey("changeme"), false);
  assert.equal(hasUsableOpenAIKey(`sk-${"a".repeat(40)}`), true);
});

test("la Home conserva la propuesta central y usa contenido persistente", async () => {
  const page = await read("../app/(public)/page.tsx");
  assert.match(page, /Entrena tu cerebro/);
  assert.match(page, /getTrainings\(\)/);
  assert.match(page, /getPosts\(\)/);
  assert.match(page, /getTestimonials\(\)/);
  assert.match(page, /trainings\.slice\(0, 3\)/);
  assert.match(page, /Ver todas las categor.as/);
  assert.match(page, /home-training-categories/);
  assert.match(page, /hero-neuroscience-person-brain-desktop-v3/);
  assert.doesNotMatch(page, /codex-preview|SkeletonPreview/);
});

test("Nosotros presenta a la fundadora y su trayectoria profesional", async () => {
  const about = await read("../app/(public)/nosotros/page.tsx");
  assert.match(about, /Marisa Antonieta/);
  assert.match(about, /Cardozo Arce/);
  assert.match(about, /marisa-cardoso-portrait-v1/);
  assert.match(about, /Neurofitness Active/);
  assert.match(about, /Universidad Nacional de Tucum.n/);
  assert.match(about, /Fundaci.n Nueva Humanidad/);
});

test("BioShield by Kirius aparece como producto inicial", async () => {
  const repository = await read("../db/repository.ts");
  assert.match(repository, /BioShield by Kirius/);
  assert.match(repository, /bioshield-by-kirius/);
  assert.match(repository, /productSeeds/);
});

test("el catálogo separa programas, cursos, neuroretos y talleres con pagos públicos", async () => {
  const [repository, trainings, categories, catalogPage, products, checkout, footer] = await Promise.all([
    read("../db/repository.ts"),
    read("../app/(public)/entrenamientos/page.tsx"),
    read("../lib/training-categories.ts"),
    read("../app/components/TrainingCatalogPage.tsx"),
    read("../app/(public)/productos/page.tsx"),
    read("../app/api/customer/checkout/route.ts"),
    read("../app/components/SiteChrome.tsx"),
  ]);
  assert.match(repository, /Cartas Neurofitness Active/);
  assert.match(repository, /Neurofitness Active Express/);
  assert.match(repository, /Super Cerebro — Master Class/);
  assert.match(repository, /super-cerebro-master-class-v3\.png/);
  assert.match(repository, /Neuroreto: 21 d.as de merecimiento/);
  assert.match(repository, /Taller Autohipnosis/);
  assert.match(repository, /https:\/\/pay\.hotmart\.com\/V96727899W/);
  assert.match(repository, /https:\/\/buy\.stripe\.com\/6oU3cvb3E9GYglgcNB97H03/);
  assert.doesNotMatch(repository, /app\.hotmart\.com\/products\/manage/);
  assert.match(trainings, /training-category-hub/);
  assert.match(categories, /Programas.*Cursos.*Neuroretos.*Talleres/s);
  assert.match(catalogPage, /entrenamientos\/\$\{item\.key\}/);
  for (const route of ["programas", "cursos", "neuroretos", "talleres"]) await read(`../app/(public)/entrenamientos/${route}/page.tsx`);
  assert.match(products, /Comprar de forma segura/);
  assert.doesNotMatch(checkout, /Number\(row\.price_cents\) <= 0/);
  assert.match(footer, /Fundaci.n.*Nueva Humanidad/s);
  assert.match(footer, /Comunidad.*Kiryus/s);
});

test("el panel permite registrar y verificar pagos con control de acceso", async () => {
  const [shell, manager, route, statusRoute, repository] = await Promise.all([
    read("../app/components/AdminShell.tsx"),
    read("../app/components/PaymentManager.tsx"),
    read("../app/api/admin/payments/route.ts"),
    read("../app/api/admin/payments/[id]/route.ts"),
    read("../db/repository.ts"),
  ]);
  assert.match(shell, /\/admin\/pagos/);
  assert.match(manager, /Registrar pago/);
  assert.match(manager, /VERIFIED/);
  assert.match(route, /SUPERADMIN.*COMERCIAL/);
  assert.match(statusRoute, /updatePaymentStatus/);
  assert.match(repository, /CREATE TABLE IF NOT EXISTS payments/);
  assert.match(repository, /GDC-/);
});

test("el acceso administrativo no conserva la navegacion publica", async () => {
  const [shell, login] = await Promise.all([
    read("../app/components/PublicShell.tsx"),
    read("../app/(public)/login/page.tsx"),
  ]);
  assert.match(shell, /pathname === "\/login"/);
  assert.match(shell, /auth-main/);
  assert.match(login, /login-back/);
  assert.match(login, /href=\{next \|\| "\/"\}/);
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

test("la agenda registra citas y las expone en la bandeja administrativa", async () => {
  const [form, route, repository, crm] = await Promise.all([
    read("../app/components/PublicUI.tsx"),
    read("../app/api/appointments/route.ts"),
    read("../db/repository.ts"),
    read("../app/admin/crm/page.tsx"),
  ]);
  assert.match(form, /fetch\("\/api\/appointments"/);
  assert.match(route, /requestIsSameOrigin/);
  assert.match(route, /public-appointment/);
  assert.match(repository, /CREATE TABLE IF NOT EXISTS appointments/);
  assert.match(crm, /Contactos y citas pendientes/);
  assert.match(crm, /AppointmentTable/);
});

test("productos, eventos y asociados son módulos administrables", async () => {
  const [chrome, manager, repository, shell, itemRoute] = await Promise.all([
    read("../app/components/SiteChrome.tsx"),
    read("../app/components/BusinessManager.tsx"),
    read("../db/repository.ts"),
    read("../app/components/AdminShell.tsx"),
    read("../app/api/admin/catalog/[resource]/[id]/route.ts"),
  ]);
  for (const label of ["Productos", "Eventos", "Asociados", "Agenda tu cita"]) assert.match(chrome, new RegExp(label));
  assert.match(chrome, /notification-menu/);
  assert.match(manager, /api\/admin\/catalog/);
  assert.match(repository, /Comunidad Kiryus/);
  assert.match(repository, /https:\/\/www\.comunidadkiryus\.org\//);
  assert.match(shell, /Volver al sitio/);
  assert.match(shell, /href="\/" title="Volver a Gimnasio del Cerebro"/);
  assert.match(manager, /method: "DELETE"/);
  assert.match(manager, /Eliminar.*titleOf/s);
  assert.match(itemRoute, /softDeleteCatalogItem/);
  assert.match(itemRoute, /export async function DELETE/);
  assert.match(repository, /deleted_at IS NULL/);
});

test("la sesión administrativa usa cookie HttpOnly y contraseña bcrypt", async () => {
  const [auth, repository] = await Promise.all([read("../lib/auth.ts"), read("../db/repository.ts")]);
  assert.match(auth, /bcrypt\.compare/);
  assert.match(auth, /HttpOnly/);
  assert.match(auth, /SameSite=Strict/);
  assert.match(auth, /constantTimeEqual/);
  assert.match(auth, /getAdminUserById/);
  assert.match(auth, /SESSION_SECRET/);
  assert.match(repository, /ADMIN_PASSWORD/);
  assert.match(repository, /LOWER\(email\) = \?/);
  assert.match(repository, /bcrypt\.hash/);
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

test("la navegación administrativa funciona sin depender del router RSC", async () => {
  const [shell, dashboard, manager, login] = await Promise.all([
    read("../app/components/AdminShell.tsx"),
    read("../app/admin/page.tsx"),
    read("../app/components/AdminUI.tsx"),
    read("../app/components/LoginForm.tsx"),
  ]);
  for (const source of [shell, dashboard, manager]) {
    assert.doesNotMatch(source, /next\/link/);
  }
  assert.match(shell, /<a className=.*href=\{href\}/);
  assert.match(dashboard, /<a href="\/admin\/crm"/);
  assert.match(login, /payload\.destination === "\/admin" \? safeNext \|\| "\/admin" : safeNext \|\| "\/mi-cuenta"/);
  assert.doesNotMatch(login, /Administraci.n/);
  assert.match(shell, /window\.location\.assign\("\/login"\)/);
});

test("los clientes pueden registrarse e ingresar con una sesión separada", async () => {
  const [form, register, login, unifiedAccess, auth, repository] = await Promise.all([
    read("../app/components/LoginForm.tsx"),
    read("../app/api/customer/auth/register/route.ts"),
    read("../app/api/customer/auth/login/route.ts"),
    read("../app/api/auth/access/route.ts"),
    read("../lib/customer-auth.ts"),
    read("../db/customer-repository.ts"),
  ]);
  assert.match(form, /Crear una cuenta nueva/);
  assert.match(form, /acceptedTerms/);
  assert.match(register, /bcrypt\.hash/);
  assert.match(login, /customerSessionCookie/);
  assert.match(unifiedAccess, /authenticate.*authenticateCustomer/s);
  assert.match(unifiedAccess, /destination/);
  assert.match(auth, /gdc_customer_session/);
  assert.match(auth, /HttpOnly/);
  assert.match(repository, /customer_users/);
});

test("cada entrenamiento tiene portada propia y los enlaces de pago se sincronizan", async () => {
  const repository = await read("../db/repository.ts");
  const covers = [...repository.matchAll(/heroImage: "(\/images\/catalog\/covers\/[^"]+)"/g)].map((match) => match[1]);
  assert.equal(covers.length, 19);
  assert.equal(new Set(covers).size, covers.length);
  assert.match(repository, /UPDATE trainings SET logo = \?, hero_image = \?, checkout_provider = \?, checkout_url = \?/);
  assert.match(repository, /https:\/\/pay\.hotmart\.com\/I95298513M/);
  assert.match(repository, /https:\/\/pay\.hotmart\.com\/A102005977H/);
  assert.match(repository, /https:\/\/pay\.hotmart\.com\/V95461171E/);
});

test("el administrador puede asignar y retirar contenidos a usuarios", async () => {
  const [manager, route, repository] = await Promise.all([
    read("../app/components/CustomerManager.tsx"),
    read("../app/api/admin/customers/[id]/entitlements/route.ts"),
    read("../db/customer-repository.ts"),
  ]);
  assert.match(manager, /Asignar \/ regalar/);
  assert.match(manager, /updateEntitlement/);
  assert.match(route, /SUPERADMIN.*COMERCIAL/);
  assert.match(route, /setCustomerEntitlement/);
  assert.match(repository, /getAllCustomerEntitlementAssignments/);
});

test("WhatsApp genera QR real, representa estados y persiste la sesión cifrada", async () => {
  const [bridge, client, panel, start, repository] = await Promise.all([
    read("../scripts/whatsapp-bridge.mjs"),
    read("../lib/whatsapp-bridge.ts"),
    read("../app/components/WhatsAppAdmin.tsx"),
    read("../scripts/start-server.mjs"),
    read("../db/repository.ts"),
  ]);
  assert.match(bridge, /@whiskeysockets\/baileys/);
  assert.match(bridge, /QRCode\.toDataURL/);
  assert.match(bridge, /connection\.update/);
  assert.match(bridge, /creds\.update/);
  assert.match(bridge, /aes-256-gcm/);
  assert.match(bridge, /whatsapp_auth_credentials/);
  assert.match(bridge, /whatsapp_auth_keys/);
  assert.match(bridge, /session_recovered/);
  assert.match(client, /AbortSignal\.timeout\(15_000\)/);
  for (const state of ["disconnected", "initializing", "generating_qr", "qr_available", "connecting", "connected", "reconnecting", "error"]) assert.match(panel, new RegExp(state));
  for (const action of ["Vincular WhatsApp", "Generar nuevo QR", "Probar conexión", "Reconectar", "Desconectar"]) assert.match(panel, new RegExp(action));
  assert.match(start, /startWhatsAppBridge/);
  assert.match(start, /WHATSAPP_BRIDGE_TOKEN/);
  assert.match(repository, /CREATE TABLE IF NOT EXISTS whatsapp_conversations/);
});

test("la agenda evita cruces y permite bloquear días o rangos", async () => {
  const [route, availability, scheduling, repository, manager, form, styles, blocksRoute] = await Promise.all([
    read("../app/api/appointments/route.ts"),
    read("../app/api/appointments/availability/route.ts"),
    read("../db/scheduling.ts"),
    read("../db/repository.ts"),
    read("../app/components/BusinessManager.tsx"),
    read("../app/components/PublicUI.tsx"),
    read("../app/globals.css"),
    read("../app/api/admin/appointments/blocks/[id]/route.ts"),
  ]);
  assert.match(route, /getAppointmentAvailability/);
  assert.match(route, /appointmentSlotsForDate/);
  assert.match(route, /AppointmentUnavailableError/);
  assert.match(repository, /idx_appointments_active_slot/);
  assert.match(scheduling, /appointment_blocks/);
  assert.match(scheduling, /2:.*08:00.*13:00.*14:00.*18:00/s);
  assert.match(scheduling, /4:.*08:00.*13:00.*14:00.*18:00/s);
  assert.match(scheduling, /5:.*08:00.*13:00/s);
  assert.match(availability, /open/);
  assert.match(manager, /Día completo/);
  assert.match(manager, /Rango horario/);
  assert.match(manager, /00:00/);
  assert.match(manager, /23:59/);
  assert.match(manager, /Todas las semanas/);
  assert.match(manager, /name="weekdays"/);
  assert.match(manager, /method: "DELETE"/);
  assert.match(scheduling, /recurrence = 'WEEKLY'/);
  assert.match(scheduling, /end_date/);
  assert.match(blocksRoute, /deleteAppointmentBlock/);
  assert.match(blocksRoute, /export async function DELETE/);
  assert.match(form, /Ese día no hay atención/);
  assert.match(form, /La reserva bloquea el horario automáticamente/);
  assert.match(styles, /training-card__buy.*background: var\(--blue-700\)/);
});

test("pagos verificados habilitan contenido y contabilidad por producto", async () => {
  const [repository, checkout, accounting, exportRoute, dashboard] = await Promise.all([
    read("../db/repository.ts"),
    read("../app/api/customer/checkout/route.ts"),
    read("../db/accounting.ts"),
    read("../app/api/admin/accounting/export/route.ts"),
    read("../app/components/CustomerDashboard.tsx"),
  ]);
  assert.match(repository, /customer_entitlements/);
  assert.match(repository, /accounting_entries/);
  assert.match(checkout, /STRIPE.*HOTMART/);
  assert.match(accounting, /Resumen por moneda/);
  assert.match(exportRoute, /application\/vnd\.ms-excel/);
  assert.match(dashboard, /Asistentes personalizados/);
});

test("los asistentes personalizados requieren acceso, servidor y store false", async () => {
  const [route, manager] = await Promise.all([read("../app/api/customer/assistant/route.ts"), read("../app/components/AssistantManager.tsx")]);
  assert.match(route, /getCustomerAssistant/);
  assert.match(route, /getOpenAIConfiguration/);
  assert.match(route, /safety_identifier/);
  assert.match(route, /store: false/);
  assert.match(manager, /API de OpenAI configurada|Falta configurar OpenAI|clave de forma segura/i);
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
  assert.match(aiRoute, /getOpenAIConfiguration/);
  assert.match(aiRoute, /store: false/);
});

test("el panel administra entrenamientos, adjuntos y testimonios", async () => {
  const [manager, trainingRoute, testimonialRoute, mediaRoute] = await Promise.all([
    read("../app/components/AdminUI.tsx"),
    read("../app/api/admin/trainings/[id]/route.ts"),
    read("../app/api/admin/testimonials/route.ts"),
    read("../app/api/admin/media/route.ts"),
  ]);
  assert.match(manager, /resourceFile/);
  assert.match(manager, /attachmentFile/);
  assert.match(trainingRoute, /updateTraining/);
  assert.match(testimonialRoute, /createTestimonial/);
  assert.match(mediaRoute, /application\/pdf/);
});

test("WhatsApp e IA usan catálogo dinámico, contexto, derivación humana y secretos del servidor", async () => {
  const [shell, config, catalog, conversation, ai, inbound, assistant, panel, manualSend] = await Promise.all([
    read("../app/components/AdminShell.tsx"),
    read("../lib/whatsapp-ai-config.ts"),
    read("../lib/catalog-service.ts"),
    read("../lib/conversation-service.ts"),
    read("../lib/whatsapp-ai-service.ts"),
    read("../app/api/internal/whatsapp/inbound/route.ts"),
    read("../app/api/admin/whatsapp/assistant/route.ts"),
    read("../app/components/WhatsAppAdmin.tsx"),
    read("../app/api/admin/whatsapp/send/route.ts"),
  ]);
  assert.match(shell, /WhatsApp \+ IA/);
  assert.match(config, /AI_CONFIG/);
  assert.match(config, /No inventes precios/);
  assert.match(catalog, /getTrainings\(\).*getProducts\(\)/s);
  assert.match(catalog, /whatsappCurrentCampaignSlug/);
  assert.match(catalog, /catalogUrl/);
  assert.match(conversation, /needsHumanHandoff/);
  assert.match(conversation, /setWhatsAppConversationMode/);
  assert.match(conversation, /getWhatsAppCatalog/);
  assert.match(conversation, /event: "ai_error"/);
  assert.match(ai, /getWhatsAppMessages/);
  assert.match(ai, /store: false/);
  assert.match(ai, /safety_identifier/);
  assert.match(ai, /buildWhatsAppInstructions/);
  assert.match(ai, /getOpenAIConfiguration/);
  assert.match(inbound, /WHATSAPP_BRIDGE_TOKEN/);
  assert.match(assistant, /whatsappAiInstructions/);
  assert.match(assistant, /whatsappCurrentCampaignSlug/);
  assert.match(panel, /IA activa/);
  assert.match(panel, /Atención humana/);
  assert.match(manualSend, /setWhatsAppConversationMode\(conversation\.id, "HUMAN"\)/);
});

test("OpenAI se configura desde el panel sin devolver la clave al navegador", async () => {
  const [page, component, route, config, schema, repository] = await Promise.all([
    read("../app/admin/[section]/page.tsx"),
    read("../app/components/OpenAISettings.tsx"),
    read("../app/api/admin/openai/route.ts"),
    read("../lib/openai-config.ts"),
    read("../db/schema.ts"),
    read("../db/repository.ts"),
  ]);
  assert.match(page, /OpenAISettings/);
  assert.match(component, /API Key de OpenAI/);
  assert.match(component, /Probar conexión/);
  assert.match(component, /Probar el asistente de WhatsApp/);
  assert.doesNotMatch(route, /apiKey:\s*configuration\.apiKey/);
  assert.match(route, /requestIsAdmin.*SUPERADMIN/s);
  assert.match(route, /previewWhatsAppReply/);
  assert.match(config, /AES-GCM/);
  assert.match(config, /system_secrets/);
  assert.match(config, /getOpenAIConfiguration/);
  assert.match(schema, /systemSecrets/);
  assert.match(repository, /CREATE TABLE IF NOT EXISTS system_secrets/);
});

test("la derivación humana distingue consultas normales de casos que requieren al equipo", async () => {
  const { AI_CONFIG, needsHumanHandoff } = await import("../lib/whatsapp-ai-config.ts");
  for (const message of ["Hola", "Quiero información", "¿Qué cursos tienen?", "¿Qué es Super Cerebro?", "Quiero mejorar mi memoria", "¿Dónde me inscribo?"]) {
    assert.equal(needsHumanHandoff(message), false, message);
  }
  for (const message of ["Quiero hablar con una persona", "Tengo un problema con el pago", "El acceso no funciona y necesito soporte técnico"]) {
    assert.equal(needsHumanHandoff(message), true, message);
  }
  assert.ok(AI_CONFIG.strictRules.some((rule) => rule.includes("No inventes precios")));
  assert.ok(AI_CONFIG.strictRules.some((rule) => rule.includes("No prometas mejoras")));
  assert.ok(AI_CONFIG.conversationFlow.some((rule) => rule.includes("pregunta directa")));
  assert.ok(AI_CONFIG.conversationFlow.some((rule) => rule.includes("Programas, Cursos, Neuroretos y Talleres")));
  assert.ok(AI_CONFIG.strictRules.some((rule) => rule.includes("campaña destacada")));
  assert.ok(AI_CONFIG.strictRules.some((rule) => rule.includes("exactamente el enlace")));
});

test("el checkout conserva el producto para visitantes, clientes y administradores", async () => {
  const [page, loginPage, loginForm, checkoutRoute] = await Promise.all([
    read("../app/checkout/[type]/[slug]/page.tsx"),
    read("../app/(public)/login/page.tsx"),
    read("../app/components/LoginForm.tsx"),
    read("../app/api/customer/checkout/route.ts"),
  ]);
  assert.match(page, /getCustomerSession\(\).*getAdminSession\(\)/s);
  assert.match(page, /Para adquirir este entrenamiento necesitas iniciar sesión o crear una cuenta/);
  assert.match(page, /login\?next=/);
  assert.match(page, /login\?mode=register&next=/);
  assert.match(page, /Vista comercial como administrador/);
  assert.match(loginPage, /startsWith\("\/checkout\/"\)/);
  assert.match(loginForm, /safeNext \|\| "\/admin"/);
  assert.match(checkoutRoute, /getRequestAdmin/);
  assert.match(checkoutRoute, /session\?\.customerId \|\| admin\?\.userId/);
});

test("el pie reutiliza la imagen de Fundación Nueva Humanidad registrada en Asociados", async () => {
  const [layout, shell, footer, styles] = await Promise.all([
    read("../app/(public)/layout.tsx"),
    read("../app/components/PublicShell.tsx"),
    read("../app/components/SiteChrome.tsx"),
    read("../app/globals.css"),
  ]);
  assert.match(layout, /getAssociates\(\)/);
  assert.match(shell, /<SiteFooter associates=\{associates\}/);
  assert.match(footer, /foundation\.image/);
  assert.match(footer, /src=\{foundation\.image\}/);
  assert.match(styles, /footer-partner--foundation img[^}]*object-fit: contain/);
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
  const [repository, auth, media, runtime, packageJson, startServer, prepareRuntime] = await Promise.all([
    read("../db/repository.ts"),
    read("../lib/auth.ts"),
    read("../app/api/admin/media/route.ts"),
    read("../lib/runtime-env.ts"),
    read("../package.json"),
    read("../scripts/start-server.mjs"),
    read("../scripts/prepare-runtime.mjs"),
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
  assert.match(packageJson, /node scripts\/start-server\.mjs/);
  assert.match(startServer, /startProdServer/);
  assert.match(prepareRuntime, /npmCommand.*prune/s);
  assert.match(prepareRuntime, /--omit=dev/);
});
