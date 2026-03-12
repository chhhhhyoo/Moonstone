import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { once } from "node:events";
import { HttpConnector } from "../../../src/provider/poc/HttpConnector.mjs";
import { OpenAIConnector } from "../../../src/provider/poc/OpenAIConnector.mjs";

function startServer(handler) {
  const server = http.createServer(handler);
  server.listen(0, "127.0.0.1");
  return once(server, "listening").then(() => server);
}

test("HttpConnector maps successful HTTP response", async () => {
  const server = await startServer((_req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
  });

  const address = server.address();
  const connector = new HttpConnector();
  const result = await connector.execute({
    node: {
      id: "http-1",
      type: "action.http",
      config: {
        url: `http://127.0.0.1:${address.port}/health`,
        method: "GET"
      }
    },
    scope: {}
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.ok, true);
  server.close();
});

test("OpenAIConnector maps chat completion payload", async () => {
  const server = await startServer(async (req, res) => {
    if (req.method !== "POST") {
      res.writeHead(405);
      res.end();
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      id: "chatcmpl-1",
      choices: [
        {
          message: {
            content: "summary"
          }
        }
      ]
    }));
  });

  const address = server.address();
  const connector = new OpenAIConnector({
    apiKey: "test-key",
    baseUrl: `http://127.0.0.1:${address.port}`
  });

  const result = await connector.execute({
    node: {
      id: "openai-1",
      type: "action.openai",
      config: {
        model: "gpt-4o-mini",
        prompt: "hello"
      }
    },
    scope: {
      input: {
        text: "hello"
      }
    }
  });

  assert.equal(result.text, "summary");
  assert.equal(result.raw.id, "chatcmpl-1");
  server.close();
});
