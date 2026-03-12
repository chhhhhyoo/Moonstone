import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp, rm } from "node:fs/promises";
import { WorkflowRuntime } from "../../../src/core/poc/WorkflowRuntime.mjs";
import { FileRunJournalStore } from "../../../src/service/poc/FileRunJournalStore.mjs";
import { startWebhookServer } from "../../../src/provider/poc/WebhookServer.mjs";

function webhookArtifact() {
  return {
    artifactId: "workflow.webhook",
    artifactVersion: "0.1.0",
    trigger: {
      type: "trigger.webhook",
      path: "/hooks/webhook",
      method: "POST"
    },
    nodes: [
      {
        id: "http-1",
        type: "action.http",
        config: {
          url: "http://localhost/mock",
          method: "GET"
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

test("Webhook server ingress starts workflow run", async () => {
  const tempRoot = await mkdtemp(path.join(tmpdir(), "moonstone-poc-webhook-"));
  const journalStore = new FileRunJournalStore({ rootDir: tempRoot });

  const runtime = new WorkflowRuntime({
    journalStore,
    connectorExecutors: {
      "action.http": async () => ({ status: 200, body: { ok: true } })
    },
    sleep: async () => {}
  });

  const server = startWebhookServer({
    runtime,
    artifact: webhookArtifact(),
    port: 0,
    host: "127.0.0.1",
    logger: {
      log: () => {}
    }
  });

  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();

  const response = await fetch(`http://127.0.0.1:${address.port}/hooks/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text: "hello"
    })
  });

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status, "completed");

  server.close();
  await rm(tempRoot, { recursive: true, force: true });
});
