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

test("WorkflowRuntime resume recovers when crash happens after receipt persistence", async () => {
  const tempRoot = await mkdtemp(path.join(tmpdir(), "moonstone-poc-replay-receipt-crash-"));
  const journalStore = new CrashAfterPersistEventJournalStore({
    rootDir: tempRoot,
    crashEventType: "receipt_recorded"
  });

  let httpCount = 0;
  let openaiCount = 0;

  const runtime = new WorkflowRuntime({
    journalStore,
    connectorExecutors: {
      "action.http": async () => {
        httpCount += 1;
        return {
          status: 200,
          body: {
            ok: true
          }
        };
      },
      "action.openai": async () => {
        openaiCount += 1;
        return {
          model: "gpt-4o-mini",
          outputText: "ok"
        };
      }
    },
    sleep: async () => {}
  });

  const artifact = {
    ...replayArtifact(),
    nodes: [
      replayArtifact().nodes[0],
      {
        id: "openai-1",
        type: "action.openai",
        config: {
          model: "gpt-4o-mini",
          prompt: "summarize"
        }
      }
    ],
    edges: [
      {
        from: "trigger",
        to: "http-1",
        on: "always"
      },
      {
        from: "http-1",
        to: "openai-1",
        on: "success"
      }
    ]
  };

  await assert.rejects(
    async () => {
      await runtime.run({
        artifact,
        input: {
          text: "hello"
        },
        runId: "run-replay-receipt-crash-1"
      });
    },
    /Injected crash after persisting event 'receipt_recorded'/
  );

  const replay = await runtime.replay({ runId: "run-replay-receipt-crash-1" });
  assert.equal(replay.pendingCommands.length, 0);
  assert.equal(replay.queue.length, 0);

  const resumed = await runtime.resume({ runId: "run-replay-receipt-crash-1" });
  assert.equal(resumed.status, "completed");
  assert.equal(httpCount, 1);
  assert.equal(openaiCount, 1);
  assert.equal(resumed.nodeResults["openai-1"].outcome, "success");

  await rm(tempRoot, { recursive: true, force: true });
});

test("WorkflowRuntime resume recovers when crash happens after retry scheduling", async () => {
  const tempRoot = await mkdtemp(path.join(tmpdir(), "moonstone-poc-replay-retry-crash-"));
  const journalStore = new CrashAfterPersistEventJournalStore({
    rootDir: tempRoot,
    crashEventType: "retry_scheduled"
  });

  let callCount = 0;
  const runtime = new WorkflowRuntime({
    journalStore,
    connectorExecutors: {
      "action.http": async () => {
        callCount += 1;
        if (callCount === 1) {
          throw new Error("first-attempt-failure");
        }
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
        runId: "run-replay-retry-crash-1"
      });
    },
    /Injected crash after persisting event 'retry_scheduled'/
  );

  const replay = await runtime.replay({ runId: "run-replay-retry-crash-1" });
  assert.equal(replay.pendingCommands.length, 0);
  assert.equal(replay.queue.length, 0);

  const resumed = await runtime.resume({ runId: "run-replay-retry-crash-1" });
  assert.equal(resumed.status, "completed");
  assert.equal(callCount, 2);
  assert.equal(resumed.nodeResults["http-1"].outcome, "success");

  await rm(tempRoot, { recursive: true, force: true });
});
