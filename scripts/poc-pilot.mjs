import path from "node:path";
import { compilePrompt } from "../src/core/poc/PromptCompiler.mjs";
import { planWorkflowMutation } from "../src/core/poc/WorkflowMutationPlanner.mjs";
import { applyWorkflowMutation } from "../src/core/poc/WorkflowMutationApplier.mjs";
import {
  planChefDirectionWithChoices,
  planChefDirectionPackWithChoices
} from "../src/core/poc/ChefDirectionPlanner.mjs";
import { buildChefDirectionPreview } from "../src/core/poc/ChefDirectionPlannerPreview.mjs";
import { WorkflowRuntime } from "../src/core/poc/WorkflowRuntime.mjs";
import { FileRunJournalStore } from "../src/service/poc/FileRunJournalStore.mjs";
import { createDefaultConnectorExecutors } from "../src/provider/poc/ConnectorRegistry.mjs";
import { parseArgs, loadInput, loadArtifact, writeJsonFile } from "./poc-common.mjs";

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

function toErrorPayload(error) {
  const code = error && typeof error === "object" && "code" in error && error.code
    ? String(error.code)
    : "PILOT_FAILED";
  const message = error instanceof Error ? error.message : String(error);
  return {
    ok: false,
    status: "failed",
    error: {
      code,
      message
    },
    warnings: []
  };
}

function slugify(input) {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "pilot";
}

function nowStamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function createMockConnectorExecutors() {
  const failOnceTracker = new Set();
  return {
    "action.http": async ({ command, scope }) => {
      const input = scope?.input ?? {};
      const failMode = String(input.forceHttpFailMode ?? "").toLowerCase();
      if (failMode === "always") {
        throw new Error("mock-http-failure(always)");
      }
      if (failMode === "once" && !failOnceTracker.has(command.nodeId)) {
        failOnceTracker.add(command.nodeId);
        throw new Error("mock-http-failure(once)");
      }

      return {
        status: 200,
        body: {
          ok: true,
          source: "mock-http",
          attempt: command.attempt,
          echoedInput: input
        }
      };
    },
    "action.openai": async ({ command }) => ({
      text: `mock-openai:${String(command.payload?.prompt ?? "").slice(0, 220)}`,
      source: "mock-openai"
    })
  };
}

function normalizeMode(rawMode) {
  const mode = String(rawMode ?? "mock").trim().toLowerCase();
  if (mode !== "mock" && mode !== "live") {
    fail("PILOT_MODE_INVALID", "Unsupported --mode. Allowed values: mock | live");
  }
  return mode;
}

function buildGeneratedToolsFromArtifact(artifact) {
  return (artifact.nodes ?? []).map((node) => {
    const normalizedNodeId = String(node.id ?? "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (node.type === "action.http") {
      const method = String(node.config?.method ?? "GET").toUpperCase();
      const url = String(node.config?.url ?? "");
      return {
        toolId: `tool.${normalizedNodeId}`,
        nodeId: node.id,
        connectorType: "action.http",
        name: `HTTP ${node.id}`,
        configSummary: `${method} ${url}`.trim()
      };
    }

    if (node.type === "action.openai") {
      const model = String(node.config?.model ?? "");
      return {
        toolId: `tool.${normalizedNodeId}`,
        nodeId: node.id,
        connectorType: "action.openai",
        name: `OpenAI ${node.id}`,
        configSummary: model ? `model=${model}` : "model=unknown"
      };
    }

    return {
      toolId: `tool.${normalizedNodeId}`,
      nodeId: node.id,
      connectorType: String(node.type ?? "unknown"),
      name: `Node ${node.id}`,
      configSummary: "unsupported-node-type"
    };
  });
}

