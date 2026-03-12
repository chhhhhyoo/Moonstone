import test from "node:test";
import assert from "node:assert/strict";
import { compilePrompt, compilePromptToArtifact } from "../../../src/core/poc/PromptCompiler.mjs";

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

test("compilePromptToArtifact emits comparator true/false branches for numeric greater-than prompt", () => {
  const artifact = compilePromptToArtifact({
    prompt: "When input.amount > 100 summarize premium order otherwise summarize standard order",
    now: FIXED_NOW
  });

  const trueEdge = artifact.edges.find((edge) =>
    edge.from === "http-1" &&
    edge.on === "success" &&
    edge.condition?.path === "input.amount" &&
    edge.condition?.op === "gt" &&
    edge.condition?.value === 100
  );
  const falseEdge = artifact.edges.find((edge) =>
    edge.from === "http-1" &&
    edge.on === "success" &&
    edge.condition?.path === "input.amount" &&
    edge.condition?.op === "lte" &&
    edge.condition?.value === 100
  );

  assert.ok(trueEdge);
  assert.ok(falseEdge);
  assert.notEqual(trueEdge.to, falseEdge.to);
});

test("compilePromptToArtifact emits comparator branches for equals prompt", () => {
  const artifact = compilePromptToArtifact({
    prompt: "If input.tier equals gold summarize gold path otherwise summarize standard path",
    now: FIXED_NOW
  });

  const equalEdge = artifact.edges.find((edge) =>
    edge.from === "http-1" &&
    edge.on === "success" &&
    edge.condition?.path === "input.tier" &&
    edge.condition?.op === "eq" &&
    edge.condition?.value === "gold"
  );
  const nonEqualEdge = artifact.edges.find((edge) =>
    edge.from === "http-1" &&
    edge.on === "success" &&
    edge.condition?.path === "input.tier" &&
    edge.condition?.op === "ne" &&
    edge.condition?.value === "gold"
  );

  assert.ok(equalEdge);
  assert.ok(nonEqualEdge);
});

test("compilePrompt diagnostics reports comparator branch mode for supported condition prompt", () => {
  const { diagnostics } = compilePrompt({
    prompt: "When input.amount >= 42 summarize premium path otherwise summarize default path",
    now: FIXED_NOW
  });

  assert.equal(diagnostics.branchMode, "comparator");
  assert.equal(diagnostics.inferred.inputComparisonCondition?.op, "gte");
  assert.equal(diagnostics.inferred.inputComparisonCondition?.value, 42);
  assert.deepEqual(diagnostics.warnings, []);
});

test("compilePrompt diagnostics warns on unsupported conditional phrasing fallback", () => {
  const { diagnostics } = compilePrompt({
    prompt: "If customer is vip route premium otherwise route standard",
    now: FIXED_NOW
  });

  assert.equal(diagnostics.branchMode, "default");
  assert.equal(diagnostics.warnings.length, 1);
  assert.match(
    diagnostics.warnings[0],
    /Conditional intent detected but no supported condition pattern matched/
  );
});
