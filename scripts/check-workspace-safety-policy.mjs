import path from "node:path";
import { exists, fail, read, repoRoot } from "./common.mjs";

const policyPath = path.join(repoRoot, "config", "governance", "workspace-safety-policy.json");

const requiredPrefixes = ["rm ", "sudo "];
const requiredDenyRegexes = ["(rm\\s+-rf\\b|dd\\s+if=\\b|mkfs\\b|:\\(\\)\\{:\\||/dev/sd[a-z])"];
const requiredAskRegexes = [
  "(git\\s+push\\b|npm\\s+publish\\b|docker\\s+push\\b|kubectl\\s+apply\\b)",
  "(npm\\s+install\\b|pip\\s+install\\b|cargo\\s+add\\b)"
];

function assertArrayContains(errors, fieldName, actual, required) {
  if (!Array.isArray(actual)) {
    errors.push(`Field '${fieldName}' must be an array.`);
    return;
  }
  for (const item of required) {
    if (!actual.includes(item)) {
      errors.push(`Missing required ${fieldName} entry: ${item}`);
    }
  }
}

async function main() {
  const errors = [];
  if (!(await exists(policyPath))) {
    fail(["Missing workspace safety policy file: config/governance/workspace-safety-policy.json"]);
  }

  let policy;
  try {
    policy = JSON.parse(await read(policyPath));
  } catch (error) {
    fail([`Invalid JSON in workspace safety policy: ${error.message}`]);
  }

  assertArrayContains(errors, "deny_prefixes", policy.deny_prefixes, requiredPrefixes);
  assertArrayContains(errors, "deny_regexes", policy.deny_regexes, requiredDenyRegexes);
  assertArrayContains(errors, "ask_user_regexes", policy.ask_user_regexes, requiredAskRegexes);

  if (errors.length > 0) {
    fail(errors);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
