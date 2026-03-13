import path from "node:path";
import { planWorkflowMutation } from "../src/core/poc/WorkflowMutationPlanner.mjs";
import { applyWorkflowMutation } from "../src/core/poc/WorkflowMutationApplier.mjs";
import {
  parseArgs,
  requireArg,
  loadArtifact,
  writeJsonFile
} from "./poc-common.mjs";

function buildDefaultMutatedPath(artifactPath) {
  if (artifactPath.endsWith(".json")) {
    return artifactPath.replace(/\.json$/u, ".mutated.json");
  }
  return `${artifactPath}.mutated.json`;
}

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

function toErrorPayload(error) {
  const code = error && typeof error === "object" && "code" in error && error.code
    ? String(error.code)
    : "MUTATION_FAILED";
  const message = error instanceof Error ? error.message : String(error);
  return {
    ok: false,
    error: {
      code,
      message
    },
    warnings: []
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const artifactPath = path.resolve(process.cwd(), requireArg(args, "artifact"));
  const prompt = requireArg(args, "prompt");

  if (args.out === true) {
    fail("MUTATION_OUTPUT_REQUIRED", "Optional --out argument requires a value.");
  }

  const outputPath = path.resolve(
    process.cwd(),
    args.out ? String(args.out) : buildDefaultMutatedPath(artifactPath)
  );

  if (outputPath === artifactPath) {
    fail("MUTATION_OUTPUT_PATH_INVALID", "Output path must differ from source artifact path.");
  }

  const artifact = await loadArtifact(artifactPath);
  const plan = planWorkflowMutation({ artifact, prompt });
  const result = applyWorkflowMutation({ artifact, plan });
  await writeJsonFile(outputPath, result.mutatedArtifact);

  console.log(JSON.stringify({
    ok: true,
    operationType: result.operationType,
    changeSummary: result.changeSummary,
    outputArtifactPath: outputPath,
    warnings: result.warnings
  }, null, 2));
}

main().catch((error) => {
  console.log(JSON.stringify(toErrorPayload(error), null, 2));
  process.exit(1);
});
