import { createHash, randomUUID } from "node:crypto";
import { assertHasFields, OperationReceiptFields } from "./contracts.mjs";

export function createOperationReceipt({
  agentId,
  sessionKey,
  action,
  input,
  outcome,
  providerRefs = [],
  evidenceRefs = [],
  policyFlags = []
}) {
  const receipt = {
    receiptId: randomUUID(),
    agentId,
    sessionKey,
    action,
    timestamp: new Date().toISOString(),
    inputsHash: createHash("sha256").update(JSON.stringify(input ?? {})).digest("hex"),
    outcome,
    providerRefs,
    evidenceRefs,
    policyFlags
  };
  assertHasFields("OperationReceipt", receipt, OperationReceiptFields);
  return receipt;
}
