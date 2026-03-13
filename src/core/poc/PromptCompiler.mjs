import { normalizeWorkflowArtifact, validateWorkflowArtifact } from "./WorkflowArtifact.mjs";

/**
 * @typedef {{
 *   id: string,
 *   type: "action.http" | "action.openai",
 *   config: Record<string, unknown>,
 *   retry?: {
 *     maxAttempts: number,
 *     backoffMs: number,
 *     maxBackoffMs: number
 *   }
 * }} WorkflowNodeDraft
 */

/**
 * @typedef {{
 *   from: string,
 *   to: string,
 *   on?: "always" | "success" | "failed",
 *   condition?: {
 *     path: string,
 *     op: string,
 *     value?: unknown
 *   }
 * }} WorkflowEdgeDraft
 */

/**
 * @typedef {"eq" | "ne" | "gt" | "gte" | "lt" | "lte"} ComparatorOp
 */

/**
 * @typedef {{
 *   path: string,
 *   op: ComparatorOp,
 *   value: string | number | boolean
 * }} InferredComparatorCondition
 */

/**
 * @typedef {"exists" | "comparator" | "default"} BranchMode
 */

/**
 * @typedef {{
 *   toolId: string,
 *   nodeId: string,
 *   connectorType: "action.http" | "action.openai",
 *   name: string,
 *   configSummary: string
 * }} GeneratedToolBlueprint
 */

/**
 * @typedef {{
 *   method: string,
 *   url: string
 * }} InferredHttpCall
 */

/**
 * @typedef {{
 *   version: string,
  *   prompt: string,
  *   branchMode: BranchMode,
  *   inferred: {
 *     httpMethod: string,
 *     httpUrl: string,
 *     httpCallCount: number,
 *     hasFailureBranch: boolean,
 *     inputExistsPath: string | null,
 *     inputComparisonCondition: InferredComparatorCondition | null
 *   },
 *   warnings: string[],
 *   generatedNodeIds: string[],
 *   generatedTools: GeneratedToolBlueprint[]
 * }} CompileDiagnostics
 */

function slugify(input) {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "workflow-poc";
}

function inferHttpMethod(prompt) {
  const normalized = prompt.toLowerCase();
  if (normalized.includes("post")) {
    return "POST";
  }
  if (normalized.includes("put")) {
    return "PUT";
  }
  if (normalized.includes("delete")) {
    return "DELETE";
  }
  return "GET";
}

function trimTrailingPunctuation(url) {
  return String(url).replace(/[),.;!?]+$/g, "");
}

/**
 * @param {string} prompt
 * @param {string} fallbackMethod
 * @returns {InferredHttpCall[]}
 */
