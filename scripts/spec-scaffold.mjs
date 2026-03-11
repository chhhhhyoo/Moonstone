import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

function exists(targetPath) {
  try {
    fs.accessSync(targetPath);
    return true;
  } catch {
    return false;
  }
}

function ensureDir(targetPath) {
  fs.mkdirSync(targetPath, { recursive: true });
}

function likelyFirstRun() {
  if (!exists(".git")) {
    return true;
  }
  try {
    execSync("git rev-parse --verify HEAD", { stdio: "ignore" });
    return false;
  } catch {
    return true;
  }
}

function specTouched() {
  try {
    const status = execSync("git status --porcelain SPEC.md specs", { encoding: "utf8" }).trim();
    return status.length > 0;
  } catch {
    return true;
  }
}

function specTemplate(title) {
  return `---\nspecVersion: 1.0.0\nrole: sub-spec\n---\n# ${title}\n\n## Purpose\n`;
}

function main() {
  ensureDir("specs");
  ensureDir(path.join("test", "integration", "conformance"));

  if (!likelyFirstRun() && exists("SPEC.md") && !specTouched()) {
    console.error("Gate failed: SPEC.md/specs unchanged. Update spec before scaffolding.");
    process.exit(1);
  }

  const subspecs = [
    { file: "01-architecture.md", title: "Architecture" },
    { file: "02-workflows.md", title: "Workflows" },
    { file: "03-tooling-and-skills.md", title: "Tooling And Skills" },
    { file: "04-validation.md", title: "Validation" },
    { file: "05-memory-and-documentation.md", title: "Memory And Documentation" }
  ];

  for (const { file, title } of subspecs) {
    const targetPath = path.join("specs", file);
    if (!exists(targetPath)) {
      fs.writeFileSync(targetPath, specTemplate(title), "utf8");
    }
  }

  console.log("SPEC scaffold complete");
}

main();
