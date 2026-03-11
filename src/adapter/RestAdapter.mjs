import { normalizeConversationContext } from "../core/ConversationContext.mjs";

export function normalizeRestRequest(payload) {
  const context = normalizeConversationContext({
    source: "rest",
    conversationId: payload?.conversationId,
    userId: payload?.userId,
    threadId: payload?.threadId ?? null,
    messageId: payload?.messageId ?? null,
    requestId: payload?.requestId ?? null,
    metadata: payload?.metadata ?? {}
  });

  return {
    context,
    input: {
      text: String(payload?.text ?? "")
    }
  };
}
