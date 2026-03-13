import { normalizeWorkflowArtifact, validateWorkflowArtifact } from "./WorkflowArtifact.mjs";

const EDGE_EVENTS = new Set(["always", "success", "failed"]);
const OPERATION_TYPES = new Set([
  "add_http_after",
  "add_openai_after",
  "replace_node_tool",
  "connect_nodes",
  "remove_leaf_node"
]);

/**
 * @returns {never}
 */
function fail(code, message) {
  const error = /** @type {Error & { code?: string }} */ (new Error(message));
  error.code = code;
  throw error;
}

function assertObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail("MUTATION_INVALID_INPUT", `${label} must be an object.`);
  }
}

function normalizeEvent(rawEvent, fallback = "success") {
  if (!rawEvent) {
    return fallback;
  }
  const event = String(rawEvent).toLowerCase();
  if (!EDGE_EVENTS.has(event)) {
    fail("MUTATION_EVENT_INVALID", `Unsupported edge event '${rawEvent}'.`);
  }
  return event;
}

function ensureNodeExists(artifact, nodeId, label) {
  if (nodeId === "trigger") {
    return;
  }
  const exists = artifact.nodes.some((node) => node.id === nodeId);
  if (!exists) {
    fail("MUTATION_NODE_NOT_FOUND", `${label} references unknown node '${nodeId}'.`);
  }
}

function ensurePlan(artifact, plan) {
  assertObject(plan, "WorkflowMutationPlan");
  if (plan.sourceArtifactId && plan.sourceArtifactId !== artifact.artifactId) {
    fail(
      "MUTATION_SOURCE_ARTIFACT_MISMATCH",
      `Plan sourceArtifactId '${plan.sourceArtifactId}' does not match artifactId '${artifact.artifactId}'.`
    );
  }

  const operationType = String(plan.operationType ?? "").trim();
  if (!OPERATION_TYPES.has(operationType)) {
    fail("MUTATION_OPERATION_INVALID", `Unsupported operationType '${operationType}'.`);
  }

  assertObject(plan.operation, "WorkflowMutationPlan.operation");
  return operationType;
}

function generateNodeId(nodes, prefix) {
  const pattern = new RegExp(`^${prefix}-(\\d+)$`);
  const existing = new Set(nodes.map((node) => node.id));
  let maxIndex = 0;
  for (const node of nodes) {
    const match = pattern.exec(node.id);
    if (!match) {
      continue;
    }
    const parsed = Number.parseInt(match[1], 10);
    if (Number.isInteger(parsed) && parsed > maxIndex) {
      maxIndex = parsed;
    }
  }

  let next = maxIndex + 1;
  let candidate = `${prefix}-${next}`;
  while (existing.has(candidate)) {
    next += 1;
    candidate = `${prefix}-${next}`;
  }
  return candidate;
}

function cloneAndValidateArtifact(artifact) {
  const normalized = normalizeWorkflowArtifact(artifact);
  validateWorkflowArtifact(normalized);
  return normalized;
}

function createHttpNode(nodeId, config) {
  const method = String(config.method ?? "GET").toUpperCase();
  const url = String(config.url ?? "").trim();
  if (!url) {
    fail("MUTATION_URL_REQUIRED", "HTTP mutation operation requires a URL.");
  }
  return {
    id: nodeId,
    type: "action.http",
    config: {
      method,
      url,
      headers: {
        "Content-Type": "application/json"
      },
      body: {
        prompt: "{{input.text}}"
      }
    }
  };
}

function createOpenAINode(nodeId, config) {
  const model = String(config.model ?? "gpt-4o-mini").trim();
  const prompt = String(config.prompt ?? "").trim();
  if (!prompt) {
    fail("MUTATION_OPENAI_PROMPT_REQUIRED", "OpenAI mutation operation requires a prompt.");
  }
  return {
    id: nodeId,
    type: "action.openai",
    config: {
      model,
      prompt
    }
  };
}

function edgeEvent(edge) {
  return String(edge.on ?? "always").toLowerCase();
}

