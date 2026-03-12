import path from "node:path";
import { compilePromptToArtifact } from "../src/core/poc/PromptCompiler.mjs";
import { parseArgs, requireArg, writeJsonFile } from "./poc-common.mjs";

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const prompt = requireArg(args, "prompt");
  const httpUrl = args["http-url"] ? String(args["http-url"]) : undefined;
  const openaiModel = args.model ? String(args.model) : undefined;

  const artifact = compilePromptToArtifact({
    prompt,
    httpUrl,
    openaiModel
  });

  const outArg = args.out
    ? String(args.out)
    : path.join(".moonstone", "artifacts", `${artifact.artifactId.replace(/\./g, "-")}.json`);

  const outPath = path.resolve(process.cwd(), outArg);
  await writeJsonFile(outPath, artifact);

  console.log(JSON.stringify({
    ok: true,
    artifactId: artifact.artifactId,
    artifactVersion: artifact.artifactVersion,
    outputPath: outPath
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
