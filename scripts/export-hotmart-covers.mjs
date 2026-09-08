import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const catalog = path.join(root, "public", "images", "catalog");
const args = process.argv.slice(2);
const square = args.includes("--square");
const onlyName = args.find((arg) => arg !== "--square") ?? null;
const output = path.join(
  root,
  "outputs",
  square ? "hotmart-portadas-gdc-cuadradas-600x600" : "hotmart-portadas-gdc",
);

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
  ["19-curso-super-cerebro-master-class", "backgrounds/super-cerebro-master-class-v1.png", "cover"],
];

const canvasWidth = square ? 600 : 1200;
const canvasHeight = square ? 600 : 675;
const stripWidth = square ? 56 : 104;
const dividerWidth = square ? 5 : 8;
const artLeft = stripWidth + dividerWidth;
const artWidth = canvasWidth - artLeft;
const brandFontSize = square ? 13 : 21;
const brandLetterSpacing = square ? 2.5 : 4;

const strip = Buffer.from(`<svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
  <style>.brand { font: 700 ${brandFontSize}px Arial, sans-serif; letter-spacing: ${brandLetterSpacing}px; fill: #ffffff; }</style>
  <rect width="${stripWidth}" height="${canvasHeight}" fill="#082342"/>
  <rect x="${stripWidth}" width="${dividerWidth}" height="${canvasHeight}" fill="#0872ed"/>
  <text class="brand" text-anchor="middle" transform="translate(${stripWidth / 2} ${canvasHeight / 2}) rotate(-90)">GIMNASIO DEL CEREBRO</text>
</svg>`);

await mkdir(output, { recursive: true });

for (const [name, sourceRelative, fit] of covers.filter(([name]) => !onlyName || name === onlyName)) {
  const source = path.resolve(catalog, sourceRelative);
  const art = await sharp(source)
    .resize(artWidth, canvasHeight, { fit, position: "attention", background: "#ffffff" })
    .flatten({ background: "#ffffff" })
    .png()
    .toBuffer();

  await sharp({ create: { width: canvasWidth, height: canvasHeight, channels: 3, background: "#ffffff" } })
    .composite([{ input: art, left: artLeft, top: 0 }, { input: strip, left: 0, top: 0 }])
    .png({ quality: 94, compressionLevel: 9 })
    .toFile(path.join(output, `${name}.png`));
}

const exportedCount = covers.filter(([name]) => !onlyName || name === onlyName).length;
console.log(`Exported ${exportedCount} Hotmart cover${exportedCount === 1 ? "" : "s"} to ${output}`);
