import { normalizeWorkflowArtifact, validateWorkflowArtifact } from "./WorkflowArtifact.mjs";

const SUMMARY_PROMPT_PATTERN = /\b(summary|summarize|summarise)\b/i;

/**
 * @returns {never}
 */
function fail(code, message) {
  const error = /** @type {Error & { code?: string }} */ (new Error(message));
  error.code = code;
  throw error;
}

function normalizeRoleReference(roleReference) {
  const normalized = String(roleReference ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  if (!normalized) {
    fail("CHEF_ROLE_REFERENCE_REQUIRED", "Role reference is required.");
  }
  return normalized;
}

function inferRoleKind(normalizedReference) {
  if (/\btrigger\b/.test(normalizedReference)) {
    return "trigger_step";
  }
  if (/\b(request|http)\b/.test(normalizedReference)) {
    return "request_step";
  }
  if (/\bsummary\b/.test(normalizedReference)) {
    return "summary_step";
  }
  fail("CHEF_ROLE_UNKNOWN", `Unknown role reference '${normalizedReference}'.`);
}

function inferSelector(normalizedReference, role) {
  if (/\bfirst\b/.test(normalizedReference)) {
    return "first";
  }
  if (/\b(latest|last)\b/.test(normalizedReference)) {
    return "latest";
  }
  if (role === "trigger_step") {
    return "exact";
  }
  return "single";
}

/**
 * @param {{
 *   roleReference: string
 * }} input
 */
export function inspectChefRoleReference({ roleReference }) {
  const normalizedReference = normalizeRoleReference(roleReference);
  const role = inferRoleKind(normalizedReference);
  const selector = inferSelector(normalizedReference, role);
  return {
    roleReference: normalizedReference,
    role,
    selector
  };
}

/**
 * @param {{
 *   artifact: Record<string, unknown>
 * }} input
 */
export function buildChefRoleIndex({ artifact }) {
  const normalizedArtifact = normalizeWorkflowArtifact(artifact);
  validateWorkflowArtifact(normalizedArtifact);

  const requestStepNodeIds = [];
  const summaryStepNodeIds = [];

  for (const node of normalizedArtifact.nodes ?? []) {
    if (node.type === "action.http") {
      requestStepNodeIds.push(node.id);
      continue;
    }
    if (node.type === "action.openai" && SUMMARY_PROMPT_PATTERN.test(String(node.config?.prompt ?? ""))) {
      summaryStepNodeIds.push(node.id);
    }
  }

  return {
    trigger_step: ["trigger"],
    request_step: requestStepNodeIds,
    summary_step: summaryStepNodeIds
  };
}

/**
 * @param {{
 *   artifact: Record<string, unknown>,
 *   roleReference: string
 * }} input
 */
export function listChefRoleCandidates({ artifact, roleReference }) {
  const normalizedArtifact = normalizeWorkflowArtifact(artifact);
  validateWorkflowArtifact(normalizedArtifact);
  const inspected = inspectChefRoleReference({ roleReference });
  const roleIndex = buildChefRoleIndex({ artifact: normalizedArtifact });
  const candidates = roleIndex[inspected.role] ?? [];
  if (candidates.length === 0) {
    fail("CHEF_ROLE_NO_CANDIDATE", `No candidates found for role reference '${roleReference}'.`);
  }
  return {
    roleReference: inspected.roleReference,
    role: inspected.role,
    selector: inspected.selector,
    candidates
  };
}

/**
 * @param {{
 *   artifact: Record<string, unknown>,
 *   roleReference: string
 * }} input
 */
export function resolveChefRoleAnchor({ artifact, roleReference }) {
  const analyzed = listChefRoleCandidates({ artifact, roleReference });
  const role = analyzed.role;
  const selector = analyzed.selector;
  const candidates = analyzed.candidates;

  if (selector === "first") {
    return {
      role,
      selector,
      roleReference: analyzed.roleReference,
      nodeId: candidates[0],
      candidates
    };
  }
  if (selector === "latest") {
    return {
      role,
      selector,
      roleReference: analyzed.roleReference,
      nodeId: candidates[candidates.length - 1],
      candidates
    };
  }

  if (candidates.length > 1) {
    fail(
      "CHEF_ROLE_AMBIGUOUS",
      `Role reference '${roleReference}' is ambiguous (${candidates.length} candidates).`
    );
  }

  return {
    role,
    selector,
    roleReference: analyzed.roleReference,
    nodeId: candidates[0],
    candidates
  };
}
