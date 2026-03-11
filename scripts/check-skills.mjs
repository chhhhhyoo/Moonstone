import path from "node:path";
import { exists, fail, repoRoot, walkFiles, read, rel } from "./common.mjs";

const requiredDefaultSkills = [
  "planning-with-files",
  "writing-plans",
  "orchestrator",
  "executing-plans",
  "verification-before-completion",
  "reflexion",
  "manage-skills"
];

const requiredReinforcedSkills = [
  "hermeneia",
  "prothesis",
  "syneidesis",
  "test-driven-development",
  "eval-suite-checklist",
  "tool-design-checklist",
  "systematic-debugging"
];

const mandatorySections = [
  "## Purpose",
  "## Protocol",
  "## Exit Protocol"
];

const durableMemoryMarkers = [
  "docs/logs/",
  "docs/learnings.md"
];

async function main() {
  const skillsRoot = path.join(repoRoot, ".codex/skills");
  const errors = [];
  if (!(await exists(skillsRoot))) {
    errors.push("Missing .codex/skills directory");
    fail(errors);
  }

  const required = [...requiredDefaultSkills, ...requiredReinforcedSkills];
  const allSkillFiles = await walkFiles(skillsRoot, (p) => path.basename(p) === "SKILL.md");

  for (const skillFile of allSkillFiles) {
    const relativePath = rel(skillFile);
    const content = await read(skillFile);

    // 1. Frontmatter Check
    const nameMatch = content.match(/^name:\s*(.+)$/m);
    const descMatch = content.match(/^description:\s*(.+)$/m);

    if (!nameMatch) {
      errors.push(`Skill missing frontmatter name: ${relativePath}`);
    }
    if (!descMatch) {
      errors.push(`Skill missing frontmatter description: ${relativePath}`);
    }

    // 2. Header and Name Consistency
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (!h1Match) {
      errors.push(`Skill missing H1 header: ${relativePath}`);
    } else if (nameMatch && nameMatch[1].trim() !== h1Match[1].trim()) {
      errors.push(`Skill frontmatter name ("${nameMatch[1].trim()}") does not match H1 header ("${h1Match[1].trim()}"): ${relativePath}`);
    }

    // 3. Mandatory Sections
    for (const section of mandatorySections) {
      if (!content.includes(section)) {
        errors.push(`Skill missing mandatory section "${section}": ${relativePath}`);
      }
    }

    // 4. Durable Memory Check (in Exit Protocol)
    const exitProtocolIndex = content.indexOf("## Exit Protocol");
    if (exitProtocolIndex !== -1) {
      const exitProtocolContent = content.substring(exitProtocolIndex);
      for (const marker of durableMemoryMarkers) {
        if (!exitProtocolContent.includes(marker)) {
          errors.push(`Skill Exit Protocol missing durable memory reference "${marker}": ${relativePath}`);
        }
      }
    }

    // 5. Local Link Integrity Check
    const linkRegex = /\[[^\]]+\]\(([^\)]+)\)/g;
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
      const linkPath = match[1];
      // Only check local paths that look like they belong to the repo
      if (linkPath.startsWith("docs/") || linkPath.startsWith("specs/") || linkPath.endsWith(".md") || linkPath.includes("/")) {
        if (linkPath.startsWith("http") || linkPath.startsWith("#") || linkPath.startsWith("mailto:")) continue;

        const absoluteLinkPath = path.resolve(path.dirname(skillFile), linkPath);
        if (!(await exists(absoluteLinkPath))) {
          errors.push(`Broken local link "${linkPath}" in ${relativePath}`);
        }
      }
    }
  }

  // 6. Completeness Check
  for (const skill of required) {
    const skillPath = path.join(skillsRoot, skill, "SKILL.md");
    if (!(await exists(skillPath))) {
      errors.push(`Missing required skill file: ${rel(skillPath)}`);
    }
  }

  if (errors.length > 0) {
    fail(errors);
  } else {
    console.log("✅ All skills passed the quality rubric.");
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
