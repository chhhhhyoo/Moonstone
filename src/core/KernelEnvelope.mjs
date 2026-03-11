import {
  ActorAddressFields,
  RunContextFields,
  ArtifactVersionFields,
  CommandEnvelopeFields,
  ReceiptEnvelopeFields,
  assertHasFields
} from "./contracts.mjs";

export function validateActorAddress(actorAddress) {
  assertHasFields("ActorAddress", actorAddress, ActorAddressFields);
  return actorAddress;
}

export function validateRunContext(run) {
  assertHasFields("RunContext", run, RunContextFields);
  return run;
}

export function validateArtifactVersion(artifact) {
  assertHasFields("ArtifactVersion", artifact, ArtifactVersionFields);
  return artifact;
}

export function validateCommandEnvelope(command) {
  assertHasFields("CommandEnvelope", command, CommandEnvelopeFields);
  validateActorAddress(command.actorAddress);
  validateRunContext(command.run);
  validateArtifactVersion(command.artifact);
  return command;
}

export function validateReceiptEnvelope(receipt) {
  assertHasFields("ReceiptEnvelope", receipt, ReceiptEnvelopeFields);
  validateActorAddress(receipt.actorAddress);
  validateRunContext(receipt.run);
  validateArtifactVersion(receipt.artifact);
  return receipt;
}
