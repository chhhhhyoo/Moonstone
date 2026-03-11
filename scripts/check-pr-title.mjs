import { loadPrPolicy, parsePrTitleIdentity } from "./pr-governance-lib.mjs";

function parseArgs() {
  const args = process.argv.slice(2);
  let title = null;
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--title") {
      title = args[i + 1] ?? null;
      i += 1;
    }
  }
  return { title };
}

async function main() {
  const { title: explicitTitle } = parseArgs();
  const title = explicitTitle ?? process.env.PR_TITLE ?? null;
  if (!title) {
    throw new Error("PR title is required. Pass --title or PR_TITLE env.");
  }

  const policy = await loadPrPolicy();
  const parsed = parsePrTitleIdentity(title, policy);
  if (!parsed.ok) {
    throw new Error(parsed.reason);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