function hasCycle(nodes, edges) {
  const adjacency = new Map(nodes.map((node) => [node.id, []]));
  for (const edge of edges) {
    if (edge.from === "trigger") {
      continue;
    }
    if (!adjacency.has(edge.from) || !adjacency.has(edge.to)) {
      continue;
    }
    adjacency.get(edge.from).push(edge.to);
  }

  const visiting = new Set();
  const visited = new Set();

  function visit(nodeId) {
    if (visiting.has(nodeId)) {
      return true;
    }
    if (visited.has(nodeId)) {
      return false;
    }

    visiting.add(nodeId);
    const neighbors = adjacency.get(nodeId) ?? [];
    for (const next of neighbors) {
      if (visit(next)) {
        return true;
      }
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (visit(node.id)) {
      return true;
    }
  }
  return false;
}

function rewireEdgesThroughNode(edges, afterNodeId, event, insertedNodeId) {
  const rewiredEdges = [];
  let rewiredCount = 0;

  for (const edge of edges) {
    const normalized = {
      ...edge,
      on: edgeEvent(edge)
    };

    if (normalized.from === afterNodeId && normalized.on === event) {
      rewiredEdges.push({
        ...normalized,
        from: insertedNodeId
      });
      rewiredCount += 1;
      continue;
    }

    rewiredEdges.push(normalized);
  }

  rewiredEdges.push({
    from: afterNodeId,
    to: insertedNodeId,
    on: event
  });

  return {
    edges: rewiredEdges,
    rewiredCount
  };
}

function applyAddHttpAfter(artifact, operation) {
  const afterNodeId = String(operation.afterNodeId ?? "").trim();
  ensureNodeExists(artifact, afterNodeId, "add_http_after.afterNodeId");
  const event = normalizeEvent(operation.event, "success");

  const nodeId = generateNodeId(artifact.nodes, "http");
  artifact.nodes.push(createHttpNode(nodeId, operation));

  const rewired = rewireEdgesThroughNode(artifact.edges, afterNodeId, event, nodeId);
  artifact.edges = rewired.edges;

  return {
    changeSummary: `Added HTTP node '${nodeId}' after '${afterNodeId}' on '${event}' (${rewired.rewiredCount} downstream edge(s) rewired).`,
    affectedNodeIds: [afterNodeId, nodeId]
  };
}

function applyAddOpenAIAfter(artifact, operation) {
  const afterNodeId = String(operation.afterNodeId ?? "").trim();
  ensureNodeExists(artifact, afterNodeId, "add_openai_after.afterNodeId");
  const event = normalizeEvent(operation.event, "success");

  const nodeId = generateNodeId(artifact.nodes, "openai");
  artifact.nodes.push(createOpenAINode(nodeId, operation));

  const rewired = rewireEdgesThroughNode(artifact.edges, afterNodeId, event, nodeId);
  artifact.edges = rewired.edges;

  return {
    changeSummary: `Added OpenAI node '${nodeId}' after '${afterNodeId}' on '${event}' (${rewired.rewiredCount} downstream edge(s) rewired).`,
    affectedNodeIds: [afterNodeId, nodeId]
  };
}

function applyReplaceNodeTool(artifact, operation) {
  const nodeId = String(operation.nodeId ?? "").trim();
  ensureNodeExists(artifact, nodeId, "replace_node_tool.nodeId");

  const targetType = String(operation.targetType ?? "").trim();
  if (!targetType || !["action.http", "action.openai"].includes(targetType)) {
    fail("MUTATION_TARGET_TYPE_INVALID", `replace_node_tool has unsupported targetType '${targetType}'.`);
  }

  artifact.nodes = artifact.nodes.map((node) => {
    if (node.id !== nodeId) {
      return node;
    }
    if (targetType === "action.http") {
      return {
        ...node,
        type: "action.http",
        config: createHttpNode(nodeId, operation.config ?? {}).config
      };
    }
    return {
      ...node,
      type: "action.openai",
      config: createOpenAINode(nodeId, operation.config ?? {}).config
    };
  });

  return {
    changeSummary: `Replaced node '${nodeId}' tool with '${targetType}'.`,
    affectedNodeIds: [nodeId]
  };
}

function applyConnectNodes(artifact, operation) {
  const fromNodeId = String(operation.fromNodeId ?? "").trim();
  const toNodeId = String(operation.toNodeId ?? "").trim();
  ensureNodeExists(artifact, fromNodeId, "connect_nodes.fromNodeId");
  ensureNodeExists(artifact, toNodeId, "connect_nodes.toNodeId");
  if (fromNodeId === toNodeId) {
    fail("MUTATION_SELF_CONNECT_INVALID", "connect_nodes cannot connect a node to itself.");
  }

  const event = normalizeEvent(
    operation.event,
    fromNodeId === "trigger" ? "always" : "success"
  );

  const hadCycleBefore = hasCycle(artifact.nodes, artifact.edges);
  const edgeExists = artifact.edges.some((edge) =>
    edge.from === fromNodeId &&
    edge.to === toNodeId &&
    edgeEvent(edge) === event &&
    !edge.condition
  );

  if (!edgeExists) {
    artifact.edges.push({
      from: fromNodeId,
      to: toNodeId,
      on: event
    });
  }

  const hasCycleAfter = hasCycle(artifact.nodes, artifact.edges);
  if (hasCycleAfter && !hadCycleBefore) {
    fail("MUTATION_CYCLE_INTRODUCED", "connect_nodes operation would introduce a cycle.");
  }

  return {
    changeSummary: edgeExists
      ? `Connection '${fromNodeId}' -> '${toNodeId}' on '${event}' already existed.`
      : `Connected '${fromNodeId}' -> '${toNodeId}' on '${event}'.`,
    affectedNodeIds: [fromNodeId, toNodeId]
  };
}

function applyRemoveLeafNode(artifact, operation) {
  const nodeId = String(operation.nodeId ?? "").trim();
  if (nodeId === "trigger") {
    fail("MUTATION_TRIGGER_REMOVE_INVALID", "remove_leaf_node cannot target trigger.");
  }
  ensureNodeExists(artifact, nodeId, "remove_leaf_node.nodeId");

  const outgoingCount = artifact.edges.filter((edge) => edge.from === nodeId).length;
  if (outgoingCount > 0) {
    fail("MUTATION_NON_LEAF_REMOVE_INVALID", `Node '${nodeId}' is not a leaf and has outgoing edges.`);
  }

  const removedIncoming = artifact.edges.filter((edge) => edge.to === nodeId).length;
  artifact.nodes = artifact.nodes.filter((node) => node.id !== nodeId);
  artifact.edges = artifact.edges.filter((edge) => edge.from !== nodeId && edge.to !== nodeId);

  return {
    changeSummary: `Removed leaf node '${nodeId}' and ${removedIncoming} incoming edge(s).`,
    affectedNodeIds: [nodeId]
  };
}

/**
 * @returns {{ changeSummary: string, affectedNodeIds: string[] }}
 */
function applyOperation(artifact, plan) {
  switch (plan.operationType) {
    case "add_http_after":
      return applyAddHttpAfter(artifact, plan.operation);
    case "add_openai_after":
      return applyAddOpenAIAfter(artifact, plan.operation);
    case "replace_node_tool":
      return applyReplaceNodeTool(artifact, plan.operation);
    case "connect_nodes":
      return applyConnectNodes(artifact, plan.operation);
    case "remove_leaf_node":
      return applyRemoveLeafNode(artifact, plan.operation);
    default:
      return fail("MUTATION_OPERATION_INVALID", `Unsupported operationType '${plan.operationType}'.`);
  }
}

export function applyWorkflowMutation({ artifact, plan }) {
  const sourceArtifact = cloneAndValidateArtifact(artifact);
  const operationType = ensurePlan(sourceArtifact, plan);
  const mutatedArtifact = structuredClone(sourceArtifact);

  const applyResult = applyOperation(mutatedArtifact, {
    ...plan,
    operationType
  });
  if (!applyResult) {
    fail("MUTATION_OPERATION_INVALID", `Unsupported operationType '${operationType}'.`);
  }

  mutatedArtifact.metadata = {
    ...mutatedArtifact.metadata,
    lastMutation: {
      planId: String(plan.planId ?? "unknown-plan"),
      operationType,
      prompt: String(plan.prompt ?? "")
    }
  };

  validateWorkflowArtifact(mutatedArtifact);

  return {
    ok: true,
    operationType,
    mutatedArtifact,
    changeSummary: applyResult.changeSummary,
    warnings: [],
    diagnostics: {
      affectedNodeIds: applyResult.affectedNodeIds
    }
  };
}
