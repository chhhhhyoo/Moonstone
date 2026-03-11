import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const REQUIRED_TYPES = ["happy", "bad_input", "system_failure", "security"];
const CONFORMANCE_DIR = path.join(process.cwd(), "test", "integration", "conformance");

function listJsonCaseFiles(root) {
  const entries = readdirSync(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "fixtures") {
        continue;
      }
      files.push(...listJsonCaseFiles(full));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(full);
    }
  }
  return files;
}

function main() {
  try {
    statSync(CONFORMANCE_DIR);
  } catch {
    console.error("❌ Conformance lint failed:");
    console.error("  - Missing directory: test/integration/conformance");
    process.exit(1);
  }

  const caseFiles = listJsonCaseFiles(CONFORMANCE_DIR);
  if (caseFiles.length === 0) {
    console.log("INFO: Conformance lint skipped: no JSON case files found outside fixtures.");
    console.log("   This repo currently uses .mjs conformance tests as canonical format.");
    return;
  }

  const seen = Object.fromEntries(REQUIRED_TYPES.map((type) => [type, 0]));
  const errors = [];

  for (const file of caseFiles) {
    let parsed;
    try {
      parsed = JSON.parse(readFileSync(file, "utf8"));
    } catch {
      errors.push(`${path.relative(process.cwd(), file)}: invalid JSON`);
      continue;
    }

    if (!Array.isArray(parsed)) {
      errors.push(`${path.relative(process.cwd(), file)}: root must be an array of test cases`);
      continue;
    }

    for (const testCase of parsed) {
      const caseId = typeof testCase?.id === "string" && testCase.id.length > 0 ? testCase.id : "(unknown)";
      const caseType = testCase?.type;

      if (typeof caseId !== "string" || caseId === "(unknown)") {
        errors.push(`${path.relative(process.cwd(), file)}: missing id`);
      }
      if (!REQUIRED_TYPES.includes(caseType)) {
        errors.push(`${path.relative(process.cwd(), file)}: ${caseId} missing/invalid type`);
      } else {
        seen[caseType] += 1;
      }
      if (!Array.isArray(testCase?.command) || testCase.command.length === 0) {
        errors.push(`${path.relative(process.cwd(), file)}: ${caseId} command must be a non-empty array`);
      }
      if (typeof testCase?.timeout_ms !== "number" || testCase.timeout_ms < 1) {
        errors.push(`${path.relative(process.cwd(), file)}: ${caseId} timeout_ms must be >= 1`);
      }
    }
  }

  for (const type of REQUIRED_TYPES) {
    if (seen[type] === 0) {
      errors.push(`Suite missing required test type: ${type}`);
    }
  }

  if (errors.length > 0) {
    console.error("❌ Conformance lint failed:");
    for (const error of errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }

  console.log("✅ Conformance lint passed");
}

main();
