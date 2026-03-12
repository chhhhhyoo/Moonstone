import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { WorkflowRuntime } from "../../../src/core/poc/WorkflowRuntime.mjs";
import { FileRunJournalStore } from "../../../src/service/poc/FileRunJournalStore.mjs";

function artifactWithFailureBranch() {
  return {
    artifactId: "workflow.retry-branch",
    artifactVersion: "0.1.0",
    trigger: {
      type: "trigger.webhook",
      path: "/hooks/retry",
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
          maxBackoffMs: 2
        }
      },
      {
        id: "openai-1",
        type: "action.openai",
        config: {
          model: "gpt-4o-mini",
          prompt: "final"
        }
      }
    ],
    edges: [
      { from: "trigger", to: "http-1", on: "always" },
      { from: "http-1", to: "openai-1", on: "success" }
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

function artifactWithFailedRoute() {
  return {
    artifactId: "workflow.failed-route",
    artifactVersion: "0.1.0",
    trigger: {
      type: "trigger.webhook",
      path: "/hooks/fail",
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
          maxAttempts: 1,
          backoffMs: 1,
          maxBackoffMs: 1
        }
      },
      {
        id: "openai-fallback",
        type: "action.openai",
        config: {
          model: "gpt-4o-mini",
          prompt: "fallback"
        }
      }
    ],
    edges: [
      { from: "trigger", to: "http-1", on: "always" },
      { from: "http-1", to: "openai-fallback", on: "failed" }
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

test("WorkflowRuntime retries failed node and completes after success", async () => {
  const tempRoot = await mkdtemp(path.join(tmpdir(), "moonstone-poc-runtime-"));
  const journalStore = new FileRunJournalStore({ rootDir: tempRoot });
  let callCount = 0;

  const runtime = new WorkflowRuntime({
    journalStore,
    connectorExecutors: {
      "action.http": async () => {
        callCount += 1;
        if (callCount === 1) {
          throw new Error("transient failure");
        }
        return { status: 200, body: { ok: true } };
      },
      "action.openai": async () => ({ text: "done" })
    },
    sleep: async () => {}
  });

  const run = await runtime.run({
    artifact: artifactWithFailureBranch(),
    input: {
      text: "hello"
    }
  });

  assert.equal(run.status, "completed");
  assert.equal(callCount, 2);

  const journalPath = journalStore.getRunPath(run.runId);
  const raw = await readFile(journalPath, "utf8");
  const lines = raw.trim().split("\n");
  const commandEvents = lines.filter((line) => line.includes('"eventType":"command_emitted"'));
  assert.equal(commandEvents.length >= 3, true);

  await rm(tempRoot, { recursive: true, force: true });
});

test("WorkflowRuntime routes to failure edge when retries are exhausted", async () => {
  const tempRoot = await mkdtemp(path.join(tmpdir(), "moonstone-poc-runtime-"));
  const journalStore = new FileRunJournalStore({ rootDir: tempRoot });
  let openaiCalls = 0;

  const runtime = new WorkflowRuntime({
    journalStore,
    connectorExecutors: {
      "action.http": async () => {
        throw new Error("hard failure");
      },
      "action.openai": async () => {
        openaiCalls += 1;
        return { text: "fallback result" };
      }
    },
    sleep: async () => {}
  });

  const run = await runtime.run({
    artifact: artifactWithFailedRoute(),
    input: {
      text: "hello"
    }
  });

  assert.equal(run.status, "completed");
  assert.equal(openaiCalls, 1);

  await rm(tempRoot, { recursive: true, force: true });
});
