import { createHash } from "node:crypto";
import { normalizeWorkflowArtifact, validateWorkflowArtifact } from "./WorkflowArtifact.mjs";

const EVENT_VALUES = new Set(["always", "success", "failed"]);
const HTTP_METHOD_VALUES = new Set(["GET", "POST", "PUT", "DELETE", "PATCH"]);

/**
 * @returns {never}
 */
function fail(code, message) {
  const error = /** @type {Error & { code?: string }} */ (new Error(message));
  error.code = code;
  throw error;
}

function normalizePrompt(prompt) {
  const cleanPrompt = String(prompt ?? "").trim();
  if (!cleanPrompt) {
    fail("MUTATION_PROMPT_REQUIRED", "Mutation prompt is required.");
  }
  return cleanPrompt;
}

function normalizeEvent(rawEvent, fallback = "success") {
  if (!rawEvent) {
    return fallback;
  }
  const value = String(rawEvent).toLowerCase();
  if (!EVENT_VALUES.has(value)) {
    fail("MUTATION_EVENT_INVALID", `Unsupported edge event '${rawEvent}'.`);
  }
  return value;
}

function normalizeHttpMethod(rawMethod, fallback = "GET") {
  if (!rawMethod) {
    return fallback;
  }
  const value = String(rawMethod).toUpperCase();
  if (!HTTP_METHOD_VALUES.has(value)) {
    fail("MUTATION_HTTP_METHOD_INVALID", `Unsupported HTTP method '${rawMethod}'.`);
  }
  return value;
}

function normalizeNodeId(rawNodeId, label) {
  const nodeId = String(rawNodeId ?? "").trim();
  if (!nodeId) {
    fail("MUTATION_NODE_ID_REQUIRED", `${label} is required.`);
  }
  return nodeId;
}

function buildArtifactLookup(artifact) {
  const nodeIds = new Set(artifact.nodes.map((node) => node.id));
  return {
    hasNode(nodeId) {
      return nodeIds.has(nodeId);
    }
  };
}

function assertNodeExists(lookup, nodeId, label) {
  if (nodeId === "trigger") {
    return;
  }
  if (!lookup.hasNode(nodeId)) {
    fail("MUTATION_NODE_NOT_FOUND", `${label} references unknown node '${nodeId}'.`);
  }
}

function extractHint(source, pattern) {
  const match = pattern.exec(source);
  if (!match) {
    return null;
  }
  return match[1];
}

function extractPromptText(cleanPrompt) {
  const doubleQuoted = extractHint(cleanPrompt, /\bprompt\s+"([^"]+)"/i);
  if (doubleQuoted) {
    return doubleQuoted.trim();
  }
  const singleQuoted = extractHint(cleanPrompt, /\bprompt\s+'([^']+)'/i);
  if (singleQuoted) {
    return singleQuoted.trim();
  }
  const bare = extractHint(cleanPrompt, /\bprompt\s+(.+?)(?:\s+on\s+(?:always|success|failed)\b|$)/i);
  return bare ? bare.trim() : null;
}

function sanitizeForOperationScan(input) {
  return input.replace(/"[^"]*"|'[^']*'/g, " ");
}

function countOperationVerbs(cleanPrompt) {
  const sanitized = sanitizeForOperationScan(cleanPrompt);
  const matches = sanitized.match(/\b(add|replace|connect|remove)\b/gi);
  return matches ? matches.length : 0;
}

