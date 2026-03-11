export function buildSessionScope(context) {
  const thread = context.threadId ?? "-";
  return `${context.source}:${context.conversationId}:${thread}:${context.userId}`;
}

export function buildSessionKey(context, agentId) {
  return `${buildSessionScope(context)}:${agentId}`;
}
