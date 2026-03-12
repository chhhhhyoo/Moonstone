import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import {
  parseJsonOutput,
  runNodeScript,
  spawnNodeScript,
  stopNodeProcess,
  waitForHttpOk,
  getAvailablePort
} from "./helpers/cli-e2e-helpers.mjs";
const THIS_FILE = fileURLToPath(import.meta.url);
const THIS_DIR = path.dirname(THIS_FILE);
const FIXTURES_PATH = path.resolve(THIS_DIR, "../../fixtures/poc/poc-webhook-e2e-fixtures.json");
const CRITERIA_PATH = path.resolve(THIS_DIR, "../../fixtures/poc/poc-webhook-e2e-quality-criteria.json");

async function loadJson(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function readJsonRequestBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) {
    return {};
  }
  return JSON.parse(raw);
}

async function startDemoProviderServer() {
  const callCounts = new Map();
  const server = http.createServer(async (request, response) => {
    if (!request.url) {
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "missing-url" }));
      return;
    }

    if (request.url.startsWith("/vendor/")) {
      const route = request.url.slice("/vendor/".length);
      const current = (callCounts.get(route) ?? 0) + 1;
      callCounts.set(route, current);
      await readJsonRequestBody(request);

      if (route === "always-fail") {
        response.writeHead(500, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ ok: false, route, attempt: current }));
        return;
      }

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ ok: true, route, attempt: current }));
      return;
    }

    if (request.method === "POST" && request.url === "/v1/chat/completions") {
      const payload = await readJsonRequestBody(request);
      const userPrompt = payload?.messages?.[0]?.content ?? "";
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({
        choices: [
          {
            message: {
              content: `mock-openai:${userPrompt}`
            }
          }
        ]
      }));
      return;
    }

    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "not-found", path: request.url }));
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Could not resolve demo provider server address.");
  }

  const origin = `http://127.0.0.1:${address.port}`;
  return {
    origin,
    close: () => new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    })
  };
}

