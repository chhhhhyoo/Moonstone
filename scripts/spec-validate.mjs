import fs from "node:fs";

const REQUIRED_HEADINGS = [
  /^## Purpose/m,
  /^## Source of Truth/m,
  /^## Architecture Baseline/m,
  /^## Required Contracts/m,
  /^## Verification Tiers/m,
  /^## PR Governance Contract/m,
  /^## Change Control/m
];

function main() {
  if (!fs.existsSync("SPEC.md")) {
    console.error("Missing SPEC.md");
    process.exit(1);
  }

  const content = fs.readFileSync("SPEC.md", "utf8");
  if (!content.startsWith("# SPEC")) {
    console.error("SPEC.md must begin with '# SPEC'.");
    process.exit(1);
  }

  const missing = REQUIRED_HEADINGS.filter((pattern) => !pattern.test(content));
  if (missing.length > 0) {
    console.error("Missing required SPEC headings:");
    for (const pattern of missing) {
      console.error(`- ${pattern.source}`);
    }
    process.exit(1);
  }

  console.log("SPEC validation passed");
}

main();
