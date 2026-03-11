import { AgentIntent, classifyIntent } from "./AgentIntent.mjs";
import { buildSessionKey, buildSessionScope } from "./SessionKey.mjs";

export class Orchestrator {
  constructor({ factory, actorStore, messagingProvider }) {
    this.factory = factory;
    this.actorStore = actorStore;
    this.messagingProvider = messagingProvider;
  }

  async handleConversation(context, input) {
    const sessionScope = buildSessionScope(context);
    const resumed = this.actorStore.getAgentByScope(sessionScope);

    let agent = null;
    let sessionKey = null;

    if (resumed) {
      agent = resumed.agent;
      sessionKey = resumed.sessionKey;
    } else {
      const intent = classifyIntent(input.text);
      if (intent === AgentIntent.OTHER) {
        return { ignored: true, reason: "OTHER" };
      }
      agent = this.factory.createAgent(intent);
      sessionKey = buildSessionKey(context, agent.id);
    }

    const result = await agent.handle({ context, input, sessionKey });

    if (result.persistSession) {
      if (resumed) {
        this.actorStore.touchSession(sessionKey, result.state);
      } else {
        this.actorStore.setAgent({ sessionScope, sessionKey, agent, state: result.state });
      }
    } else {
      this.actorStore.clearActor(sessionKey);
    }

    for (const message of result.messages) {
      await this.messagingProvider.postMessage(context.conversationId, message, {
        threadId: context.threadId ?? undefined
      });
    }
    for (const reaction of result.reactions) {
      if (context.messageId) {
        await this.messagingProvider.addReaction(context.conversationId, context.messageId, reaction);
      }
    }

    return { ignored: false, sessionKey, result };
  }
}
