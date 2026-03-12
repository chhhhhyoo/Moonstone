import { HttpConnector } from "./HttpConnector.mjs";
import { OpenAIConnector } from "./OpenAIConnector.mjs";

export function createDefaultConnectorExecutors(options = {}) {
  const httpConnector = new HttpConnector();
  const openaiConnector = new OpenAIConnector(options.openai ?? {});

  return {
    "action.http": async (params) => httpConnector.execute(params),
    "action.openai": async (params) => openaiConnector.execute(params)
  };
}
