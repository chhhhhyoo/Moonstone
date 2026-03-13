import test from "node:test";
import assert from "node:assert/strict";
import { buildChefDirectionPreview } from "../../../src/core/poc/ChefDirectionPlannerPreview.mjs";

function sampleArtifact() {
  return {
    artifactId: "workflow.chef-direction-preview-sample",
    artifactVersion: "0.1.0",
    trigger: {
      type: "trigger.webhook",
      path: "/hooks/chef-preview",
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

test("buildChefDirectionPreview is deterministic for same artifact and direction", () => {
  const direction = "After http-1, add an API check step using GET https://api.example.com/orders/summary.";
  const left = buildChefDirectionPreview({
    artifact: sampleArtifact(),
    direction
  });
  const right = buildChefDirectionPreview({
    artifact: sampleArtifact(),
    direction
  });

  assert.deepEqual(left, right);
  assert.ok(Array.isArray(left.affectedNodeIds));
  assert.ok(Array.isArray(left.nodeAdds));
  assert.ok(Array.isArray(left.edgeAdds));
  assert.ok(Array.isArray(left.blockedReasons));
});

test("buildChefDirectionPreview reports blocked cycle proposal deterministically", () => {
  const preview = buildChefDirectionPreview({
    artifact: sampleArtifact(),
    direction: "Connect openai-success-1 to http-1 on success."
  });

  assert.equal(preview.blocked, true);
  assert.ok(preview.blockedReasons.some((reason) => /cycle/i.test(reason)));
});
