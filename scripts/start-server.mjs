import { randomBytes } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { startProdServer } from "../dist/vinext/server/prod-server.js";
import { startWhatsAppBridge } from "./whatsapp-bridge.mjs";

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

const bridgePort = Number(process.env.WHATSAPP_BRIDGE_PORT || (port < 65525 ? port + 11 : port - 11));
if (!Number.isInteger(bridgePort) || bridgePort < 1 || bridgePort > 65535 || bridgePort === port) throw new Error("Puerto interno de WhatsApp inválido.");
const bridgeToken = randomBytes(32).toString("hex");
process.env.WHATSAPP_BRIDGE_URL = `http://127.0.0.1:${bridgePort}`;
process.env.WHATSAPP_BRIDGE_TOKEN = bridgeToken;

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const application = await startProdServer({
  port,
  host,
  outDir: join(scriptDirectory, "..", "dist"),
});
let whatsappBridge;
try {
  whatsappBridge = await startWhatsAppBridge({ port: bridgePort, applicationPort: port, token: bridgeToken });
} catch (error) {
  await new Promise((resolve) => application.server.close(resolve));
  throw error;
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, async () => {
    await whatsappBridge.close().catch(() => undefined);
    await new Promise((resolve) => application.server.close(resolve));
    process.exit(0);
  });
}
