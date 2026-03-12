export const ConversationContextFields = [
  "source",
  "conversationId",
  "userId",
  "threadId",
  "messageId",
  "requestId",
  "receivedAt",
  "metadata"
];

export const AgentIntentValues = ["INTAKE", "OTHER"];

export const AgentDefinitionFields = [
  "id",
  "displayName",
  "capabilities",
  "moonstoneContractId",
  "requiredProviders"
];

export const AgentRunResultFields = [
  "messages",
  "reactions",
  "state",
  "persistSession",
  "receipts",
  "handoff"
];

export const AgentFsmContractFields = [
  "agentId",
  "states",
  "persistableStates",
  "terminalStates",
  "hydratePolicy",
  "timeoutPolicy"
];

export const ActorAddressFields = [
  "sessionScope",
  "actorId",
  "runId"
];

export const RunContextFields = [
  "runId",
  "correlationId",
  "requestId",
  "artifactId",
  "artifactVersion"
];

export const ArtifactVersionFields = [
  "artifactId",
  "artifactVersion",
  "compiledAt",
  "checksum"
];

export const CommandEnvelopeFields = [
  "commandId",
  "commandType",
  "actorAddress",
  "run",
  "artifact",
  "idempotencyKey",
  "taskToken",
  "payload",
  "createdAt",
  "deadlineAt"
];

export const ReceiptEnvelopeFields = [
  "receiptId",
  "commandId",
  "actorAddress",
  "run",
  "artifact",
  "idempotencyKey",
  "taskToken",
  "outcome",
  "result",
  "recordedAt",
  "evidenceRefs"
];

export const WorkflowArtifactFields = [
  "artifactId",
  "artifactVersion",
  "trigger",
  "nodes",
  "edges",
  "defaults",
  "metadata"
];

export const PocOperationCommandFields = [
  "commandId",
  "runId",
  "nodeId",
  "connectorType",
  "payload",
  "attempt",
  "idempotencyKey",
  "deadlineAt"
];

export const PocOperationReceiptFields = [
  "receiptId",
  "commandId",
  "runId",
  "nodeId",
  "outcome",
  "result",
  "error",
  "attempt",
  "durationMs",
  "recordedAt"
];

export const MessagingProviderMethods = ["postMessage", "addReaction", "removeReaction"];

export const DomainProviderMethods = ["query"];

export const ProviderProxyMethods = ["query"];

export const SessionKeyFields = ["scope", "value"];

export const OperationReceiptFields = [
  "receiptId",
  "agentId",
  "sessionKey",
  "action",
  "timestamp",
  "inputsHash",
  "outcome",
  "providerRefs",
  "evidenceRefs",
  "policyFlags"
];

export const SpecImpactFrontmatterFields = [
  "status",
  "changed_areas",
  "consulted_sources",
  "decisions"
];

export function assertHasFields(label, target, fields) {
  if (typeof target !== "object" || target === null) {
    throw new Error(`${label} must be an object.`);
  }
  for (const field of fields) {
    if (!(field in target)) {
      throw new Error(`${label} missing field: ${field}`);
    }
  }
}
