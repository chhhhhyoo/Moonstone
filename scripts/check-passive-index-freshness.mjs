import path from "node:path";
import { buildPassiveIndex } from "./generate-passive-context-index.mjs";
import { exists, read, repoRoot } from "./common.mjs";

async function main() {
  const indexPath = path.join(repoRoot, "docs/index/passive-context-index.md");
  if (!(await exists(indexPath))) {
    console.error("Passive context index is missing. Run: npm run docs:index");
    process.exit(1);
  }

  const current = await read(indexPath);
  const expected = await buildPassiveIndex();
  if (current !== expected) {
    console.error("Passive context index is stale. Run: npm run docs:index");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
