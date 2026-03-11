import { AgentIntent } from "../core/AgentIntent.mjs";
import { IntakeAgent } from "../agent/intake/IntakeAgent.mjs";
import { ActiveAgentDefinitions } from "../agent/registry.mjs";

export class AgentFactory {
  constructor({ researchProvider }) {
    this.researchProvider = researchProvider;
  }

  createAgent(intent) {
    if (intent === AgentIntent.INTAKE) {
      return new IntakeAgent({ provider: this.researchProvider });
    }
    throw new Error(`Unsupported intent: ${intent}`);
  }

  listActiveDefinitions() {
    return ActiveAgentDefinitions;
  }
}
