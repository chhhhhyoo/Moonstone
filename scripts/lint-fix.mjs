import { spawnSync } from "node:child_process";

function main() {
  const result = spawnSync(
    "npx",
    [
      "eslint",
      "--fix",
      "--max-warnings",
      "0",
      "src/core/**/*.mjs",
      "src/service/**/*.mjs"
    ],
    {
      stdio: "inherit"
    }
  );
  if ((result.status ?? 1) !== 0) {
    process.exit(result.status ?? 1);
  }
}

main();
