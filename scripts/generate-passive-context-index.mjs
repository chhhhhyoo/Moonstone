import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { exists, rel, repoRoot, walkFiles } from "./common.mjs";

function section(title, items) {
  const body = items.length > 0 ? items.map((item) => `- \`${item}\``).join("\n") : "- (none)";
  return `## ${title}\n\n${body}\n`;
}

function sectionWithSummary(title, items) {
  const body =
    items.length > 0
      ? items
          .map(({ item, summary }) => (summary ? `- \`${item}\`: ${summary}` : `- \`${item}\``))
          .join("\n")
      : "- (none)";
  return `## ${title}\n\n${body}\n`;
}

function truncate(value, limit = 100) {
  if (value.length <= limit) {
    return value;
  }
  return `${value.slice(0, limit - 3)}...`;
}

async function readMarkdownSummary(filePath) {
  const content = await fs.readFile(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  let lineIndex = 0;
  while (lineIndex < lines.length && lines[lineIndex].trim() === "") {
    lineIndex += 1;
  }

  if (lines[lineIndex]?.trim() === "---") {
    lineIndex += 1;
    while (lineIndex < lines.length && lines[lineIndex].trim() !== "---") {
      lineIndex += 1;
    }
    if (lineIndex < lines.length) {
      lineIndex += 1;
    }
  }

  for (; lineIndex < lines.length; lineIndex += 1) {
    const trimmed = lines[lineIndex].trim();
    if (!trimmed) {
      continue;
    }
    if (trimmed.startsWith("#")) {
      return truncate(trimmed.replace(/^#+\s*/, ""));
    }
    if (trimmed.startsWith(">")) {
      continue;
    }
    return truncate(trimmed);
  }
  return "";
}

async function listMarkdownWithSummary(rootDir) {
  const files = await walkFiles(rootDir, (p) => p.endsWith(".md"));
  const entries = [];
  for (const filePath of files) {
    const summary = await readMarkdownSummary(filePath);
    entries.push({ item: rel(filePath), summary });
  }
  return entries;
}

async function listCodexSkills() {
  const skillsRoot = path.join(repoRoot, ".codex", "skills");
  if (!(await exists(skillsRoot))) {
    return [];
  }
  const entries = await fs.readdir(skillsRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

async function listNpmScripts() {
  const packageJsonPath = path.join(repoRoot, "package.json");
  if (!(await exists(packageJsonPath))) {
    return [];
  }
  const parsed = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));
  return Object.keys(parsed.scripts ?? {})
    .sort((a, b) => a.localeCompare(b))
    .map((scriptName) => `npm run ${scriptName}`);
}

async function listDocsCatalog() {
  const docsRoot = path.join(repoRoot, "docs");
  if (!(await exists(docsRoot))) {
    return [];
  }
  const entries = await fs.readdir(docsRoot, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));
  return entries
    .filter((entry) => (entry.isDirectory() && !entry.name.startsWith(".")) || (entry.isFile() && entry.name.endsWith(".md")))
    .map((entry) => (entry.isDirectory() ? `docs/${entry.name}/*` : `docs/${entry.name}`));
}

export async function buildPassiveIndex() {
  const commands = await listNpmScripts();
  const skills = await listCodexSkills();
  const specs = await listMarkdownWithSummary(path.join(repoRoot, "specs"));
  const notes = await listMarkdownWithSummary(path.join(repoRoot, "notes"));
  const docsCatalog = await listDocsCatalog();
  const governance = (await walkFiles(path.join(repoRoot, "docs/governance"), (p) => p.endsWith(".md"))).map(rel);
  const workflows = (await walkFiles(path.join(repoRoot, "docs/workflows"), (p) => p.endsWith(".md"))).map(rel);
  const coreModules = (await walkFiles(path.join(repoRoot, "src/core"), (p) => p.endsWith(".mjs"))).map(rel);
  const agentModules = (await walkFiles(path.join(repoRoot, "src/agent"), (p) => p.endsWith(".mjs") || p.endsWith(".json"))).map(rel);
  const runtimeOverviewPath = path.join(repoRoot, "docs/orchestrator-overview.md");
  const runtimeOverview = (await exists(runtimeOverviewPath)) ? [rel(runtimeOverviewPath)] : [];

  const criticalArtifacts = commands.length + skills.length + specs.length + notes.length + docsCatalog.length;
  if (criticalArtifacts === 0) {
    throw new Error("Refusing to generate passive context index with zero discovered artifacts.");
  }

  return [
    "# Passive Context Index",
    "",
    "> GENERATED FILE. DO NOT EDIT MANUALLY.",
    "> Source command: `npm run docs:index`",
    "> Migrated cognitive-hub behaviors from `.gemini/scripts/generate-cognitive-map.js` into this Codex-native index.",
    "",
    section("Command Surface", commands),
    section("Skill Catalog", skills),
    sectionWithSummary("Canonical Specs", specs),
    sectionWithSummary("Notes And Playbooks", notes),
    section("Documentation Catalog", docsCatalog),
    section("Governance Docs", governance),
    section("Active Workflows", workflows),
    section("Runtime Overview", runtimeOverview),
    section("Core Module Families", coreModules),
    section("Agent Module Families", agentModules)
  ].join("\n");
}

async function main() {
  const write = process.argv.includes("--write");
  const outPath = path.join(repoRoot, "docs/index/passive-context-index.md");
  const content = await buildPassiveIndex();
  if (write) {
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, content, "utf8");
    return;
  }
  process.stdout.write(content);
}

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);
if (isDirectRun) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