function splitDirectionClauses(direction) {
  return String(direction ?? "")
    .split(/\s+\bthen\b\s+/i)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function buildDirectionMutationPlan({
  sourceArtifactId,
  proposal,
  promptLabel,
  planId
}) {
  return {
    planId,
    sourceArtifactId,
    prompt: promptLabel,
    operationType: proposal.operationType,
    operation: proposal.operation,
    diagnostics: {
      plannerVersion: proposal.diagnostics?.plannerVersion ?? "0.1.0",
      mode: "chef-direction-proposal",
      warnings: []
    }
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.artifact === true) {
    fail("PILOT_ARTIFACT_ARG_REQUIRED", "Optional --artifact requires a value.");
  }
  if (args.feedback === true) {
    fail("PILOT_FEEDBACK_ARG_REQUIRED", "Optional --feedback requires a value.");
  }
  if (args.direction === true) {
    fail("PILOT_DIRECTION_ARG_REQUIRED", "Optional --direction requires a value.");
  }
  if (args["proposal-id"] === true) {
    fail("PILOT_PROPOSAL_ID_ARG_REQUIRED", "Optional --proposal-id requires a value.");
  }
  if (args["apply-direction"] && args["apply-direction"] !== true) {
    fail("PILOT_APPLY_DIRECTION_FLAG_INVALID", "Flag --apply-direction does not accept a value.");
  }

  const prompt = args.prompt ? String(args.prompt) : null;
  const artifactArg = args.artifact ? path.resolve(process.cwd(), String(args.artifact)) : null;
  if (!prompt && !artifactArg) {
    fail("PILOT_PROMPT_OR_ARTIFACT_REQUIRED", "Either --prompt or --artifact is required.");
  }
  if (prompt && artifactArg) {
    fail("PILOT_PROMPT_AND_ARTIFACT_CONFLICT", "Use either --prompt or --artifact, not both.");
  }

  const feedbackPrompt = args.feedback ? String(args.feedback).trim() : null;
  const direction = args.direction ? String(args.direction).trim() : null;
  const applyDirection = Boolean(args["apply-direction"]);
  const selectedProposalId = args["proposal-id"] ? String(args["proposal-id"]).trim() : null;
  if (feedbackPrompt && direction) {
    fail("PILOT_FEEDBACK_AND_DIRECTION_CONFLICT", "Use either --feedback or --direction, not both.");
  }
  if (applyDirection && !direction) {
    fail("CHEF_DIRECTION_APPLY_REQUIRES_DIRECTION", "Flag --apply-direction requires --direction.");
  }
  if (selectedProposalId && !applyDirection) {
    fail("CHEF_DIRECTION_PROPOSAL_ID_REQUIRES_APPLY", "Flag --proposal-id requires --apply-direction.");
  }

  const isDirectionProposalOnly = Boolean(direction && !applyDirection);
  const shouldWriteMutatedArtifact = Boolean(feedbackPrompt || (direction && applyDirection));

  const mode = normalizeMode(args.mode);
  const input = await loadInput(args.input ? String(args.input) : "");
  const runId = args["run-id"] ? String(args["run-id"]) : undefined;
  const pilotKeySource = prompt
    ? prompt.split(" ").slice(0, 8).join(" ")
    : path.basename(artifactArg ?? "artifact", path.extname(artifactArg ?? "artifact"));
  const pilotKey = `${slugify(pilotKeySource)}-${nowStamp()}`;

  const pilotRoot = path.resolve(
    process.cwd(),
    args.outdir ? String(args.outdir) : path.join(".moonstone", "pilot", pilotKey)
  );
  const artifactPath = path.resolve(
    pilotRoot,
    shouldWriteMutatedArtifact ? "artifact.mutated.json" : "artifact.json"
  );
  const shouldWriteSourceSnapshot = Boolean(prompt && shouldWriteMutatedArtifact);
  const sourceArtifactPath = path.resolve(
    pilotRoot,
    shouldWriteSourceSnapshot ? "artifact.source.json" : "artifact.json"
  );
  const diagnosticsPath = path.resolve(pilotRoot, "diagnostics.json");
  const runSummaryPath = path.resolve(pilotRoot, "run-summary.json");
  const inspectionPath = path.resolve(pilotRoot, "inspection.json");
  const replayPath = path.resolve(pilotRoot, "replay.json");
  const toolsPath = path.resolve(pilotRoot, "tools.json");
  const journalDir = path.resolve(
    process.cwd(),
    args["journal-dir"] ? String(args["journal-dir"]) : path.join(".moonstone", "pilot", "journal")
  );

  let sourceArtifact = null;
  let effectiveArtifact = null;
  let diagnostics = null;
  let proposal = null;
  let proposalPack = null;
  let proposalPackCandidates = [];
  let proposalCandidates = [];
  let directionPlanStatus = null;
  let mutation = {
    applied: false,
    operationType: null,
    changeSummary: null,
    planId: null,
    operations: null
  };

  if (prompt) {
    const compiled = compilePrompt({
      prompt,
      httpUrl: args["http-url"] ? String(args["http-url"]) : undefined,
      openaiModel: args.model ? String(args.model) : undefined
    });
    sourceArtifact = compiled.artifact;
    diagnostics = compiled.diagnostics;
  } else {
    sourceArtifact = await loadArtifact(artifactArg);
    diagnostics = {
      version: "0.1.0",
      prompt: null,
      branchMode: "artifact-input",
      inferred: {
        sourceArtifactPath: artifactArg
      },
      warnings: []
    };
  }

  effectiveArtifact = sourceArtifact;
  if (direction) {
    const directionClauses = splitDirectionClauses(direction);
    if (directionClauses.length > 1) {
      const directionPackPlan = planChefDirectionPackWithChoices({
        artifact: sourceArtifact,
        direction
      });
      directionPlanStatus = directionPackPlan.status;
      proposal = null;
      proposalCandidates = [];
      if (directionPackPlan.status === "resolved") {
        proposalPack = {
          ...directionPackPlan.proposalPack,
          applied: false
        };
        proposalPackCandidates = [];
      } else {
        proposalPack = null;
        proposalPackCandidates = directionPackPlan.proposalPackCandidates.map((candidate) => ({
          ...candidate,
          applied: false
        }));
      }
    } else {
      const directionPlan = planChefDirectionWithChoices({
        artifact: sourceArtifact,
        direction
      });
      directionPlanStatus = directionPlan.status;

      if (directionPlan.status === "resolved") {
        proposal = {
          ...directionPlan.proposal,
          preview: buildChefDirectionPreview({
            artifact: sourceArtifact,
            proposal: directionPlan.proposal
          }),
          applied: false
        };
        proposalCandidates = [];
      } else {
        proposal = null;
        proposalCandidates = directionPlan.proposalCandidates.map((candidate) => ({
          ...candidate,
          preview: buildChefDirectionPreview({
            artifact: sourceArtifact,
            proposal: candidate
          }),
          applied: false
        }));
      }
      proposalPackCandidates = [];
    }
  }

  if (feedbackPrompt || applyDirection) {
    if (applyDirection && (proposalPack || proposalPackCandidates.length > 0)) {
      let selectedDirectionPack = proposalPack;
      if (!selectedDirectionPack) {
        if (!selectedProposalId) {
          fail(
            "CHEF_DIRECTION_PACK_PROPOSAL_ID_REQUIRED",
            "Ambiguous direction pack requires --proposal-id to select one candidate pack."
          );
        }
        selectedDirectionPack = proposalPackCandidates.find((candidate) => candidate.packId === selectedProposalId) ?? null;
        if (!selectedDirectionPack) {
          fail(
            "CHEF_DIRECTION_PACK_PROPOSAL_ID_UNKNOWN",
            `Unknown direction-pack proposal id '${selectedProposalId}' for current candidates.`
          );
        }
        proposalPackCandidates = proposalPackCandidates.map((candidate) => ({
          ...candidate,
          selected: candidate.packId === selectedDirectionPack.packId
        }));
      }

      let workingArtifact = sourceArtifact;
      const operations = [];
      for (let index = 0; index < selectedDirectionPack.proposals.length; index += 1) {
        const stepProposal = selectedDirectionPack.proposals[index];
        const mutationPlan = buildDirectionMutationPlan({
          sourceArtifactId: workingArtifact.artifactId,
          proposal: stepProposal,
          promptLabel: `direction-pack:${stepProposal.clauseDirection}`,
          planId: `direction-pack.${selectedDirectionPack.packId}.${index + 1}`
        });
        const applyResult = applyWorkflowMutation({
          artifact: workingArtifact,
          plan: mutationPlan
        });
        workingArtifact = applyResult.mutatedArtifact;
        operations.push({
          clauseIndex: index + 1,
          proposalId: stepProposal.proposalId,
          operationType: applyResult.operationType,
          changeSummary: applyResult.changeSummary,
          planId: mutationPlan.planId
        });
      }
      effectiveArtifact = workingArtifact;
      mutation = {
        applied: true,
        operationType: "direction_pack",
        changeSummary: `Applied direction pack '${selectedDirectionPack.packId}' with ${operations.length} operation(s).`,
        planId: `direction-pack.${selectedDirectionPack.packId}`,
        operations
      };
      proposalPack = {
        ...selectedDirectionPack,
        applied: true,
        selected: true,
        applySummary: operations
      };
    } else {
      let selectedDirectionProposal = proposal;
      if (applyDirection && directionPlanStatus === "choice_required") {
        if (!selectedProposalId) {
          fail(
            "CHEF_DIRECTION_PROPOSAL_ID_REQUIRED",
            "Ambiguous direction requires --proposal-id to select one proposal candidate."
          );
        }
        selectedDirectionProposal = proposalCandidates.find((candidate) => candidate.proposalId === selectedProposalId) ?? null;
        if (!selectedDirectionProposal) {
          fail(
            "CHEF_DIRECTION_PROPOSAL_ID_UNKNOWN",
            `Unknown proposal id '${selectedProposalId}' for current direction candidates.`
          );
        }
        proposalCandidates = proposalCandidates.map((candidate) => ({
          ...candidate,
          selected: candidate.proposalId === selectedDirectionProposal.proposalId
        }));
        proposal = {
          ...selectedDirectionProposal,
          applied: true,
          selected: true
        };
      }

      if (applyDirection && !selectedDirectionProposal) {
        fail("CHEF_DIRECTION_PROPOSAL_MISSING", "Direction apply requires a resolved proposal.");
      }

      const mutationPlan = feedbackPrompt
        ? planWorkflowMutation({
            artifact: sourceArtifact,
            prompt: feedbackPrompt
          })
        : buildDirectionMutationPlan({
            sourceArtifactId: sourceArtifact.artifactId,
            proposal: selectedDirectionProposal,
            promptLabel: `direction:${direction}`,
            planId: `direction.${selectedDirectionProposal.proposalId}`
          });
      const applyResult = applyWorkflowMutation({
        artifact: sourceArtifact,
        plan: mutationPlan
      });
      effectiveArtifact = applyResult.mutatedArtifact;
      mutation = {
        applied: true,
        operationType: applyResult.operationType,
        changeSummary: applyResult.changeSummary,
        planId: mutationPlan.planId,
        operations: null
      };
      if (proposal) {
        proposal = {
          ...proposal,
          applied: true
        };
      }
    }
  }

  const generatedTools = buildGeneratedToolsFromArtifact(effectiveArtifact);
  const resolvedSourceArtifactPath = prompt ? sourceArtifactPath : artifactArg;
  const resolvedEffectiveArtifactPath = isDirectionProposalOnly
    ? resolvedSourceArtifactPath
    : artifactPath;

  if (prompt || feedbackPrompt || applyDirection) {
    await writeJsonFile(sourceArtifactPath, sourceArtifact);
  }
  if (!isDirectionProposalOnly) {
    await writeJsonFile(artifactPath, effectiveArtifact);
  }
  await writeJsonFile(diagnosticsPath, diagnostics);
  await writeJsonFile(toolsPath, generatedTools);

  if (isDirectionProposalOnly) {
    const proposalOnlyStatus = proposalPack
      ? "proposal_pack_only"
      : proposalPackCandidates.length > 0
        ? "proposal_pack_choice_required"
        : directionPlanStatus === "choice_required"
          ? "proposal_choice_required"
          : "proposal_only";
    console.log(JSON.stringify({
      ok: true,
      mode,
      prompt,
      artifact: artifactArg,
      feedback: feedbackPrompt,
      direction,
      runId: null,
      status: proposalOnlyStatus,
      diagnostics: {
        branchMode: diagnostics.branchMode,
        warnings: diagnostics.warnings
      },
      proposal,
      proposalPack,
      proposalPackCandidates,
      proposalCandidates,
      lineage: {
        sourceArtifactPath: resolvedSourceArtifactPath,
        effectiveArtifactPath: resolvedEffectiveArtifactPath,
        feedbackPrompt,
        mutation
      },
      generatedTools,
      executedNodeIds: [],
      paths: {
        artifactPath: resolvedEffectiveArtifactPath,
        sourceArtifactPath: resolvedSourceArtifactPath,
        mutatedArtifactPath: null,
        diagnosticsPath,
        runSummaryPath,
        inspectionPath,
        replayPath,
        toolsPath,
        journalDir
      },
      quickStart: {
        inspect: null,
        replay: null
      }
    }, null, 2));
    return;
  }

  const journalStore = new FileRunJournalStore({ rootDir: journalDir });
  const runtime = new WorkflowRuntime({
    journalStore,
    connectorExecutors: mode === "live" ? createDefaultConnectorExecutors() : createMockConnectorExecutors(),
    sleep: async () => {}
  });

  const runSummary = await runtime.run({
    artifact: effectiveArtifact,
    input,
    runId
  });
  const inspection = await runtime.inspect({ runId: runSummary.runId });
  const replay = await runtime.replay({ runId: runSummary.runId });

  await writeJsonFile(runSummaryPath, runSummary);
  await writeJsonFile(inspectionPath, inspection);
  await writeJsonFile(replayPath, replay);

  console.log(JSON.stringify({
    ok: runSummary.status === "completed",
    mode,
    prompt,
    artifact: artifactArg,
    feedback: feedbackPrompt,
    direction,
    runId: runSummary.runId,
    status: runSummary.status,
    diagnostics: {
      branchMode: diagnostics.branchMode,
      warnings: diagnostics.warnings
    },
    proposal,
    proposalPack,
    proposalPackCandidates,
    proposalCandidates,
    lineage: {
      sourceArtifactPath: resolvedSourceArtifactPath,
      effectiveArtifactPath: resolvedEffectiveArtifactPath,
      feedbackPrompt,
      mutation
    },
    generatedTools,
    executedNodeIds: Object.keys(runSummary.nodeResults).sort(),
    paths: {
      artifactPath: resolvedEffectiveArtifactPath,
      sourceArtifactPath: resolvedSourceArtifactPath,
      mutatedArtifactPath: shouldWriteMutatedArtifact ? resolvedEffectiveArtifactPath : null,
      diagnosticsPath,
      runSummaryPath,
      inspectionPath,
      replayPath,
      toolsPath,
      journalDir
    },
    quickStart: {
      inspect: `npm run poc:inspect -- --run-id ${runSummary.runId} --journal-dir ${journalDir}`,
      replay: `npm run poc:replay -- --run-id ${runSummary.runId} --journal-dir ${journalDir}`
    }
  }, null, 2));
}

main().catch((error) => {
  console.log(JSON.stringify(toErrorPayload(error), null, 2));
  process.exit(1);
});
