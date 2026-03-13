import test from "node:test";
import assert from "node:assert/strict";
import { planChefDirection, planChefDirectionWithChoices } from "../../../src/core/poc/ChefDirectionPlanner.mjs";

function sampleArtifact() {
  return {
    artifactId: "workflow.chef-direction-sample",
    artifactVersion: "0.1.0",
    trigger: {
      type: "trigger.webhook",
      path: "/hooks/chef-direction",
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
        id: "openai-success-1",
        type: "action.openai",
        config: {
          model: "gpt-4o-mini",
          prompt: "Summarize {{input.text}}"
        }
      }
    ],
    edges: [
      { from: "trigger", to: "http-1", on: "always" },
      { from: "http-1", to: "openai-success-1", on: "success" }
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

function sampleArtifactWithAmbiguousSummaryRole() {
  const artifact = sampleArtifact();
  return {
    ...artifact,
    nodes: [
      ...artifact.nodes,
      {
        id: "openai-summary-2",
        type: "action.openai",
        config: {
          model: "gpt-4o-mini",
          prompt: "Summarize {{input.text}} in detail"
        }
      }
    ]
  };
}

function sampleArtifactWithMultipleRequestAndSummaryRoles() {
  const artifact = sampleArtifactWithAmbiguousSummaryRole();
  return {
    ...artifact,
    nodes: [
      ...artifact.nodes,
      {
        id: "http-2",
        type: "action.http",
        config: {
          url: "https://api.example.com/orders/audit",
          method: "GET",
          body: {}
        }
      }
    ],
    edges: [
      ...artifact.edges,
      { from: "http-1", to: "http-2", on: "success" }
    ]
  };
}

test("planChefDirection is deterministic for same artifact and direction", () => {
  const artifact = sampleArtifact();
  const direction = "Please add a summary step after http-1.";

  const left = planChefDirection({ artifact, direction });
  const right = planChefDirection({ artifact, direction });

  assert.deepEqual(left, right);
});

test("planChefDirection maps summary intent into add_openai_after mutation proposal", () => {
  const proposal = planChefDirection({
    artifact: sampleArtifact(),
    direction: "After http-1, summarize the result for the operator."
  });

  assert.equal(proposal.operationType, "add_openai_after");
  assert.equal(proposal.operation.afterNodeId, "http-1");
  assert.equal(proposal.ambiguity, "none");
  assert.ok(typeof proposal.confidence === "number");
  assert.ok(typeof proposal.rationale === "string" && proposal.rationale.length > 0);
});

test("planChefDirection maps http-step intent into add_http_after mutation proposal", () => {
  const proposal = planChefDirection({
    artifact: sampleArtifact(),
    direction: "After http-1, add an API check step using GET https://api.example.com/orders/summary."
  });

  assert.equal(proposal.operationType, "add_http_after");
  assert.equal(proposal.operation.afterNodeId, "http-1");
  assert.equal(proposal.operation.method, "GET");
  assert.equal(proposal.operation.url, "https://api.example.com/orders/summary");
});

test("planChefDirection maps replace intent into replace_node_tool mutation proposal", () => {
  const proposal = planChefDirection({
    artifact: sampleArtifact(),
    direction: "Replace node openai-success-1 with HTTP POST https://api.example.com/notify."
  });

  assert.equal(proposal.operationType, "replace_node_tool");
  assert.equal(proposal.operation.nodeId, "openai-success-1");
  assert.equal(proposal.operation.targetType, "action.http");
  assert.equal(proposal.operation.config.method, "POST");
  assert.equal(proposal.operation.config.url, "https://api.example.com/notify");
});

test("planChefDirection maps connect intent into connect_nodes mutation proposal", () => {
  const proposal = planChefDirection({
    artifact: sampleArtifact(),
    direction: "Connect http-1 to openai-success-1 on failed."
  });

  assert.equal(proposal.operationType, "connect_nodes");
  assert.equal(proposal.operation.fromNodeId, "http-1");
  assert.equal(proposal.operation.toNodeId, "openai-success-1");
  assert.equal(proposal.operation.event, "failed");
});

test("planChefDirection maps remove intent into remove_leaf_node mutation proposal", () => {
  const proposal = planChefDirection({
    artifact: sampleArtifact(),
    direction: "Remove leaf node openai-success-1."
  });

  assert.equal(proposal.operationType, "remove_leaf_node");
  assert.equal(proposal.operation.nodeId, "openai-success-1");
});

test("planChefDirection maps role-based direction without node ids into add_openai_after proposal", () => {
  const proposal = planChefDirection({
    artifact: sampleArtifact(),
    direction: "After first request step, add a summary step for the operator."
  });

  assert.equal(proposal.operationType, "add_openai_after");
  assert.equal(proposal.operation.afterNodeId, "http-1");
  assert.ok(Array.isArray(proposal.resolvedAnchors));
  assert.ok(proposal.resolvedAnchors.some((entry) => entry.nodeId === "http-1"));
});

test("planChefDirection maps trigger/summary role phrases into connect_nodes proposal", () => {
  const proposal = planChefDirection({
    artifact: sampleArtifact(),
    direction: "Connect trigger step to summary step."
  });

  assert.equal(proposal.operationType, "connect_nodes");
  assert.equal(proposal.operation.fromNodeId, "trigger");
  assert.equal(proposal.operation.toNodeId, "openai-success-1");
  assert.ok(Array.isArray(proposal.resolvedAnchors));
});

test("planChefDirection fails closed for unsupported vague intent", () => {
  assert.throws(
    () => planChefDirection({
      artifact: sampleArtifact(),
      direction: "Make this workflow better somehow."
    }),
    /unsupported|low confidence|direction/i
  );
});

test("planChefDirection fails closed for ambiguous direction", () => {
  assert.throws(
    () => planChefDirection({
      artifact: sampleArtifact(),
      direction: "Add a summary after http-1 and also connect http-1 to openai-success-1 on failed."
    }),
    /ambiguous|single|direction/i
  );
});

test("planChefDirection fails closed for ambiguous role resolution", () => {
  assert.throws(
    () => planChefDirection({
      artifact: sampleArtifactWithAmbiguousSummaryRole(),
      direction: "After summary step, add a summary step for the operator."
    }),
    /ambiguous|summary|role/i
  );
});

test("planChefDirectionWithChoices returns deterministic candidates for single ambiguous role reference", () => {
  const plan = planChefDirectionWithChoices({
    artifact: sampleArtifactWithAmbiguousSummaryRole(),
    direction: "After summary step, add a summary step for the operator."
  });

  assert.equal(plan.status, "choice_required");
  assert.ok(Array.isArray(plan.proposalCandidates));
  assert.equal(plan.proposalCandidates.length, 2);

  const candidateNodeIds = plan.proposalCandidates.map((entry) => entry.operation.afterNodeId);
  assert.deepEqual(candidateNodeIds, [...candidateNodeIds].sort());
  assert.ok(plan.proposalCandidates.every((entry) => typeof entry.proposalId === "string" && entry.proposalId.length > 0));
  assert.ok(plan.proposalCandidates.every((entry) => Array.isArray(entry.resolvedAnchors) && entry.resolvedAnchors.length > 0));
});

test("planChefDirectionWithChoices fails closed when direction has multiple ambiguous role references", () => {
  assert.throws(
    () => planChefDirectionWithChoices({
      artifact: sampleArtifactWithMultipleRequestAndSummaryRoles(),
      direction: "Connect request step to summary step."
    }),
    /ambiguous|multiple|role/i
  );
});
