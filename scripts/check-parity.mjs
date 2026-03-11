import path from "node:path";
import { exists, fail, read, repoRoot } from "./common.mjs";

async function main() {
  const registryPath = path.join(repoRoot, "src/agent/active-agents.json");
  const errors = [];
  if (!(await exists(registryPath))) {
    errors.push("Missing src/agent/active-agents.json");
    fail(errors);
  }

  const registry = JSON.parse(await read(registryPath));
  for (const entry of registry) {
    const directory = path.join(repoRoot, entry.directory);
    const prefix = entry.module;

    const required = [
      path.join(directory, `${prefix}.machine.mjs`),
      path.join(directory, `${prefix}.mjs`),
      path.join(directory, `${prefix}.schema.mjs`),
      path.join(directory, `${prefix}.def.mjs`),
      path.join(repoRoot, `test/unit/agent/${prefix}.machine.test.mjs`)
    ];

    for (const target of required) {
      if (!(await exists(target))) {
        errors.push(`Parity missing file for ${entry.id}: ${path.relative(repoRoot, target)}`);
      }
    }

    const testPath = path.join(repoRoot, `test/unit/agent/${prefix}.machine.test.mjs`);
    if (await exists(testPath)) {
      const testContent = await read(testPath);
      if (!testContent.includes(`${prefix}.machine`)) {
        errors.push(`Parity test does not import machine module: ${path.relative(repoRoot, testPath)}`);
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
