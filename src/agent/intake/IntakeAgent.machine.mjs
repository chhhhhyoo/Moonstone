export const IntakeAgentMachine = {
  id: "intake-machine",
  initial: "idle",
  states: ["idle", "waiting_input", "processing_lookup", "completed", "failed"],
  persistableStates: ["waiting_input"],
  terminalStates: ["completed", "failed"],
  transition(currentState, event, payload) {
    if (event !== "RUN") {
      return { nextState: "failed", action: "invalid_event" };
    }

    const text = String(payload?.text ?? "").toLowerCase();
    if (currentState === "idle") {
      if (text.includes("wait")) {
        return { nextState: "waiting_input", action: "request_followup" };
      }
      if (text.includes("lookup")) {
        return { nextState: "processing_lookup", action: "lookup" };
      }
      return { nextState: "completed", action: "acknowledge" };
    }

    if (currentState === "waiting_input") {
      if (text.includes("confirm")) {
        return { nextState: "completed", action: "confirm_complete" };
      }
      return { nextState: "waiting_input", action: "request_followup" };
    }

    return { nextState: "failed", action: "invalid_transition" };
  }
};
