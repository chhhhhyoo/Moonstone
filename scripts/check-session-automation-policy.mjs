import path from "node:path";
import { exists, fail, read, repoRoot } from "./common.mjs";

const policyPath = path.join(repoRoot, "config", "governance", "session-automation-policy.json");
const packageJsonPath = path.join(repoRoot, "package.json");

const requiredMappings = [
  { event: "SessionStart", matcher: "*", hook: "state-recall" },
  { event: "SessionEnd", matcher: "*", hook: "post-session-lint" },
  { event: "BeforeTool", matcher: "activate_skill", hook: "skill-sequencer" },
  { event: "AfterAgent", matcher: "*", hook: "post-task-lint" },
  { event: "AfterTool", matcher: "exec", hook: "track-verification" },
  { event: "AfterTool", matcher: "activate_skill", hook: "track-skill-activation" },
  { event: "AfterTool", matcher: "activate_skill", hook: "refresh-cognitive-map" },
  { event: "AfterModel", matcher: "*", hook: "enforce-honesty" }
];

function mappingKey(mapping) {
  return `${mapping.event}::${mapping.matcher}::${mapping.hook}`;
}

function assertString(errors, fieldPath, value) {
  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`Field '${fieldPath}' must be a non-empty string.`);
  }
}

function assertArray(errors, fieldPath, value) {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`Field '${fieldPath}' must be a non-empty array.`);
    return false;
  }
  return true;
}

async function pathExists(relativePath) {
  return exists(path.join(repoRoot, relativePath));
}

async function main() {
  if (!(await exists(policyPath))) {
    fail(["Missing session automation policy file: config/governance/session-automation-policy.json"]);
  }
  if (!(await exists(packageJsonPath))) {
    fail(["Missing package.json (required to validate mapped npm commands)."]);
  }

  const errors = [];
  let policy;
  let packageJson;
  try {
    policy = JSON.parse(await read(policyPath));
  } catch (error) {
    fail([`Invalid JSON in session automation policy: ${error.message}`]);
  }
  try {
    packageJson = JSON.parse(await read(packageJsonPath));
  } catch (error) {
    fail([`Invalid JSON in package.json: ${error.message}`]);
  }

  if (policy.source !== ".gemini/settings.json") {
    errors.push("Field 'source' must be '.gemini/settings.json'.");
  }
  if (policy.mode !== "protocol-driven") {
    errors.push("Field 'mode' must be 'protocol-driven'.");
  }
  if (!Array.isArray(policy.disabled)) {
    errors.push("Field 'disabled' must be an array.");
  } else if (policy.disabled.length !== 0) {
    errors.push("Field 'disabled' must remain empty unless explicitly approved migration exceptions are documented.");
  }

  if (!Array.isArray(policy.event_mappings)) {
    errors.push("Field 'event_mappings' must be an array.");
  }

  const scriptNames = new Set(Object.keys(packageJson.scripts ?? {}));
  const seenKeys = new Set();
  const mappingSet = new Set();

  for (let i = 0; i < (policy.event_mappings ?? []).length; i += 1) {
    const mapping = policy.event_mappings[i];
    const prefix = `event_mappings[${i}]`;

    assertString(errors, `${prefix}.event`, mapping.event);
    assertString(errors, `${prefix}.matcher`, mapping.matcher);
    assertString(errors, `${prefix}.hook`, mapping.hook);

    const key = mappingKey(mapping);
    if (seenKeys.has(key)) {
      errors.push(`Duplicate mapping entry detected: ${key}`);
    }
    seenKeys.add(key);
    mappingSet.add(key);

    if (typeof mapping.codex !== "object" || mapping.codex === null) {
      errors.push(`Field '${prefix}.codex' must be an object.`);
      continue;
    }

    const hasCommands = assertArray(errors, `${prefix}.codex.commands`, mapping.codex.commands);
    const hasDocs = assertArray(errors, `${prefix}.codex.docs`, mapping.codex.docs);
    const hasSkills = assertArray(errors, `${prefix}.codex.skills`, mapping.codex.skills);

    if (hasCommands) {
      for (const command of mapping.codex.commands) {
        assertString(errors, `${prefix}.codex.commands[]`, command);
        if (!command.startsWith("npm run ")) {
          errors.push(`Unsupported command format in ${prefix}.codex.commands: ${command} (expected 'npm run <script>').`);
          continue;
        }
        const scriptName = command.slice("npm run ".length).trim();
        if (!scriptNames.has(scriptName)) {
          errors.push(`Command maps to missing npm script '${scriptName}' in ${prefix}.codex.commands.`);
        }
      }
    }

    if (hasDocs) {
      for (const docPath of mapping.codex.docs) {
        assertString(errors, `${prefix}.codex.docs[]`, docPath);
        if (!(await pathExists(docPath))) {
          errors.push(`Mapped doc path does not exist for ${prefix}: ${docPath}`);
        }
      }
    }

    if (hasSkills) {
      for (const skillPath of mapping.codex.skills) {
        assertString(errors, `${prefix}.codex.skills[]`, skillPath);
        if (!(await pathExists(skillPath))) {
          errors.push(`Mapped skill path does not exist for ${prefix}: ${skillPath}`);
        }
      }
    }
  }

  for (const required of requiredMappings) {
    const key = mappingKey(required);
    if (!mappingSet.has(key)) {
      errors.push(`Missing required lifecycle mapping: ${key}`);
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
