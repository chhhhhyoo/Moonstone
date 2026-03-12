import { spawnSync } from "node:child_process";

function main() {
  const result = spawnSync(
    "npx",
    [
      "eslint",
      "--max-warnings",
      "0",
      "src/core/**/*.mjs",
      "src/service/**/*.mjs",
      "src/provider/poc/**/*.mjs"
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
