import http from "node:http";

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON body.");
  }
}

function resolveOptionalRunId(request, runIdHeaderName) {
  const headerKey = String(runIdHeaderName ?? "").trim().toLowerCase();
  if (!headerKey) {
    return null;
  }

  const raw = request.headers[headerKey];
  if (raw === undefined) {
    return null;
  }

  if (Array.isArray(raw)) {
    const first = String(raw[0] ?? "").trim();
    return first ? first : null;
  }

  const value = String(raw).trim();
  return value ? value : null;
}

export function startWebhookServer({
  runtime,
  artifact,
  port = 3000,
  host = "0.0.0.0",
  logger = console,
  runIdHeader = "x-moonstone-run-id"
}) {
  const triggerPath = artifact.trigger.path;
  const triggerMethod = String(artifact.trigger.method ?? "POST").toUpperCase();

  const server = http.createServer(async (request, response) => {
    if (!request.url) {
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "Missing request URL." }));
      return;
    }

    if (request.method === "GET" && request.url === "/health") {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ ok: true }));
      return;
    }

    if (request.url !== triggerPath || String(request.method).toUpperCase() !== triggerMethod) {
      response.writeHead(404, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "Route not found." }));
      return;
    }

    try {
      const payload = await readJsonBody(request);
      const runId = resolveOptionalRunId(request, runIdHeader);
      const result = await runtime.run({ artifact, input: payload, runId });
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(result));
    } catch (error) {
      response.writeHead(500, { "Content-Type": "application/json" });
      response.end(JSON.stringify({
        error: error instanceof Error ? error.message : String(error)
      }));
    }
  });

  server.listen(port, host, () => {
    logger.log(`POC webhook server listening on http://${host}:${port}${triggerPath} (runIdHeader=${runIdHeader})`);
  });

  return server;
}
