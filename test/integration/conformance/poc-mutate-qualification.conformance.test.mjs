import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { parseJsonOutput, runNodeScript } from "./helpers/cli-e2e-helpers.mjs";

const execFileAsync = promisify(execFile);
const THIS_FILE = fileURLToPath(import.meta.url);
const THIS_DIR = path.dirname(THIS_FILE);
const CRITERIA_PATH = path.resolve(THIS_DIR, "../../fixtures/poc/poc-mutate-quality-criteria.json");

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

async function fileExists(filePath) {
  try {
    const info = await stat(filePath);
    return info.isFile();
  } catch {
    return false;
  }
}

async function runNodeScriptAllowFailure(args, options = {}) {
  try {
    const result = await execFileAsync(process.execPath, args, {
      cwd: options.cwd ?? process.cwd(),
      env: {
        ...process.env,
        ...(options.env ?? {})
      }
    });
    return {
      ok: true,
      code: 0,
      stdout: result.stdout ?? "",
      stderr: result.stderr ?? ""
    };
  } catch (error) {
    return {
      ok: false,
      code: Number(error?.code ?? 1),
      stdout: String(error?.stdout ?? ""),
      stderr: String(error?.stderr ?? "")
    };
  }
}

async function startDemoProviderServer() {
  const server = http.createServer(async (request, response) => {
    if (!request.url) {
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "missing-url" }));
      return;
    }

    if (request.url.startsWith("/vendor/")) {
      await readJsonRequestBody(request);
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({
        ok: true,
        source: "mutate-conformance-http"
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
    throw new Error("Could not resolve conformance provider server address.");
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

test("poc:mutate qualification matrix enforces deterministic prompt mutation behavior", async (t) => {
  const criteria = await loadJson(CRITERIA_PATH);
  const scenarioTemplates = [
    {
      id: "add-http-after",
      promptTemplate: "add http after http-1 method GET url {origin}/vendor/orders/summary on success",
      expectOk: true,
      expectedOperationType: "add_http_after"
    },
    {
      id: "replace-node-tool",
      promptTemplate: "replace node openai-success-1 with http method GET url {origin}/vendor/orders/final",
      expectOk: true,
      expectedOperationType: "replace_node_tool"
    },
    {
      id: "rewire-connect",
      promptTemplate: "connect http-1 to openai-success-1 on failed",
      expectOk: true,
      expectedOperationType: "connect_nodes"
    },
    {
      id: "remove-leaf",
      promptTemplate: "remove leaf node openai-success-1",
      expectOk: true,
      expectedOperationType: "remove_leaf_node"
    },
    {
      id: "invalid-ambiguous",
      promptTemplate: "add http after http-1 method GET url {origin}/vendor/orders/summary and connect http-1 to openai-success-1 on failed",
      expectOk: false
    },
    {
      id: "invalid-cycle",
      promptTemplate: "connect openai-success-1 to http-1 on success",
      expectOk: false
    }
  ];

  assert.ok(scenarioTemplates.length >= criteria.minimumScenarioCount, "scenario count below mutate qualification minimum");

  const scenarioIds = new Set(scenarioTemplates.map((scenario) => scenario.id));
  for (const requiredId of criteria.requiredScenarioIds) {
    assert.ok(scenarioIds.has(requiredId), `missing required mutate scenario: ${requiredId}`);
  }

  const observedCommandCoverage = new Set();
  const observedEventTypes = new Set();
  let invalidScenarioCount = 0;

  const providerServer = await startDemoProviderServer();
  try {
    const scenarios = scenarioTemplates.map((scenario) => ({
      ...scenario,
      prompt: scenario.promptTemplate.replaceAll("{origin}", providerServer.origin)
    }));

    for (const scenario of scenarios) {
      await t.test(scenario.id, async () => {
        const tempRoot = await mkdtemp(path.join(tmpdir(), "moonstone-poc-mutate-qualification-"));
        try {
          const artifactPath = path.join(tempRoot, `${scenario.id}.artifact.json`);
          const mutatedArtifactPath = path.join(tempRoot, `${scenario.id}.mutated.json`);
          const journalDir = path.join(tempRoot, "journal");
          const runId = `mutate-${scenario.id}`;

          await runNodeScript([
            "scripts/poc-compile.mjs",
            "--prompt",
            "POST https://api.example.com/orders then summarize result",
            "--http-url",
            `${providerServer.origin}/vendor/orders`,
            "--out",
            artifactPath
          ]);
          observedCommandCoverage.add("poc:compile");

          const sourceBefore = JSON.parse(await readFile(artifactPath, "utf8"));
          const mutateResult = await runNodeScriptAllowFailure([
            "scripts/poc-mutate.mjs",
            "--artifact",
            artifactPath,
            "--prompt",
            scenario.prompt,
            "--out",
            mutatedArtifactPath
          ]);
          observedCommandCoverage.add("poc:mutate");

          if (!scenario.expectOk) {
            invalidScenarioCount += 1;
            assert.equal(mutateResult.ok, false);
            const payload = parseJsonOutput(mutateResult.stdout, "poc:mutate(failure)");
            assert.equal(payload.ok, false);
            assert.ok(payload.error?.code);
            assert.ok(payload.error?.message);
            assert.equal(await fileExists(mutatedArtifactPath), false);
            return;
          }

          assert.equal(mutateResult.ok, true);
          const mutationPayload = parseJsonOutput(mutateResult.stdout, "poc:mutate");
          assert.equal(mutationPayload.ok, true);
          assert.equal(mutationPayload.operationType, scenario.expectedOperationType);
          assert.equal(mutationPayload.outputArtifactPath, mutatedArtifactPath);
          assert.equal(await fileExists(mutatedArtifactPath), true);

          const sourceAfter = JSON.parse(await readFile(artifactPath, "utf8"));
          assert.deepEqual(sourceAfter, sourceBefore, "source artifact must remain unchanged");

          const runResult = await runNodeScript(
            [
              "scripts/poc-run.mjs",
              "--artifact",
              mutatedArtifactPath,
              "--input",
              "{\"text\":\"mutate-qualification\"}",
              "--journal-dir",
              journalDir,
              "--run-id",
              runId
            ],
            {
              env: {
                OPENAI_BASE_URL: `${providerServer.origin}/v1`,
                OPENAI_API_KEY: "test-key"
              }
            }
          );
          observedCommandCoverage.add("poc:run");

          const runPayload = parseJsonOutput(runResult.stdout, "poc:run");
          assert.equal(runPayload.status, "completed");
          assert.equal(runPayload.runId, runId);

          const inspectResult = await runNodeScript([
            "scripts/poc-inspect.mjs",
            "--run-id",
            runId,
            "--journal-dir",
            journalDir
          ]);
          observedCommandCoverage.add("poc:inspect");
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
          observedCommandCoverage.add("poc:replay");
          const replay = parseJsonOutput(replayResult.stdout, "poc:replay");
          assert.equal(replay.status, runPayload.status);
        } finally {
          await rm(tempRoot, { recursive: true, force: true });
        }
      });
    }
  } finally {
    await providerServer.close();
  }

  for (const commandName of criteria.requiredCommandCoverage) {
    assert.ok(observedCommandCoverage.has(commandName), `missing required command coverage: ${commandName}`);
  }
  for (const eventType of criteria.requiredEventTypes) {
    assert.ok(observedEventTypes.has(eventType), `missing required timeline event type: ${eventType}`);
  }
  assert.ok(
    invalidScenarioCount >= criteria.requiredInvalidScenarioCount,
    `invalid scenario coverage below minimum: ${invalidScenarioCount}/${criteria.requiredInvalidScenarioCount}`
  );
});
