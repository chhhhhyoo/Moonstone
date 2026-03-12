import path from "node:path";
import { parseArgs, requireArg, loadArtifact } from "./poc-common.mjs";

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const artifactPath = path.resolve(process.cwd(), requireArg(args, "artifact"));
  const artifact = await loadArtifact(artifactPath);

  console.log(JSON.stringify({
    ok: true,
    artifactPath,
    artifactId: artifact.artifactId,
    nodes: artifact.nodes.length,
    edges: artifact.edges.length,
    trigger: artifact.trigger
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