function inferHttpCalls(prompt, fallbackMethod) {
  /** @type {InferredHttpCall[]} */
  const calls = [];
  const pattern = /\b(?:(GET|POST|PUT|DELETE|PATCH)\s+)?(https?:\/\/[^\s"')`]+)/gi;
  let match = pattern.exec(prompt);
  while (match) {
    const explicitMethod = String(match[1] ?? "").toUpperCase();
    calls.push({
      method: explicitMethod || fallbackMethod,
      url: trimTrailingPunctuation(match[2])
    });
    match = pattern.exec(prompt);
  }
  return calls;
}

function inferFailureBranch(prompt) {
  return /(?:on\s+failure|if\s+.*fails|when\s+.*fails|fallback|error\s+branch)/i.test(prompt);
}

function inferInputExistsPath(prompt) {
  const match = /(?:if|when)\s+input\.([a-zA-Z0-9_.-]+)\s+exists/i.exec(prompt);
  if (!match) {
    return null;
  }
  return `input.${match[1]}`;
}

function parseLiteralToken(rawValue) {
  const value = String(rawValue ?? "").trim();

  if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }

  if (/^(?:true|false)$/i.test(value)) {
    return value.toLowerCase() === "true";
  }

  if (/^-?\d+(?:\.\d+)?$/.test(value)) {
    return Number(value);
  }

  return value;
}

function invertComparator(op) {
  switch (op) {
    case "eq":
      return "ne";
    case "ne":
      return "eq";
    case "gt":
      return "lte";
    case "gte":
      return "lt";
    case "lt":
      return "gte";
    case "lte":
      return "gt";
    default:
      return null;
  }
}

/**
 * @param {string} prompt
 * @returns {InferredComparatorCondition | null}
 */
function inferInputComparisonCondition(prompt) {
  const symbolicMatch = /(?:if|when)\s+input\.([a-zA-Z0-9_.-]+)\s*(==|!=|>=|<=|>|<)\s*("[^"]+"|'[^']+'|[^\s,.;]+)/i.exec(prompt);
  if (symbolicMatch) {
    const [, rawPath, rawOperator, rawValue] = symbolicMatch;
    /** @type {Record<string, ComparatorOp>} */
    const operatorMap = {
      "==": "eq",
      "!=": "ne",
      ">": "gt",
      ">=": "gte",
      "<": "lt",
      "<=": "lte"
    };
    const mapped = operatorMap[rawOperator];
    if (!mapped) {
      return null;
    }
    return {
      path: `input.${rawPath}`,
      op: mapped,
      value: parseLiteralToken(rawValue)
    };
  }

  const verbalMatch = /(?:if|when)\s+input\.([a-zA-Z0-9_.-]+)\s+(is\s+not|not\s+equals?|equals?|is|greater\s+than\s+or\s+equal\s+to|greater\s+than|less\s+than\s+or\s+equal\s+to|less\s+than)\s+("[^"]+"|'[^']+'|[^\s,.;]+)/i.exec(prompt);
  if (!verbalMatch) {
    return null;
  }

  const [, rawPath, rawOperator, rawValue] = verbalMatch;
  const normalizedOperator = rawOperator.toLowerCase().replace(/\s+/g, " ").trim();

  /** @type {Record<string, ComparatorOp>} */
  const operatorMap = {
    "is": "eq",
    "equals": "eq",
    "equal": "eq",
    "not equal": "ne",
    "not equals": "ne",
    "is not": "ne",
    "greater than": "gt",
    "greater than or equal to": "gte",
    "less than": "lt",
    "less than or equal to": "lte"
  };
  const mapped = operatorMap[normalizedOperator];
  if (!mapped) {
    return null;
  }

  return {
    path: `input.${rawPath}`,
    op: mapped,
    value: parseLiteralToken(rawValue)
  };
}

function inferBranchMode({ inputExistsPath, inputComparisonCondition }) {
  if (inputExistsPath) {
    return "exists";
  }
  if (inputComparisonCondition) {
    return "comparator";
  }
  return "default";
}

function hasConditionalIntent(prompt) {
  return /\b(?:if|when|otherwise|else)\b/i.test(prompt);
}

/**
 * @param {{
 *   cleanPrompt: string,
 *   httpMethod: string,
 *   httpUrl: string,
 *   httpCallCount: number,
 *   hasFailureBranch: boolean,
 *   inputExistsPath: string | null,
 *   inputComparisonCondition: InferredComparatorCondition | null,
 *   branchMode: BranchMode,
 *   generatedNodeIds: string[],
 *   generatedTools: GeneratedToolBlueprint[]
 * }} params
 * @returns {CompileDiagnostics}
 */
function buildCompileDiagnostics({
  cleanPrompt,
  httpMethod,
  httpUrl,
  httpCallCount,
  hasFailureBranch,
  inputExistsPath,
  inputComparisonCondition,
  branchMode,
  generatedNodeIds,
  generatedTools
}) {
  /** @type {string[]} */
  const warnings = [];

  if (hasConditionalIntent(cleanPrompt) && branchMode === "default") {
    warnings.push("Conditional intent detected but no supported condition pattern matched; emitted default success branch.");
  }

  if (inputExistsPath && inputComparisonCondition) {
    warnings.push("Both exists and comparator condition patterns were detected; exists-pattern routing took precedence.");
  }

  return {
    version: "0.1.0",
    prompt: cleanPrompt,
    branchMode,
    inferred: {
      httpMethod,
      httpUrl,
      httpCallCount,
      hasFailureBranch,
      inputExistsPath,
      inputComparisonCondition
    },
    warnings,
    generatedNodeIds,
    generatedTools
  };
}

/**
 * @param {Array<{ id: string, type: "action.http" | "action.openai", config: Record<string, unknown> }>} nodes
 * @returns {GeneratedToolBlueprint[]}
 */
function buildGeneratedTools(nodes) {
  return nodes.map((node) => {
    const normalizedNodeId = node.id.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (node.type === "action.http") {
      const method = String(node.config.method ?? "GET").toUpperCase();
      const url = String(node.config.url ?? "");
      return {
        toolId: `tool.${normalizedNodeId}`,
        nodeId: node.id,
        connectorType: "action.http",
        name: `HTTP ${node.id}`,
        configSummary: `${method} ${url}`.trim()
      };
    }

    const model = String(node.config.model ?? "");
    return {
      toolId: `tool.${normalizedNodeId}`,
      nodeId: node.id,
      connectorType: "action.openai",
      name: `OpenAI ${node.id}`,
      configSummary: model ? `model=${model}` : "model=unknown"
    };
  });
}

export function compilePrompt({
  prompt,
  httpUrl,
  openaiModel = "gpt-4o-mini",
  now = () => new Date()
}) {
  const cleanPrompt = String(prompt ?? "").trim();
  if (!cleanPrompt) {
    throw new Error("Prompt is required for POC compilation.");
  }

  const slug = slugify(cleanPrompt.split(" ").slice(0, 8).join(" "));
  const inferredDefaultHttpMethod = inferHttpMethod(cleanPrompt);
  const inferredHttpCalls = inferHttpCalls(cleanPrompt, inferredDefaultHttpMethod);
  /** @type {InferredHttpCall[]} */
  const resolvedHttpCalls = inferredHttpCalls.length > 0
    ? inferredHttpCalls.map((call, index) => (
      index === 0 && httpUrl
        ? {
          method: call.method,
          url: String(httpUrl)
        }
        : call
    ))
    : [
      {
        method: inferredDefaultHttpMethod,
        url: String(httpUrl ?? "https://example.com/api")
      }
    ];
  const primaryHttpCall = resolvedHttpCalls[0];

  const terminalHttpNodeId = `http-${resolvedHttpCalls.length}`;
  const upstreamResultReference = `{{nodeResults.${terminalHttpNodeId}.result.body}}`;

  const hasFailureBranch = inferFailureBranch(cleanPrompt);
  const inputExistsPath = inferInputExistsPath(cleanPrompt);
  const inputComparisonCondition = inferInputComparisonCondition(cleanPrompt);
  const branchMode = inferBranchMode({ inputExistsPath, inputComparisonCondition });

  /** @type {WorkflowNodeDraft[]} */
  const nodes = resolvedHttpCalls.map((call, index) => {
    const previousNodeId = index > 0 ? `http-${index}` : null;
    const body = previousNodeId
      ? {
        prompt: "{{input.text}}",
        upstreamStatus: `{{nodeResults.${previousNodeId}.result.status}}`,
        upstreamSource: `{{nodeResults.${previousNodeId}.result.body.source}}`,
        upstreamNodeId: previousNodeId
      }
      : {
        prompt: "{{input.text}}"
      };

    return {
      id: `http-${index + 1}`,
      type: "action.http",
      config: {
        url: call.url,
        method: call.method,
        headers: {
          "Content-Type": "application/json"
        },
        body
      },
      retry: {
        maxAttempts: 2,
        backoffMs: 200,
        maxBackoffMs: 1_000
      }
    };
  });

  /** @type {WorkflowEdgeDraft[]} */
  const edges = /** @type {WorkflowEdgeDraft[]} */ ([
    {
      from: "trigger",
      to: "http-1",
      on: "always"
    }
  ]);

  for (let index = 1; index < resolvedHttpCalls.length; index += 1) {
    edges.push({
      from: `http-${index}`,
      to: `http-${index + 1}`,
      on: "success"
    });
  }

  if (inputExistsPath) {
    nodes.push(
      {
        id: "openai-present-1",
        type: "action.openai",
        config: {
          model: openaiModel,
          prompt: `Input field '${inputExistsPath}' is present. Summarize workflow result: ${cleanPrompt} | upstream=${upstreamResultReference}`
        }
      },
      {
        id: "openai-missing-1",
        type: "action.openai",
        config: {
          model: openaiModel,
          prompt: `Input field '${inputExistsPath}' is missing. Summarize default workflow result: ${cleanPrompt} | upstream=${upstreamResultReference}`
        }
      }
    );

    edges.push(
      {
        from: terminalHttpNodeId,
        to: "openai-present-1",
        on: "success",
        condition: {
          path: inputExistsPath,
          op: "exists",
          value: true
        }
      },
      {
        from: terminalHttpNodeId,
        to: "openai-missing-1",
        on: "success",
        condition: {
          path: inputExistsPath,
          op: "exists",
          value: false
        }
      }
    );
  } else if (inputComparisonCondition) {
    const inverseComparator = invertComparator(inputComparisonCondition.op);
    if (inverseComparator) {
      nodes.push(
        {
          id: "openai-condition-true-1",
          type: "action.openai",
          config: {
            model: openaiModel,
            prompt: `Condition '${inputComparisonCondition.path} ${inputComparisonCondition.op} ${inputComparisonCondition.value}' matched. Summarize workflow result: ${cleanPrompt} | upstream=${upstreamResultReference}`
          }
        },
        {
          id: "openai-condition-false-1",
          type: "action.openai",
          config: {
            model: openaiModel,
            prompt: `Condition '${inputComparisonCondition.path} ${inputComparisonCondition.op} ${inputComparisonCondition.value}' did not match. Summarize fallback workflow result: ${cleanPrompt} | upstream=${upstreamResultReference}`
          }
        }
      );

      edges.push(
        {
          from: terminalHttpNodeId,
          to: "openai-condition-true-1",
          on: "success",
          condition: {
            path: inputComparisonCondition.path,
            op: inputComparisonCondition.op,
            value: inputComparisonCondition.value
          }
        },
        {
          from: terminalHttpNodeId,
          to: "openai-condition-false-1",
          on: "success",
          condition: {
            path: inputComparisonCondition.path,
            op: inverseComparator,
            value: inputComparisonCondition.value
          }
        }
      );
    }
  } else {
    nodes.push({
      id: "openai-success-1",
      type: "action.openai",
      config: {
        model: openaiModel,
        prompt: `Summarize this workflow result for the user: ${cleanPrompt} | upstream=${upstreamResultReference}`
      }
    });
    edges.push({
      from: terminalHttpNodeId,
      to: "openai-success-1",
      on: "success"
    });
  }

  if (hasFailureBranch) {
    nodes.push({
      id: "openai-failure-1",
      type: "action.openai",
      config: {
        model: openaiModel,
        prompt: `The upstream HTTP step failed. Summarize failure context for the user: ${cleanPrompt} | error={{lastReceipt.error}}`
      }
    });
    for (let index = 0; index < resolvedHttpCalls.length; index += 1) {
      edges.push({
        from: `http-${index + 1}`,
        to: "openai-failure-1",
        on: "failed"
      });
    }
  }

  const artifactDraft = {
    artifactId: `workflow.${slug}`,
    artifactVersion: "0.1.0",
    trigger: {
      type: "trigger.webhook",
      path: `/hooks/${slug}`,
      method: "POST"
    },
    nodes,
    edges,
    defaults: {
      retry: {
        maxAttempts: 1,
        backoffMs: 100,
        maxBackoffMs: 400
      }
    },
    metadata: {
      generatedFromPrompt: cleanPrompt,
      generatedAt: now().toISOString(),
      compiler: "poc-compiler-v0",
      compilerHints: {
        hasFailureBranch,
        inputExistsPath,
        inputComparisonCondition
      }
    }
  };

  const artifact = normalizeWorkflowArtifact(artifactDraft);
  const generatedTools = buildGeneratedTools(artifact.nodes);
  artifact.metadata.compilerHints.generatedTools = generatedTools;
  validateWorkflowArtifact(artifact);

  const diagnostics = buildCompileDiagnostics({
    cleanPrompt,
    httpMethod: primaryHttpCall.method,
    httpUrl: primaryHttpCall.url,
    httpCallCount: resolvedHttpCalls.length,
    hasFailureBranch,
    inputExistsPath,
    inputComparisonCondition,
    branchMode,
    generatedNodeIds: artifact.nodes.map((node) => node.id),
    generatedTools
  });

  return {
    artifact,
    diagnostics
  };
}

export function compilePromptToArtifact(options) {
  return compilePrompt(options).artifact;
}
