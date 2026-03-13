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
