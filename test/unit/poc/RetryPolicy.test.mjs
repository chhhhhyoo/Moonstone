import test from "node:test";
import assert from "node:assert/strict";
import { computeBackoffMs, buildIdempotencyKey } from "../../../src/core/poc/RetryPolicy.mjs";

test("computeBackoffMs is capped and deterministic", () => {
  assert.equal(computeBackoffMs({ attempt: 1, backoffMs: 50, maxBackoffMs: 200 }), 50);
  assert.equal(computeBackoffMs({ attempt: 2, backoffMs: 50, maxBackoffMs: 200 }), 100);
  assert.equal(computeBackoffMs({ attempt: 3, backoffMs: 50, maxBackoffMs: 200 }), 200);
  assert.equal(computeBackoffMs({ attempt: 4, backoffMs: 50, maxBackoffMs: 200 }), 200);
});

test("buildIdempotencyKey is stable for same tuple", () => {
  const first = buildIdempotencyKey({ runId: "run-1", nodeId: "http-1", attempt: 2 });
  const second = buildIdempotencyKey({ runId: "run-1", nodeId: "http-1", attempt: 2 });
  const third = buildIdempotencyKey({ runId: "run-1", nodeId: "http-1", attempt: 3 });

  assert.equal(first, second);
  assert.notEqual(first, third);
});
