import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const catalog = path.join(root, "public", "images", "catalog");
const output = path.join(catalog, "covers");

const programCovers = [
  ["neurofitness-active", "../../logos/nfa-full-v2.jpg"],
  ["neurotraumas", "../../logos/ntr-full-v2.jpg"],
  ["brain-full-training", "../../logos/bft-full-v2.jpg"],
  ["neurotrainer-maestria", "../../logos/ntm-full-v2.jpg"],
  ["algoritmos-pedagogicos", "../../logos/alp-full-v2.jpg"],
  ["neuroconstelaciones-holograficas", "../../logos/nco-full-v2.jpg"],
];

const visualCovers = [
  ["neurofitness-active-express", "backgrounds/nfa-express-white-v2.png"],
  ["neurotraumas-express", "backgrounds/neurotraumas-express-white-v2.png"],
  ["tabla-radionica-del-cerebro", "backgrounds/tabla-radionica-white-v2.png"],
  ["neuroreto-21-dias-merecimiento", "backgrounds/neuroreto-merecimiento-white-v2.png"],
  ["neuroreto-se-feliz-y-eficiente", "backgrounds/neuroreto-feliz-v1.png"],
  ["taller-neuroconstelaciones-holograficas", "backgrounds/neuroconstelaciones-v1.png"],
  ["taller-autohipnosis-seguridad-interior", "backgrounds/autohipnosis-seguridad-white-v2.png"],
  ["taller-autohipnosis-nivel-medio", "backgrounds/autohipnosis-medio-v1.png"],
  ["taller-neurosexualidad", "backgrounds/neurosexualidad-white-v2.png"],
  ["taller-recordarme-desde-adentro", "backgrounds/recordarme-v1.png"],
  ["taller-cerrando-ciclos-nuevo-tu", "backgrounds/cerrando-ciclos-v1.png"],
  ["taller-autovaloracion", "backgrounds/autovaloracion-v1.png"],
];

for (const [slug, sourceRelative] of programCovers) {
  const source = path.resolve(catalog, sourceRelative);
  const logo = await sharp(source)
    .resize(900, 555, { fit: "contain", background: "#ffffff", withoutEnlargement: false })
    .flatten({ background: "#ffffff" })
    .png()
    .toBuffer();

  await sharp({ create: { width: 1200, height: 675, channels: 3, background: "#ffffff" } })
    .composite([{ input: logo, left: 150, top: 60 }])
    .png({ quality: 92, compressionLevel: 9 })
    .toFile(path.join(output, `${slug}-v3.png`));
}

const verticalBrand = Buffer.from(`<svg width="1200" height="675" xmlns="http://www.w3.org/2000/svg">
  <style>.brand { font: 700 20px Arial, sans-serif; letter-spacing: 4px; fill: #ffffff; }</style>
  <rect width="92" height="675" fill="#082342"/>
  <rect x="92" width="8" height="675" fill="#0872ed"/>
  <text class="brand" text-anchor="middle" transform="translate(46 337.5) rotate(-90)">GIMNASIO DEL CEREBRO</text>
</svg>`);

for (const [slug, sourceRelative] of visualCovers) {
  const source = path.resolve(catalog, sourceRelative);
  const art = await sharp(source)
    .resize(1100, 675, { fit: "cover", position: "attention", background: "#ffffff" })
    .flatten({ background: "#ffffff" })
    .png()
    .toBuffer();

  await sharp({ create: { width: 1200, height: 675, channels: 3, background: "#ffffff" } })
    .composite([{ input: art, left: 100, top: 0 }, { input: verticalBrand, left: 0, top: 0 }])
    .png({ quality: 92, compressionLevel: 9 })
    .toFile(path.join(output, `${slug}-v3.png`));
}

console.log(`Created ${programCovers.length + visualCovers.length} distinct branded covers in ${output}`);
