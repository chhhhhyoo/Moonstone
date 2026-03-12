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

export function compilePromptToArtifact({
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
        inputExistsPath
      }
    }
  };

  const artifact = normalizeWorkflowArtifact(artifactDraft);
  validateWorkflowArtifact(artifact);
  return artifact;
}
