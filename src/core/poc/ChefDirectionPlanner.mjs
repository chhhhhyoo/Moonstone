import { createHash } from "node:crypto";
import { normalizeWorkflowArtifact, validateWorkflowArtifact } from "./WorkflowArtifact.mjs";
import { planWorkflowMutation } from "./WorkflowMutationPlanner.mjs";
import { applyWorkflowMutation } from "./WorkflowMutationApplier.mjs";
import { listChefRoleCandidates } from "./ChefDirectionPlannerRoles.mjs";

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

function tokenizeNodeId(value) {
  return String(value).match(/[0-9]+|[^0-9]+/g) ?? [];
}

function compareNodeIdsNatural(left, right) {
  const leftTokens = tokenizeNodeId(left);
  const rightTokens = tokenizeNodeId(right);
  const length = Math.max(leftTokens.length, rightTokens.length);

  for (let index = 0; index < length; index += 1) {
    const leftToken = leftTokens[index];
    const rightToken = rightTokens[index];
    if (leftToken === undefined) {
      return -1;
    }
    if (rightToken === undefined) {
      return 1;
    }

    const leftNumeric = /^[0-9]+$/.test(leftToken);
    const rightNumeric = /^[0-9]+$/.test(rightToken);
    if (leftNumeric && rightNumeric) {
      const leftNumber = Number.parseInt(leftToken, 10);
      const rightNumber = Number.parseInt(rightToken, 10);
      if (leftNumber !== rightNumber) {
        return leftNumber - rightNumber;
      }
      if (leftToken.length !== rightToken.length) {
        return leftToken.length - rightToken.length;
      }
      continue;
    }

    const compared = leftToken.localeCompare(rightToken, "en", { sensitivity: "base" });
    if (compared !== 0) {
      return compared;
    }
  }

  return 0;
}

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

