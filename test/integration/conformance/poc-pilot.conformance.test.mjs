import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { parseJsonOutput, runNodeScript } from "./helpers/cli-e2e-helpers.mjs";

async function expectFile(filePath) {
  const info = await stat(filePath);
  assert.ok(info.isFile(), `expected file: ${filePath}`);
}

test("poc:pilot compiles and runs prompt workflow in mock mode", async () => {
  const tempRoot = await mkdtemp(path.join(tmpdir(), "moonstone-poc-pilot-"));
  try {
    const outDir = path.join(tempRoot, "out");
    const journalDir = path.join(tempRoot, "journal");
    const runId = "pilot-conformance-001";

    const result = await runNodeScript([
      "scripts/poc-pilot.mjs",
      "--mode",
      "mock",
      "--prompt",
      "When input.amount > 100 summarize premium order otherwise summarize standard order",
      "--input",
      "{\"amount\":120,\"text\":\"pilot-conformance\"}",
      "--outdir",
      outDir,
      "--journal-dir",
      journalDir,
      "--run-id",
      runId
    ]);

    const payload = parseJsonOutput(result.stdout, "poc:pilot");
    assert.equal(payload.ok, true);
    assert.equal(payload.status, "completed");
    assert.equal(payload.runId, runId);
    assert.equal(payload.diagnostics.branchMode, "comparator");
    assert.deepEqual(payload.executedNodeIds.sort(), ["http-1", "openai-condition-true-1"].sort());
    assert.ok(Array.isArray(payload.generatedTools));
    assert.ok(payload.generatedTools.length >= 2);

    await expectFile(payload.paths.artifactPath);
    await expectFile(payload.paths.diagnosticsPath);
    await expectFile(payload.paths.runSummaryPath);
    await expectFile(payload.paths.inspectionPath);
    await expectFile(payload.paths.replayPath);
    await expectFile(payload.paths.toolsPath);

    const runSummary = JSON.parse(await readFile(payload.paths.runSummaryPath, "utf8"));
    assert.equal(runSummary.status, "completed");
    assert.deepEqual(runSummary.attempts, {
      "http-1": 1,
      "openai-condition-true-1": 1
    });

    const generatedTools = JSON.parse(await readFile(payload.paths.toolsPath, "utf8"));
    assert.deepEqual(generatedTools, payload.generatedTools);
    assert.ok(generatedTools.some((tool) => tool.nodeId === "http-1"));
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("poc:pilot compiles and runs ordered multi-tool prompt in mock mode", async () => {
  const tempRoot = await mkdtemp(path.join(tmpdir(), "moonstone-poc-pilot-multi-tool-"));
  try {
    const outDir = path.join(tempRoot, "out");
    const journalDir = path.join(tempRoot, "journal");
    const runId = "pilot-multi-tool-001";

    const result = await runNodeScript([
      "scripts/poc-pilot.mjs",
      "--mode",
      "mock",
      "--prompt",
      "POST https://api.example.com/orders then GET https://api.example.com/orders/summary then summarize result",
      "--input",
      "{\"text\":\"pilot-multi-tool\"}",
      "--outdir",
      outDir,
      "--journal-dir",
      journalDir,
      "--run-id",
      runId
    ]);

    const payload = parseJsonOutput(result.stdout, "poc:pilot");
    assert.equal(payload.ok, true);
    assert.equal(payload.status, "completed");
    assert.equal(payload.runId, runId);
    assert.deepEqual(payload.executedNodeIds.sort(), ["http-1", "http-2", "openai-success-1"].sort());

    const httpTools = payload.generatedTools.filter((tool) => tool.connectorType === "action.http");
    assert.equal(httpTools.length, 2);
    assert.deepEqual(httpTools.map((tool) => tool.nodeId), ["http-1", "http-2"]);

    const artifact = JSON.parse(await readFile(payload.paths.artifactPath, "utf8"));
    assert.deepEqual(artifact.nodes.map((node) => node.id), ["http-1", "http-2", "openai-success-1"]);

    const inspection = JSON.parse(await readFile(payload.paths.inspectionPath, "utf8"));
    const http2CommandEvent = inspection.timeline.find((event) =>
      event.eventType === "command_emitted" && event.command?.nodeId === "http-2"
    );
    assert.ok(http2CommandEvent);
    assert.deepEqual(http2CommandEvent.command.payload.body, {
      prompt: "pilot-multi-tool",
      upstreamStatus: "200",
      upstreamSource: "mock-http",
      upstreamNodeId: "http-1"
    });
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("poc:pilot routes to upstream-status false branch deterministically in mock mode", async () => {
  const tempRoot = await mkdtemp(path.join(tmpdir(), "moonstone-poc-pilot-upstream-branch-"));
  try {
    const outDir = path.join(tempRoot, "out");
    const journalDir = path.join(tempRoot, "journal");
    const runId = "pilot-upstream-branch-001";

    const result = await runNodeScript([
      "scripts/poc-pilot.mjs",
      "--mode",
      "mock",
      "--prompt",
      "POST https://api.example.com/orders then if response.status >= 500 summarize error otherwise summarize success",
      "--input",
      "{\"text\":\"pilot-upstream-status\"}",
      "--outdir",
      outDir,
      "--journal-dir",
      journalDir,
      "--run-id",
      runId
    ]);

    const payload = parseJsonOutput(result.stdout, "poc:pilot");
    assert.equal(payload.ok, true);
    assert.equal(payload.status, "completed");
    assert.equal(payload.runId, runId);
    assert.equal(payload.diagnostics.branchMode, "comparator");
    assert.deepEqual(payload.executedNodeIds.sort(), ["http-1", "openai-condition-false-1"].sort());

    const artifact = JSON.parse(await readFile(payload.paths.artifactPath, "utf8"));
    const trueEdge = artifact.edges.find((edge) =>
      edge.from === "http-1" &&
      edge.on === "success" &&
      edge.condition?.path === "nodeResults.http-1.result.status" &&
      edge.condition?.op === "gte" &&
      edge.condition?.value === 500
    );
    const falseEdge = artifact.edges.find((edge) =>
      edge.from === "http-1" &&
      edge.on === "success" &&
      edge.condition?.path === "nodeResults.http-1.result.status" &&
      edge.condition?.op === "lt" &&
      edge.condition?.value === 500
    );

    assert.ok(trueEdge);
    assert.ok(falseEdge);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
