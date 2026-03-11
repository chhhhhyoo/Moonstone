import fs from "node:fs/promises";
import path from "node:path";

export const repoRoot = process.cwd();

export async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function walkFiles(rootDir, predicate = () => true) {
  const out = [];

  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }
      if (predicate(fullPath)) {
        out.push(fullPath);
      }
    }
  }

  if (await exists(rootDir)) {
    await walk(rootDir);
  }
  return out;
}

export function rel(targetPath) {
  return path.relative(repoRoot, targetPath).split(path.sep).join("/");
}

export async function read(targetPath) {
  return fs.readFile(targetPath, "utf8");
}

export function fail(errors) {
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}