function buildDirectionPackId({ artifactId, clauses, proposals }) {
  const seed = JSON.stringify({
    artifactId,
    clauses: clauses.map((entry) => entry.toLowerCase()),
    proposals: proposals.map((proposal) => ({
      operationType: proposal.operationType,
      operation: proposal.operation
    }))
  });
  const hash = createHash("sha256").update(seed).digest("hex").slice(0, 12);
  return `pack.${hash}`;
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

function extractUrls(direction) {
  const matches = String(direction).match(/https?:\/\/[^\s"')]+/gi) ?? [];
  const uniqueUrls = [];
  const seen = new Set();
  for (const rawUrl of matches) {
    const normalizedUrl = trimTrailingPunctuation(rawUrl);
    if (!seen.has(normalizedUrl)) {
      seen.add(normalizedUrl);
      uniqueUrls.push(normalizedUrl);
    }
  }
  return uniqueUrls;
}

function stripUrls(direction) {
  return String(direction).replace(/https?:\/\/[^\s"')]+/gi, " ");
}

function extractUrl(direction) {
  const urls = extractUrls(direction);
  return urls.length > 0 ? urls[0] : null;
}

function extractExplicitEvents(direction) {
  const matches = direction.matchAll(/\bon\s+(always|success|failed)\b/gi);
  const events = [];
  const seen = new Set();
  for (const match of matches) {
    const event = String(match[1]).toLowerCase();
    if (!seen.has(event)) {
      seen.add(event);
      events.push(event);
    }
  }
  return events;
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

function planSingleMutationForDirection(artifact, rewrittenDirection) {
  const parsers = [
    parseConnectDirection,
    parseRemoveLeafDirection,
    parseReplaceDirection,
    parseAddHttpDirection,
    parseAddOpenAISummaryDirection
  ];
  const matches = parsers
    .map((parser) => parser(rewrittenDirection))
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
    artifact,
    prompt: selected.mutationPrompt
  });

  return {
    mutationPlan,
    confidence: selected.confidence,
    rationale: selected.rationale
  };
}

function buildDirectionProposal({
  artifact,
  cleanDirection,
  rewrittenDirection,
  resolvedAnchors
}) {
  const planned = planSingleMutationForDirection(artifact, rewrittenDirection);
  return {
    proposalId: buildProposalId({
      artifactId: artifact.artifactId,
      direction: cleanDirection,
      operationType: planned.mutationPlan.operationType,
      operation: planned.mutationPlan.operation
    }),
    sourceArtifactId: artifact.artifactId,
    direction: cleanDirection,
    operationType: planned.mutationPlan.operationType,
    operation: planned.mutationPlan.operation,
    resolvedAnchors,
    ambiguity: "none",
    confidence: planned.confidence,
    rationale: planned.rationale,
    diagnostics: {
      plannerVersion: "0.1.0",
      mode: "bounded-operation-direction-v1",
      warnings: []
    }
  };
}

function resolveRoleAnchorsInDirection({
  artifact,
  direction,
  allowAmbiguityChoices
}) {
  const resolvedAnchors = [];
  const ambiguousReferences = [];
  let rewrittenDirection = String(direction);
  let roleTokenCounter = 0;

  const resolveReference = (matched) => {
    const analyzed = listChefRoleCandidates({
      artifact,
      roleReference: matched
    });
    const candidates = [...analyzed.candidates].sort(compareNodeIdsNatural);

    if (analyzed.selector === "first") {
      const nodeId = candidates[0];
      resolvedAnchors.push({
        roleReference: matched,
        role: analyzed.role,
        selector: analyzed.selector,
        nodeId
      });
      return nodeId;
    }

    if (analyzed.selector === "latest") {
      const nodeId = candidates[candidates.length - 1];
      resolvedAnchors.push({
        roleReference: matched,
        role: analyzed.role,
        selector: analyzed.selector,
        nodeId
      });
      return nodeId;
    }

    if (candidates.length > 1) {
      const token = `__moonstone_role_anchor_${roleTokenCounter}__`;
      roleTokenCounter += 1;
      ambiguousReferences.push({
        token,
        roleReference: matched,
        role: analyzed.role,
        selector: analyzed.selector,
        candidates
      });
      return token;
    }

    const nodeId = candidates[0];
    resolvedAnchors.push({
      roleReference: matched,
      role: analyzed.role,
      selector: analyzed.selector,
      nodeId
    });
    return nodeId;
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

  if (ambiguousReferences.length === 0) {
    return {
      status: "resolved",
      rewrittenDirection,
      resolvedAnchors
    };
  }

  if (ambiguousReferences.length > 1) {
    fail(
      "CHEF_DIRECTION_MULTI_ROLE_AMBIGUOUS",
      "Direction contains multiple ambiguous role references; add disambiguators (for example first/latest)."
    );
  }

  if (!allowAmbiguityChoices) {
    fail(
      "CHEF_ROLE_AMBIGUOUS",
      `Role reference '${ambiguousReferences[0].roleReference}' is ambiguous (${ambiguousReferences[0].candidates.length} candidates).`
    );
  }

  const ambiguous = ambiguousReferences[0];
  const candidateResolutions = ambiguous.candidates
    .map((nodeId) => ({
      nodeId,
      rewrittenDirection: rewrittenDirection.replaceAll(ambiguous.token, nodeId),
      resolvedAnchors: [
        ...resolvedAnchors,
        {
          roleReference: ambiguous.roleReference,
          role: ambiguous.role,
          selector: ambiguous.selector,
          nodeId
        }
      ]
    }))
    .sort((left, right) => compareNodeIdsNatural(left.nodeId, right.nodeId));

  return {
    status: "choice_required",
    candidateResolutions
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
  const roleResolved = resolveRoleAnchorsInDirection({
    artifact: normalizedArtifact,
    direction: cleanDirection,
    allowAmbiguityChoices: false
  });

  if (roleResolved.status !== "resolved") {
    fail(
      "CHEF_DIRECTION_INTERNAL_ERROR",
      "Unexpected planner state while resolving direction."
    );
  }

  return buildDirectionProposal({
    artifact: normalizedArtifact,
    cleanDirection,
    rewrittenDirection: roleResolved.rewrittenDirection,
    resolvedAnchors: roleResolved.resolvedAnchors
  });
}

/**
 * @param {{
 *   artifact: Record<string, unknown>,
 *   direction: string
 * }} input
 */
export function planChefDirectionWithChoices({ artifact, direction }) {
  const normalizedArtifact = normalizeWorkflowArtifact(artifact);
  validateWorkflowArtifact(normalizedArtifact);

  const cleanDirection = normalizeDirection(direction);
  const roleResolved = resolveRoleAnchorsInDirection({
    artifact: normalizedArtifact,
    direction: cleanDirection,
    allowAmbiguityChoices: true
  });

  if (roleResolved.status === "resolved") {
    return {
      status: "resolved",
      proposal: buildDirectionProposal({
        artifact: normalizedArtifact,
        cleanDirection,
        rewrittenDirection: roleResolved.rewrittenDirection,
        resolvedAnchors: roleResolved.resolvedAnchors
      })
    };
  }

  return {
    status: "choice_required",
    proposalCandidates: roleResolved.candidateResolutions.map((candidate) =>
      buildDirectionProposal({
        artifact: normalizedArtifact,
        cleanDirection,
        rewrittenDirection: candidate.rewrittenDirection,
        resolvedAnchors: candidate.resolvedAnchors
      })
    )
  };
}

function splitDirectionClauses(direction) {
  return String(direction)
    .split(/\s+\bthen\b\s+/i)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

/**
 * @param {{
 *   mode: string,
 *   synthesisApplied?: boolean,
 *   derivedClauses?: string[],
 *   intentSignals?: string[],
 *   warnings?: string[]
 * }} input
 */
function buildDirectionPackDiagnostics({
  mode,
  synthesisApplied = false,
  derivedClauses = [],
  intentSignals = [],
  warnings = []
}) {
  return {
    plannerVersion: "0.1.0",
    mode,
    synthesisApplied,
    derivedClauses: [...derivedClauses],
    intentSignals: [...intentSignals],
    warnings: [...warnings]
  };
}

function inferIntentPackClauses(direction) {
  if (/\bthen\b/i.test(direction)) {
    return null;
  }

  const urls = extractUrls(direction);
  if (urls.length > 1) {
    fail(
      "CHEF_DIRECTION_INTENT_MULTI_URL_CONFLICT",
      "Intent synthesis supports exactly one URL in a single direction."
    );
  }

  const explicitEvents = extractExplicitEvents(direction);
  if (explicitEvents.length > 1) {
    fail(
      "CHEF_DIRECTION_INTENT_EVENT_CONFLICT",
      "Intent synthesis supports at most one explicit 'on <event>' intent in a single direction."
    );
  }

  const clauses = /** @type {string[]} */ ([]);
  const intentSignals = /** @type {string[]} */ ([]);
  const warnings = /** @type {string[]} */ ([]);
  const url = urls.length > 0 ? urls[0] : null;
  if (url) {
    intentSignals.push(`http_url:${url}`);
  }

  const directionWithoutUrl = stripUrls(direction);
  const hasHttpIntent = Boolean(url) && /\b(call|fetch|check|enrich|request|api)\b/i.test(directionWithoutUrl);
  if (hasHttpIntent && url) {
    intentSignals.push("http_intent");
    const method = extractHttpMethod(direction, "GET");
    clauses.push(`After latest request step, add an API check step using ${method} ${url}.`);
  }

  const hasFailureRouteIntent = /\b(route|send)\b/i.test(direction) &&
    /\b(failure|failed)\b/i.test(direction) &&
    SUMMARY_INTENT_PATTERN.test(direction);
  if (hasFailureRouteIntent) {
    intentSignals.push("failure_route_intent");
    clauses.push("Connect latest request step to summary step on failed.");
  }

  const hasSummaryIntent = SUMMARY_INTENT_PATTERN.test(direction) || /\b(report|notify)\b/i.test(direction);
  if (hasSummaryIntent) {
    intentSignals.push("summary_intent");
  }
  if (!SUMMARY_INTENT_PATTERN.test(direction) && /\b(report|notify)\b/i.test(direction)) {
    warnings.push("SUMMARY_INTENT_INFERRED_FROM_REPORT_NOTIFY");
  }
  if (hasSummaryIntent && !hasFailureRouteIntent) {
    const event = extractEdgeEvent(direction, "success");
    const target = /\boperator\b/i.test(direction) ? "for the operator" : "for review";
    intentSignals.push(target === "for the operator" ? "target:operator" : "target:review");
    if (explicitEvents.length === 1) {
      intentSignals.push(`event:${explicitEvents[0]}`);
    }
    clauses.push(`After latest request step, add a summary step ${target} on ${event}.`);
  }

  if (clauses.length < 2) {
    return null;
  }
  return {
    clauses,
    diagnostics: buildDirectionPackDiagnostics({
      mode: "chef-intent-pack-v1",
      synthesisApplied: true,
      derivedClauses: clauses,
      intentSignals,
      warnings
    })
  };
}

function resolveDirectionPackClauses({
  cleanDirection,
  allowIntentSynthesis
}) {
  let clauses = splitDirectionClauses(cleanDirection);
  let plannerMode = "bounded-operation-direction-pack-v1";
  let diagnostics = buildDirectionPackDiagnostics({
    mode: plannerMode,
    synthesisApplied: false
  });

  if (clauses.length < 2 && allowIntentSynthesis) {
    const inferred = inferIntentPackClauses(cleanDirection);
    if (inferred && inferred.clauses.length > 1) {
      clauses = inferred.clauses;
      plannerMode = "chef-intent-pack-v1";
      diagnostics = inferred.diagnostics;
    }
  }

  return {
    clauses,
    plannerMode,
    diagnostics
  };
}

function validateDirectionPackClauses({ clauses, maxClauses }) {
  if (clauses.length < 2) {
    fail(
      "CHEF_DIRECTION_PACK_REQUIRED",
      "Direction pack mode requires at least two clauses separated by 'then'."
    );
  }
  if (clauses.length > maxClauses) {
    fail(
      "CHEF_DIRECTION_PACK_TOO_LARGE",
      `Direction pack supports at most ${maxClauses} clauses in v1.`
    );
  }
}

function buildPreviewPlanFromProposal({ artifact, proposal, clauseDirection, clauseIndex }) {
  return {
    planId: `pack-preview.${proposal.proposalId}.${clauseIndex}`,
    sourceArtifactId: artifact.artifactId,
    prompt: `direction-pack:${clauseDirection}`,
    operationType: proposal.operationType,
    operation: proposal.operation,
    diagnostics: {
      plannerVersion: proposal.diagnostics?.plannerVersion ?? "0.1.0",
      mode: "chef-direction-pack-preview",
      warnings: []
    }
  };
}

function applyPreviewProposal({
  artifact,
  proposal,
  clauseDirection,
  clauseIndex
}) {
  const previewPlan = buildPreviewPlanFromProposal({
    artifact,
    proposal,
    clauseDirection,
    clauseIndex
  });
  const previewApply = applyWorkflowMutation({
    artifact,
    plan: previewPlan
  });
  return previewApply.mutatedArtifact;
}

function buildDirectionPackProposal({
  artifactId,
  cleanDirection,
  clauses,
  proposals,
  plannerMode = "bounded-operation-direction-pack-v1",
  diagnostics = buildDirectionPackDiagnostics({
    mode: plannerMode,
    synthesisApplied: false
  })
}) {
  const confidenceValues = proposals.map((entry) => Number(entry.confidence ?? 0));
  const confidence = confidenceValues.length > 0
    ? Math.min(...confidenceValues)
    : 0;

  return {
    packId: buildDirectionPackId({
      artifactId,
      clauses,
      proposals
    }),
    sourceArtifactId: artifactId,
    direction: cleanDirection,
    clauseCount: clauses.length,
    clauses,
    proposals,
    ambiguity: "none",
    confidence,
    diagnostics
  };
}

/**
 * @param {{
 *   artifact: Record<string, unknown>,
 *   direction: string,
 *   maxClauses?: number
 * }} input
 */
export function planChefDirectionPack({ artifact, direction, maxClauses = 3 }) {
  const normalizedArtifact = normalizeWorkflowArtifact(artifact);
  validateWorkflowArtifact(normalizedArtifact);

  const cleanDirection = normalizeDirection(direction);
  const { clauses, plannerMode, diagnostics } = resolveDirectionPackClauses({
    cleanDirection,
    allowIntentSynthesis: false
  });
  validateDirectionPackClauses({ clauses, maxClauses });

  let workingArtifact = normalizedArtifact;
  const proposals = [];

  for (let index = 0; index < clauses.length; index += 1) {
    const clauseDirection = clauses[index];
    const planned = planChefDirectionWithChoices({
      artifact: workingArtifact,
      direction: clauseDirection
    });

    if (planned.status !== "resolved") {
      fail(
        "CHEF_DIRECTION_PACK_CLAUSE_AMBIGUOUS",
        `Direction pack clause ${index + 1} is ambiguous; v1 requires each clause to resolve to one proposal.`
      );
    }

    const clauseProposal = {
      ...planned.proposal,
      clauseIndex: index + 1,
      clauseDirection
    };
    proposals.push(clauseProposal);
    workingArtifact = applyPreviewProposal({
      artifact: workingArtifact,
      proposal: clauseProposal,
      clauseDirection,
      clauseIndex: index + 1
    });
  }

  return {
    status: "resolved",
    proposalPack: buildDirectionPackProposal({
      artifactId: normalizedArtifact.artifactId,
      cleanDirection,
      clauses,
      proposals,
      plannerMode,
      diagnostics
    })
  };
}

/**
 * @param {{
 *   artifact: Record<string, unknown>,
 *   direction: string,
 *   maxClauses?: number,
 *   allowIntentSynthesis?: boolean
 * }} input
 */
export function planChefDirectionPackWithChoices({
  artifact,
  direction,
  maxClauses = 3,
  allowIntentSynthesis = false
}) {
  const normalizedArtifact = normalizeWorkflowArtifact(artifact);
  validateWorkflowArtifact(normalizedArtifact);

  const cleanDirection = normalizeDirection(direction);
  const { clauses, plannerMode, diagnostics } = resolveDirectionPackClauses({
    cleanDirection,
    allowIntentSynthesis
  });
  validateDirectionPackClauses({ clauses, maxClauses });

  let prefixArtifact = normalizedArtifact;
  const prefixProposals = [];
  let ambiguousClauseIndex = -1;
  let ambiguousClauseDirection = "";
  let ambiguousClauseCandidates = [];

  for (let index = 0; index < clauses.length; index += 1) {
    const clauseDirection = clauses[index];
    const planned = planChefDirectionWithChoices({
      artifact: prefixArtifact,
      direction: clauseDirection
    });

    if (planned.status === "resolved") {
      const clauseProposal = {
        ...planned.proposal,
        clauseIndex: index + 1,
        clauseDirection
      };
      prefixProposals.push(clauseProposal);
      prefixArtifact = applyPreviewProposal({
        artifact: prefixArtifact,
        proposal: clauseProposal,
        clauseDirection,
        clauseIndex: index + 1
      });
      continue;
    }

    if (ambiguousClauseIndex >= 0) {
      fail(
        "CHEF_DIRECTION_PACK_MULTI_AMBIGUOUS",
        "Direction pack contains multiple ambiguous clauses; v1 supports exactly one ambiguous clause."
      );
    }

    ambiguousClauseIndex = index;
    ambiguousClauseDirection = clauseDirection;
    ambiguousClauseCandidates = planned.proposalCandidates.map((candidate) => ({
      ...candidate,
      clauseIndex: index + 1,
      clauseDirection
    }));
    break;
  }

  if (ambiguousClauseIndex < 0) {
    return {
      status: "resolved",
      proposalPack: buildDirectionPackProposal({
        artifactId: normalizedArtifact.artifactId,
        cleanDirection,
        clauses,
        proposals: prefixProposals,
        plannerMode,
        diagnostics
      })
    };
  }

  const proposalPackCandidates = ambiguousClauseCandidates.map((ambiguousCandidate) => {
    let workingArtifact = applyPreviewProposal({
      artifact: prefixArtifact,
      proposal: ambiguousCandidate,
      clauseDirection: ambiguousClauseDirection,
      clauseIndex: ambiguousClauseIndex + 1
    });
    const proposals = [
      ...prefixProposals,
      ambiguousCandidate
    ];

    for (let tailIndex = ambiguousClauseIndex + 1; tailIndex < clauses.length; tailIndex += 1) {
      const tailDirection = clauses[tailIndex];
      const plannedTail = planChefDirectionWithChoices({
        artifact: workingArtifact,
        direction: tailDirection
      });
      if (plannedTail.status !== "resolved") {
        fail(
          "CHEF_DIRECTION_PACK_MULTI_AMBIGUOUS",
          `Direction pack clause ${tailIndex + 1} is also ambiguous; v1 supports exactly one ambiguous clause.`
        );
      }

      const tailProposal = {
        ...plannedTail.proposal,
        clauseIndex: tailIndex + 1,
        clauseDirection: tailDirection
      };
      proposals.push(tailProposal);
      workingArtifact = applyPreviewProposal({
        artifact: workingArtifact,
        proposal: tailProposal,
        clauseDirection: tailDirection,
        clauseIndex: tailIndex + 1
      });
    }

    return buildDirectionPackProposal({
      artifactId: normalizedArtifact.artifactId,
      cleanDirection,
      clauses,
      proposals,
      plannerMode,
      diagnostics
    });
  });

  return {
    status: "choice_required",
    proposalPackCandidates
  };
}
