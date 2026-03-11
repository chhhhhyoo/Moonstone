import { BaseFsmAgent } from "../BaseFsmAgent.mjs";
import { createOperationReceipt } from "../../core/OperationReceipt.mjs";
import { IntakeAgentDefinition } from "./IntakeAgent.def.mjs";
import { IntakeAgentMachine } from "./IntakeAgent.machine.mjs";
import { validateIntakeInput, validateIntakeOutput } from "./IntakeAgent.schema.mjs";

export class IntakeAgent extends BaseFsmAgent {
  constructor({ provider }) {
    super({ definition: IntakeAgentDefinition, machine: IntakeAgentMachine });
    this.provider = provider;
  }

  async handle({ input, sessionKey }) {
    validateIntakeInput(input);
    const transition = this.machine.transition(this.currentState, "RUN", input);
    this.currentState = transition.nextState;

    const result = {
      messages: [],
      reactions: [],
      state: this.currentState,
      persistSession: this.machine.persistableStates.includes(this.currentState),
      receipts: [],
      handoff: null
    };

    if (transition.action === "request_followup") {
      result.messages.push("Need follow-up input. Reply with `confirm` to complete.");
      validateIntakeOutput(result);
      return result;
    }

    if (transition.action === "confirm_complete" || transition.action === "acknowledge") {
      result.messages.push("Intake completed.");
      this.currentState = "completed";
      result.state = this.currentState;
      result.persistSession = false;
      validateIntakeOutput(result);
      return result;
    }

    if (transition.action === "lookup") {
      try {
        const providerResult = await this.provider.query({ query: input.text });
        result.messages.push(`Lookup completed: ${providerResult.items[0].title}`);
        this.currentState = "completed";
        result.state = this.currentState;
        result.persistSession = false;
        result.receipts.push(
          createOperationReceipt({
            agentId: this.id,
            sessionKey,
            action: "provider.query",
            input,
            outcome: "success",
            providerRefs: [this.provider.providerName]
          })
        );
      } catch (error) {
        this.currentState = "failed";
        result.state = this.currentState;
        result.persistSession = false;
        result.messages.push(`Lookup failed: ${error.message}`);
        result.receipts.push(
          createOperationReceipt({
            agentId: this.id,
            sessionKey,
            action: "provider.query",
            input,
            outcome: "failed",
            providerRefs: [this.provider.providerName],
            policyFlags: ["provider-failure"]
          })
        );
      }
      validateIntakeOutput(result);
      return result;
    }

    this.currentState = "failed";
    result.state = this.currentState;
    result.persistSession = false;
    result.messages.push("Invalid transition.");
    validateIntakeOutput(result);
    return result;
  }
}
