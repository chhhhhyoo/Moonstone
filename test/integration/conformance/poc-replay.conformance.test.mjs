import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp, rm } from "node:fs/promises";
import { WorkflowRuntime } from "../../../src/core/poc/WorkflowRuntime.mjs";
import { FileRunJournalStore } from "../../../src/service/poc/FileRunJournalStore.mjs";

function replayArtifact() {
  return {
    artifactId: "workflow.replay",
    artifactVersion: "0.1.0",
    trigger: {
      type: "trigger.webhook",
      path: "/hooks/replay",
      method: "POST"
    },
    nodes: [
      {
        id: "http-1",
        type: "action.http",
        config: {
          url: "http://localhost/mock",
          method: "GET"
        },
        retry: {
          maxAttempts: 2,
          backoffMs: 1,
          maxBackoffMs: 1
        }
      }
    ],
    edges: [
      {
        from: "trigger",
        to: "http-1",
        on: "always"
      }
    ],
    defaults: {
      retry: {
        maxAttempts: 1,
        backoffMs: 1,
        maxBackoffMs: 1
      }
    },
    metadata: {}
  };
}

test("WorkflowRuntime replay reconstructs pending command and resume completes run", async () => {
  const tempRoot = await mkdtemp(path.join(tmpdir(), "moonstone-poc-replay-"));
  const journalStore = new FileRunJournalStore({ rootDir: tempRoot });
  let callCount = 0;

  const runtime = new WorkflowRuntime({
    journalStore,
    connectorExecutors: {
      "action.http": async () => {
        callCount += 1;
        return {
          status: 200,
          body: {
            ok: true
          }
        };
      }
    },
    sleep: async () => {}
  });

  await assert.rejects(
    async () => {
      await runtime.run({
        artifact: replayArtifact(),
        input: {
          text: "hello"
        },
        runId: "run-replay-1",
        crashAfterCommands: 1
      });
    },
    /Injected crash/
  );

  const replay = await runtime.replay({ runId: "run-replay-1" });
  assert.equal(replay.pendingCommands.length, 1);

  const resumed = await runtime.resume({ runId: "run-replay-1" });
  assert.equal(resumed.status, "completed");
  assert.equal(callCount, 1);

  const replayAgain = await runtime.replay({ runId: "run-replay-1" });
  assert.equal(replayAgain.status, "completed");
  assert.equal(replayAgain.pendingCommands.length, 0);

  await rm(tempRoot, { recursive: true, force: true });
});
