import test from "node:test";
import assert from "node:assert/strict";
import { IntakeAgentMachine } from "../../../src/agent/intake/IntakeAgent.machine.mjs";

test("IntakeAgent.machine transitions to waiting_input on wait signal", () => {
  const transition = IntakeAgentMachine.transition("idle", "RUN", { text: "please wait" });
  assert.equal(transition.nextState, "waiting_input");
  assert.equal(transition.action, "request_followup");
});

test("IntakeAgent.machine transitions waiting_input to completed on confirm", () => {
  const transition = IntakeAgentMachine.transition("waiting_input", "RUN", { text: "confirm now" });
  assert.equal(transition.nextState, "completed");
  assert.equal(transition.action, "confirm_complete");
});
