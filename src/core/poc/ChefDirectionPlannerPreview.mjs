import { applyWorkflowMutation } from "./WorkflowMutationApplier.mjs";
import { planChefDirection } from "./ChefDirectionPlanner.mjs";
import { normalizeWorkflowArtifact, validateWorkflowArtifact } from "./WorkflowArtifact.mjs";

function sortByJsonStable(entries) {
  return [...entries].sort((left, right) => {
    const leftJson = JSON.stringify(left);
    const rightJson = JSON.stringify(right);
    return leftJson.localeCompare(rightJson);
  });
}

function buildEdgeKey(edge) {
  return JSON.stringify({
    from: edge.from,
    to: edge.to,
    on: String(edge.on ?? "always").toLowerCase(),
    condition: edge.condition ?? null
  });
}

function buildNodeMap(nodes) {
  return new Map(nodes.map((node) => [node.id, node]));
}

function buildEdgeMap(edges) {
  const map = new Map();
  for (const edge of edges) {
    map.set(buildEdgeKey(edge), edge);
  }
  return map;
}

function diffArtifacts(sourceArtifact, targetArtifact) {
  const sourceNodes = buildNodeMap(sourceArtifact.nodes ?? []);
  const targetNodes = buildNodeMap(targetArtifact.nodes ?? []);

  const nodeAdds = [];
  const nodeRemoves = [];
  const nodeUpdates = [];

  for (const [nodeId, node] of targetNodes.entries()) {
    if (!sourceNodes.has(nodeId)) {
      nodeAdds.push({
        nodeId,
        type: node.type
      });
      continue;
    }
    const sourceNode = sourceNodes.get(nodeId);
    if (JSON.stringify(sourceNode) !== JSON.stringify(node)) {
      nodeUpdates.push({
        nodeId,
        beforeType: sourceNode?.type ?? null,
        afterType: node.type
      });
    }
  }

  for (const [nodeId, node] of sourceNodes.entries()) {
    if (!targetNodes.has(nodeId)) {
      nodeRemoves.push({
        nodeId,
        type: node.type
      });
    }
  }

  const sourceEdges = buildEdgeMap(sourceArtifact.edges ?? []);
  const targetEdges = buildEdgeMap(targetArtifact.edges ?? []);
  const edgeAdds = [];
  const edgeRemoves = [];

  for (const [key, edge] of targetEdges.entries()) {
    if (!sourceEdges.has(key)) {
      edgeAdds.push({
        from: edge.from,
        to: edge.to,
        on: String(edge.on ?? "always").toLowerCase(),
        condition: edge.condition ?? null
      });
    }
  }

  for (const [key, edge] of sourceEdges.entries()) {
    if (!targetEdges.has(key)) {
      edgeRemoves.push({
        from: edge.from,
        to: edge.to,
        on: String(edge.on ?? "always").toLowerCase(),
        condition: edge.condition ?? null
      });
    }
  }

  const affectedNodeIds = new Set();
  for (const node of nodeAdds) {
    affectedNodeIds.add(node.nodeId);
  }
  for (const node of nodeRemoves) {
    affectedNodeIds.add(node.nodeId);
  }
  for (const node of nodeUpdates) {
    affectedNodeIds.add(node.nodeId);
  }
  for (const edge of edgeAdds) {
    affectedNodeIds.add(edge.from);
    affectedNodeIds.add(edge.to);
  }
  for (const edge of edgeRemoves) {
    affectedNodeIds.add(edge.from);
    affectedNodeIds.add(edge.to);
  }

  return {
    affectedNodeIds: Array.from(affectedNodeIds).sort(),
    nodeAdds: sortByJsonStable(nodeAdds),
    nodeUpdates: sortByJsonStable(nodeUpdates),
    nodeRemoves: sortByJsonStable(nodeRemoves),
    edgeAdds: sortByJsonStable(edgeAdds),
    edgeRemoves: sortByJsonStable(edgeRemoves)
  };
}

function toDeterministicReason(error) {
  const code = error && typeof error === "object" && "code" in error
    ? String(error.code ?? "UNKNOWN")
    : "UNKNOWN";
  const message = error instanceof Error ? error.message : String(error);
  return `${code}:${message}`;
}

/**
 * @param {{
 *   artifact: Record<string, unknown>,
 *   direction?: string,
 *   proposal?: {
 *     proposalId: string,
 *     sourceArtifactId: string,
 *     direction: string,
 *     operationType: string,
 *     operation: Record<string, unknown>
 *   }
 * }} input
 */
export function buildChefDirectionPreview({ artifact, direction, proposal }) {
  const normalizedArtifact = normalizeWorkflowArtifact(artifact);
  validateWorkflowArtifact(normalizedArtifact);

  const resolvedProposal = proposal ?? planChefDirection({
    artifact: normalizedArtifact,
    direction: String(direction ?? "")
  });

  const mutationPlan = {
    planId: `preview.${resolvedProposal.proposalId}`,
    sourceArtifactId: normalizedArtifact.artifactId,
    prompt: `direction:${resolvedProposal.direction}`,
    operationType: resolvedProposal.operationType,
    operation: resolvedProposal.operation,
    diagnostics: {
      plannerVersion: "0.1.0",
      mode: "chef-direction-preview",
      warnings: []
    }
  };

  try {
    const applyResult = applyWorkflowMutation({
      artifact: normalizedArtifact,
      plan: mutationPlan
    });
    const diff = diffArtifacts(normalizedArtifact, applyResult.mutatedArtifact);
    return {
      blocked: false,
      blockedReasons: [],
      changeSummary: applyResult.changeSummary,
      ...diff
    };
  } catch (error) {
    return {
      blocked: true,
      blockedReasons: [toDeterministicReason(error)],
      changeSummary: null,
      affectedNodeIds: [],
      nodeAdds: [],
      nodeUpdates: [],
      nodeRemoves: [],
      edgeAdds: [],
      edgeRemoves: []
    };
  }
}
