import path from "node:path";
import { exists, fail, read, repoRoot, walkFiles, rel } from "./common.mjs";

const markdownRoots = [
  path.join(repoRoot, "README.md"),
  path.join(repoRoot, "SPEC.md"),
  path.join(repoRoot, "VISION.md"),
  path.join(repoRoot, "AGENTS.md"),
  path.join(repoRoot, "docs"),
  path.join(repoRoot, "specs"),
  path.join(repoRoot, "notes")
];

function extractLinks(markdown) {
  const links = [];
  const regex = /\[[^\]]*]\(([^)]+)\)/g;
  let match = regex.exec(markdown);
  while (match) {
    links.push(match[1]);
    match = regex.exec(markdown);
  }
  return links;
}

function normalizeTarget(target) {
  return target.split("#")[0].split("?")[0];
}

async function listMarkdownFiles() {
  const files = [];
  for (const root of markdownRoots) {
    if (!(await exists(root))) {
      continue;
    }
    const statIsFile = root.endsWith(".md");
    if (statIsFile) {
      files.push(root);
      continue;
    }
    const nested = await walkFiles(root, (p) => p.endsWith(".md"));
    files.push(...nested);
  }
  return files;
}

async function main() {
  const errors = [];
  const files = await listMarkdownFiles();
  for (const filePath of files) {
    const content = await read(filePath);
    const links = extractLinks(content);
    for (const rawLink of links) {
      if (rawLink.startsWith("http://") || rawLink.startsWith("https://") || rawLink.startsWith("mailto:")) {
        continue;
      }
      if (rawLink.startsWith("#")) {
        continue;
      }

      const target = normalizeTarget(rawLink);
      if (!target) {
        continue;
      }

      let resolved;
      if (target.startsWith("/")) {
        resolved = target;
      } else {
        resolved = path.resolve(path.dirname(filePath), target);
      }

      if (!(await exists(resolved))) {
        errors.push(`Broken link in ${rel(filePath)} -> ${rawLink}`);
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
