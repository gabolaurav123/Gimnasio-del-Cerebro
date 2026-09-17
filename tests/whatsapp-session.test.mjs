import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { hasLinkedWhatsAppIdentity } from "../scripts/whatsapp-bridge.mjs";

test("QR sessions recover even when registered is false or missing", () => {
  assert.equal(hasLinkedWhatsAppIdentity({ registered: false, me: { id: "123:4@s.whatsapp.net" } }), true);
  assert.equal(hasLinkedWhatsAppIdentity({ me: { id: "123:4@s.whatsapp.net" } }), true);
});

test("fresh credentials and metadata alone do not imply a linked session", () => {
  for (const creds of [undefined, {}, { registered: true }, { me: {} }, { me: { id: "" } }, { phoneNumber: "123" }]) {
    assert.equal(hasLinkedWhatsAppIdentity(creds), false);
  }
});

test("startup uses saved identity and reconnect preserves credentials", async () => {
  const source = await readFile(new URL("../scripts/whatsapp-bridge.mjs", import.meta.url), "utf8");
  assert.match(source, /if \(hasLinkedWhatsAppIdentity\(auth\.state\.creds\)\) await connect\(true\)/);
  const reconnect = source.slice(source.indexOf("async function reconnect()"), source.indexOf("function authorized("));
  assert.match(reconnect, /if \(connectPromise\) return connectPromise;\s*closeCurrentSocket\(\)/);
  assert.match(reconnect, /return connect\(true\)/);
  assert.doesNotMatch(reconnect, /logout|clearPersistedSession|DELETE/);
  assert.match(source, /await createDatabaseAuthState\(sql\);\s*if \(currentGeneration !== generation\) return publicStatus\(\)/);
  assert.match(source, /nextSocket\.ev\.on\("creds.update", async \(\) => \{\s*if \(currentGeneration !== generation\) return/);
  assert.match(source, /nextSocket\.ev\.on\("messages.upsert", async \(\{ messages, type \}\) => \{\s*if \(currentGeneration !== generation\) return/);
});
