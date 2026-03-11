import test from "node:test";
import assert from "node:assert/strict";
import { normalizeRestRequest } from "../../../src/adapter/RestAdapter.mjs";
import { Orchestrator } from "../../../src/core/Orchestrator.mjs";
import { ActorStore } from "../../../src/service/ActorStore.mjs";
import { AgentFactory } from "../../../src/service/AgentFactory.mjs";
import { InMemoryMessagingProvider } from "../../../src/service/MessagingProvider.mjs";
import { ResearchProviderProxy } from "../../../src/provider/mock/ResearchProviderProxy.mjs";

function setup() {
  const provider = new ResearchProviderProxy();
  const factory = new AgentFactory({ researchProvider: provider });
  const actorStore = new ActorStore({ ttlMs: 60_000 });
  const messaging = new InMemoryMessagingProvider();
  const orchestrator = new Orchestrator({
    factory,
    actorStore,
    messagingProvider: messaging
  });
  return { orchestrator, actorStore, messaging };
}

test("orchestrator persists waiting state and resumes with confirm", async () => {
  const { orchestrator, actorStore, messaging } = setup();
  const initial = normalizeRestRequest({
    conversationId: "conv-1",
    userId: "user-1",
    text: "wait for my confirm"
  });

  const first = await orchestrator.handleConversation(initial.context, initial.input);
  assert.equal(first.ignored, false);
  assert.equal(first.result.persistSession, true);
  assert.equal(messaging.messages.length, 1);

  const resumedPayload = normalizeRestRequest({
    conversationId: "conv-1",
    userId: "user-1",
    text: "confirm"
  });
  const second = await orchestrator.handleConversation(resumedPayload.context, resumedPayload.input);
  assert.equal(second.ignored, false);
  assert.equal(second.result.persistSession, false);
  assert.equal(actorStore.getAgentByScope("rest:conv-1:-:user-1"), null);
});

test("orchestrator returns ignored for OTHER intent", async () => {
  const { orchestrator } = setup();
  const payload = normalizeRestRequest({
    conversationId: "conv-2",
    userId: "user-9",
    text: "random non-routable statement"
  });
  const result = await orchestrator.handleConversation(payload.context, payload.input);
  assert.equal(result.ignored, true);
  assert.equal(result.reason, "OTHER");
});
