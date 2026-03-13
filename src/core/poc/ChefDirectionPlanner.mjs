import { createHash } from "node:crypto";
import { normalizeWorkflowArtifact, validateWorkflowArtifact } from "./WorkflowArtifact.mjs";
import { planWorkflowMutation } from "./WorkflowMutationPlanner.mjs";

const SUMMARY_INTENT_PATTERN = /\b(summary|summarize|summarise)\b/i;
const CONNECT_INTENT_PATTERN = /\bconnect\b/i;
const REPLACE_INTENT_PATTERN = /\breplace\b/i;
const REMOVE_INTENT_PATTERN = /\bremove\b/i;
const ADD_HTTP_INTENT_PATTERN = /\badd\s+http\b/i;

/**
 * @returns {never}
 */
function fail(code, message) {
  const error = /** @type {Error & { code?: string }} */ (new Error(message));
  error.code = code;
  throw error;
}

function normalizeDirection(direction) {
  const normalized = String(direction ?? "").trim().replace(/\s+/g, " ");
  if (!normalized) {
    fail("CHEF_DIRECTION_REQUIRED", "Chef direction is required.");
  }
  return normalized;
}

function buildProposalId({ artifactId, direction, operationType, operation }) {
  const seed = JSON.stringify({
    artifactId,
    direction: direction.toLowerCase(),
    operationType,
    operation
  });
  const hash = createHash("sha256").update(seed).digest("hex").slice(0, 12);
  return `proposal.${hash}`;
}

function countIntentSignals(direction) {
  let count = 0;
  if (SUMMARY_INTENT_PATTERN.test(direction)) {
    count += 1;
  }
  if (CONNECT_INTENT_PATTERN.test(direction)) {
    count += 1;
  }
  if (REPLACE_INTENT_PATTERN.test(direction)) {
    count += 1;
  }
  if (REMOVE_INTENT_PATTERN.test(direction)) {
    count += 1;
  }
  if (ADD_HTTP_INTENT_PATTERN.test(direction)) {
    count += 1;
  }
  return count;
}

function extractAfterNodeId(direction) {
  const match = /\bafter\s+(trigger|[a-zA-Z0-9_-]+)\b/i.exec(direction);
  if (!match) {
    return null;
  }
  return String(match[1]);
}

function inferSummaryPrompt(direction) {
  if (/\bfor\s+the\s+operator\b/i.test(direction)) {
    return "Summarize result for the operator.";
  }
  return "Summarize result for review.";
}

/**
 * @param {{
 *   artifact: Record<string, unknown>,
 *   direction: string
 * }} input
 */
export function planChefDirection({ artifact, direction }) {
  const normalizedArtifact = normalizeWorkflowArtifact(artifact);
  validateWorkflowArtifact(normalizedArtifact);

  const cleanDirection = normalizeDirection(direction);
  const intentSignalCount = countIntentSignals(cleanDirection);
  if (intentSignalCount > 1) {
    fail(
      "CHEF_DIRECTION_AMBIGUOUS",
      "Chef direction is ambiguous; exactly one intent is required for a single operation proposal."
    );
  }

  if (!SUMMARY_INTENT_PATTERN.test(cleanDirection)) {
    fail(
      "CHEF_DIRECTION_UNSUPPORTED",
      "Unsupported direction: low confidence to map to a safe single mutation operation."
    );
  }

  const afterNodeId = extractAfterNodeId(cleanDirection);
  if (!afterNodeId) {
    fail(
      "CHEF_DIRECTION_LOW_CONFIDENCE",
      "Direction must include an explicit 'after <node-id>' target for deterministic planning."
    );
  }

  const mutationPrompt = `add openai after ${afterNodeId} model gpt-4o-mini prompt "${inferSummaryPrompt(cleanDirection)}" on success`;
  const mutationPlan = planWorkflowMutation({
    artifact: normalizedArtifact,
    prompt: mutationPrompt
  });

  return {
    proposalId: buildProposalId({
      artifactId: normalizedArtifact.artifactId,
      direction: cleanDirection,
      operationType: mutationPlan.operationType,
      operation: mutationPlan.operation
    }),
    sourceArtifactId: normalizedArtifact.artifactId,
    direction: cleanDirection,
    operationType: mutationPlan.operationType,
    operation: mutationPlan.operation,
    ambiguity: "none",
    confidence: 0.92,
    rationale: `Mapped summary direction to add_openai_after after '${afterNodeId}' on success.`,
    diagnostics: {
      plannerVersion: "0.1.0",
      mode: "bounded-summary-direction-v1",
      warnings: []
    }
  };
}
