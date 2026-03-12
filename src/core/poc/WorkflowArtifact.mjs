const SUPPORTED_TRIGGER_TYPES = new Set(["trigger.webhook"]);
const SUPPORTED_NODE_TYPES = new Set(["action.http", "action.openai"]);
const SUPPORTED_EDGE_EVENTS = new Set(["always", "success", "failed"]);
const SUPPORTED_OPERATORS = new Set([
  "eq",
  "ne",
  "gt",
  "gte",
  "lt",
  "lte",
  "contains",
  "exists"
]);

function assertObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
}

function assertNonEmptyString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} must be a non-empty string.`);
  }
}

function getByPath(scope, path) {
  if (typeof path !== "string" || path.trim() === "") {
    return undefined;
  }

  return path.split(".").reduce((acc, part) => {
    if (acc === null || acc === undefined) {
      return undefined;
    }
    if (typeof acc !== "object") {
      return undefined;
    }
    return acc[part];
  }, scope);
}

function validateCondition(condition, label) {
  assertObject(condition, label);
  assertNonEmptyString(condition.path, `${label}.path`);
  assertNonEmptyString(condition.op, `${label}.op`);
  if (!SUPPORTED_OPERATORS.has(condition.op)) {
    throw new Error(`${label}.op uses unsupported comparator: ${condition.op}`);
  }

  if (condition.op !== "exists" && !("value" in condition)) {
    throw new Error(`${label}.value is required for comparator '${condition.op}'.`);
  }
}

function validateTrigger(trigger) {
  assertObject(trigger, "WorkflowArtifact.trigger");
  assertNonEmptyString(trigger.type, "WorkflowArtifact.trigger.type");
  if (!SUPPORTED_TRIGGER_TYPES.has(trigger.type)) {
    throw new Error(`Unsupported trigger type: ${trigger.type}`);
  }
  assertNonEmptyString(trigger.path, "WorkflowArtifact.trigger.path");
  assertNonEmptyString(trigger.method, "WorkflowArtifact.trigger.method");
}

function validateNode(node, index, ids) {
  assertObject(node, `WorkflowArtifact.nodes[${index}]`);
  assertNonEmptyString(node.id, `WorkflowArtifact.nodes[${index}].id`);
  if (ids.has(node.id)) {
    throw new Error(`Duplicate node id: ${node.id}`);
  }
  ids.add(node.id);

  assertNonEmptyString(node.type, `WorkflowArtifact.nodes[${index}].type`);
  if (!SUPPORTED_NODE_TYPES.has(node.type)) {
    throw new Error(`Unsupported node type: ${node.type}`);
  }

  assertObject(node.config, `WorkflowArtifact.nodes[${index}].config`);
}

function validateEdge(edge, index, validNodeIds) {
  assertObject(edge, `WorkflowArtifact.edges[${index}]`);
  assertNonEmptyString(edge.from, `WorkflowArtifact.edges[${index}].from`);
  assertNonEmptyString(edge.to, `WorkflowArtifact.edges[${index}].to`);

  if (edge.from !== "trigger" && !validNodeIds.has(edge.from)) {
    throw new Error(`WorkflowArtifact.edges[${index}].from references unknown node: ${edge.from}`);
  }
  if (!validNodeIds.has(edge.to)) {
    throw new Error(`WorkflowArtifact.edges[${index}].to references unknown node: ${edge.to}`);
  }

  const eventType = edge.on ?? "always";
  if (!SUPPORTED_EDGE_EVENTS.has(eventType)) {
    throw new Error(`WorkflowArtifact.edges[${index}].on is invalid: ${eventType}`);
  }

  if (edge.condition) {
    validateCondition(edge.condition, `WorkflowArtifact.edges[${index}].condition`);
  }
}

function validateRetryConfig(retry, label) {
  assertObject(retry, label);
  if (!Number.isInteger(retry.maxAttempts) || retry.maxAttempts < 1) {
    throw new Error(`${label}.maxAttempts must be an integer >= 1.`);
  }
  if (!Number.isInteger(retry.backoffMs) || retry.backoffMs < 0) {
    throw new Error(`${label}.backoffMs must be an integer >= 0.`);
  }

  const maxBackoffMs = retry.maxBackoffMs ?? retry.backoffMs;
  if (!Number.isInteger(maxBackoffMs) || maxBackoffMs < 0) {
    throw new Error(`${label}.maxBackoffMs must be an integer >= 0.`);
  }
}

export function normalizeWorkflowArtifact(artifactInput) {
  const artifact = structuredClone(artifactInput ?? {});

  artifact.defaults = artifact.defaults ?? {};
  const retry = artifact.defaults.retry ?? {};
  artifact.defaults.retry = {
    maxAttempts: Number.isInteger(retry.maxAttempts) ? retry.maxAttempts : 1,
    backoffMs: Number.isInteger(retry.backoffMs) ? retry.backoffMs : 0,
    maxBackoffMs: Number.isInteger(retry.maxBackoffMs)
      ? retry.maxBackoffMs
      : (Number.isInteger(retry.backoffMs) ? retry.backoffMs : 0)
  };

  artifact.metadata = artifact.metadata ?? {};

  for (const edge of artifact.edges ?? []) {
    edge.on = edge.on ?? "always";
  }

  return artifact;
}

export function validateWorkflowArtifact(artifact) {
  assertObject(artifact, "WorkflowArtifact");
  assertNonEmptyString(artifact.artifactId, "WorkflowArtifact.artifactId");
  assertNonEmptyString(artifact.artifactVersion, "WorkflowArtifact.artifactVersion");

  validateTrigger(artifact.trigger);

  if (!Array.isArray(artifact.nodes) || artifact.nodes.length === 0) {
    throw new Error("WorkflowArtifact.nodes must be a non-empty array.");
  }

  if (!Array.isArray(artifact.edges) || artifact.edges.length === 0) {
    throw new Error("WorkflowArtifact.edges must be a non-empty array.");
  }

  const ids = new Set();
  artifact.nodes.forEach((node, index) => validateNode(node, index, ids));
  artifact.edges.forEach((edge, index) => validateEdge(edge, index, ids));

  if (artifact.defaults?.retry) {
    validateRetryConfig(artifact.defaults.retry, "WorkflowArtifact.defaults.retry");
  }

  for (const node of artifact.nodes) {
    if (node.retry) {
      validateRetryConfig(node.retry, `WorkflowArtifact.nodes.${node.id}.retry`);
    }
  }

  assertObject(artifact.metadata ?? {}, "WorkflowArtifact.metadata");
  return artifact;
}

export function getOutgoingEdges(artifact, fromNodeId, outcome, scope) {
  const edges = artifact.edges.filter((edge) => {
    if (edge.from !== fromNodeId) {
      return false;
    }

    if (edge.on && edge.on !== "always" && edge.on !== outcome) {
      return false;
    }

    if (!edge.condition) {
      return true;
    }

    return evaluateCondition(edge.condition, scope);
  });

  return edges;
}

export function evaluateCondition(condition, scope) {
  validateCondition(condition, "Condition");
  const current = getByPath(scope, condition.path);

  switch (condition.op) {
    case "eq":
      return current === condition.value;
    case "ne":
      return current !== condition.value;
    case "gt":
      return Number(current) > Number(condition.value);
    case "gte":
      return Number(current) >= Number(condition.value);
    case "lt":
      return Number(current) < Number(condition.value);
    case "lte":
      return Number(current) <= Number(condition.value);
    case "contains": {
      if (typeof current === "string") {
        return current.includes(String(condition.value));
      }
      if (Array.isArray(current)) {
        return current.includes(condition.value);
      }
      return false;
    }
    case "exists":
      return (current !== undefined && current !== null) === Boolean(condition.value);
    default:
      return false;
  }
}

export function renderTemplate(template, scope) {
  if (typeof template !== "string") {
    return template;
  }

  return template.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_match, rawPath) => {
    const resolved = getByPath(scope, String(rawPath).trim());
    return resolved === undefined || resolved === null ? "" : String(resolved);
  });
}

export const WorkflowArtifactCapabilities = Object.freeze({
  triggerTypes: [...SUPPORTED_TRIGGER_TYPES],
  nodeTypes: [...SUPPORTED_NODE_TYPES],
  edgeEvents: [...SUPPORTED_EDGE_EVENTS],
  comparators: [...SUPPORTED_OPERATORS]
});
