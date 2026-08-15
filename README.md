# Gimnasio del Cerebro

Reconstrucción integral de la presencia digital de **Gimnasio del Cerebro**: sitio público, catálogo de entrenamientos, blog, contacto conectado a CRM y panel administrativo.

## Stack

- React 19 + TypeScript
- vinext (App Router compatible) + Vite
- Tailwind CSS 4 y CSS de diseño propio
- Cloudflare Worker
- Cloudflare D1 + Drizzle ORM
- Cloudflare R2 para biblioteca multimedia
- Zod para validaciones
- bcryptjs para verificación de contraseñas
- Cookies HttpOnly firmadas para la sesión administrativa

La persistencia usa D1/SQLite porque es el motor transaccional nativo de la plataforma Sites donde se publica esta versión. La capa de repositorio está separada de la interfaz para permitir una migración posterior a PostgreSQL sin rehacer los componentes.

## Arquitectura

```text
app/
  (public)/                 # Home y rutas públicas
  admin/                    # Dashboard, CRM y CMS
  api/                      # REST pública y administrativa
  components/               # Componentes reutilizables
db/
  repository.ts             # Acceso y seeds persistentes
  schema.ts                 # Modelos Drizzle
drizzle/                    # Migraciones versionadas
lib/
  auth.ts                   # Sesiones y autenticación
  whatsapp.ts               # URLs contextuales oficiales
public/
  images/                   # Imágenes editoriales generadas
  logos/                    # Logos oficiales aportados
worker/                     # Entrada Cloudflare Worker
```

## Rutas públicas

- `/`
- `/entrenamientos`
- `/entrenamientos/:slug`
- `/blog`
- `/blog/:slug`
- `/contacto`
- `/login`

## Rutas administrativas

- `/admin`
- `/admin/crm`
- `/admin/crm/:id`
- `/admin/entrenamientos`
- `/admin/blog`
- `/admin/testimonios`
- `/admin/contenido`
- `/admin/media`
- `/admin/usuarios`
- `/admin/configuracion`

## Modelos de datos

`User`, `Contact`, `ContactNote`, `ContactActivity`, `Training`, `BlogPost`, `BlogCategory`, `BlogTag`, `Testimonial`, `MediaAsset` y `SiteSetting`.

Las migraciones incluyen índices para las consultas frecuentes de CRM, entrenamientos, blog y actividad.

## Desarrollo

Requiere Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Validación completa:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Generar migraciones después de modificar `db/schema.ts`:

```bash
npm run db:generate
```

## Configuración administrativa

Copiar `.env.example` y configurar las variables en el entorno local o en Sites:

```env
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=
SESSION_SECRET=
WHATSAPP_NUMBER=543813004167
SITE_URL=
DATABASE_URL=
```

La contraseña nunca se guarda en texto plano. Genera un hash bcrypt así:

```bash
npm run admin:hash -- "una-contraseña-segura"
```

Usa el resultado como `ADMIN_PASSWORD_HASH`. `SESSION_SECRET` debe ser un valor aleatorio largo.

## CRM

El formulario público valida la información en frontend y backend, crea un `Contact` con `source = website_contact` y `status = NEW`, y registra la actividad de creación. El panel permite buscar, filtrar, abrir la ficha, cambiar el estado, programar seguimiento, añadir notas y abrir WhatsApp.

## CMS

- Entrenamientos: creación de borradores y estados publicado/oculto.
- Blog: creación de borradores y estados publicado/archivado.
- Home: mensajes del hero y CTA final administrables.
- Configuración: datos generales y redes.
- Media: subida validada a R2 en Cloudflare o PostgreSQL en Seenode.
- Testimonios: colección preparada y vacía hasta cargar testimonios reales.

## Contenido inicial

El primer arranque crea las tablas y carga únicamente los seis entrenamientos y tres títulos editoriales incluidos en el material entregado. No se añaden reviews, profesionales, métricas clínicas ni certificaciones inventadas.

## Recursos visuales

Los logos de GDC, NFA, NTR, BFT, NTM, ALP y NCO proceden de los archivos oficiales aportados. La fotografía del hero, su adaptación móvil y la tarjeta social fueron generadas específicamente para esta reconstrucción y no sustituyen logotipos oficiales.

## Despliegue en Seenode

El proyecto detecta automáticamente el entorno: usa D1/R2 en Cloudflare y PostgreSQL en Node.js cuando existe `DATABASE_URL`. En Seenode:

1. Crea una base de datos PostgreSQL y asígnala al Web Service.
2. Copia su cadena de conexión completa en la variable `DATABASE_URL`.
3. Configura el build como `npm install --include=dev --no-audit --no-fund && npm run build`.
4. Configura el inicio como `npm run start -- --hostname 0.0.0.0 --port 3000` y el puerto como `3000`.
5. Añade las variables administrativas de `.env.example` y vuelve a desplegar.

Las tablas y los datos iniciales se crean automáticamente en la primera solicitud. En PostgreSQL, los archivos multimedia se guardan junto con sus metadatos para evitar depender de R2.
