import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { parseJsonOutput, runNodeScript } from "./helpers/cli-e2e-helpers.mjs";
const THIS_FILE = fileURLToPath(import.meta.url);
const THIS_DIR = path.dirname(THIS_FILE);
const RUNBOOK_FIXTURES_PATH = path.resolve(THIS_DIR, "../../fixtures/poc/poc-demo-runbook-fixtures.json");
const QUALIFICATION_CRITERIA_PATH = path.resolve(THIS_DIR, "../../fixtures/poc/poc-demo-quality-criteria.json");

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

      if (route === "always-fail" || (route === "fail-once" && current === 1)) {
        response.writeHead(500, { "Content-Type": "application/json" });
        response.end(JSON.stringify({
          ok: false,
          route,
          attempt: current
        }));
        return;
      }

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({
        ok: true,
        route,
        attempt: current
      }));
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

test("poc demo runbook qualification matrix is deterministic and CLI-executable", async (t) => {
  const fixtures = await loadJson(RUNBOOK_FIXTURES_PATH);
  const criteria = await loadJson(QUALIFICATION_CRITERIA_PATH);

  assert.ok(Array.isArray(fixtures), "fixtures must be an array");
  assert.ok(typeof criteria === "object" && criteria !== null, "criteria must be an object");
  assert.ok(
    fixtures.length >= criteria.minimumScenarioCount,
    "fixture count below demo qualification minimum"
  );

  const fixtureIds = new Set(fixtures.map((fixture) => fixture.id));
  for (const scenarioId of criteria.requiredScenarioIds) {
    assert.ok(fixtureIds.has(scenarioId), `missing required demo scenario fixture: ${scenarioId}`);
  }

  const commandCoverage = new Set();
  const observedEventTypes = new Set();
  let retryScenarioCount = 0;
  let failureBranchScenarioCount = 0;

  const demoServer = await startDemoProviderServer();
  try {
    for (const fixture of fixtures) {
      await t.test(fixture.id, async () => {
        const tempRoot = await mkdtemp(path.join(tmpdir(), "moonstone-poc-demo-qualification-"));
        try {
          const artifactPath = path.join(tempRoot, `${fixture.id}.artifact.json`);
          const diagnosticsPath = path.join(tempRoot, `${fixture.id}.diagnostics.json`);
          const inputPath = path.join(tempRoot, `${fixture.id}.input.json`);
          const journalDir = path.join(tempRoot, "journal");
          const runId = `demo-${fixture.id}`;

          await writeFile(inputPath, `${JSON.stringify(fixture.input ?? {}, null, 2)}\n`, "utf8");

          const compileResult = await runNodeScript([
            "scripts/poc-compile.mjs",
            "--prompt",
            fixture.prompt,
            "--http-url",
            `${demoServer.origin}/vendor/${fixture.httpRoute}`,
            "--out",
            artifactPath,
            "--diagnostics-out",
            diagnosticsPath
          ]);
          commandCoverage.add("poc:compile");
          const compileOutput = parseJsonOutput(compileResult.stdout, "poc:compile");
          assert.equal(compileOutput.diagnostics.branchMode, fixture.expected.branchMode);

          await runNodeScript([
            "scripts/poc-validate.mjs",
            "--artifact",
            artifactPath
          ]);
          commandCoverage.add("poc:validate");

          const runResult = await runNodeScript(
            [
              "scripts/poc-run.mjs",
              "--artifact",
              artifactPath,
              "--input",
              inputPath,
              "--journal-dir",
              journalDir,
              "--run-id",
              runId
            ],
            {
              env: {
                OPENAI_BASE_URL: `${demoServer.origin}/v1`,
                OPENAI_API_KEY: "test-key"
              }
            }
          );
          commandCoverage.add("poc:run");

          const runOutput = parseJsonOutput(runResult.stdout, "poc:run");
          assert.equal(
            runOutput.runId,
            runId,
            "poc:run must honor --run-id for deterministic inspect/replay workflows"
          );
          assert.equal(runOutput.status, fixture.expected.status);
          assert.deepEqual(runOutput.pendingCommands, []);
          assert.deepEqual(runOutput.attempts, fixture.expected.attempts);

          const executedNodeIds = Object.keys(runOutput.nodeResults).sort();
          const expectedNodeIds = [...fixture.expected.executedNodeIds].sort();
          assert.deepEqual(executedNodeIds, expectedNodeIds);

          if ((runOutput.attempts?.["http-1"] ?? 0) > 1) {
            retryScenarioCount += 1;
          }
          if (executedNodeIds.includes("openai-failure-1")) {
            failureBranchScenarioCount += 1;
          }

          const inspectResult = await runNodeScript([
            "scripts/poc-inspect.mjs",
            "--run-id",
            runId,
            "--journal-dir",
            journalDir
          ]);
          commandCoverage.add("poc:inspect");

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
          commandCoverage.add("poc:replay");

          const replay = parseJsonOutput(replayResult.stdout, "poc:replay");
          assert.equal(replay.status, runOutput.status);
          assert.deepEqual(replay.attempts, runOutput.attempts);
          assert.deepEqual(Object.keys(replay.nodeResults).sort(), expectedNodeIds);
        } finally {
          await rm(tempRoot, { recursive: true, force: true });
        }
      });
    }
  } finally {
    await demoServer.close();
  }

  for (const commandName of criteria.requiredCommandCoverage) {
    assert.ok(commandCoverage.has(commandName), `missing required command coverage: ${commandName}`);
  }

  for (const eventType of criteria.requiredEventTypes) {
    assert.ok(observedEventTypes.has(eventType), `missing required timeline event type: ${eventType}`);
  }

  assert.ok(
    retryScenarioCount >= criteria.requiredRetryScenarioCount,
    `retry scenario coverage below minimum: ${retryScenarioCount}/${criteria.requiredRetryScenarioCount}`
  );
  assert.ok(
    failureBranchScenarioCount >= criteria.requiredFailureBranchScenarioCount,
    `failure branch coverage below minimum: ${failureBranchScenarioCount}/${criteria.requiredFailureBranchScenarioCount}`
  );
});
