import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compilePrompt } from "../../../src/core/poc/PromptCompiler.mjs";

const FIXED_NOW = () => new Date("2026-03-12T09:00:00.000Z");

const THIS_FILE = fileURLToPath(import.meta.url);
const THIS_DIR = path.dirname(THIS_FILE);
const FIXTURES_PATH = path.resolve(THIS_DIR, "../../fixtures/poc/prompt-compile-fixtures.json");

async function loadFixtures() {
  const raw = await readFile(FIXTURES_PATH, "utf8");
  const parsed = JSON.parse(raw);
  assert.ok(Array.isArray(parsed) && parsed.length > 0);
  return parsed;
}

test("PromptCompiler fixture matrix remains deterministic and topology-stable", async (t) => {
  const fixtures = await loadFixtures();

  for (const fixture of fixtures) {
    await t.test(fixture.id, () => {
      const first = compilePrompt({
        prompt: fixture.prompt,
        now: FIXED_NOW
      });
      const second = compilePrompt({
        prompt: fixture.prompt,
        now: FIXED_NOW
      });

      assert.deepEqual(first, second, "compile output must be deterministic for fixed input/time");

      const { artifact, diagnostics } = first;
      assert.equal(diagnostics.branchMode, fixture.expected.branchMode);

      const actualNodeIds = artifact.nodes.map((node) => node.id).sort();
      const expectedNodeIds = [...fixture.expected.nodeIds].sort();
      assert.deepEqual(actualNodeIds, expectedNodeIds);

      const conditionEdges = artifact.edges
        .filter((edge) => edge.condition)
        .map((edge) => ({
          path: edge.condition.path,
          op: edge.condition.op,
          value: edge.condition.value
        }))
        .sort((left, right) => `${left.path}:${left.op}:${left.value}`.localeCompare(`${right.path}:${right.op}:${right.value}`));

      const expectedConditionEdges = [...fixture.expected.conditionEdges]
        .sort((left, right) => `${left.path}:${left.op}:${left.value}`.localeCompare(`${right.path}:${right.op}:${right.value}`));
      assert.deepEqual(conditionEdges, expectedConditionEdges);

      if (fixture.expected.failedEdgeTo) {
        const failedEdge = artifact.edges.find((edge) => edge.on === "failed");
        assert.ok(failedEdge);
        assert.equal(failedEdge.to, fixture.expected.failedEdgeTo);
      }

      if (fixture.expected.warningIncludes) {
        assert.ok(
          diagnostics.warnings.some((warning) => warning.includes(fixture.expected.warningIncludes))
        );
      } else {
        assert.equal(diagnostics.warnings.length, 0);
      }
    });
  }
});
