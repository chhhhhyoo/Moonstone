import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { parseJsonOutput, runNodeScript } from "./helpers/cli-e2e-helpers.mjs";

const execFileAsync = promisify(execFile);
const THIS_FILE = fileURLToPath(import.meta.url);
const THIS_DIR = path.dirname(THIS_FILE);
const FIXTURES_PATH = path.resolve(THIS_DIR, "../../fixtures/poc/poc-pilot-01-fixtures.json");
const CRITERIA_PATH = path.resolve(THIS_DIR, "../../fixtures/poc/poc-pilot-01-quality-criteria.json");

async function loadJson(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

function normalizeProposalPayload(payload) {
  return {
    status: payload.status,
    proposal: payload.proposal
      ? {
          proposalId: payload.proposal.proposalId,
          operationType: payload.proposal.operationType,
          operation: payload.proposal.operation
        }
      : null,
    proposalCandidates: Array.isArray(payload.proposalCandidates)
      ? payload.proposalCandidates.map((candidate) => ({
          proposalId: candidate.proposalId,
          operationType: candidate.operationType,
          operation: candidate.operation
        }))
      : []
  };
}

async function runNodeScriptAllowFailure(args, options = {}) {
  try {
    const result = await execFileAsync(process.execPath, args, {
      cwd: options.cwd ?? process.cwd(),
      env: {
        ...process.env,
        ...(options.env ?? {})
      }
    });
    return {
      ok: true,
      code: 0,
      stdout: result.stdout ?? "",
      stderr: result.stderr ?? ""
    };
  } catch (error) {
    return {
      ok: false,
      code: Number(error?.code ?? 1),
      stdout: String(error?.stdout ?? ""),
      stderr: String(error?.stderr ?? "")
    };
  }
}

test("poc:pilot Pilot-01 qualification matrix enforces lead-chef proposal/apply quality gates", async (t) => {
  const fixtures = await loadJson(FIXTURES_PATH);
  const criteria = await loadJson(CRITERIA_PATH);

  assert.ok(Array.isArray(fixtures), "fixtures must be an array");
  assert.ok(typeof criteria === "object" && criteria !== null, "criteria must be an object");
  assert.ok(
    fixtures.length >= criteria.minimumScenarioCount,
    "fixture count below Pilot-01 qualification minimum"
  );

  const fixtureIds = new Set(fixtures.map((fixture) => fixture.id));
  for (const scenarioId of criteria.requiredScenarioIds) {
    assert.ok(fixtureIds.has(scenarioId), `missing required Pilot-01 scenario fixture: ${scenarioId}`);
  }

  const commandCoverage = new Set();
  const observedEventTypes = new Set();
  let invalidScenarioCount = 0;
  let applyScenarioCount = 0;

  for (const fixture of fixtures) {
    await t.test(fixture.id, async () => {
      const tempRoot = await mkdtemp(path.join(tmpdir(), "moonstone-poc-pilot-01-qualification-"));
      try {
        const initialOutDir = path.join(tempRoot, "initial");
        const feedbackOutDir = path.join(tempRoot, "feedback");
        const proposalOutDir = path.join(tempRoot, "proposal");
        const applyOutDir = path.join(tempRoot, "apply");
        const journalDir = path.join(tempRoot, "journal");
        const initialRunId = `pilot01-${fixture.id}-initial`;
        const feedbackRunId = `pilot01-${fixture.id}-feedback`;
        const applyRunId = `pilot01-${fixture.id}-apply`;

        const initialResult = await runNodeScript([
          "scripts/poc-pilot.mjs",
          "--mode",
          "mock",
          "--prompt",
          fixture.prompt,
          "--input",
          `{"text":"${fixture.id}-initial"}`,
          "--outdir",
          initialOutDir,
          "--journal-dir",
          journalDir,
          "--run-id",
          initialRunId
        ]);
        commandCoverage.add("poc:pilot");
        const initialPayload = parseJsonOutput(initialResult.stdout, `poc:pilot(initial:${fixture.id})`);
        assert.equal(initialPayload.ok, true);
        assert.equal(initialPayload.status, "completed");
        assert.equal(initialPayload.runId, initialRunId);

        let directionArtifactPath = initialPayload.paths.artifactPath;
        let sourceArtifactPath = initialPayload.paths.artifactPath;
        if (fixture.feedback) {
          const feedbackResult = await runNodeScript([
            "scripts/poc-pilot.mjs",
            "--mode",
            "mock",
            "--artifact",
            initialPayload.paths.artifactPath,
            "--feedback",
            fixture.feedback,
            "--input",
            `{"text":"${fixture.id}-feedback"}`,
            "--outdir",
            feedbackOutDir,
            "--journal-dir",
            journalDir,
            "--run-id",
            feedbackRunId
          ]);
          commandCoverage.add("poc:pilot");
          const feedbackPayload = parseJsonOutput(feedbackResult.stdout, `poc:pilot(feedback:${fixture.id})`);
          assert.equal(feedbackPayload.ok, true);
          assert.equal(feedbackPayload.status, "completed");
          assert.equal(feedbackPayload.runId, feedbackRunId);
          directionArtifactPath = feedbackPayload.lineage.effectiveArtifactPath;
          sourceArtifactPath = feedbackPayload.lineage.sourceArtifactPath;
        }

        const sourceBefore = await readFile(sourceArtifactPath, "utf8");

        const proposalArgs = [
          "scripts/poc-pilot.mjs",
          "--mode",
          "mock",
          "--artifact",
          directionArtifactPath,
          "--direction",
          fixture.direction,
          "--outdir",
          proposalOutDir,
          "--journal-dir",
          journalDir
        ];

        if (fixture.expectedProposalErrorCode) {
          const proposalFailure = await runNodeScriptAllowFailure(proposalArgs);
          commandCoverage.add("poc:pilot");
          assert.equal(proposalFailure.ok, false);
          const payload = parseJsonOutput(proposalFailure.stdout, `poc:pilot(proposal-failure:${fixture.id})`);
          assert.equal(payload.ok, false);
          assert.equal(payload.error.code, fixture.expectedProposalErrorCode);
          invalidScenarioCount += 1;
          return;
        }

        const proposalResultFirst = await runNodeScript(proposalArgs);
        commandCoverage.add("poc:pilot");
        const proposalPayloadFirst = parseJsonOutput(proposalResultFirst.stdout, `poc:pilot(proposal:${fixture.id}:first)`);

        const proposalResultSecond = await runNodeScript(proposalArgs);
        commandCoverage.add("poc:pilot");
        const proposalPayloadSecond = parseJsonOutput(proposalResultSecond.stdout, `poc:pilot(proposal:${fixture.id}:second)`);

        assert.deepEqual(
          normalizeProposalPayload(proposalPayloadFirst),
          normalizeProposalPayload(proposalPayloadSecond),
          "proposal payload must be deterministic across repeated runs"
        );

        assert.equal(proposalPayloadFirst.ok, true);
        assert.equal(proposalPayloadFirst.status, fixture.expectedProposalStatus);

        if (fixture.expectedProposalStatus === "proposal_only") {
          assert.ok(proposalPayloadFirst.proposal);
          assert.equal(proposalPayloadFirst.proposal.operationType, fixture.expectedOperationType);
        }

        if (fixture.expectedProposalStatus === "proposal_choice_required") {
          assert.equal(proposalPayloadFirst.proposal, null);
          assert.ok(Array.isArray(proposalPayloadFirst.proposalCandidates));
          assert.equal(proposalPayloadFirst.proposalCandidates.length, fixture.expectedCandidateCount);

          const candidateNodeIds = proposalPayloadFirst.proposalCandidates.map((entry) => entry.operation.afterNodeId);
          assert.deepEqual(candidateNodeIds, [...candidateNodeIds].sort());
          assert.ok(
            proposalPayloadFirst.proposalCandidates.every((entry) => entry.operationType === fixture.expectedOperationType),
            "all ambiguous candidates must map to expected operation type"
          );
        }

        if (fixture.expectApply === "error") {
          const applyArgs = [
            "scripts/poc-pilot.mjs",
            "--mode",
            "mock",
            "--artifact",
            directionArtifactPath,
            "--direction",
            fixture.direction,
            "--apply-direction",
            "--input",
            `{"text":"${fixture.id}-apply-error"}`,
            "--outdir",
            applyOutDir,
            "--journal-dir",
            journalDir,
            "--run-id",
            applyRunId
          ];

          if (fixture.expectedApplyErrorCode === "CHEF_DIRECTION_PROPOSAL_ID_UNKNOWN") {
            applyArgs.push("--proposal-id", "proposal.invalid");
          }

          const applyFailure = await runNodeScriptAllowFailure(applyArgs);
          commandCoverage.add("poc:pilot");
          assert.equal(applyFailure.ok, false);
          const payload = parseJsonOutput(applyFailure.stdout, `poc:pilot(apply-failure:${fixture.id})`);
          assert.equal(payload.ok, false);
          assert.equal(payload.error.code, fixture.expectedApplyErrorCode);
          invalidScenarioCount += 1;
          return;
        }

        if (fixture.expectApply === "success") {
          const applyArgs = [
            "scripts/poc-pilot.mjs",
            "--mode",
            "mock",
            "--artifact",
            directionArtifactPath,
            "--direction",
            fixture.direction,
            "--apply-direction",
            "--input",
            `{"text":"${fixture.id}-apply-success"}`,
            "--outdir",
            applyOutDir,
            "--journal-dir",
            journalDir,
            "--run-id",
            applyRunId
          ];
          if (proposalPayloadFirst.status === "proposal_choice_required") {
            applyArgs.push("--proposal-id", proposalPayloadFirst.proposalCandidates[0].proposalId);
          }

          const applyResult = await runNodeScript(applyArgs);
          commandCoverage.add("poc:pilot");
          const applyPayload = parseJsonOutput(applyResult.stdout, `poc:pilot(apply:${fixture.id})`);
          assert.equal(applyPayload.ok, true);
          assert.equal(applyPayload.status, "completed");
          assert.equal(applyPayload.runId, applyRunId);
          assert.equal(applyPayload.proposal?.applied, true);
          applyScenarioCount += 1;

          const inspectResult = await runNodeScript([
            "scripts/poc-inspect.mjs",
            "--run-id",
            applyRunId,
            "--journal-dir",
            journalDir
          ]);
          commandCoverage.add("poc:inspect");
          const inspection = parseJsonOutput(inspectResult.stdout, `poc:inspect(${fixture.id})`);
          assert.ok(Array.isArray(inspection.timeline) && inspection.timeline.length > 0);
          for (const event of inspection.timeline) {
            observedEventTypes.add(event.eventType);
          }

          const replayResult = await runNodeScript([
            "scripts/poc-replay.mjs",
            "--run-id",
            applyRunId,
            "--journal-dir",
            journalDir
          ]);
          commandCoverage.add("poc:replay");
          const replayPayload = parseJsonOutput(replayResult.stdout, `poc:replay(${fixture.id})`);
          assert.equal(replayPayload.status, applyPayload.status);
        }

        const sourceAfter = await readFile(sourceArtifactPath, "utf8");
        assert.equal(sourceAfter, sourceBefore, "pilot direction loop must not mutate source artifact");
      } finally {
        await rm(tempRoot, { recursive: true, force: true });
      }
    });
  }

  for (const commandName of criteria.requiredCommandCoverage) {
    assert.ok(commandCoverage.has(commandName), `missing required command coverage: ${commandName}`);
  }

  for (const eventType of criteria.requiredEventTypes) {
    assert.ok(observedEventTypes.has(eventType), `missing required timeline event type: ${eventType}`);
  }

  assert.ok(
    invalidScenarioCount >= criteria.requiredInvalidScenarioCount,
    `invalid scenario coverage below minimum: ${invalidScenarioCount}/${criteria.requiredInvalidScenarioCount}`
  );
  assert.ok(
    applyScenarioCount >= criteria.requiredApplyScenarioCount,
    `apply scenario coverage below minimum: ${applyScenarioCount}/${criteria.requiredApplyScenarioCount}`
  );
});
