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

async function fileExists(filePath) {
  try {
    const info = await stat(filePath);
    return info.isFile();
  } catch {
    return false;
  }
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

test("poc:pilot supports artifact-first feedback mutation loop with deterministic lineage evidence", async () => {
  const tempRoot = await mkdtemp(path.join(tmpdir(), "moonstone-poc-pilot-feedback-loop-"));
  try {
    const outDir = path.join(tempRoot, "initial");
    const secondOutDir = path.join(tempRoot, "feedback");
    const journalDir = path.join(tempRoot, "journal");

    const initialResult = await runNodeScript([
      "scripts/poc-pilot.mjs",
      "--mode",
      "mock",
      "--prompt",
      "POST https://api.example.com/orders then summarize result",
      "--input",
      "{\"text\":\"pilot-feedback-initial\"}",
      "--outdir",
      outDir,
      "--journal-dir",
      journalDir,
      "--run-id",
      "pilot-feedback-initial-001"
    ]);

    const initialPayload = parseJsonOutput(initialResult.stdout, "poc:pilot(initial)");
    assert.equal(initialPayload.ok, true);
    assert.equal(initialPayload.status, "completed");
    await expectFile(initialPayload.paths.artifactPath);

    const sourceBeforeRaw = await readFile(initialPayload.paths.artifactPath, "utf8");
    const feedbackPrompt = "add http after http-1 method GET url https://api.example.com/orders/summary on success";
    const feedbackResult = await runNodeScript([
      "scripts/poc-pilot.mjs",
      "--mode",
      "mock",
      "--artifact",
      initialPayload.paths.artifactPath,
      "--feedback",
      feedbackPrompt,
      "--input",
      "{\"text\":\"pilot-feedback-revision\"}",
      "--outdir",
      secondOutDir,
      "--journal-dir",
      journalDir,
      "--run-id",
      "pilot-feedback-revision-001"
    ]);

    const feedbackPayload = parseJsonOutput(feedbackResult.stdout, "poc:pilot(feedback)");
    assert.equal(feedbackPayload.ok, true);
    assert.equal(feedbackPayload.status, "completed");
    assert.equal(feedbackPayload.lineage.feedbackPrompt, feedbackPrompt);
    assert.equal(feedbackPayload.lineage.mutation.applied, true);
    assert.equal(feedbackPayload.lineage.mutation.operationType, "add_http_after");
    assert.equal(feedbackPayload.lineage.sourceArtifactPath, initialPayload.paths.artifactPath);
    assert.ok(feedbackPayload.lineage.effectiveArtifactPath.endsWith(".mutated.json"));

    await expectFile(feedbackPayload.lineage.effectiveArtifactPath);
    await expectFile(feedbackPayload.paths.artifactPath);

    const sourceAfterRaw = await readFile(initialPayload.paths.artifactPath, "utf8");
    assert.equal(sourceAfterRaw, sourceBeforeRaw, "feedback loop must not mutate source artifact file");

    assert.ok(feedbackPayload.executedNodeIds.includes("http-2"));
    assert.ok(feedbackPayload.executedNodeIds.includes("openai-success-1"));

    const replay = JSON.parse(await readFile(feedbackPayload.paths.replayPath, "utf8"));
    assert.equal(replay.runId, "pilot-feedback-revision-001");
    assert.equal(replay.status, "completed");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("poc:pilot supports direction proposal and apply-confirm loop", async () => {
  const tempRoot = await mkdtemp(path.join(tmpdir(), "moonstone-poc-pilot-direction-loop-"));
  try {
    const outDir = path.join(tempRoot, "initial");
    const proposalOutDir = path.join(tempRoot, "proposal");
    const applyOutDir = path.join(tempRoot, "apply");
    const journalDir = path.join(tempRoot, "journal");

    const initialResult = await runNodeScript([
      "scripts/poc-pilot.mjs",
      "--mode",
      "mock",
      "--prompt",
      "POST https://api.example.com/orders then summarize result",
      "--input",
      "{\"text\":\"pilot-direction-initial\"}",
      "--outdir",
      outDir,
      "--journal-dir",
      journalDir,
      "--run-id",
      "pilot-direction-initial-001"
    ]);
    const initialPayload = parseJsonOutput(initialResult.stdout, "poc:pilot(initial-direction)");
    const sourceBeforeRaw = await readFile(initialPayload.paths.artifactPath, "utf8");

    const direction = "After http-1, add a summary step for the operator.";
    const proposalResult = await runNodeScript([
      "scripts/poc-pilot.mjs",
      "--mode",
      "mock",
      "--artifact",
      initialPayload.paths.artifactPath,
      "--direction",
      direction,
      "--outdir",
      proposalOutDir,
      "--journal-dir",
      journalDir
    ]);
    const proposalPayload = parseJsonOutput(proposalResult.stdout, "poc:pilot(direction-proposal)");
    assert.equal(proposalPayload.ok, true);
    assert.equal(proposalPayload.status, "proposal_only");
    assert.equal(proposalPayload.runId, null);
    assert.equal(proposalPayload.proposal.operationType, "add_openai_after");
    assert.equal(proposalPayload.proposal.applied, false);
    assert.equal(proposalPayload.lineage.sourceArtifactPath, initialPayload.paths.artifactPath);
    assert.equal(proposalPayload.lineage.effectiveArtifactPath, initialPayload.paths.artifactPath);
    assert.equal(await fileExists(proposalPayload.paths.runSummaryPath), false);

    const applyResult = await runNodeScript([
      "scripts/poc-pilot.mjs",
      "--mode",
      "mock",
      "--artifact",
      initialPayload.paths.artifactPath,
      "--direction",
      direction,
      "--apply-direction",
      "--input",
      "{\"text\":\"pilot-direction-apply\"}",
      "--outdir",
      applyOutDir,
      "--journal-dir",
      journalDir,
      "--run-id",
      "pilot-direction-apply-001"
    ]);
    const applyPayload = parseJsonOutput(applyResult.stdout, "poc:pilot(direction-apply)");
    assert.equal(applyPayload.ok, true);
    assert.equal(applyPayload.status, "completed");
    assert.equal(applyPayload.runId, "pilot-direction-apply-001");
    assert.equal(applyPayload.proposal.applied, true);
    assert.equal(applyPayload.proposal.operationType, "add_openai_after");
    assert.ok(applyPayload.lineage.effectiveArtifactPath.endsWith(".mutated.json"));
    assert.ok(applyPayload.executedNodeIds.length >= 3);

    const sourceAfterRaw = await readFile(initialPayload.paths.artifactPath, "utf8");
    assert.equal(sourceAfterRaw, sourceBeforeRaw, "direction apply must not mutate source artifact file");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("poc:pilot supports add-http direction proposal with deterministic diff preview", async () => {
  const tempRoot = await mkdtemp(path.join(tmpdir(), "moonstone-poc-pilot-direction-http-loop-"));
  try {
    const outDir = path.join(tempRoot, "initial");
    const proposalOutDir = path.join(tempRoot, "proposal");
    const applyOutDir = path.join(tempRoot, "apply");
    const journalDir = path.join(tempRoot, "journal");

    const initialResult = await runNodeScript([
      "scripts/poc-pilot.mjs",
      "--mode",
      "mock",
      "--prompt",
      "POST https://api.example.com/orders then summarize result",
      "--input",
      "{\"text\":\"pilot-direction-http-initial\"}",
      "--outdir",
      outDir,
      "--journal-dir",
      journalDir,
      "--run-id",
      "pilot-direction-http-initial-001"
    ]);
    const initialPayload = parseJsonOutput(initialResult.stdout, "poc:pilot(initial-direction-http)");
    const sourceBeforeRaw = await readFile(initialPayload.paths.artifactPath, "utf8");

    const direction = "After http-1, add an API check step using GET https://api.example.com/orders/summary.";
    const proposalResult = await runNodeScript([
      "scripts/poc-pilot.mjs",
      "--mode",
      "mock",
      "--artifact",
      initialPayload.paths.artifactPath,
      "--direction",
      direction,
      "--outdir",
      proposalOutDir,
      "--journal-dir",
      journalDir
    ]);
    const proposalPayload = parseJsonOutput(proposalResult.stdout, "poc:pilot(direction-http-proposal)");
    assert.equal(proposalPayload.ok, true);
    assert.equal(proposalPayload.status, "proposal_only");
    assert.equal(proposalPayload.proposal.operationType, "add_http_after");
    assert.equal(proposalPayload.proposal.applied, false);
    assert.ok(Array.isArray(proposalPayload.proposal.preview.affectedNodeIds));
    assert.ok(proposalPayload.proposal.preview.nodeAdds.length >= 1);
    assert.ok(proposalPayload.proposal.preview.edgeAdds.length >= 1);

    const applyResult = await runNodeScript([
      "scripts/poc-pilot.mjs",
      "--mode",
      "mock",
      "--artifact",
      initialPayload.paths.artifactPath,
      "--direction",
      direction,
      "--apply-direction",
      "--input",
      "{\"text\":\"pilot-direction-http-apply\"}",
      "--outdir",
      applyOutDir,
      "--journal-dir",
      journalDir,
      "--run-id",
      "pilot-direction-http-apply-001"
    ]);
    const applyPayload = parseJsonOutput(applyResult.stdout, "poc:pilot(direction-http-apply)");
    assert.equal(applyPayload.ok, true);
    assert.equal(applyPayload.status, "completed");
    assert.equal(applyPayload.runId, "pilot-direction-http-apply-001");
    assert.equal(applyPayload.proposal.applied, true);
    assert.equal(applyPayload.proposal.operationType, "add_http_after");
    assert.ok(applyPayload.executedNodeIds.includes("http-2"));
    assert.ok(applyPayload.executedNodeIds.includes("openai-success-1"));

    const sourceAfterRaw = await readFile(initialPayload.paths.artifactPath, "utf8");
    assert.equal(sourceAfterRaw, sourceBeforeRaw, "direction add-http apply must not mutate source artifact file");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("poc:pilot supports role-based direction without explicit node ids", async () => {
  const tempRoot = await mkdtemp(path.join(tmpdir(), "moonstone-poc-pilot-direction-role-loop-"));
  try {
    const outDir = path.join(tempRoot, "initial");
    const proposalOutDir = path.join(tempRoot, "proposal");
    const applyOutDir = path.join(tempRoot, "apply");
    const journalDir = path.join(tempRoot, "journal");

    const initialResult = await runNodeScript([
      "scripts/poc-pilot.mjs",
      "--mode",
      "mock",
      "--prompt",
      "POST https://api.example.com/orders then summarize result",
      "--input",
      "{\"text\":\"pilot-direction-role-initial\"}",
      "--outdir",
      outDir,
      "--journal-dir",
      journalDir,
      "--run-id",
      "pilot-direction-role-initial-001"
    ]);
    const initialPayload = parseJsonOutput(initialResult.stdout, "poc:pilot(initial-direction-role)");
    const sourceBeforeRaw = await readFile(initialPayload.paths.artifactPath, "utf8");

    const direction = "Connect trigger step to summary step.";
    const proposalResult = await runNodeScript([
      "scripts/poc-pilot.mjs",
      "--mode",
      "mock",
      "--artifact",
      initialPayload.paths.artifactPath,
      "--direction",
      direction,
      "--outdir",
      proposalOutDir,
      "--journal-dir",
      journalDir
    ]);
    const proposalPayload = parseJsonOutput(proposalResult.stdout, "poc:pilot(direction-role-proposal)");
    assert.equal(proposalPayload.ok, true);
    assert.equal(proposalPayload.status, "proposal_only");
    assert.equal(proposalPayload.proposal.operationType, "connect_nodes");
    assert.ok(Array.isArray(proposalPayload.proposal.resolvedAnchors));
    assert.ok(proposalPayload.proposal.resolvedAnchors.some((entry) => entry.nodeId === "trigger"));
    assert.ok(proposalPayload.proposal.resolvedAnchors.some((entry) => entry.nodeId === "openai-success-1"));

    const applyResult = await runNodeScript([
      "scripts/poc-pilot.mjs",
      "--mode",
      "mock",
      "--artifact",
      initialPayload.paths.artifactPath,
      "--direction",
      direction,
      "--apply-direction",
      "--input",
      "{\"text\":\"pilot-direction-role-apply\"}",
      "--outdir",
      applyOutDir,
      "--journal-dir",
      journalDir,
      "--run-id",
      "pilot-direction-role-apply-001"
    ]);
    const applyPayload = parseJsonOutput(applyResult.stdout, "poc:pilot(direction-role-apply)");
    assert.equal(applyPayload.ok, true);
    assert.equal(applyPayload.status, "completed");
    assert.equal(applyPayload.runId, "pilot-direction-role-apply-001");
    assert.equal(applyPayload.proposal.operationType, "connect_nodes");

    const sourceAfterRaw = await readFile(initialPayload.paths.artifactPath, "utf8");
    assert.equal(sourceAfterRaw, sourceBeforeRaw, "role-based direction apply must not mutate source artifact file");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("poc:pilot returns proposal-choice-required for ambiguous role anchors and enforces --proposal-id on apply", async () => {
  const tempRoot = await mkdtemp(path.join(tmpdir(), "moonstone-poc-pilot-direction-ambiguity-choice-"));
  try {
    const initialOutDir = path.join(tempRoot, "initial");
    const feedbackOutDir = path.join(tempRoot, "feedback");
    const proposalOutDir = path.join(tempRoot, "proposal");
    const applyOutDir = path.join(tempRoot, "apply");
    const journalDir = path.join(tempRoot, "journal");

    const initialResult = await runNodeScript([
      "scripts/poc-pilot.mjs",
      "--mode",
      "mock",
      "--prompt",
      "POST https://api.example.com/orders then summarize result",
      "--input",
      "{\"text\":\"pilot-direction-ambiguity-initial\"}",
      "--outdir",
      initialOutDir,
      "--journal-dir",
      journalDir,
      "--run-id",
      "pilot-direction-ambiguity-initial-001"
    ]);
    const initialPayload = parseJsonOutput(initialResult.stdout, "poc:pilot(initial-direction-ambiguity)");
    const sourceBeforeRaw = await readFile(initialPayload.paths.artifactPath, "utf8");

    const feedbackResult = await runNodeScript([
      "scripts/poc-pilot.mjs",
      "--mode",
      "mock",
      "--artifact",
      initialPayload.paths.artifactPath,
      "--feedback",
      "add openai after http-1 model gpt-4o-mini prompt \"Summarize result for operator.\" on success",
      "--input",
      "{\"text\":\"pilot-direction-ambiguity-feedback\"}",
      "--outdir",
      feedbackOutDir,
      "--journal-dir",
      journalDir,
      "--run-id",
      "pilot-direction-ambiguity-feedback-001"
    ]);
    const feedbackPayload = parseJsonOutput(feedbackResult.stdout, "poc:pilot(feedback-direction-ambiguity)");
    const ambiguousArtifactPath = feedbackPayload.lineage.effectiveArtifactPath;
    await expectFile(ambiguousArtifactPath);

    const direction = "After summary step, add a summary step for the operator.";
    const proposalResult = await runNodeScript([
      "scripts/poc-pilot.mjs",
      "--mode",
      "mock",
      "--artifact",
      ambiguousArtifactPath,
      "--direction",
      direction,
      "--outdir",
      proposalOutDir,
      "--journal-dir",
      journalDir
    ]);
    const proposalPayload = parseJsonOutput(proposalResult.stdout, "poc:pilot(direction-ambiguity-proposal)");
    assert.equal(proposalPayload.ok, true);
    assert.equal(proposalPayload.status, "proposal_choice_required");
    assert.equal(proposalPayload.runId, null);
    assert.equal(proposalPayload.proposal, null);
    assert.ok(Array.isArray(proposalPayload.proposalCandidates));
    assert.equal(proposalPayload.proposalCandidates.length, 2);

    const candidateNodeIds = proposalPayload.proposalCandidates.map((entry) => entry.operation.afterNodeId);
    assert.deepEqual(candidateNodeIds, [...candidateNodeIds].sort());
    assert.ok(proposalPayload.proposalCandidates.every((entry) => typeof entry.proposalId === "string"));

    await assert.rejects(
      () => runNodeScript([
        "scripts/poc-pilot.mjs",
        "--mode",
        "mock",
        "--artifact",
        ambiguousArtifactPath,
        "--direction",
        direction,
        "--apply-direction",
        "--input",
        "{\"text\":\"pilot-direction-ambiguity-apply-missing-proposal-id\"}",
        "--outdir",
        applyOutDir,
        "--journal-dir",
        journalDir,
        "--run-id",
        "pilot-direction-ambiguity-apply-missing-proposal-id-001"
      ]),
      /CHEF_DIRECTION_PROPOSAL_ID_REQUIRED/i
    );

    await assert.rejects(
      () => runNodeScript([
        "scripts/poc-pilot.mjs",
        "--mode",
        "mock",
        "--artifact",
        ambiguousArtifactPath,
        "--direction",
        direction,
        "--apply-direction",
        "--proposal-id",
        "proposal.invalid",
        "--input",
        "{\"text\":\"pilot-direction-ambiguity-apply-invalid-proposal-id\"}",
        "--outdir",
        applyOutDir,
        "--journal-dir",
        journalDir,
        "--run-id",
        "pilot-direction-ambiguity-apply-invalid-proposal-id-001"
      ]),
      /CHEF_DIRECTION_PROPOSAL_ID_UNKNOWN/i
    );

    const selectedProposalId = proposalPayload.proposalCandidates[0].proposalId;
    const applyResult = await runNodeScript([
      "scripts/poc-pilot.mjs",
      "--mode",
      "mock",
      "--artifact",
      ambiguousArtifactPath,
      "--direction",
      direction,
      "--apply-direction",
      "--proposal-id",
      selectedProposalId,
      "--input",
      "{\"text\":\"pilot-direction-ambiguity-apply\"}",
      "--outdir",
      applyOutDir,
      "--journal-dir",
      journalDir,
      "--run-id",
      "pilot-direction-ambiguity-apply-001"
    ]);
    const applyPayload = parseJsonOutput(applyResult.stdout, "poc:pilot(direction-ambiguity-apply)");
    assert.equal(applyPayload.ok, true);
    assert.equal(applyPayload.status, "completed");
    assert.equal(applyPayload.runId, "pilot-direction-ambiguity-apply-001");
    assert.equal(applyPayload.proposal.proposalId, selectedProposalId);
    assert.equal(applyPayload.proposal.applied, true);

    const sourceAfterRaw = await readFile(initialPayload.paths.artifactPath, "utf8");
    assert.equal(sourceAfterRaw, sourceBeforeRaw, "ambiguity-choice apply must not mutate original source artifact file");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
