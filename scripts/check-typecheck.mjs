import path from "node:path";
import { pathToFileURL } from "node:url";
import { fail, repoRoot } from "./common.mjs";

const requiredContractExports = [
  "ConversationContextFields",
  "AgentIntentValues",
  "AgentDefinitionFields",
  "AgentRunResultFields",
  "AgentFsmContractFields",
  "ActorAddressFields",
  "RunContextFields",
  "ArtifactVersionFields",
  "CommandEnvelopeFields",
  "ReceiptEnvelopeFields",
  "WorkflowArtifactFields",
  "PocOperationCommandFields",
  "PocOperationReceiptFields",
  "MessagingProviderMethods",
  "DomainProviderMethods",
  "ProviderProxyMethods",
  "OperationReceiptFields",
  "SpecImpactFrontmatterFields"
];

async function main() {
  const errors = [];

  const contractsPath = path.join(repoRoot, "src/core/contracts.mjs");
  const contractsModule = await import(pathToFileURL(contractsPath).href);
  for (const exportName of requiredContractExports) {
    if (!(exportName in contractsModule)) {
      errors.push(`Missing contract export in src/core/contracts.mjs: ${exportName}`);
    }
  }

  if (errors.length > 0) {
    fail(errors);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
