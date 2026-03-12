import test from "node:test";
import assert from "node:assert/strict";
import { compilePromptToArtifact } from "../../../src/core/poc/PromptCompiler.mjs";

const FIXED_NOW = () => new Date("2026-03-12T07:45:00.000Z");

test("compilePromptToArtifact infers HTTP method and deterministic metadata when now is provided", () => {
  const artifact = compilePromptToArtifact({
    prompt: "POST order payload then summarize result",
    now: FIXED_NOW
  });

  assert.equal(artifact.nodes[0].id, "http-1");
  assert.equal(artifact.nodes[0].config.method, "POST");
  assert.equal(artifact.metadata.generatedAt, "2026-03-12T07:45:00.000Z");
});

test("compilePromptToArtifact emits failure branch when prompt asks for failure handling", () => {
  const artifact = compilePromptToArtifact({
    prompt: "Call vendor API and on failure summarize the error for user",
    now: FIXED_NOW
  });

  const failureNode = artifact.nodes.find((node) => node.id === "openai-failure-1");
  assert.ok(failureNode);

  const failedEdge = artifact.edges.find((edge) => edge.from === "http-1" && edge.on === "failed");
  assert.ok(failedEdge);
  assert.equal(failedEdge.to, "openai-failure-1");
});

test("compilePromptToArtifact emits conditional success branches for input exists prompt", () => {
  const artifact = compilePromptToArtifact({
    prompt: "When input.priority exists summarize priority, otherwise summarize default",
    now: FIXED_NOW
  });

  const presentBranch = artifact.edges.find((edge) =>
    edge.from === "http-1" &&
    edge.on === "success" &&
    edge.condition?.path === "input.priority" &&
    edge.condition?.op === "exists" &&
    edge.condition?.value === true
  );
  const missingBranch = artifact.edges.find((edge) =>
    edge.from === "http-1" &&
    edge.on === "success" &&
    edge.condition?.path === "input.priority" &&
    edge.condition?.op === "exists" &&
    edge.condition?.value === false
  );

  assert.ok(presentBranch);
  assert.ok(missingBranch);
  assert.notEqual(presentBranch.to, missingBranch.to);
});

test("compilePromptToArtifact is deterministic for same prompt/options when now is fixed", () => {
  const prompt = "When input.priority exists summarize priority, otherwise summarize default";
  const left = compilePromptToArtifact({
    prompt,
    httpUrl: "https://example.com/a",
    openaiModel: "gpt-4o-mini",
    now: FIXED_NOW
  });
  const right = compilePromptToArtifact({
    prompt,
    httpUrl: "https://example.com/a",
    openaiModel: "gpt-4o-mini",
    now: FIXED_NOW
  });

  assert.deepEqual(left, right);
});
