# PF-POC Pilot: Promptable Workflow Builder (Opal/n8n Feel Check)

## Why This Exists

This is a reality check lane: prompt -> compiled workflow -> executed run -> inspect/replay evidence, in one command.

If this flow does not feel fast and legible, we are not yet at the product bar.

## Fast Path (No External API Needed)

```bash
npm run poc:pilot -- \
  --mode mock \
  --prompt "When input.amount > 100 summarize premium order otherwise summarize standard order" \
  --input '{"amount": 120, "text": "pilot-order"}'
```

Expected result:

1. `status` should be `completed`.
2. `diagnostics.branchMode` should usually be `comparator` for this prompt.
3. `executedNodeIds` should reflect one branch path, not both.
4. Output includes `generatedTools` and file paths for `tools.json` plus artifact/diagnostics/run/inspect/replay.

## Lead-Chef Feedback Loop (PF-POC-016)

Use this to iterate from an existing artifact with directional prompt feedback.

```bash
npm run poc:pilot -- \
  --mode mock \
  --prompt "POST https://api.example.com/orders then summarize result" \
  --input '{"text":"chef-initial"}' \
  --outdir .moonstone/pilot/chef-initial \
  --run-id chef-initial-001

npm run poc:pilot -- \
  --mode mock \
  --artifact .moonstone/pilot/chef-initial/artifact.json \
  --feedback "add http after http-1 method GET url https://api.example.com/orders/summary on success" \
  --input '{"text":"chef-feedback"}' \
  --outdir .moonstone/pilot/chef-feedback \
  --run-id chef-feedback-001
```

Expected result:

1. Second run output includes `lineage.sourceArtifactPath`, `lineage.effectiveArtifactPath`, and `lineage.mutation`.
2. `lineage.mutation.applied` is `true` and `operationType` matches the feedback mutation.
3. Source artifact file remains unchanged; effective run artifact is written to a new `*.mutated.json` path.
4. Inspect/replay evidence remains runnable for the feedback run.

## Intent-Level Direction Proposal Loop (PF-POC-017)

Use this when the chef gives outcome direction instead of explicit mutation syntax.

```bash
npm run poc:pilot -- \
  --mode mock \
  --artifact .moonstone/pilot/chef-initial/artifact.json \
  --direction "After http-1, add a summary step for the operator." \
  --outdir .moonstone/pilot/chef-direction-proposal
```

Expected proposal-only result:

1. `status` is `proposal_only`.
2. `runId` is `null`.
3. `proposal.operationType` is deterministic (`add_openai_after` for this direction).
4. No `run-summary.json` is emitted until apply is explicitly confirmed.

Apply the proposal explicitly:

```bash
npm run poc:pilot -- \
  --mode mock \
  --artifact .moonstone/pilot/chef-initial/artifact.json \
  --direction "After http-1, add a summary step for the operator." \
  --apply-direction \
  --input '{"text":"chef-direction-apply"}' \
  --outdir .moonstone/pilot/chef-direction-apply \
  --run-id chef-direction-apply-001
```

Expected apply result:

1. `status` is `completed`.
2. `proposal.applied` is `true`.
3. `lineage.effectiveArtifactPath` points to a new `*.mutated.json`.
4. Source artifact remains byte-unchanged.

## Intent Operation-Pack (PF-POC-018)

Direction planning now supports bounded operation intents (single operation only):

1. `add_openai_after`
2. `add_http_after`
3. `replace_node_tool`
4. `connect_nodes`
5. `remove_leaf_node`

Example direction for HTTP insert:

```bash
npm run poc:pilot -- \
  --mode mock \
  --artifact .moonstone/pilot/chef-initial/artifact.json \
  --direction "After http-1, add an API check step using GET https://api.example.com/orders/summary." \
  --outdir .moonstone/pilot/chef-direction-http-proposal
```

Expected proposal payload contract additions:

1. `proposal.preview.affectedNodeIds`
2. `proposal.preview.nodeAdds`, `proposal.preview.nodeUpdates`, `proposal.preview.nodeRemoves`
3. `proposal.preview.edgeAdds`, `proposal.preview.edgeRemoves`
4. `proposal.preview.blocked` + `proposal.preview.blockedReasons`

Fail-closed behavior:

1. ambiguous/multi-intent directions are rejected,
2. under-specified directions (missing required hints) are rejected,
3. blocked graph-safety proposals report deterministic `blockedReasons` in preview.

## Role-Based Direction Anchors (PF-POC-019)

Node-ID-free direction paths are now supported through bounded role anchors:

1. `first request step` / `latest request step`
2. `summary step`
3. `trigger step`

Example (no explicit node IDs):

```bash
npm run poc:pilot -- \
  --mode mock \
  --artifact .moonstone/pilot/chef-initial/artifact.json \
  --direction "Connect trigger step to summary step." \
  --outdir .moonstone/pilot/chef-direction-role-proposal
```

Expected proposal details:

1. `proposal.operationType` is deterministic (`connect_nodes` in this example).
2. `proposal.resolvedAnchors` shows which concrete node IDs were selected.
3. Proposal remains `status: proposal_only` until `--apply-direction` is supplied.

Role resolution safety:

1. If a role has multiple candidates and no disambiguator (`first`/`latest`), planner fails closed.
2. Unknown role references fail closed.
3. Role substitution is context-aware (`after`, `connect ... to ...`, `replace ... with`, `remove leaf ...`) to avoid rewriting operation descriptors accidentally.

