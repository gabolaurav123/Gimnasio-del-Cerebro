import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { startProdServer } from "../dist/vinext/server/prod-server.js";

const args = process.argv.slice(2);
function readOption(name, fallback) {
  const exactIndex = args.indexOf(name);
  if (exactIndex >= 0 && args[exactIndex + 1]) return args[exactIndex + 1];
  const prefixed = args.find((item) => item.startsWith(`${name}=`));
  return prefixed ? prefixed.slice(name.length + 1) : fallback;
}

const port = Number(readOption("--port", process.env.PORT || "3000"));
const host = readOption("--hostname", process.env.HOST || "0.0.0.0");
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Puerto de inicio inválido.");

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
await startProdServer({
  port,
  host,
  outDir: join(scriptDirectory, "..", "dist"),
});
