import { randomUUID } from "node:crypto";

/**
 * @param {{
 *   runId: string,
 *   nodeId: string,
 *   connectorType: string,
 *   payload: unknown,
 *   attempt: number,
 *   idempotencyKey: string,
 *   now?: () => Date,
 *   timeoutMs?: number
 * }} params
 */
export function createOperationCommand({
  runId,
  nodeId,
  connectorType,
  payload,
  attempt,
  idempotencyKey,
  now = () => new Date(),
  timeoutMs = 30_000
}) {
  const createdAt = now();
  return {
    commandId: randomUUID(),
    runId,
    nodeId,
    connectorType,
    payload,
    attempt,
    idempotencyKey,
    deadlineAt: new Date(createdAt.getTime() + timeoutMs).toISOString(),
    createdAt: createdAt.toISOString()
  };
}

/**
 * @param {{
 *   command: { commandId: string },
 *   runId: string,
 *   nodeId: string,
 *   attempt: number,
 *   outcome: "success" | "failed",
 *   result?: unknown,
 *   error?: unknown,
 *   durationMs: number,
 *   now?: () => Date
 * }} params
 */
export function createOperationReceipt({
  command,
  runId,
  nodeId,
  attempt,
  outcome,
  result = null,
  error = null,
  durationMs,
  now = () => new Date()
}) {
  return {
    receiptId: randomUUID(),
    commandId: command.commandId,
    runId,
    nodeId,
    outcome,
    result,
    error,
    attempt,
    durationMs,
    recordedAt: now().toISOString()
  };
}
