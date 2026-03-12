import path from "node:path";
import { exists, fail, read, repoRoot, walkFiles } from "./common.mjs";

const requiredPaths = [
  "SPEC.md",
  "specs/01-architecture.md",
  "specs/02-workflows.md",
  "specs/03-tooling-and-skills.md",
  "specs/04-validation.md",
  "specs/05-memory-and-documentation.md",
  "docs/governance/agent-rulebook.md",
  "docs/governance/RULE.md",
  "docs/governance/local-skill-routing.md",
  "docs/governance/pr-branch-policy.md",
  "docs/governance/verification-tier-policy.md",
  "docs/governance/guard-registry.md",
  "docs/governance/repo-family-charter.md",
  "docs/governance/handoff-contract.md",
  "docs/orchestrator-overview.md",
  "docs/learnings.md",
  "docs/strategy/MILESTONES.md",
  "docs/strategy/FUTURE-ACTIONS.md",
  "notes/00-Index.md",
  "config/governance/pr-policy.json",
  "config/governance/verification-scope-map.json",
  "tsconfig.json",
  "eslint.config.mjs",
  ".github/pull_request_template.md",
  ".github/workflows/verify-moonstone.yml"
];

const requiredFrontmatterFields = [
  "status:",
  "changed_areas:",
  "consulted_sources:",
  "decisions:"
];

async function validateSpecImpact(errors) {
  const specImpactDir = path.join(repoRoot, "notes/spec-impact");
  if (!(await exists(specImpactDir))) {
    errors.push("Missing notes/spec-impact directory.");
    return;
  }
  const records = await walkFiles(specImpactDir, (p) => p.endsWith(".md"));
  if (records.length === 0) {
    errors.push("No spec-impact record found under notes/spec-impact.");
    return;
  }

  for (const recordPath of records) {
    const content = await read(recordPath);
    if (!content.startsWith("---")) {
      errors.push(`Spec-impact record missing frontmatter: ${path.relative(repoRoot, recordPath)}`);
      continue;
    }
    for (const field of requiredFrontmatterFields) {
      if (!content.includes(field)) {
        errors.push(`Spec-impact record missing '${field.replace(":", "")}': ${path.relative(repoRoot, recordPath)}`);
      }
    }
  }
}

async function main() {
  const errors = [];
  for (const requiredPath of requiredPaths) {
    if (!(await exists(path.join(repoRoot, requiredPath)))) {
      errors.push(`Missing required canonical file: ${requiredPath}`);
    }
  }

  if (await exists(path.join(repoRoot, "docs/plans"))) {
    errors.push("docs/plans is prohibited. Use docs/strategy instead.");
  }

  const agentsPath = path.join(repoRoot, "AGENTS.md");
  if (await exists(agentsPath)) {
    const agents = await read(agentsPath);
    if (!agents.includes("docs/governance/agent-rulebook.md")) {
      errors.push("AGENTS.md must reference docs/governance/agent-rulebook.md");
    }
    if (!agents.includes("docs/governance/local-skill-routing.md")) {
      errors.push("AGENTS.md must reference docs/governance/local-skill-routing.md");
    }
    if (!agents.includes("docs/governance/pr-branch-policy.md")) {
      errors.push("AGENTS.md must reference docs/governance/pr-branch-policy.md");
    }
  }

  await validateSpecImpact(errors);

  if (errors.length > 0) {
    fail(errors);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
