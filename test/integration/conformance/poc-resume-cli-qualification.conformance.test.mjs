import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { createServer } from "node:http";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { WorkflowRuntime } from "../../../src/core/poc/WorkflowRuntime.mjs";
import { FileRunJournalStore } from "../../../src/service/poc/FileRunJournalStore.mjs";
import { parseJsonOutput, runNodeScript } from "./helpers/cli-e2e-helpers.mjs";

function buildArtifact(httpUrl) {
  return {
    artifactId: "workflow.resume-cli-qualification",
    artifactVersion: "0.1.0",
    trigger: {
      type: "trigger.webhook",
      path: "/hooks/resume-cli-qualification",
      method: "POST"
    },
    nodes: [
      {
        id: "http-1",
        type: "action.http",
        config: {
          url: httpUrl,
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: {
            text: "{{input.text}}"
          }
        },
        retry: {
          maxAttempts: 1,
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

async function withHttpServer(handler) {
  const requests = [];
  const server = createServer(async (req, res) => {
    let body = "";
    for await (const chunk of req) {
      body += chunk;
    }
    requests.push({
      method: req.method,
      url: req.url,
      body: body ? JSON.parse(body) : null
    });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({
      ok: true
    }));
  });

  await new Promise((resolve, reject) => {
    server.listen(0, "127.0.0.1", (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(undefined);
    });
  });

  try {
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Could not resolve test server address.");
    }
    await handler({
      requests,
      url: `http://127.0.0.1:${address.port}/mock`
    });
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(undefined);
      });
    });
  }
}

test("poc:resume CLI completes crash-interrupted run and preserves inspect/replay determinism", async () => {
  const tempRoot = await mkdtemp(path.join(tmpdir(), "moonstone-poc-resume-cli-"));
  const journalDir = path.join(tempRoot, "journal");
  const runId = "resume-cli-qualification-001";

  try {
    await withHttpServer(async ({ requests, url }) => {
      const journalStore = new FileRunJournalStore({ rootDir: journalDir });
      const runtime = new WorkflowRuntime({
        journalStore,
        connectorExecutors: {
          "action.http": async () => ({ ok: true })
        },
        sleep: async () => {}
      });

      await assert.rejects(
        async () => {
          await runtime.run({
            artifact: buildArtifact(url),
            input: {
              text: "resume-cli-qualification"
            },
            runId,
            crashAfterCommands: 1
          });
        },
        /Injected crash/
      );

      const replayBeforeResume = await runtime.replay({ runId });
      assert.equal(replayBeforeResume.status, "running");
      assert.equal(replayBeforeResume.pendingCommands.length, 1);

      const resumeResult = await runNodeScript([
        "scripts/poc-resume.mjs",
        "--run-id",
        runId,
        "--journal-dir",
        journalDir
      ]);
      const resumed = parseJsonOutput(resumeResult.stdout, "poc:resume");
      assert.equal(resumed.runId, runId);
      assert.equal(resumed.status, "completed");
      assert.deepEqual(resumed.attempts, {
        "http-1": 1
      });

      assert.equal(requests.length, 1);
      assert.deepEqual(requests[0].body, {
        text: "resume-cli-qualification"
      });

      const inspectResult = await runNodeScript([
        "scripts/poc-inspect.mjs",
        "--run-id",
        runId,
        "--journal-dir",
        journalDir
      ]);
      const inspection = parseJsonOutput(inspectResult.stdout, "poc:inspect");
      const eventTypes = inspection.timeline.map((event) => event.eventType);
      assert.ok(eventTypes.includes("command_emitted"));
      assert.ok(eventTypes.includes("receipt_recorded"));
      assert.ok(eventTypes.includes("run_finished"));

      const replayResult = await runNodeScript([
        "scripts/poc-replay.mjs",
        "--run-id",
        runId,
        "--journal-dir",
        journalDir
      ]);
      const replayAfterResume = parseJsonOutput(replayResult.stdout, "poc:replay");
      assert.equal(replayAfterResume.status, "completed");
      assert.equal(replayAfterResume.pendingCommands.length, 0);
    });
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
