import test from "node:test";
import assert from "node:assert/strict";
import { applyWorkflowMutation } from "../../../src/core/poc/WorkflowMutationApplier.mjs";

function sampleArtifact() {
  return {
    artifactId: "workflow.applier-sample",
    artifactVersion: "0.1.0",
    trigger: {
      type: "trigger.webhook",
      path: "/hooks/applier",
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

test("applyWorkflowMutation add_http_after inserts node and rewires success path", () => {
  const artifact = sampleArtifact();
  const result = applyWorkflowMutation({
    artifact,
    plan: {
      planId: "plan.add-http",
      sourceArtifactId: artifact.artifactId,
      prompt: "add http after http-1",
      operationType: "add_http_after",
      operation: {
        afterNodeId: "http-1",
        event: "success",
        method: "GET",
        url: "https://api.example.com/orders/summary"
      },
      diagnostics: {}
    }
  });

  assert.equal(result.ok, true);
  assert.equal(result.operationType, "add_http_after");
  assert.ok(result.mutatedArtifact.nodes.some((node) => node.id === "http-2"));

  const edgeIntoHttp2 = result.mutatedArtifact.edges.find((edge) =>
    edge.from === "http-1" && edge.to === "http-2" && edge.on === "success"
  );
  const edgeOutHttp2 = result.mutatedArtifact.edges.find((edge) =>
    edge.from === "http-2" && edge.to === "openai-1" && edge.on === "success"
  );

  assert.ok(edgeIntoHttp2);
  assert.ok(edgeOutHttp2);
});

test("applyWorkflowMutation replace_node_tool updates node type/config deterministically", () => {
  const artifact = sampleArtifact();
  const result = applyWorkflowMutation({
    artifact,
    plan: {
      planId: "plan.replace-tool",
      sourceArtifactId: artifact.artifactId,
      prompt: "replace node openai-1 with http",
      operationType: "replace_node_tool",
      operation: {
        nodeId: "openai-1",
        targetType: "action.http",
        config: {
          method: "GET",
          url: "https://api.example.com/summary"
        }
      },
      diagnostics: {}
    }
  });

  const node = result.mutatedArtifact.nodes.find((entry) => entry.id === "openai-1");
  assert.ok(node);
  assert.equal(node.type, "action.http");
  assert.equal(node.config.method, "GET");
  assert.equal(node.config.url, "https://api.example.com/summary");
});

test("applyWorkflowMutation rejects cycle-inducing connect_nodes operation", () => {
  const artifact = sampleArtifact();

  assert.throws(
    () => applyWorkflowMutation({
      artifact,
      plan: {
        planId: "plan.cycle",
        sourceArtifactId: artifact.artifactId,
        prompt: "connect openai-1 to http-1",
        operationType: "connect_nodes",
        operation: {
          fromNodeId: "openai-1",
          toNodeId: "http-1",
          event: "success"
        },
        diagnostics: {}
      }
    }),
    /cycle/i
  );
});

test("applyWorkflowMutation rejects remove_leaf_node on non-leaf node", () => {
  const artifact = sampleArtifact();

  assert.throws(
    () => applyWorkflowMutation({
      artifact,
      plan: {
        planId: "plan.remove-non-leaf",
        sourceArtifactId: artifact.artifactId,
        prompt: "remove leaf node http-1",
        operationType: "remove_leaf_node",
        operation: {
          nodeId: "http-1"
        },
        diagnostics: {}
      }
    }),
    /leaf|outgoing/i
  );
});

test("applyWorkflowMutation remove_leaf_node removes target node and incoming edges", () => {
  const artifact = sampleArtifact();
  const result = applyWorkflowMutation({
    artifact,
    plan: {
      planId: "plan.remove-leaf",
      sourceArtifactId: artifact.artifactId,
      prompt: "remove leaf node openai-1",
      operationType: "remove_leaf_node",
      operation: {
        nodeId: "openai-1"
      },
      diagnostics: {}
    }
  });

  assert.equal(result.ok, true);
  assert.ok(!result.mutatedArtifact.nodes.some((node) => node.id === "openai-1"));
  assert.ok(!result.mutatedArtifact.edges.some((edge) => edge.to === "openai-1"));
});

test("applyWorkflowMutation does not mutate source artifact object", () => {
  const artifact = sampleArtifact();
  const snapshot = structuredClone(artifact);

  applyWorkflowMutation({
    artifact,
    plan: {
      planId: "plan.no-mutate-source",
      sourceArtifactId: artifact.artifactId,
      prompt: "add openai after http-1",
      operationType: "add_openai_after",
      operation: {
        afterNodeId: "http-1",
        event: "success",
        model: "gpt-4o-mini",
        prompt: "Generate summary"
      },
      diagnostics: {}
    }
  });

  assert.deepEqual(artifact, snapshot);
});
