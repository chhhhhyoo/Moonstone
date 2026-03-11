import fs from "node:fs/promises";
import path from "node:path";
import { repoRoot } from "./common.mjs";

const statePath = path.join(repoRoot, "notes", ".session-state.json");
const defaultState = {
  activeSkill: "none",
  currentPhase: "none",
  lastVerificationStatus: "0",
  lastVerificationTime: 0
};

async function ensureState() {
  await fs.mkdir(path.dirname(statePath), { recursive: true });
  try {
    const raw = await fs.readFile(statePath, "utf8");
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed };
  } catch {
    await fs.writeFile(statePath, JSON.stringify(defaultState, null, 2), "utf8");
    return { ...defaultState };
  }
}

async function saveState(state) {
  await fs.writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!key.startsWith("--")) {
      continue;
    }
    out[key.slice(2)] = value ?? "";
    i += 1;
  }
  return out;
}

async function runRecall() {
  const state = await ensureState();
  process.stdout.write(`${JSON.stringify(state, null, 2)}\n`);
}

async function runSet(argv) {
  const state = await ensureState();
  const args = parseArgs(argv);
  if (args.skill) {
    state.activeSkill = args.skill;
  }
  if (args.phase) {
    state.currentPhase = args.phase;
  }
  await saveState(state);
  process.stdout.write(`${JSON.stringify(state, null, 2)}\n`);
}

async function runVerification(argv) {
  const state = await ensureState();
  const args = parseArgs(argv);
  if (args.status) {
    state.lastVerificationStatus = args.status;
  }
  state.lastVerificationTime = Math.floor(Date.now() / 1000);
  await saveState(state);
  process.stdout.write(`${JSON.stringify(state, null, 2)}\n`);
}

function usage() {
  process.stderr.write(
    [
      "Usage:",
      "  node scripts/session-state.mjs recall",
      "  node scripts/session-state.mjs set --skill <name> --phase <name>",
      "  node scripts/session-state.mjs verification --status <code>"
    ].join("\n") + "\n"
  );
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  if (!cmd) {
    usage();
    process.exit(1);
  }
  if (cmd === "recall") {
    await runRecall();
    return;
  }
  if (cmd === "set") {
    await runSet(rest);
    return;
  }
  if (cmd === "verification") {
    await runVerification(rest);
    return;
  }
  usage();
  process.exit(1);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
