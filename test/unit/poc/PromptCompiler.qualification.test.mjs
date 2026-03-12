import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compilePrompt } from "../../../src/core/poc/PromptCompiler.mjs";

const FIXED_NOW = () => new Date("2026-03-12T09:15:00.000Z");

const THIS_FILE = fileURLToPath(import.meta.url);
const THIS_DIR = path.dirname(THIS_FILE);
const FIXTURES_PATH = path.resolve(THIS_DIR, "../../fixtures/poc/prompt-compile-fixtures.json");
const CRITERIA_PATH = path.resolve(THIS_DIR, "../../fixtures/poc/prompt-compile-quality-criteria.json");

async function loadJson(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

function pairKey(trueOp, falseOp) {
  return `${trueOp}|${falseOp}`;
}

test("PromptCompiler satisfies qualification criteria contract", async () => {
  const fixtures = await loadJson(FIXTURES_PATH);
  const criteria = await loadJson(CRITERIA_PATH);

  assert.ok(Array.isArray(fixtures), "fixtures must be an array");
  assert.ok(typeof criteria === "object" && criteria !== null, "criteria must be an object");
  assert.ok(fixtures.length >= criteria.minimumFixtureCount, "fixture count below qualification minimum");

  const fixtureIds = new Set(fixtures.map((fixture) => fixture.id));
  for (const scenarioId of criteria.requiredScenarioIds) {
    assert.ok(fixtureIds.has(scenarioId), `missing required scenario fixture: ${scenarioId}`);
  }

  const branchModesObserved = new Set();
  const comparatorPairsObserved = new Set();
  let warningScenarioCount = 0;
  let failureBranchScenarioCount = 0;

  for (const fixture of fixtures) {
    let baseline = null;
    for (let run = 0; run < criteria.determinism.runsPerFixture; run += 1) {
      const compiled = compilePrompt({
        prompt: fixture.prompt,
        now: FIXED_NOW
      });

      if (baseline === null) {
        baseline = compiled;
        continue;
      }

      assert.deepEqual(
        compiled,
        baseline,
        `non-deterministic compile output for fixture '${fixture.id}' at run ${run + 1}`
      );
    }

    const { artifact, diagnostics } = baseline;
    assert.equal(diagnostics.branchMode, fixture.expected.branchMode);
    branchModesObserved.add(diagnostics.branchMode);

    if (diagnostics.warnings.length > 0) {
      warningScenarioCount += 1;
    }

    if (artifact.edges.some((edge) => edge.on === "failed")) {
      failureBranchScenarioCount += 1;
    }

    const successConditionOps = new Set(
      artifact.edges
        .filter((edge) => edge.on === "success" && edge.condition)
        .map((edge) => edge.condition.op)
    );

    for (const pair of criteria.requiredComparatorPairs) {
      if (successConditionOps.has(pair.trueOp) && successConditionOps.has(pair.falseOp)) {
        comparatorPairsObserved.add(pairKey(pair.trueOp, pair.falseOp));
      }
    }
  }

  for (const mode of criteria.requiredBranchModes) {
    assert.ok(branchModesObserved.has(mode), `missing required branch mode coverage: ${mode}`);
  }

  assert.ok(
    warningScenarioCount >= criteria.requiredWarningScenarioCount,
    `warning scenario coverage below minimum: ${warningScenarioCount}/${criteria.requiredWarningScenarioCount}`
  );
  assert.ok(
    failureBranchScenarioCount >= criteria.requiredFailureBranchScenarioCount,
    `failure branch scenario coverage below minimum: ${failureBranchScenarioCount}/${criteria.requiredFailureBranchScenarioCount}`
  );

  for (const pair of criteria.requiredComparatorPairs) {
    const key = pairKey(pair.trueOp, pair.falseOp);
    assert.ok(
      comparatorPairsObserved.has(key),
      `missing required comparator pair coverage: ${pair.trueOp}/${pair.falseOp}`
    );
  }
});
