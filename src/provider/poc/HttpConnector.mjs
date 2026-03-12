import { renderTemplate } from "../../core/poc/WorkflowArtifact.mjs";

function renderValue(value, scope) {
  if (typeof value === "string") {
    return renderTemplate(value, scope);
  }
  if (Array.isArray(value)) {
    return value.map((item) => renderValue(item, scope));
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, nested] of Object.entries(value)) {
      out[key] = renderValue(nested, scope);
    }
    return out;
  }
  return value;
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

export class HttpConnector {
  async execute({ node, scope }) {
    const config = node.config ?? {};
    const method = String(config.method ?? "GET").toUpperCase();
    const url = renderTemplate(String(config.url ?? ""), scope);
    if (!url) {
      throw new Error("HTTP connector requires config.url.");
    }

    const headers = renderValue(config.headers ?? {}, scope);
    const bodyTemplate = config.body;
    const hasBody = bodyTemplate !== undefined && method !== "GET" && method !== "HEAD";
    const bodyValue = hasBody ? renderValue(bodyTemplate, scope) : undefined;

    const request = {
      method,
      headers: {
        ...headers
      }
    };

    if (hasBody) {
      const shouldJsonEncode = typeof bodyValue === "object" && bodyValue !== null;
      request.body = shouldJsonEncode ? JSON.stringify(bodyValue) : String(bodyValue);
      if (shouldJsonEncode && !request.headers["Content-Type"] && !request.headers["content-type"]) {
        request.headers["Content-Type"] = "application/json";
      }
    }

    const response = await fetch(url, request);
    const parsed = await parseResponse(response);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${typeof parsed === "string" ? parsed : JSON.stringify(parsed)}`);
    }

    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: parsed
    };
  }
}
