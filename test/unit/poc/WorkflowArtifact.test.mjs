import test from "node:test";
import assert from "node:assert/strict";
import {
  validateWorkflowArtifact,
  normalizeWorkflowArtifact,
  evaluateCondition
} from "../../../src/core/poc/WorkflowArtifact.mjs";

function sampleArtifact() {
  return {
    artifactId: "workflow.demo",
    artifactVersion: "0.1.0",
    trigger: {
      type: "trigger.webhook",
      path: "/hooks/demo",
      method: "POST"
    },
    nodes: [
      {
        id: "http-1",
        type: "action.http",
        config: {
          url: "http://localhost:8080/health",
          method: "GET"
        }
      },
      {
        id: "openai-1",
        type: "action.openai",
        config: {
          model: "gpt-4o-mini",
          prompt: "Summarize {{input.text}}"
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
        on: "success",
        condition: {
          path: "lastReceipt.outcome",
          op: "eq",
          value: "success"
        }
      }
    ],
    defaults: {
      retry: {
        maxAttempts: 2,
        backoffMs: 10,
        maxBackoffMs: 200
      }
    },
    metadata: {
      owner: "poc"
    }
  };
}

test("validateWorkflowArtifact accepts canonical shape", () => {
  const artifact = sampleArtifact();
  assert.equal(validateWorkflowArtifact(artifact), artifact);
});

test("normalizeWorkflowArtifact canonicalizes retry defaults", () => {
  const artifact = sampleArtifact();
  delete artifact.defaults.retry.maxBackoffMs;
  const normalized = normalizeWorkflowArtifact(artifact);
  assert.equal(normalized.defaults.retry.maxBackoffMs, normalized.defaults.retry.backoffMs);
});

test("validateWorkflowArtifact rejects unsupported node type", () => {
  const artifact = sampleArtifact();
  artifact.nodes[0].type = "action.unknown";
  assert.throws(() => validateWorkflowArtifact(artifact), /Unsupported node type/);
});

test("evaluateCondition supports comparator set deterministically", () => {
  const scope = {
    run: {
      attempts: 3,
      tag: "alpha",
      present: true
    }
  };

  assert.equal(evaluateCondition({ path: "run.attempts", op: "gt", value: 2 }, scope), true);
  assert.equal(evaluateCondition({ path: "run.attempts", op: "gte", value: 3 }, scope), true);
  assert.equal(evaluateCondition({ path: "run.attempts", op: "lt", value: 9 }, scope), true);
  assert.equal(evaluateCondition({ path: "run.attempts", op: "lte", value: 3 }, scope), true);
  assert.equal(evaluateCondition({ path: "run.tag", op: "contains", value: "alp" }, scope), true);
  assert.equal(evaluateCondition({ path: "run.tag", op: "ne", value: "beta" }, scope), true);
  assert.equal(evaluateCondition({ path: "run.present", op: "exists", value: true }, scope), true);
});
