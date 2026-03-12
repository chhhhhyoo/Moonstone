import path from "node:path";
import { compilePrompt } from "../src/core/poc/PromptCompiler.mjs";
import { parseArgs, requireArg, writeJsonFile } from "./poc-common.mjs";

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const prompt = requireArg(args, "prompt");
  const httpUrl = args["http-url"] ? String(args["http-url"]) : undefined;
  const openaiModel = args.model ? String(args.model) : undefined;

  const { artifact, diagnostics } = compilePrompt({
    prompt,
    httpUrl,
    openaiModel
  });

  const outArg = args.out
    ? String(args.out)
    : path.join(".moonstone", "artifacts", `${artifact.artifactId.replace(/\./g, "-")}.json`);

  const outPath = path.resolve(process.cwd(), outArg);
  await writeJsonFile(outPath, artifact);

  let diagnosticsPath = null;
  if (args["diagnostics-out"] && args["diagnostics-out"] !== true) {
    diagnosticsPath = path.resolve(process.cwd(), String(args["diagnostics-out"]));
    await writeJsonFile(diagnosticsPath, diagnostics);
  }

  console.log(JSON.stringify({
    ok: true,
    artifactId: artifact.artifactId,
    artifactVersion: artifact.artifactVersion,
    outputPath: outPath,
    diagnostics: {
      branchMode: diagnostics.branchMode,
      warnings: diagnostics.warnings,
      inferred: diagnostics.inferred
    },
    diagnosticsPath
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
