import path from "node:path";
import { exists, fail, read, repoRoot } from "./common.mjs";

const statePath = path.join(repoRoot, "notes", ".session-state.json");
const maxAgeSeconds = 300;

async function main() {
  if (!(await exists(statePath))) {
    fail(["Verification freshness check failed: no session state file found (notes/.session-state.json)."]);
  }

  const raw = await read(statePath);
  const state = JSON.parse(raw);
  const status = String(state.lastVerificationStatus ?? "1");
  const timestamp = Number(state.lastVerificationTime ?? 0);
  const now = Math.floor(Date.now() / 1000);
  const age = now - timestamp;

  if (status !== "0") {
    fail([`Verification freshness check failed: last verification status is non-zero (${status}).`]);
  }

  if (age > maxAgeSeconds) {
    fail([`Verification freshness check failed: last passing verification is stale (${age}s old, max ${maxAgeSeconds}s).`]);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
