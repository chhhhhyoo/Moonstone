import test from "node:test";
import assert from "node:assert/strict";
import { buildChefRoleIndex, resolveChefRoleAnchor } from "../../../src/core/poc/ChefDirectionPlannerRoles.mjs";

function sampleArtifact() {
  return {
    artifactId: "workflow.chef-role-index-sample",
    artifactVersion: "0.1.0",
    trigger: {
      type: "trigger.webhook",
      path: "/hooks/chef-role-index",
      method: "POST"
    },
    nodes: [
      {
        id: "http-1",
        type: "action.http",
        config: {
          url: "https://api.example.com/orders",
          method: "POST",
          body: { prompt: "{{input.text}}" }
        }
      },
      {
        id: "http-2",
        type: "action.http",
        config: {
          url: "https://api.example.com/orders/summary",
          method: "GET",
          body: { prompt: "{{input.text}}" }
        }
      },
      {
        id: "openai-summary-1",
        type: "action.openai",
        config: {
          model: "gpt-4o-mini",
          prompt: "Summarize {{input.text}}"
        }
      },
      {
        id: "openai-summary-2",
        type: "action.openai",
        config: {
          model: "gpt-4o-mini",
          prompt: "Summarize {{input.text}} in detail"
        }
      }
    ],
    edges: [
      { from: "trigger", to: "http-1", on: "always" },
      { from: "http-1", to: "http-2", on: "success" },
      { from: "http-2", to: "openai-summary-1", on: "success" }
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

test("buildChefRoleIndex is deterministic and returns bounded role groups", () => {
  const artifact = sampleArtifact();
  const left = buildChefRoleIndex({ artifact });
  const right = buildChefRoleIndex({ artifact });

  assert.deepEqual(left, right);
  assert.deepEqual(left.request_step, ["http-1", "http-2"]);
  assert.deepEqual(left.summary_step, ["openai-summary-1", "openai-summary-2"]);
  assert.deepEqual(left.trigger_step, ["trigger"]);
});

test("resolveChefRoleAnchor selects first and latest request roles deterministically", () => {
  const first = resolveChefRoleAnchor({
    artifact: sampleArtifact(),
    roleReference: "first request step"
  });
  const latest = resolveChefRoleAnchor({
    artifact: sampleArtifact(),
    roleReference: "latest request step"
  });

  assert.equal(first.nodeId, "http-1");
  assert.equal(first.role, "request_step");
  assert.equal(first.selector, "first");
  assert.equal(latest.nodeId, "http-2");
  assert.equal(latest.role, "request_step");
  assert.equal(latest.selector, "latest");
});

test("resolveChefRoleAnchor fails closed on ambiguous summary role", () => {
  assert.throws(
    () => resolveChefRoleAnchor({
      artifact: sampleArtifact(),
      roleReference: "summary step"
    }),
    /ambiguous|summary/i
  );
});
