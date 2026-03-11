import path from "node:path";
import { exists, read, repoRoot } from "./common.mjs";

const policyPath = path.join(repoRoot, "config/governance/pr-policy.json");
const scopeMapPath = path.join(repoRoot, "config/governance/verification-scope-map.json");
const prTemplatePath = path.join(repoRoot, ".github/pull_request_template.md");

export async function loadPrPolicy() {
  if (!(await exists(policyPath))) {
    throw new Error("Missing config/governance/pr-policy.json");
  }
  return JSON.parse(await read(policyPath));
}

export async function loadScopeMap() {
  if (!(await exists(scopeMapPath))) {
    throw new Error("Missing config/governance/verification-scope-map.json");
  }
  return JSON.parse(await read(scopeMapPath));
}

export function parseBranchIdentity(branchName, policy) {
  if (policy.allow_branches.includes(branchName)) {
    return { ok: true, exempt: true, streamLower: null, id: null, slug: null };
  }
  const regex = new RegExp(policy.branch_regex);
  const match = regex.exec(branchName);
  if (!match) {
    return { ok: false, reason: `Branch name does not match policy: ${branchName}` };
  }
  return {
    ok: true,
    exempt: false,
    streamLower: match[1],
    id: match[2],
    slug: match[3]
  };
}

export function parsePrTitleIdentity(title, policy) {
  if (typeof title !== "string" || title.trim() === "") {
    return { ok: false, reason: "PR title is required." };
  }
  if (title.length > policy.max_pr_title_length) {
    return { ok: false, reason: `PR title exceeds max length ${policy.max_pr_title_length}.` };
  }
  const regex = new RegExp(policy.pr_title_regex);
  const match = regex.exec(title);
  if (!match) {
    return { ok: false, reason: `PR title does not match policy: ${title}` };
  }
  return {
    ok: true,
    streamUpper: match[1],
    id: match[2],
    summary: match[3]
  };
}

export function parseCommitSubject(subject, policy) {
  const regex = new RegExp(policy.commit_regex);
  const match = regex.exec(subject);
  if (!match) {
    return { ok: false, reason: `Commit subject does not match policy: ${subject}` };
  }
  return {
    ok: true,
    streamUpper: match[1],
    id: match[2],
    summary: match[3]
  };
}

export function ensureBranchPrIdentityMatch(branchIdentity, prIdentity, policy) {
  if (branchIdentity.exempt) {
    return { ok: true };
  }
  const expectedUpper = policy.streams[branchIdentity.streamLower];
  if (!expectedUpper) {
    return { ok: false, reason: `Unknown branch stream token: ${branchIdentity.streamLower}` };
  }
  if (expectedUpper !== prIdentity.streamUpper) {
    return {
      ok: false,
      reason: `Stream mismatch: branch=${branchIdentity.streamLower} PR=${prIdentity.streamUpper}`
    };
  }
  if (branchIdentity.id !== prIdentity.id) {
    return {
      ok: false,
      reason: `ID mismatch: branch=${branchIdentity.id} PR=${prIdentity.id}`
    };
  }
  return { ok: true };
}

export function classifyFilePath(filePath, scopeMap) {
  const normalized = String(filePath).replace(/\\/g, "/").replace(/^\.\//, "");
  for (const regexText of scopeMap.docs_only) {
    if (new RegExp(regexText).test(normalized)) {
      return "docs_only";
    }
  }
  for (const regexText of scopeMap.governance) {
    if (new RegExp(regexText).test(normalized)) {
      return "governance";
    }
  }
  return "runtime";
}

export function mergeScopes(scopes) {
  if (scopes.includes("runtime")) {
    return "runtime";
  }
  if (scopes.includes("governance")) {
    return "governance";
  }
  return "docs_only";
}

export async function validatePrTemplate(policy) {
  if (!(await exists(prTemplatePath))) {
    return { ok: false, reason: "Missing .github/pull_request_template.md" };
  }
  const content = await read(prTemplatePath);
  for (const section of policy.required_pr_template_sections) {
    if (!content.includes(section)) {
      return { ok: false, reason: `PR template missing section: ${section}` };
    }
  }
  return { ok: true };
}

function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractSection(markdown, heading) {
  const normalized = String(markdown).replace(/\r\n/g, "\n");
  const headingRegex = new RegExp(`^${escapeRegex(heading)}\\s*$`, "m");
  const headingMatch = headingRegex.exec(normalized);
  if (!headingMatch) {
    return { found: false, content: "" };
  }

  const startIndex = headingMatch.index + headingMatch[0].length;
  const tail = normalized.slice(startIndex);
  const nextHeadingMatch = /^\s*##\s+.+$/m.exec(tail);
  const endIndex = nextHeadingMatch ? startIndex + nextHeadingMatch.index : normalized.length;
  return {
    found: true,
    content: normalized.slice(startIndex, endIndex).trim()
  };
}

function informativeLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("```")) {
    return false;
  }

  const withoutPrefix = trimmed
    .replace(/^[-*]\s+/, "")
    .replace(/^[0-9]+\.\s+/, "")
    .replace(/^\[[xX ]\]\s+/, "")
    .trim();

  if (!withoutPrefix) {
    return false;
  }

  if (/^<[^>]+>$/.test(withoutPrefix)) {
    return false;
  }

  if (/^(none|n\/a)$/i.test(withoutPrefix)) {
    return false;
  }

  return /[A-Za-z0-9]/.test(withoutPrefix) && withoutPrefix.length >= 12;
}

export function validatePrBody(body, policy) {
  if (typeof body !== "string" || body.trim() === "") {
    return { ok: false, reason: "PR body is required and cannot be empty." };
  }

  const normalized = body.replace(/\r\n/g, "\n");
  const forbiddenPhrases = policy.forbidden_pr_body_phrases ?? [];
  const lowerBody = normalized.toLowerCase();
  for (const phrase of forbiddenPhrases) {
    if (lowerBody.includes(String(phrase).toLowerCase())) {
      return {
        ok: false,
        reason: `PR body contains forbidden low-signal phrase: ${phrase}`
      };
    }
  }

  const requiredSections = policy.required_pr_body_sections ?? [];
  for (const heading of requiredSections) {
    const section = extractSection(normalized, heading);
    if (!section.found) {
      return { ok: false, reason: `PR body missing section: ${heading}` };
    }
    const hasInformativeContent = section.content
      .split("\n")
      .some((line) => informativeLine(line));
    if (!hasInformativeContent) {
      return { ok: false, reason: `PR body section lacks informative content: ${heading}` };
    }
  }

  return { ok: true };
}
