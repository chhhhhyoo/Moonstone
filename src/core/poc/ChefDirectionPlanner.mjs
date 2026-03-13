import { createHash } from "node:crypto";
import { normalizeWorkflowArtifact, validateWorkflowArtifact } from "./WorkflowArtifact.mjs";
import { planWorkflowMutation } from "./WorkflowMutationPlanner.mjs";
import { resolveChefRoleAnchor } from "./ChefDirectionPlannerRoles.mjs";

const EVENT_VALUES = new Set(["always", "success", "failed"]);
const HTTP_METHOD_VALUES = new Set(["GET", "POST", "PUT", "DELETE", "PATCH"]);
const SUMMARY_INTENT_PATTERN = /\b(summary|summarize|summarise)\b/i;
const ROLE_REFERENCE_CAPTURE = [
  "first\\s+(?:request|http)\\s+(?:step|node)",
  "(?:latest|last)\\s+(?:request|http)\\s+(?:step|node)",
  "(?:request|http)\\s+(?:step|node)",
  "summary\\s+(?:step|node)",
  "trigger\\s+(?:step|node)"
].join("|");

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

function trimTrailingPunctuation(value) {
  return String(value).replace(/[),.;!?]+$/g, "");
}

function stripUrls(direction) {
  return String(direction).replace(/https?:\/\/[^\s"')]+/gi, " ");
}

function extractUrl(direction) {
  const match = /\b(https?:\/\/[^\s"')]+)/i.exec(direction);
  if (!match) {
    return null;
  }
  return trimTrailingPunctuation(match[1]);
}

function extractHttpMethod(direction, fallback = "GET") {
  const match = /\b(GET|POST|PUT|DELETE|PATCH)\b/i.exec(direction);
  const method = String(match?.[1] ?? fallback).toUpperCase();
  if (!HTTP_METHOD_VALUES.has(method)) {
    return fallback;
  }
  return method;
}

function extractEdgeEvent(direction, fallback = "success") {
  const match = /\bon\s+(always|success|failed)\b/i.exec(direction);
  const event = String(match?.[1] ?? fallback).toLowerCase();
  if (!EVENT_VALUES.has(event)) {
    return fallback;
  }
  return event;
}

function extractQuotedText(direction) {
  const doubleQuoted = /\bprompt\s+"([^"]+)"/i.exec(direction);
  if (doubleQuoted?.[1]) {
    return String(doubleQuoted[1]).trim();
  }
  const singleQuoted = /\bprompt\s+'([^']+)'/i.exec(direction);
  if (singleQuoted?.[1]) {
    return String(singleQuoted[1]).trim();
  }
  return null;
}

function parseConnectDirection(direction) {
  const match = /\bconnect\s+(trigger|[a-zA-Z0-9_-]+)\s+to\s+([a-zA-Z0-9_-]+)\b/i.exec(direction);
  if (!match) {
    return null;
  }
  const fromNodeId = String(match[1]);
  const toNodeId = String(match[2]);
  const event = extractEdgeEvent(direction, fromNodeId === "trigger" ? "always" : "success");
  return {
    mutationPrompt: `connect ${fromNodeId} to ${toNodeId} on ${event}`,
    confidence: 0.95,
    rationale: `Mapped connect direction to connect_nodes from '${fromNodeId}' to '${toNodeId}' on '${event}'.`
  };
}

function parseRemoveLeafDirection(direction) {
  const match = /\bremove\s+leaf\s+node\s+([a-zA-Z0-9_-]+)\b/i.exec(direction);
  if (!match) {
    return null;
  }
  const nodeId = String(match[1]);
  return {
    mutationPrompt: `remove leaf node ${nodeId}`,
    confidence: 0.96,
    rationale: `Mapped remove direction to remove_leaf_node for '${nodeId}'.`
  };
}

function parseReplaceDirection(direction) {
  const match = /\breplace\s+(?:node\s+)?([a-zA-Z0-9_-]+)\s+with\s+(http|openai)\b/i.exec(direction);
  if (!match) {
    return null;
  }

  const nodeId = String(match[1]);
  const target = String(match[2]).toLowerCase();
  if (target === "http") {
    const url = extractUrl(direction);
    if (!url) {
      fail(
        "CHEF_DIRECTION_LOW_CONFIDENCE",
        "Replace HTTP direction requires an explicit URL for deterministic planning."
      );
    }
    const method = extractHttpMethod(direction, "GET");
    return {
      mutationPrompt: `replace node ${nodeId} with http method ${method} url ${url}`,
      confidence: 0.94,
      rationale: `Mapped replace direction to replace_node_tool HTTP for '${nodeId}' (${method} ${url}).`
    };
  }

  const model = /model\s+([a-zA-Z0-9_.:-]+)/i.exec(direction)?.[1] ?? "gpt-4o-mini";
  const prompt = extractQuotedText(direction) ?? inferSummaryPrompt(direction);
  return {
    mutationPrompt: `replace node ${nodeId} with openai model ${model} prompt "${prompt}"`,
    confidence: 0.9,
    rationale: `Mapped replace direction to replace_node_tool OpenAI for '${nodeId}' (model=${model}).`
  };
}