## Direct-Apply Mutation Check (PF-POC-015)

```bash
npm run poc:compile -- \
  --prompt "POST https://api.example.com/orders then summarize result" \
  --out .moonstone/artifacts/pilot-mutate-source.json

npm run poc:mutate -- \
  --artifact .moonstone/artifacts/pilot-mutate-source.json \
  --prompt "add http after http-1 method GET url https://api.example.com/orders/summary on success"

npm run poc:run -- \
  --artifact .moonstone/artifacts/pilot-mutate-source.mutated.json \
  --input '{"text":"mutate-check"}' \
  --run-id pilot-mutate-check

npm run poc:inspect -- --run-id pilot-mutate-check
npm run poc:replay -- --run-id pilot-mutate-check
```

Expected result:

1. `poc:mutate` returns deterministic JSON with `operationType`, `changeSummary`, and `outputArtifactPath`.
2. Source artifact stays unchanged; mutation writes a new `*.mutated.json` file.
3. Mutated artifact still executes and remains inspect/replay-safe.

## Mutation Prompt Contract (v1)

`poc:mutate` is fail-closed and intentionally strict in PF-POC-015.

Supported single-operation verbs:

1. `add_http_after`
2. `add_openai_after`
3. `replace_node_tool`
4. `connect_nodes`
5. `remove_leaf_node`

Rules:

1. Prompt must express exactly one operation and an explicit verb.
2. Hint fields are required where needed (`url`, `method`, `model`, `prompt`, `event`).
3. Ambiguous or multi-operation prompts are rejected with deterministic error payloads.
4. Safety invariants block unsafe edits (unknown refs, trigger deletion, non-leaf deletion, cycle-introducing connect).

## Prompt-Derived URL Check

```bash
npm run poc:pilot -- \
  --mode mock \
  --prompt "POST https://api.example.com/orders then summarize result" \
  --input '{"text":"url-inference"}'
```

Expected result:

1. `generatedTools` includes an HTTP tool whose `configSummary` is `POST https://api.example.com/orders`.
2. Compiled artifact `http-1` node URL uses the same prompt-derived URL unless `--http-url` is explicitly provided.

## Multi-Tool Prompt Chain Check

```bash
npm run poc:pilot -- \
  --mode mock \
  --prompt "POST https://api.example.com/orders then GET https://api.example.com/orders/summary then summarize result" \
  --input '{"text":"multi-tool"}'
```

Expected result:

1. `executedNodeIds` includes ordered chain nodes (`http-1`, `http-2`, `openai-success-1`).
2. `generatedTools` includes two HTTP tool entries (`http-1`, `http-2`) before summary tool output.
3. Compiled artifact contains sequential success edges (`trigger -> http-1 -> http-2 -> openai-success-1`).
4. Inspection timeline `command_emitted` for `http-2` contains upstream-derived payload fields:
   - `upstreamStatus` (from `http-1` result)
   - `upstreamSource` (from `http-1` result body source)
   - `upstreamNodeId` (`http-1`)

## Upstream Status Branch Check

```bash
npm run poc:pilot -- \
  --mode mock \
  --prompt "POST https://api.example.com/orders then if response.status >= 500 summarize error otherwise summarize success" \
  --input '{"text":"upstream-status"}'
```

Expected result:

1. `diagnostics.branchMode` is `comparator`.
2. In mock mode (`http` status `200`), `executedNodeIds` includes `openai-condition-false-1` (not `openai-success-1`).
3. Compiled artifact contains complementary success-edge conditions from `http-1`:
   - `path: nodeResults.http-1.result.status`, `op: gte`, `value: 500`
   - `path: nodeResults.http-1.result.status`, `op: lt`, `value: 500`

## Failure Branch Check

```bash
npm run poc:pilot -- \
  --mode mock \
  --prompt "Call vendor API and on failure summarize error for operator" \
  --input '{"text":"pilot-failure","forceHttpFailMode":"always"}'
```

Expected result:

1. HTTP step retries and then routes failure branch.
2. `executedNodeIds` includes `openai-failure-1`.

## Live Connector Mode (Real Integrations)

Prerequisites:

1. `OPENAI_API_KEY` is set.
2. Prompt-generated HTTP URL is reachable (or pass explicit `--http-url`).

```bash
npm run poc:pilot -- \
  --mode live \
  --prompt "Get order status and summarize result" \
  --http-url "https://your-api.example.com/orders" \
  --input '{"text":"live-pilot"}'
```

## What This Pilot Proves

1. Promptable workflow creation exists and is runnable.
2. Prompt-derived tool blueprints are explicit (`generatedTools` + `tools.json`) and reviewable.
3. Runtime execution is command/receipt/journal driven.
4. Operator can inspect and replay exact runs from returned run-id.

## What It Does Not Prove Yet

1. Arbitrary tool creation from free-form prompt (tool catalog is still fixed to HTTP/OpenAI).
2. Full natural-language intent coverage for complex multi-step tool flows (parser currently expects explicit URL tokens and ordered phrasing).
3. Rich data transformations between steps beyond deterministic upstream field projection.
4. Advanced graph authoring (parallelism, loops, human-wait).
5. UI-level authoring quality comparable to mature no-code products.
6. Upstream-aware conditional parsing is currently limited to status comparators (not arbitrary upstream body fields).
