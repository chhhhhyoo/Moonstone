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
 *   version: string,
 *   prompt: string,
 *   branchMode: BranchMode,
 *   inferred: {
 *     httpMethod: string,
 *     hasFailureBranch: boolean,
 *     inputExistsPath: string | null,
 *     inputComparisonCondition: InferredComparatorCondition | null
 *   },
 *   warnings: string[],
 *   generatedNodeIds: string[]
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
 *   hasFailureBranch: boolean,
 *   inputExistsPath: string | null,
 *   inputComparisonCondition: InferredComparatorCondition | null,
 *   branchMode: BranchMode,
 *   generatedNodeIds: string[]
 * }} params
 * @returns {CompileDiagnostics}
 */
function buildCompileDiagnostics({
  cleanPrompt,
  httpMethod,
  hasFailureBranch,
  inputExistsPath,
  inputComparisonCondition,
  branchMode,
  generatedNodeIds
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
      hasFailureBranch,
      inputExistsPath,
      inputComparisonCondition
    },
    warnings,
    generatedNodeIds
  };
}

export function compilePrompt({
  prompt,
  httpUrl = "https://example.com/api",
  openaiModel = "gpt-4o-mini",
  now = () => new Date()
}) {
  const cleanPrompt = String(prompt ?? "").trim();
  if (!cleanPrompt) {
    throw new Error("Prompt is required for POC compilation.");
  }

  const slug = slugify(cleanPrompt.split(" ").slice(0, 8).join(" "));
  const httpMethod = inferHttpMethod(cleanPrompt);
  const hasFailureBranch = inferFailureBranch(cleanPrompt);
  const inputExistsPath = inferInputExistsPath(cleanPrompt);
  const inputComparisonCondition = inferInputComparisonCondition(cleanPrompt);
  const branchMode = inferBranchMode({ inputExistsPath, inputComparisonCondition });

  /** @type {WorkflowNodeDraft[]} */
  const nodes = [
    {
      id: "http-1",
      type: "action.http",
      config: {
        url: httpUrl,
        method: httpMethod,
        headers: {
          "Content-Type": "application/json"
        },
        body: {
          prompt: "{{input.text}}"
        }
      },
      retry: {
        maxAttempts: 2,
        backoffMs: 200,
        maxBackoffMs: 1_000
      }
    }
  ];

  /** @type {WorkflowEdgeDraft[]} */
  const edges = [
    {
      from: "trigger",
      to: "http-1",
      on: "always"
    }
  ];

  if (inputExistsPath) {
    nodes.push(
      {
        id: "openai-present-1",
        type: "action.openai",
        config: {
          model: openaiModel,
          prompt: `Input field '${inputExistsPath}' is present. Summarize workflow result: ${cleanPrompt} | upstream={{nodeResults.http-1.result.body}}`
        }
      },
      {
        id: "openai-missing-1",
        type: "action.openai",
        config: {
          model: openaiModel,
          prompt: `Input field '${inputExistsPath}' is missing. Summarize default workflow result: ${cleanPrompt} | upstream={{nodeResults.http-1.result.body}}`
        }
      }
    );

    edges.push(
      {
        from: "http-1",
        to: "openai-present-1",
        on: "success",
        condition: {
          path: inputExistsPath,
          op: "exists",
          value: true
        }
      },
      {
        from: "http-1",
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
            prompt: `Condition '${inputComparisonCondition.path} ${inputComparisonCondition.op} ${inputComparisonCondition.value}' matched. Summarize workflow result: ${cleanPrompt} | upstream={{nodeResults.http-1.result.body}}`
          }
        },
        {
          id: "openai-condition-false-1",
          type: "action.openai",
          config: {
            model: openaiModel,
            prompt: `Condition '${inputComparisonCondition.path} ${inputComparisonCondition.op} ${inputComparisonCondition.value}' did not match. Summarize fallback workflow result: ${cleanPrompt} | upstream={{nodeResults.http-1.result.body}}`
          }
        }
      );

      edges.push(
        {
          from: "http-1",
          to: "openai-condition-true-1",
          on: "success",
          condition: {
            path: inputComparisonCondition.path,
            op: inputComparisonCondition.op,
            value: inputComparisonCondition.value
          }
        },
        {
          from: "http-1",
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
        prompt: `Summarize this workflow result for the user: ${cleanPrompt} | upstream={{nodeResults.http-1.result.body}}`
      }
    });
    edges.push({
      from: "http-1",
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
    edges.push({
      from: "http-1",
      to: "openai-failure-1",
      on: "failed"
    });
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
  validateWorkflowArtifact(artifact);

  const diagnostics = buildCompileDiagnostics({
    cleanPrompt,
    httpMethod,
    hasFailureBranch,
    inputExistsPath,
    inputComparisonCondition,
    branchMode,
    generatedNodeIds: artifact.nodes.map((node) => node.id)
  });

  return {
    artifact,
    diagnostics
  };
}

export function compilePromptToArtifact(options) {
  return compilePrompt(options).artifact;
}
