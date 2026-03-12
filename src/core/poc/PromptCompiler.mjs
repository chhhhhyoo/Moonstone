import { normalizeWorkflowArtifact, validateWorkflowArtifact } from "./WorkflowArtifact.mjs";

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

export function compilePromptToArtifact({
  prompt,
  httpUrl = "https://example.com/api",
  openaiModel = "gpt-4o-mini"
}) {
  const cleanPrompt = String(prompt ?? "").trim();
  if (!cleanPrompt) {
    throw new Error("Prompt is required for POC compilation.");
  }

  const slug = slugify(cleanPrompt.split(" ").slice(0, 8).join(" "));
  const httpMethod = inferHttpMethod(cleanPrompt);

  const artifactDraft = {
    artifactId: `workflow.${slug}`,
    artifactVersion: "0.1.0",
    trigger: {
      type: "trigger.webhook",
      path: `/hooks/${slug}`,
      method: "POST"
    },
    nodes: [
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
      },
      {
        id: "openai-1",
        type: "action.openai",
        config: {
          model: openaiModel,
          prompt: `Summarize this workflow result for the user: ${cleanPrompt} | upstream={{nodeResults.http-1.result.body}}`
        }
      }
    ],
    edges: [
      {
        from: "trigger",
        to: "http-1",
        on: "always"
      },
      {
        from: "http-1",
        to: "openai-1",
        on: "success"
      }
    ],
    defaults: {
      retry: {
        maxAttempts: 1,
        backoffMs: 100,
        maxBackoffMs: 400
      }
    },
    metadata: {
      generatedFromPrompt: cleanPrompt,
      generatedAt: new Date().toISOString(),
      compiler: "poc-compiler-v0"
    }
  };

  const artifact = normalizeWorkflowArtifact(artifactDraft);
  validateWorkflowArtifact(artifact);
  return artifact;
}