test("poc webhook E2E qualification enforces deterministic run-id and replay continuity", async (t) => {
  const fixtures = await loadJson(FIXTURES_PATH);
  const criteria = await loadJson(CRITERIA_PATH);

  assert.ok(Array.isArray(fixtures), "fixtures must be an array");
  assert.ok(typeof criteria === "object" && criteria !== null, "criteria must be an object");
  assert.ok(
    fixtures.length >= criteria.minimumScenarioCount,
    "fixture count below webhook qualification minimum"
  );

  const fixtureIds = new Set(fixtures.map((fixture) => fixture.id));
  for (const scenarioId of criteria.requiredScenarioIds) {
    assert.ok(fixtureIds.has(scenarioId), `missing required webhook scenario fixture: ${scenarioId}`);
  }

  const observedCoverageSteps = new Set();
  const observedEventTypes = new Set();
  let headerOverrideScenarioCount = 0;
  let uuidFallbackScenarioCount = 0;

  for (const fixture of fixtures) {
    await t.test(fixture.id, async () => {
      const tempRoot = await mkdtemp(path.join(tmpdir(), "moonstone-poc-webhook-e2e-"));
      const providerServer = await startDemoProviderServer();
      let serveProcess = null;
      try {
        const artifactPath = path.join(tempRoot, `${fixture.id}.artifact.json`);
        const inputPath = path.join(tempRoot, `${fixture.id}.input.json`);
        const journalDir = path.join(tempRoot, "journal");
        const port = await getAvailablePort();

        await writeFile(inputPath, `${JSON.stringify(fixture.input ?? {}, null, 2)}\n`, "utf8");

        await runNodeScript([
          "scripts/poc-compile.mjs",
          "--prompt",
          fixture.prompt,
          "--http-url",
          `${providerServer.origin}/vendor/${fixture.httpRoute}`,
          "--out",
          artifactPath
        ]);

        const artifact = JSON.parse(await readFile(artifactPath, "utf8"));
        const triggerPath = artifact?.trigger?.path;
        assert.equal(typeof triggerPath, "string");
        assert.ok(triggerPath.startsWith("/hooks/"), "compiled trigger path must start with /hooks/");

        serveProcess = spawnNodeScript([
          "scripts/poc-serve.mjs",
          "--artifact",
          artifactPath,
          "--journal-dir",
          journalDir,
          "--host",
          "127.0.0.1",
          "--port",
          String(port),
          "--run-id-header",
          "x-moonstone-run-id"
        ], {
          env: {
            OPENAI_BASE_URL: `${providerServer.origin}/v1`,
            OPENAI_API_KEY: "test-key"
          }
        });

        let serveStderr = "";
        serveProcess.stderr.on("data", (chunk) => {
          serveStderr += chunk.toString();
        });

        await waitForHttpOk(`http://127.0.0.1:${port}/health`);
        observedCoverageSteps.add("health");

        const headers = {
          "Content-Type": "application/json"
        };
        if (fixture.runIdHeaderValue) {
          headers["x-moonstone-run-id"] = fixture.runIdHeaderValue;
        }

        const triggerResponse = await fetch(`http://127.0.0.1:${port}${triggerPath}`, {
          method: "POST",
          headers,
          body: JSON.stringify(fixture.input ?? {})
        });
        observedCoverageSteps.add("trigger");
        assert.equal(triggerResponse.status, 200, `trigger failed: ${serveStderr}`);

        const runSummary = await triggerResponse.json();
        assert.equal(runSummary.status, fixture.expected.status);
        assert.deepEqual(runSummary.attempts, fixture.expected.attempts);
        const executedNodeIds = Object.keys(runSummary.nodeResults).sort();
        assert.deepEqual(executedNodeIds, [...fixture.expected.executedNodeIds].sort());

        const runId = runSummary.runId;
        assert.equal(typeof runId, "string");
        assert.ok(runId.length > 0, "runId must be non-empty");
        if (fixture.runIdHeaderValue) {
          headerOverrideScenarioCount += 1;
          assert.equal(
            runId,
            fixture.runIdHeaderValue,
            "webhook runId must use x-moonstone-run-id override when provided"
          );
        } else {
          uuidFallbackScenarioCount += 1;
        }

        const inspectResult = await runNodeScript([
          "scripts/poc-inspect.mjs",
          "--run-id",
          runId,
          "--journal-dir",
          journalDir
        ]);
        observedCoverageSteps.add("inspect");
        const inspection = parseJsonOutput(inspectResult.stdout, "poc:inspect");
        assert.ok(Array.isArray(inspection.timeline) && inspection.timeline.length > 0);
        for (const event of inspection.timeline) {
          observedEventTypes.add(event.eventType);
        }

        const replayResult = await runNodeScript([
          "scripts/poc-replay.mjs",
          "--run-id",
          runId,
          "--journal-dir",
          journalDir
        ]);
        observedCoverageSteps.add("replay");
        const replay = parseJsonOutput(replayResult.stdout, "poc:replay");
        assert.equal(replay.status, runSummary.status);
        assert.deepEqual(replay.attempts, runSummary.attempts);
      } finally {
        await stopNodeProcess(serveProcess);
        await providerServer.close();
        await rm(tempRoot, { recursive: true, force: true });
      }
    });
  }

  for (const coverageStep of criteria.requiredCoverageSteps) {
    assert.ok(observedCoverageSteps.has(coverageStep), `missing required webhook coverage step: ${coverageStep}`);
  }

  for (const eventType of criteria.requiredEventTypes) {
    assert.ok(observedEventTypes.has(eventType), `missing required timeline event type: ${eventType}`);
  }

  assert.ok(
    headerOverrideScenarioCount >= criteria.requiredHeaderOverrideScenarioCount,
    `header override coverage below minimum: ${headerOverrideScenarioCount}/${criteria.requiredHeaderOverrideScenarioCount}`
  );
  assert.ok(
    uuidFallbackScenarioCount >= criteria.requiredUuidFallbackScenarioCount,
    `uuid fallback coverage below minimum: ${uuidFallbackScenarioCount}/${criteria.requiredUuidFallbackScenarioCount}`
  );
});
