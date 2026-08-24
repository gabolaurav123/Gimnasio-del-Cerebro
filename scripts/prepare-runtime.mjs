import { cp, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const vinextSource = join(projectRoot, "node_modules", "vinext", "dist");
const vinextTarget = join(projectRoot, "dist", "vinext");

await rm(vinextTarget, { recursive: true, force: true });
await cp(vinextSource, vinextTarget, { recursive: true });

const isSeenodeBuild = process.env.SEENODE_BUILD === "1" || Boolean(
  process.env.DATABASE_URL && process.env.SITE_URL && process.env.SESSION_SECRET,
);

if (isSeenodeBuild) {
  const npmCli = process.env.npm_execpath;
  const npmCommand = npmCli ? process.execPath : "npm";
  const npmArgs = npmCli
    ? [npmCli, "prune", "--omit=dev", "--no-audit", "--no-fund"]
    : ["prune", "--omit=dev", "--no-audit", "--no-fund"];
  const result = spawnSync(npmCommand, npmArgs, {
    cwd: projectRoot,
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "production" },
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
