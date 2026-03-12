import { createHash } from "node:crypto";

export function resolveRetryPolicy({ artifactDefaults, nodeRetry }) {
  const source = nodeRetry ?? artifactDefaults ?? {};
  return {
    maxAttempts: Number.isInteger(source.maxAttempts) ? source.maxAttempts : 1,
    backoffMs: Number.isInteger(source.backoffMs) ? source.backoffMs : 0,
    maxBackoffMs: Number.isInteger(source.maxBackoffMs)
      ? source.maxBackoffMs
      : (Number.isInteger(source.backoffMs) ? source.backoffMs : 0)
  };
}

export function computeBackoffMs({ attempt, backoffMs, maxBackoffMs }) {
  const safeAttempt = Math.max(1, Number(attempt));
  const base = Math.max(0, Number(backoffMs));
  const cap = Math.max(0, Number(maxBackoffMs));
  const calculated = base * (2 ** (safeAttempt - 1));
  return Math.min(calculated, cap);
}

export function buildIdempotencyKey({ runId, nodeId, attempt }) {
  return createHash("sha256")
    .update(`${runId}:${nodeId}:${attempt}`)
    .digest("hex");
}
