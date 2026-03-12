import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { compilePrompt } from "../../../src/core/poc/PromptCompiler.mjs";
import { WorkflowRuntime } from "../../../src/core/poc/WorkflowRuntime.mjs";
import { FileRunJournalStore } from "../../../src/service/poc/FileRunJournalStore.mjs";

const FIXED_NOW = () => new Date("2026-03-12T09:45:00.000Z");

const THIS_FILE = fileURLToPath(import.meta.url);
const THIS_DIR = path.dirname(THIS_FILE);
const FAULT_FIXTURES_PATH = path.resolve(THIS_DIR, "../../fixtures/poc/prompt-fault-fixtures.json");

class CrashAfterPersistEventJournalStore extends FileRunJournalStore {
  constructor({ rootDir, crashEventType, maxCrashes = 1 }) {
    super({ rootDir });
    this.crashEventType = crashEventType;
    this.remainingCrashes = maxCrashes;
  }

  async appendEvent(runId, event) {
    await super.appendEvent(runId, event);
    if (event?.eventType === this.crashEventType && this.remainingCrashes > 0) {
      this.remainingCrashes -= 1;
      throw new Error(`Injected crash after persisting event '${this.crashEventType}'.`);
    }
  }
}

async function loadFaultFixtures() {
  const raw = await readFile(FAULT_FIXTURES_PATH, "utf8");
  const fixtures = JSON.parse(raw);
  assert.ok(Array.isArray(fixtures) && fixtures.length > 0, "fault fixture set must be non-empty");
  return fixtures;
}

function shouldFailByPattern(pattern, index) {
  if (!Array.isArray(pattern) || pattern.length === 0) {
    return false;
  }
  const safeIndex = Math.min(index, pattern.length - 1);
  return Boolean(pattern[safeIndex]);
}

test("fault-injection runtime matrix preserves deterministic retry/failure outcomes", async (t) => {
  const fixtures = await loadFaultFixtures();

  for (const fixture of fixtures) {
    await t.test(fixture.id, async () => {
      const tempRoot = await mkdtemp(path.join(tmpdir(), "moonstone-poc-fault-matrix-"));
      try {
        const { artifact, diagnostics } = compilePrompt({
          prompt: fixture.prompt,
          now: FIXED_NOW
        });
        assert.equal(diagnostics.branchMode, fixture.expected.branchMode);

        const journalStore = fixture.crashEventType
          ? new CrashAfterPersistEventJournalStore({
            rootDir: tempRoot,
            crashEventType: fixture.crashEventType
          })
          : new FileRunJournalStore({ rootDir: tempRoot });

        let httpCallCount = 0;
        const runtime = new WorkflowRuntime({
          journalStore,
          connectorExecutors: {
            "action.http": async () => {
              const shouldFail = shouldFailByPattern(fixture.httpFailurePattern, httpCallCount);
              httpCallCount += 1;
              if (shouldFail) {
                throw new Error(`forced-http-failure:${fixture.id}:${httpCallCount}`);
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

        const runId = `fault-matrix-${fixture.id}`;
        let runSummary;

        if (fixture.crashEventType) {
          await assert.rejects(
            async () => {
              await runtime.run({
                artifact,
                input: fixture.input ?? {},
                runId
              });
            },
            new RegExp(`Injected crash after persisting event '${fixture.crashEventType}'`)
          );

          runSummary = await runtime.resume({ runId });
        } else {
          runSummary = await runtime.run({
            artifact,
            input: fixture.input ?? {},
            runId
          });
        }

        assert.equal(runSummary.status, fixture.expected.status);
        assert.deepEqual(runSummary.pendingCommands, []);
        assert.deepEqual(runSummary.attempts, fixture.expected.attempts);

        const executedNodeIds = Object.keys(runSummary.nodeResults).sort();
        const expectedNodeIds = [...fixture.expected.executedNodeIds].sort();
        assert.deepEqual(executedNodeIds, expectedNodeIds);
      } finally {
        await rm(tempRoot, { recursive: true, force: true });
      }
    });
  }
});
