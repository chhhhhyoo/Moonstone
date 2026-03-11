export function validateIntakeInput(input) {
  if (!input || typeof input !== "object") {
    throw new Error("Intake input must be an object.");
  }
  if (typeof input.text !== "string" || input.text.trim() === "") {
    throw new Error("Intake input requires non-empty text.");
  }
  return true;
}

export function validateIntakeOutput(output) {
  if (!output || typeof output !== "object") {
    throw new Error("Intake output must be an object.");
  }
  if (!Array.isArray(output.messages)) {
    throw new Error("Intake output requires messages array.");
  }
  if (!Array.isArray(output.receipts)) {
    throw new Error("Intake output requires receipts array.");
  }
  return true;
}
