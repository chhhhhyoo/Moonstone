import test from "node:test";
import assert from "node:assert/strict";
import {
  validateActorAddress,
  validateRunContext,
  validateArtifactVersion,
  validateCommandEnvelope,
  validateReceiptEnvelope
} from "../../../src/core/KernelEnvelope.mjs";

function sampleActorAddress() {
  return {
    sessionScope: "slack:C123:T123:U123",
    actorId: "intake",
    runId: "run-001"
  };
}

function sampleRunContext() {
  return {
    runId: "run-001",
    correlationId: "corr-001",
    requestId: "req-001",
    artifactId: "workflow.intake",
    artifactVersion: "1.0.0"
  };
}

function sampleArtifactVersion() {
  return {
    artifactId: "workflow.intake",
    artifactVersion: "1.0.0",
    compiledAt: "2026-03-10T00:00:00.000Z",
    checksum: "sha256:abc123"
  };
}

test("validateActorAddress accepts canonical shape", () => {
  const actorAddress = sampleActorAddress();
  assert.equal(validateActorAddress(actorAddress), actorAddress);
});

test("validateRunContext accepts canonical shape", () => {
  const run = sampleRunContext();
  assert.equal(validateRunContext(run), run);
});

test("validateArtifactVersion accepts canonical shape", () => {
  const artifact = sampleArtifactVersion();
  assert.equal(validateArtifactVersion(artifact), artifact);
});

test("validateCommandEnvelope checks nested contracts", () => {
  const command = {
    commandId: "cmd-001",
    commandType: "provider.query",
    actorAddress: sampleActorAddress(),
    run: sampleRunContext(),
    artifact: sampleArtifactVersion(),
    idempotencyKey: "idem-001",
    taskToken: "tok-001",
    payload: { query: "status" },
    createdAt: "2026-03-10T00:00:01.000Z",
    deadlineAt: "2026-03-10T00:05:00.000Z"
  };

  assert.equal(validateCommandEnvelope(command), command);
});

test("validateReceiptEnvelope checks nested contracts", () => {
  const receipt = {
    receiptId: "rcp-001",
    commandId: "cmd-001",
    actorAddress: sampleActorAddress(),
    run: sampleRunContext(),
    artifact: sampleArtifactVersion(),
    idempotencyKey: "idem-001",
    taskToken: "tok-001",
    outcome: "success",
    result: { rows: 1 },
    recordedAt: "2026-03-10T00:00:02.000Z",
    evidenceRefs: ["log-001"]
  };

  assert.equal(validateReceiptEnvelope(receipt), receipt);
});

test("validateCommandEnvelope rejects missing field", () => {
  const invalid = {
    commandType: "provider.query",
    actorAddress: sampleActorAddress(),
    run: sampleRunContext(),
    artifact: sampleArtifactVersion(),
    idempotencyKey: "idem-001",
    taskToken: "tok-001",
    payload: {},
    createdAt: "2026-03-10T00:00:01.000Z",
    deadlineAt: "2026-03-10T00:05:00.000Z"
  };

  assert.throws(() => validateCommandEnvelope(invalid), /missing field: commandId/);
});
