import { spawnSync } from "node:child_process";

function parseCommand(argv) {
  const marker = argv.indexOf("--");
  if (marker === -1 || marker === argv.length - 1) {
    return null;
  }
  return argv.slice(marker + 1);
}

function run(cmd, args) {
  return spawnSync(cmd, args, { stdio: "inherit", shell: false });
}

function updateState(status) {
  run("npm", ["run", "state:verification", "--", "--status", String(status)]);
}

function main() {
  const command = parseCommand(process.argv.slice(2));
  if (!command) {
    console.error("Usage: node scripts/run-with-state.mjs -- <command> [args...]");
    process.exit(1);
  }

  const [cmd, ...args] = command;
  const result = run(cmd, args);
  const status = result.status ?? 1;
  updateState(status);
  process.exit(status);
}

main();
