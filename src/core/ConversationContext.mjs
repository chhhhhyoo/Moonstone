import { randomUUID } from "node:crypto";
import { assertHasFields, ConversationContextFields } from "./contracts.mjs";

export function normalizeConversationContext(input) {
  const base = {
    source: input?.source,
    conversationId: input?.conversationId,
    userId: input?.userId,
    threadId: input?.threadId ?? null,
    messageId: input?.messageId ?? null,
    requestId: input?.requestId ?? randomUUID(),
    receivedAt: input?.receivedAt ?? new Date().toISOString(),
    metadata: input?.metadata ?? {}
  };

  assertHasFields("ConversationContext", base, ConversationContextFields);
  if (!base.source || !base.conversationId || !base.userId) {
    throw new Error("ConversationContext requires source, conversationId, and userId.");
  }

  return base;
}
