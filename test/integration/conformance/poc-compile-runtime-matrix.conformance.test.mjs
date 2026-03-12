import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { compilePrompt } from "../../../src/core/poc/PromptCompiler.mjs";
import { WorkflowRuntime } from "../../../src/core/poc/WorkflowRuntime.mjs";
import { FileRunJournalStore } from "../../../src/service/poc/FileRunJournalStore.mjs";

const FIXED_NOW = () => new Date("2026-03-12T09:30:00.000Z");

const THIS_FILE = fileURLToPath(import.meta.url);
const THIS_DIR = path.dirname(THIS_FILE);
const RUNTIME_FIXTURES_PATH = path.resolve(THIS_DIR, "../../fixtures/poc/prompt-runtime-fixtures.json");

async function loadRuntimeFixtures() {
  const raw = await readFile(RUNTIME_FIXTURES_PATH, "utf8");
  const fixtures = JSON.parse(raw);
  assert.ok(Array.isArray(fixtures) && fixtures.length > 0, "runtime fixture set must be non-empty");
  return fixtures;
}

test("compile-to-runtime fixture matrix enforces expected branch outcomes", async (t) => {
  const fixtures = await loadRuntimeFixtures();

  for (const fixture of fixtures) {
    await t.test(fixture.id, async () => {
      const tempRoot = await mkdtemp(path.join(tmpdir(), "moonstone-poc-runtime-matrix-"));
      try {
        const { artifact, diagnostics } = compilePrompt({
          prompt: fixture.prompt,
          now: FIXED_NOW
        });

        assert.equal(diagnostics.branchMode, fixture.expected.branchMode);
        if (fixture.expected.warningIncludes) {
          assert.ok(
            diagnostics.warnings.some((warning) => warning.includes(fixture.expected.warningIncludes))
          );
        } else {
          assert.equal(diagnostics.warnings.length, 0);
        }

        const journalStore = new FileRunJournalStore({ rootDir: tempRoot });
        const runtime = new WorkflowRuntime({
          journalStore,
          connectorExecutors: {
            "action.http": async () => {
              if (fixture.httpBehavior === "fail") {
                throw new Error(`forced-http-failure:${fixture.id}`);
              }
              return {
                status: 200,
                body: {
                  ok: true
                }
              };
            },
            "action.openai": async ({ command }) => ({
              text: `executed:${command.nodeId}`
            })
          },
          sleep: async () => {}
        });

        const run = await runtime.run({
          artifact,
          input: fixture.input ?? {},
          runId: `runtime-matrix-${fixture.id}`
        });

        assert.equal(run.status, fixture.expected.status);
        assert.deepEqual(run.pendingCommands, []);
        assert.deepEqual(run.attempts, fixture.expected.attempts);

        const executedNodeIds = Object.keys(run.nodeResults).sort();
        const expectedNodeIds = [...fixture.expected.executedNodeIds].sort();
        assert.deepEqual(executedNodeIds, expectedNodeIds);
      } finally {
        await rm(tempRoot, { recursive: true, force: true });
      }
    });
  }
});
