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
const FIXTURES_PATH = path.resolve(THIS_DIR, "../../fixtures/poc/poc-intent-synthesis-fixtures.json");
const CRITERIA_PATH = path.resolve(THIS_DIR, "../../fixtures/poc/poc-intent-synthesis-quality-criteria.json");
const PACKAGE_JSON_PATH = path.resolve(THIS_DIR, "../../../package.json");

async function loadJson(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
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

test("poc:intent-synthesis qualification matrix enforces synthesized diagnostics and fail-closed conflicts", async (t) => {
  const fixtures = await loadJson(FIXTURES_PATH);
  const criteria = await loadJson(CRITERIA_PATH);

  assert.ok(Array.isArray(fixtures), "fixtures must be an array");
  assert.ok(typeof criteria === "object" && criteria !== null, "criteria must be an object");
  assert.ok(
    fixtures.length >= criteria.minimumScenarioCount,
    "fixture count below intent-synthesis qualification minimum"
  );

  const fixtureIds = new Set(fixtures.map((fixture) => fixture.id));
  for (const scenarioId of criteria.requiredScenarioIds) {
    assert.ok(fixtureIds.has(scenarioId), `missing required intent-synthesis scenario fixture: ${scenarioId}`);
  }

  const commandCoverage = new Set();
  const observedEventTypes = new Set();
  let conflictScenarioCount = 0;
  let unsupportedScenarioCount = 0;
  let applyScenarioCount = 0;

  for (const fixture of fixtures) {
    await t.test(fixture.id, async () => {
      const tempRoot = await mkdtemp(path.join(tmpdir(), "moonstone-poc-intent-synthesis-qualification-"));
      try {
        const initialOutDir = path.join(tempRoot, "initial");
        const proposalOutDir = path.join(tempRoot, "proposal");
        const applyOutDir = path.join(tempRoot, "apply");
        const journalDir = path.join(tempRoot, "journal");
        const initialRunId = `intent-synth-${fixture.id}-initial`;
        const applyRunId = `intent-synth-${fixture.id}-apply`;

        const initialResult = await runNodeScript([
          "scripts/poc-pilot.mjs",
          "--mode",
          "mock",
          "--prompt",
          fixture.prompt,
          "--input",
          `{\"text\":\"${fixture.id}-initial\"}`,
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

        const proposalArgs = [
          "scripts/poc-pilot.mjs",
          "--mode",
          "mock",
          "--artifact",
          initialPayload.paths.artifactPath,
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

          if (fixture.expectedProposalErrorCode === "CHEF_DIRECTION_UNSUPPORTED") {
            unsupportedScenarioCount += 1;
          } else {
            conflictScenarioCount += 1;
          }
          return;
        }

        const proposalResult = await runNodeScript(proposalArgs);
        commandCoverage.add("poc:pilot");
        const proposalPayload = parseJsonOutput(proposalResult.stdout, `poc:pilot(proposal:${fixture.id})`);
        assert.equal(proposalPayload.ok, true);
        assert.equal(proposalPayload.status, fixture.expectedProposalStatus);
        assert.ok(proposalPayload.proposalPack);
        assert.equal(proposalPayload.proposalPack.diagnostics.mode, fixture.expectedDiagnosticsMode);
        assert.equal(proposalPayload.proposalPack.diagnostics.synthesisApplied, fixture.expectedSynthesisApplied);
        assert.deepEqual(proposalPayload.proposalPack.diagnostics.derivedClauses, fixture.expectedDerivedClauses);
        assert.deepEqual(proposalPayload.proposalPack.diagnostics.intentSignals, fixture.expectedIntentSignals);

        if (!fixture.expectApply) {
          return;
        }

        const applyResult = await runNodeScript([
          "scripts/poc-pilot.mjs",
          "--mode",
          "mock",
          "--artifact",
          initialPayload.paths.artifactPath,
          "--direction",
          fixture.direction,
          "--apply-direction",
          "--input",
          `{\"text\":\"${fixture.id}-apply\"}`,
          "--outdir",
          applyOutDir,
          "--journal-dir",
          journalDir,
          "--run-id",
          applyRunId
        ]);
        commandCoverage.add("poc:pilot");
        const applyPayload = parseJsonOutput(applyResult.stdout, `poc:pilot(apply:${fixture.id})`);
        assert.equal(applyPayload.ok, true);
        assert.equal(applyPayload.status, "completed");
        assert.equal(applyPayload.runId, applyRunId);
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
      } finally {
        await rm(tempRoot, { recursive: true, force: true });
      }
    });
  }

  const packageJson = await loadJson(PACKAGE_JSON_PATH);
  const qualifyScript = packageJson?.scripts?.["poc:qualify:intent-synthesis"];
  assert.equal(
    typeof qualifyScript,
    "string",
    "missing npm script: poc:qualify:intent-synthesis"
  );
  commandCoverage.add("poc:qualify:intent-synthesis");

  for (const commandName of criteria.requiredCommandCoverage) {
    assert.ok(commandCoverage.has(commandName), `missing required command coverage: ${commandName}`);
  }

  for (const eventType of criteria.requiredEventTypes) {
    assert.ok(observedEventTypes.has(eventType), `missing required timeline event type: ${eventType}`);
  }

  assert.ok(
    conflictScenarioCount >= criteria.requiredConflictScenarioCount,
    `conflict scenario coverage below minimum: ${conflictScenarioCount}/${criteria.requiredConflictScenarioCount}`
  );
  assert.ok(
    unsupportedScenarioCount >= criteria.requiredUnsupportedScenarioCount,
    `unsupported scenario coverage below minimum: ${unsupportedScenarioCount}/${criteria.requiredUnsupportedScenarioCount}`
  );
  assert.ok(
    applyScenarioCount >= criteria.requiredApplyScenarioCount,
    `apply scenario coverage below minimum: ${applyScenarioCount}/${criteria.requiredApplyScenarioCount}`
  );
});
