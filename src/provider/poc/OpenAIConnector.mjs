import { renderTemplate } from "../../core/poc/WorkflowArtifact.mjs";

export class OpenAIConnector {
  constructor({ apiKey = process.env.OPENAI_API_KEY, baseUrl = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1" } = {}) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  async execute({ node, scope }) {
    const config = node.config ?? {};
    const model = String(config.model ?? "").trim();
    if (!model) {
      throw new Error("OpenAI connector requires config.model.");
    }

    if (!this.apiKey) {
      throw new Error("OpenAI connector requires OPENAI_API_KEY or explicit apiKey.");
    }

    const promptTemplate = String(config.prompt ?? "");
    const prompt = renderTemplate(promptTemplate, scope);

    const body = {
      model,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body)
    });

    const raw = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(`OpenAI ${response.status}: ${JSON.stringify(raw)}`);
    }

    const text = raw?.choices?.[0]?.message?.content;
    return {
      text: typeof text === "string" ? text : "",
      raw
    };
  }
}
