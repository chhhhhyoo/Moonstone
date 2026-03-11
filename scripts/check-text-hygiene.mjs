import path from "node:path";
import { fail, read, repoRoot, walkFiles } from "./common.mjs";

function shouldLint(filePath) {
  return filePath.endsWith(".mjs") || filePath.endsWith(".md") || filePath.endsWith(".json") || filePath.endsWith(".yml");
}

async function main() {
  const errors = [];
  const roots = ["src", "scripts", "specs", "docs", "notes", "config", ".github", ".codex/skills", "test"];

  for (const root of roots) {
    const files = await walkFiles(path.join(repoRoot, root), shouldLint);
    for (const filePath of files) {
      const content = await read(filePath);
      const lines = content.split("\n");
      lines.forEach((line, index) => {
        if (line.includes("\t")) {
          errors.push(`Tab character in ${path.relative(repoRoot, filePath)}:${index + 1}`);
        }
        if (/\s+$/.test(line) && line.length > 0) {
          errors.push(`Trailing whitespace in ${path.relative(repoRoot, filePath)}:${index + 1}`);
        }
      });
      if (!content.endsWith("\n")) {
        errors.push(`Missing newline at EOF in ${path.relative(repoRoot, filePath)}`);
      }
    }
  }

  if (errors.length > 0) {
    fail(errors);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