function parseAddHttp(cleanPrompt, lookup) {
  const match = /^add\s+http\s+after\s+([a-zA-Z0-9_-]+)\b/i.exec(cleanPrompt);
  if (!match) {
    return null;
  }

  const afterNodeId = normalizeNodeId(match[1], "afterNodeId");
  assertNodeExists(lookup, afterNodeId, "add_http_after.afterNodeId");

  const method = normalizeHttpMethod(extractHint(cleanPrompt, /\bmethod\s+(GET|POST|PUT|DELETE|PATCH)\b/i));
  const url = extractHint(cleanPrompt, /\burl\s+(https?:\/\/[^\s"']+)/i);
  if (!url) {
    fail("MUTATION_URL_REQUIRED", "add_http_after requires a URL hint (url <https://...>).");
  }
  const event = normalizeEvent(extractHint(cleanPrompt, /\bon\s+(always|success|failed)\b/i), "success");

  return {
    operationType: "add_http_after",
    operation: {
      afterNodeId,
      event,
      method,
      url
    }
  };
}

function parseAddOpenAI(cleanPrompt, lookup) {
  const match = /^add\s+openai\s+after\s+([a-zA-Z0-9_-]+)\b/i.exec(cleanPrompt);
  if (!match) {
    return null;
  }

  const afterNodeId = normalizeNodeId(match[1], "afterNodeId");
  assertNodeExists(lookup, afterNodeId, "add_openai_after.afterNodeId");

  const model = extractHint(cleanPrompt, /\bmodel\s+([a-zA-Z0-9_.:-]+)\b/i) ?? "gpt-4o-mini";
  const prompt = extractPromptText(cleanPrompt);
  if (!prompt) {
    fail("MUTATION_OPENAI_PROMPT_REQUIRED", "add_openai_after requires a prompt hint.");
  }
  const event = normalizeEvent(extractHint(cleanPrompt, /\bon\s+(always|success|failed)\b/i), "success");

  return {
    operationType: "add_openai_after",
    operation: {
      afterNodeId,
      event,
      model,
      prompt
    }
  };
}

function parseReplaceNodeTool(cleanPrompt, lookup) {
  const match = /^replace\s+node\s+([a-zA-Z0-9_-]+)\s+with\s+(http|openai)\b/i.exec(cleanPrompt);
  if (!match) {
    return null;
  }

  const nodeId = normalizeNodeId(match[1], "nodeId");
  assertNodeExists(lookup, nodeId, "replace_node_tool.nodeId");

  const target = String(match[2]).toLowerCase();
  if (target === "http") {
    const method = normalizeHttpMethod(extractHint(cleanPrompt, /\bmethod\s+(GET|POST|PUT|DELETE|PATCH)\b/i));
    const url = extractHint(cleanPrompt, /\burl\s+(https?:\/\/[^\s"']+)/i);
    if (!url) {
      fail("MUTATION_URL_REQUIRED", "replace_node_tool(http) requires a URL hint.");
    }
    return {
      operationType: "replace_node_tool",
      operation: {
        nodeId,
        targetType: "action.http",
        config: {
          method,
          url
        }
      }
    };
  }

  const model = extractHint(cleanPrompt, /\bmodel\s+([a-zA-Z0-9_.:-]+)\b/i) ?? "gpt-4o-mini";
  const prompt = extractPromptText(cleanPrompt);
  if (!prompt) {
    fail("MUTATION_OPENAI_PROMPT_REQUIRED", "replace_node_tool(openai) requires a prompt hint.");
  }
  return {
    operationType: "replace_node_tool",
    operation: {
      nodeId,
      targetType: "action.openai",
      config: {
        model,
        prompt
      }
    }
  };
}

function parseConnectNodes(cleanPrompt, lookup) {
  const match = /^connect\s+(trigger|[a-zA-Z0-9_-]+)\s+to\s+([a-zA-Z0-9_-]+)\b/i.exec(cleanPrompt);
  if (!match) {
    return null;
  }

  const fromNodeId = normalizeNodeId(match[1], "fromNodeId");
  const toNodeId = normalizeNodeId(match[2], "toNodeId");
  assertNodeExists(lookup, fromNodeId, "connect_nodes.fromNodeId");
  assertNodeExists(lookup, toNodeId, "connect_nodes.toNodeId");
  if (fromNodeId === toNodeId) {
    fail("MUTATION_SELF_CONNECT_INVALID", "connect_nodes cannot connect a node to itself.");
  }

  const defaultEvent = fromNodeId === "trigger" ? "always" : "success";
  const event = normalizeEvent(extractHint(cleanPrompt, /\bon\s+(always|success|failed)\b/i), defaultEvent);

  return {
    operationType: "connect_nodes",
    operation: {
      fromNodeId,
      toNodeId,
      event
    }
  };
}

function parseRemoveLeaf(cleanPrompt, lookup) {
  const match = /^remove\s+leaf\s+node\s+([a-zA-Z0-9_-]+)\s*$/i.exec(cleanPrompt);
  if (!match) {
    return null;
  }

  const nodeId = normalizeNodeId(match[1], "nodeId");
  assertNodeExists(lookup, nodeId, "remove_leaf_node.nodeId");
  if (nodeId === "trigger") {
    fail("MUTATION_TRIGGER_REMOVE_INVALID", "remove_leaf_node cannot target trigger.");
  }

  return {
    operationType: "remove_leaf_node",
    operation: {
      nodeId
    }
  };
}

function buildPlanId({ artifactId, prompt }) {
  const normalized = `${artifactId}|${prompt.toLowerCase().replace(/\s+/g, " ").trim()}`;
  const hash = createHash("sha256").update(normalized).digest("hex").slice(0, 12);
  return `mutation.${hash}`;
}

export function planWorkflowMutation({ artifact, prompt }) {
  const normalizedArtifact = normalizeWorkflowArtifact(artifact);
  validateWorkflowArtifact(normalizedArtifact);

  const cleanPrompt = normalizePrompt(prompt);
  if (countOperationVerbs(cleanPrompt) > 1) {
    fail("MUTATION_PROMPT_AMBIGUOUS", "Mutation prompt must describe exactly one single operation.");
  }

  const lookup = buildArtifactLookup(normalizedArtifact);
  const parsers = [
    parseAddHttp,
    parseAddOpenAI,
    parseReplaceNodeTool,
    parseConnectNodes,
    parseRemoveLeaf
  ];

  const matches = /** @type {Array<{ operationType: string, operation: Record<string, unknown> }>} */ (
    parsers
      .map((parser) => parser(cleanPrompt, lookup))
      .filter((entry) => entry !== null)
  );

  if (matches.length === 0) {
    fail("MUTATION_OPERATION_UNSUPPORTED", "Unsupported mutation prompt operation.");
  }
  if (matches.length > 1) {
    fail("MUTATION_PROMPT_AMBIGUOUS", "Mutation prompt is ambiguous; exactly one operation is required.");
  }

  const match = matches[0];
  if (!match) {
    fail("MUTATION_OPERATION_UNSUPPORTED", "Unsupported mutation prompt operation.");
  }

  return {
    planId: buildPlanId({
      artifactId: normalizedArtifact.artifactId,
      prompt: cleanPrompt
    }),
    sourceArtifactId: normalizedArtifact.artifactId,
    prompt: cleanPrompt,
    operationType: match.operationType,
    operation: match.operation,
    diagnostics: {
      parserVersion: "0.1.0",
      mode: "hybrid-strict-hints",
      warnings: []
    }
  };
}
