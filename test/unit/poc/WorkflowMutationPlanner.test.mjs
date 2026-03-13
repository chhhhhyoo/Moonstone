import test from "node:test";
import assert from "node:assert/strict";
import { planWorkflowMutation } from "../../../src/core/poc/WorkflowMutationPlanner.mjs";

function sampleArtifact() {
  return {
    artifactId: "workflow.mutation-sample",
    artifactVersion: "0.1.0",
    trigger: {
      type: "trigger.webhook",
      path: "/hooks/mutation",
      method: "POST"
    },
    nodes: [
      {
        id: "http-1",
        type: "action.http",
        config: {
          url: "https://api.example.com/orders",
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: {
            prompt: "{{input.text}}"
          }
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
      { from: "trigger", to: "http-1", on: "always" },
      { from: "http-1", to: "openai-1", on: "success" }
    ],
    defaults: {
      retry: {
        maxAttempts: 1,
        backoffMs: 100,
        maxBackoffMs: 400
      }
    },
    metadata: {}
  };
}

test("planWorkflowMutation is deterministic for same artifact and prompt", () => {
  const artifact = sampleArtifact();
  const prompt = "add http after http-1 method GET url https://api.example.com/orders/summary on success";

  const left = planWorkflowMutation({ artifact, prompt });
  const right = planWorkflowMutation({ artifact, prompt });

  assert.deepEqual(left, right);
});

test("planWorkflowMutation parses add_http_after operation", () => {
  const plan = planWorkflowMutation({
    artifact: sampleArtifact(),
    prompt: "add http after http-1 method GET url https://api.example.com/orders/summary on success"
  });

  assert.equal(plan.operationType, "add_http_after");
  assert.deepEqual(plan.operation, {
    afterNodeId: "http-1",
    event: "success",
    method: "GET",
    url: "https://api.example.com/orders/summary"
  });
});

test("planWorkflowMutation parses add_openai_after operation", () => {
  const plan = planWorkflowMutation({
    artifact: sampleArtifact(),
    prompt: "add openai after http-1 model gpt-4o-mini prompt \"Summarize order status\" on failed"
  });

  assert.equal(plan.operationType, "add_openai_after");
  assert.deepEqual(plan.operation, {
    afterNodeId: "http-1",
    event: "failed",
    model: "gpt-4o-mini",
    prompt: "Summarize order status"
  });
});

test("planWorkflowMutation parses replace_node_tool operation", () => {
  const plan = planWorkflowMutation({
    artifact: sampleArtifact(),
    prompt: "replace node openai-1 with http method GET url https://api.example.com/status"
  });

  assert.equal(plan.operationType, "replace_node_tool");
  assert.deepEqual(plan.operation, {
    nodeId: "openai-1",
    targetType: "action.http",
    config: {
      method: "GET",
      url: "https://api.example.com/status"
    }
  });
});

test("planWorkflowMutation parses connect_nodes operation", () => {
  const plan = planWorkflowMutation({
    artifact: sampleArtifact(),
    prompt: "connect http-1 to openai-1 on failed"
  });

  assert.equal(plan.operationType, "connect_nodes");
  assert.deepEqual(plan.operation, {
    fromNodeId: "http-1",
    toNodeId: "openai-1",
    event: "failed"
  });
});

test("planWorkflowMutation parses remove_leaf_node operation", () => {
  const plan = planWorkflowMutation({
    artifact: sampleArtifact(),
    prompt: "remove leaf node openai-1"
  });

  assert.equal(plan.operationType, "remove_leaf_node");
  assert.deepEqual(plan.operation, {
    nodeId: "openai-1"
  });
});

test("planWorkflowMutation rejects ambiguous multi-operation prompt", () => {
  assert.throws(
    () => planWorkflowMutation({
      artifact: sampleArtifact(),
      prompt: "add http after http-1 method GET url https://api.example.com/summary and connect http-1 to openai-1 on failed"
    }),
    /ambiguous|single operation|multi-operation/i
  );
});

test("planWorkflowMutation rejects unsupported operation prompt", () => {
  assert.throws(
    () => planWorkflowMutation({
      artifact: sampleArtifact(),
      prompt: "optimize this graph automatically"
    }),
    /unsupported|operation|prompt/i
  );
});
