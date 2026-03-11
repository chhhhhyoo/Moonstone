import fs from "node:fs/promises";
import path from "node:path";
import { exists, fail, repoRoot } from "./common.mjs";

async function walkEntries(rootDir) {
  const entries = [];
  async function walk(current) {
    const items = await fs.readdir(current, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(current, item.name);
      entries.push(fullPath);
      if (item.isDirectory()) {
        await walk(fullPath);
      }
    }
  }
  await walk(rootDir);
  return entries;
}

async function main() {
  const docsRoot = path.join(repoRoot, "docs");
  const errors = [];
  if (!(await exists(docsRoot))) {
    errors.push("docs directory is missing.");
    fail(errors);
  }

  const entries = await walkEntries(docsRoot);
  for (const entryPath of entries) {
    const stat = await fs.lstat(entryPath);
    if (!stat.isSymbolicLink()) {
      continue;
    }
    const linkTarget = await fs.readlink(entryPath);
    const resolved = path.resolve(path.dirname(entryPath), linkTarget);
    if (!resolved.startsWith(repoRoot)) {
      errors.push(`External docs symlink is prohibited: ${path.relative(repoRoot, entryPath)} -> ${resolved}`);
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
