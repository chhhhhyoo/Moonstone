import { AgentIntentValues } from "./contracts.mjs";

export const AgentIntent = Object.freeze({
  INTAKE: "INTAKE",
  OTHER: "OTHER"
});

export function isAgentIntent(value) {
  return AgentIntentValues.includes(value);
}

export function classifyIntent(text) {
  const normalized = String(text ?? "").toLowerCase();
  if (
    normalized.includes("intake") ||
    normalized.includes("wait") ||
    normalized.includes("lookup") ||
    normalized.includes("confirm")
  ) {
    return AgentIntent.INTAKE;
  }
  return AgentIntent.OTHER;
}
