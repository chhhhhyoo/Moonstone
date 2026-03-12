import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { normalizeWorkflowArtifact, validateWorkflowArtifact } from "../src/core/poc/WorkflowArtifact.mjs";

export function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    i += 1;
  }
  return args;
}

export async function readJsonFile(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

export async function writeJsonFile(filePath, data) {
  const dir = path.dirname(filePath);
  await mkdir(dir, { recursive: true });
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function loadArtifact(filePath) {
  const artifact = await readJsonFile(filePath);
  const normalized = normalizeWorkflowArtifact(artifact);
  validateWorkflowArtifact(normalized);
  return normalized;
}

export async function loadInput(inputArg) {
  if (!inputArg) {
    return {};
  }

  if (inputArg.startsWith("{")) {
    return JSON.parse(inputArg);
  }

  const resolved = path.resolve(process.cwd(), inputArg);
  return readJsonFile(resolved);
}

export function requireArg(args, key) {
  const value = args[key];
  if (!value || value === true) {
    throw new Error(`Missing required --${key} argument.`);
  }
  return String(value);
}
