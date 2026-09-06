import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const catalog = path.join(root, "public", "images", "catalog");
const output = path.join(catalog, "covers");
const logo = path.join(root, "public", "logos", "gdc-primary.jpg");

const covers = [
  ["neurofitness-active", "PROGRAMA", ["Neurofitness", "Active"], "../../logos/nfa-full-v2.jpg", "contain"],
  ["neurotraumas", "PROGRAMA", ["Neurotraumas"], "../../logos/ntr-full-v2.jpg", "contain"],
  ["brain-full-training", "PROGRAMA", ["Brain Full", "Training"], "../../logos/bft-full-v2.jpg", "contain"],
  ["neurotrainer-maestria", "PROGRAMA", ["Neurotrainer", "Maestría en NFA"], "../../logos/ntm-full-v2.jpg", "contain"],
  ["algoritmos-pedagogicos", "PROGRAMA", ["Algoritmos", "Pedagógicos"], "../../logos/alp-full-v2.jpg", "contain"],
  ["neuroconstelaciones-holograficas", "PROGRAMA", ["Neuroconstelaciones", "Holográficas"], "../../logos/nco-full-v2.jpg", "contain"],
  ["neurofitness-active-express", "CURSO EXPRESS", ["Neurofitness Active", "Express"], "course-express-v1.png", "cover"],
  ["neurotraumas-express", "CURSO EXPRESS", ["Neurotraumas", "Express"], "course-neurodeep-v1.png", "cover"],
  ["tabla-radionica-del-cerebro", "CURSO", ["Tabla Radiónica", "del Cerebro"], "course-radionic-v1.png", "cover"],
  ["neuroreto-21-dias-merecimiento", "NEURORETO · 21 DÍAS", ["Un viaje hacia", "el merecimiento"], "course-neuroreto-v1.png", "cover"],
  ["neuroreto-se-feliz-y-eficiente", "NEURORETO · 21 DÍAS", ["Sé feliz", "y eficiente"], "backgrounds/neuroreto-feliz-v1.png", "cover"],
  ["taller-neuroconstelaciones-holograficas", "TALLER", ["Neuroconstelaciones", "Holográficas"], "backgrounds/neuroconstelaciones-v1.png", "cover"],
  ["taller-autohipnosis-seguridad-interior", "TALLER", ["Autohipnosis", "Seguridad interior"], "course-autohypnosis-v1.png", "cover"],
  ["taller-autohipnosis-nivel-medio", "TALLER", ["Autohipnosis", "Nivel medio"], "backgrounds/autohipnosis-medio-v1.png", "cover"],
  ["taller-neurosexualidad", "TALLER", ["Neurosexualidad"], "course-neurosexuality-v1.png", "cover"],
  ["taller-recordarme-desde-adentro", "TALLER ONLINE", ["Recordarme", "desde adentro"], "backgrounds/recordarme-v1.png", "cover"],
  ["taller-cerrando-ciclos-nuevo-tu", "TALLER", ["Cerrando ciclos", "El nuevo tú"], "backgrounds/cerrando-ciclos-v1.png", "cover"],
  ["taller-autovaloracion", "TALLER", ["Autovaloración"], "backgrounds/autovaloracion-v1.png", "cover"],
];

function escapeXml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

for (const [slug, category, lines, sourceRelative, fit] of covers) {
  const source = path.resolve(catalog, sourceRelative);
  const art = await sharp(source)
    .resize(690, 675, { fit, position: "attention", background: "#ffffff" })
    .png()
    .toBuffer();
  const mark = await sharp(logo).resize(58, 58, { fit: "contain", background: "#ffffff" }).png().toBuffer();
  const title = lines.map((line, index) => `<text x="54" y="${274 + index * 60}" class="title">${escapeXml(line)}</text>`).join("");
  const overlay = Buffer.from(`<svg width="1200" height="675" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="fade" x1="0" x2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".72" stop-color="#ffffff"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
      <style>
        .brand { font: 700 15px Arial, sans-serif; letter-spacing: 2.2px; fill: #09284b; }
        .brand2 { font: 500 11px Arial, sans-serif; letter-spacing: 2px; fill: #426486; }
        .category { font: 700 13px Arial, sans-serif; letter-spacing: 2.4px; fill: #0872ed; }
        .title { font: 500 47px Arial, sans-serif; letter-spacing: -1.5px; fill: #061b34; }
        .tagline { font: 700 10px Arial, sans-serif; letter-spacing: 1.7px; fill: #4f6b88; }
      </style>
    </defs>
    <rect width="550" height="675" fill="#ffffff"/>
    <rect x="500" width="225" height="675" fill="url(#fade)"/>
    <path d="M54 147H468" stroke="#d9e5f2"/>
    <path d="M54 530H468" stroke="#d9e5f2"/>
    <circle cx="1085" cy="87" r="42" fill="#ffffff" fill-opacity=".9"/>
    <circle cx="1085" cy="87" r="34" fill="none" stroke="#0c72de" stroke-opacity=".32"/>
    <text x="129" y="76" class="brand">GIMNASIO</text>
    <text x="129" y="98" class="brand2">DEL CEREBRO</text>
    <text x="54" y="190" class="category">${escapeXml(category)}</text>
    ${title}
    <text x="54" y="566" class="tagline">COMPRENDER · PRACTICAR · TRANSFORMAR</text>
    <rect x="54" y="604" width="118" height="8" rx="4" fill="#0872ed"/>
    <rect x="181" y="604" width="48" height="8" rx="4" fill="#20af72"/>
  </svg>`);

  await sharp({ create: { width: 1200, height: 675, channels: 3, background: "#ffffff" } })
    .composite([{ input: art, left: 510, top: 0 }, { input: overlay, left: 0, top: 0 }, { input: mark, left: 54, top: 52 }])
    .png({ quality: 92, compressionLevel: 9 })
    .toFile(path.join(output, `${slug}-v2.png`));
}

console.log(`Created ${covers.length} distinct branded covers in ${output}`);
