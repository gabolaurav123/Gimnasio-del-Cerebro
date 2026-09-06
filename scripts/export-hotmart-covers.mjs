import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const catalog = path.join(root, "public", "images", "catalog");
const output = path.join(root, "outputs", "hotmart-portadas-gdc");

const covers = [
  ["01-programa-neurofitness-active", "../../logos/nfa-full-v2.jpg", "contain"],
  ["02-programa-neurotraumas", "../../logos/ntr-full-v2.jpg", "contain"],
  ["03-programa-brain-full-training", "../../logos/bft-full-v2.jpg", "contain"],
  ["04-programa-neurotrainer-maestria", "../../logos/ntm-full-v2.jpg", "contain"],
  ["05-programa-algoritmos-pedagogicos", "../../logos/alp-full-v2.jpg", "contain"],
  ["06-programa-neuroconstelaciones-holograficas", "../../logos/nco-full-v2.jpg", "contain"],
  ["07-curso-neurofitness-active-express", "backgrounds/nfa-express-white-v2.png", "cover"],
  ["08-curso-neurotraumas-express", "backgrounds/neurotraumas-express-white-v2.png", "cover"],
  ["09-curso-tabla-radionica-del-cerebro", "backgrounds/tabla-radionica-white-v2.png", "cover"],
  ["10-neuroreto-21-dias-merecimiento", "backgrounds/neuroreto-merecimiento-white-v2.png", "cover"],
  ["11-neuroreto-se-feliz-y-eficiente", "backgrounds/neuroreto-feliz-v1.png", "cover"],
  ["12-taller-neuroconstelaciones-holograficas", "backgrounds/neuroconstelaciones-v1.png", "cover"],
  ["13-taller-autohipnosis-seguridad-interior", "backgrounds/autohipnosis-seguridad-white-v2.png", "cover"],
  ["14-taller-autohipnosis-nivel-medio", "backgrounds/autohipnosis-medio-v1.png", "cover"],
  ["15-taller-neurosexualidad", "backgrounds/neurosexualidad-white-v2.png", "cover"],
  ["16-taller-recordarme-desde-adentro", "backgrounds/recordarme-v1.png", "cover"],
  ["17-taller-cerrando-ciclos-nuevo-tu", "backgrounds/cerrando-ciclos-v1.png", "cover"],
  ["18-taller-autovaloracion", "backgrounds/autovaloracion-v1.png", "cover"],
];

const strip = Buffer.from(`<svg width="1200" height="675" xmlns="http://www.w3.org/2000/svg">
  <style>.brand { font: 700 21px Arial, sans-serif; letter-spacing: 4px; fill: #ffffff; }</style>
  <rect width="104" height="675" fill="#082342"/>
  <rect x="104" width="8" height="675" fill="#0872ed"/>
  <text class="brand" text-anchor="middle" transform="translate(52 337.5) rotate(-90)">GIMNASIO DEL CEREBRO</text>
</svg>`);

await mkdir(output, { recursive: true });

for (const [name, sourceRelative, fit] of covers) {
  const source = path.resolve(catalog, sourceRelative);
  const art = await sharp(source)
    .resize(1088, 675, { fit, position: "attention", background: "#ffffff" })
    .flatten({ background: "#ffffff" })
    .png()
    .toBuffer();

  await sharp({ create: { width: 1200, height: 675, channels: 3, background: "#ffffff" } })
    .composite([{ input: art, left: 112, top: 0 }, { input: strip, left: 0, top: 0 }])
    .png({ quality: 94, compressionLevel: 9 })
    .toFile(path.join(output, `${name}.png`));
}

console.log(`Exported ${covers.length} Hotmart covers to ${output}`);
