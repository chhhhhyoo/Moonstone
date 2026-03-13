import test from "node:test";
import assert from "node:assert/strict";
import { planChefDirection } from "../../../src/core/poc/ChefDirectionPlanner.mjs";

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