function parseAddHttpDirection(direction) {
  const afterNodeId = extractAfterNodeId(direction);
  const url = extractUrl(direction);
  if (!afterNodeId || !url) {
    return null;
  }
  if (SUMMARY_INTENT_PATTERN.test(stripUrls(direction))) {
    return null;
  }
  if (!/\b(add|call|fetch|request|api)\b/i.test(direction)) {
    return null;
  }
  const method = extractHttpMethod(direction, "GET");
  const event = extractEdgeEvent(direction, "success");
  return {
    mutationPrompt: `add http after ${afterNodeId} method ${method} url ${url} on ${event}`,
    confidence: 0.91,
    rationale: `Mapped HTTP-step direction to add_http_after after '${afterNodeId}' (${method} ${url}) on '${event}'.`
  };
}

function parseAddOpenAISummaryDirection(direction) {
  if (!SUMMARY_INTENT_PATTERN.test(stripUrls(direction))) {
    return null;
  }
  if (!/\b(add|after)\b/i.test(stripUrls(direction))) {
    return null;
  }
  const afterNodeId = extractAfterNodeId(direction);
  if (!afterNodeId) {
    fail(
      "CHEF_DIRECTION_LOW_CONFIDENCE",
      "Direction must include an explicit 'after <node-id>' target for deterministic planning."
    );
  }
  const event = extractEdgeEvent(direction, "success");
  const model = /model\s+([a-zA-Z0-9_.:-]+)/i.exec(direction)?.[1] ?? "gpt-4o-mini";
  const prompt = inferSummaryPrompt(direction);
  return {
    mutationPrompt: `add openai after ${afterNodeId} model ${model} prompt "${prompt}" on ${event}`,
    confidence: 0.92,
    rationale: `Mapped summary direction to add_openai_after after '${afterNodeId}' on '${event}'.`
  };
}

function resolveRoleAnchorsInDirection(artifact, direction) {
  const resolvedAnchors = [];
  let rewrittenDirection = String(direction);

  const resolveReference = (matched) => {
    const resolved = resolveChefRoleAnchor({
      artifact,
      roleReference: matched
    });
    resolvedAnchors.push({
      roleReference: matched,
      role: resolved.role,
      selector: resolved.selector,
      nodeId: resolved.nodeId
    });
    return resolved.nodeId;
  };

  const afterPattern = new RegExp(`\\bafter\\s+(${ROLE_REFERENCE_CAPTURE})\\b`, "gi");
  rewrittenDirection = rewrittenDirection.replace(afterPattern, (_full, matched) => `after ${resolveReference(matched)}`);

  const connectPattern = new RegExp(`\\bconnect\\s+(${ROLE_REFERENCE_CAPTURE})\\s+to\\s+(${ROLE_REFERENCE_CAPTURE})\\b`, "gi");
  rewrittenDirection = rewrittenDirection.replace(connectPattern, (_full, fromMatched, toMatched) =>
    `connect ${resolveReference(fromMatched)} to ${resolveReference(toMatched)}`
  );

  const replacePattern = new RegExp(`\\breplace\\s+(?:node\\s+)?(${ROLE_REFERENCE_CAPTURE})\\s+with\\b`, "gi");
  rewrittenDirection = rewrittenDirection.replace(replacePattern, (_full, matched) => `replace node ${resolveReference(matched)} with`);

  const removeLeafPattern = new RegExp(`\\bremove\\s+leaf\\s+node\\s+(${ROLE_REFERENCE_CAPTURE})\\b`, "gi");
  rewrittenDirection = rewrittenDirection.replace(removeLeafPattern, (_full, matched) => `remove leaf node ${resolveReference(matched)}`);

  return {
    rewrittenDirection,
    resolvedAnchors
  };
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
  const roleResolved = resolveRoleAnchorsInDirection(normalizedArtifact, cleanDirection);
  const parsers = [
    parseConnectDirection,
    parseRemoveLeafDirection,
    parseReplaceDirection,
    parseAddHttpDirection,
    parseAddOpenAISummaryDirection
  ];
  const matches = parsers
    .map((parser) => parser(roleResolved.rewrittenDirection))
    .filter((entry) => entry !== null);

  if (matches.length > 1) {
    fail(
      "CHEF_DIRECTION_AMBIGUOUS",
      "Chef direction is ambiguous; exactly one intent is required for a single operation proposal."
    );
  }
  if (matches.length === 0) {
    fail(
      "CHEF_DIRECTION_UNSUPPORTED",
      "Unsupported direction: low confidence to map to a safe single mutation operation."
    );
  }
  const selected = matches[0];
  if (!selected) {
    fail(
      "CHEF_DIRECTION_UNSUPPORTED",
      "Unsupported direction: low confidence to map to a safe single mutation operation."
    );
  }
  const mutationPlan = planWorkflowMutation({
    artifact: normalizedArtifact,
    prompt: selected.mutationPrompt
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
    resolvedAnchors: roleResolved.resolvedAnchors,
    ambiguity: "none",
    confidence: selected.confidence,
    rationale: selected.rationale,
    diagnostics: {
      plannerVersion: "0.1.0",
      mode: "bounded-operation-direction-v1",
      warnings: []
    }
  };
}
