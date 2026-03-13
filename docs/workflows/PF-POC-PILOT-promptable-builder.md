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

1. If exactly one role reference is ambiguous, planner returns `status: proposal_choice_required` with deterministic `proposalCandidates[]`.
2. Unknown role references fail closed.
3. Role substitution is context-aware (`after`, `connect ... to ...`, `replace ... with`, `remove leaf ...`) to avoid rewriting operation descriptors accidentally.

## Role-Ambiguity Choice Flow (PF-POC-020)

When one role anchor maps to multiple nodes, use proposal-choice mode and explicitly select one candidate for apply.

```bash
npm run poc:pilot -- \
  --mode mock \
  --artifact .moonstone/pilot/chef-ambiguous/artifact.json \
  --direction "After summary step, add a summary step for the operator." \
  --outdir .moonstone/pilot/chef-direction-choice
```

Expected proposal-choice result:

1. `status` is `proposal_choice_required`.
2. `proposal` is `null`.
3. `proposalCandidates[]` is deterministic and sorted by candidate `afterNodeId` in natural order (`...-2` before `...-10`).
4. each candidate includes `proposalId`, `resolvedAnchors`, and `preview`.

Apply with explicit selection:

```bash
npm run poc:pilot -- \
  --mode mock \
  --artifact .moonstone/pilot/chef-ambiguous/artifact.json \
  --direction "After summary step, add a summary step for the operator." \
  --apply-direction \
  --proposal-id "proposal.<from-candidates>" \
  --input '{"text":"chef-direction-choice-apply"}' \
  --outdir .moonstone/pilot/chef-direction-choice-apply \
  --run-id chef-direction-choice-apply-001
```

Safety contract:

1. missing `--proposal-id` on ambiguous apply fails closed with `CHEF_DIRECTION_PROPOSAL_ID_REQUIRED`.
2. unknown `--proposal-id` fails closed with `CHEF_DIRECTION_PROPOSAL_ID_UNKNOWN`.
3. directions with multiple ambiguous role references fail closed (`CHEF_DIRECTION_MULTI_ROLE_AMBIGUOUS`).
4. unsupported vague direction fails closed with `CHEF_DIRECTION_UNSUPPORTED`.
5. all pilot failures emit deterministic JSON payloads on stdout:
   - `{"ok": false, "status": "failed", "error": {"code": "...", "message": "..."}}`

### Failure Map (Operator Action)

1. `CHEF_DIRECTION_PROPOSAL_ID_REQUIRED`:
   - action: run proposal mode first and copy one `proposalCandidates[].proposalId`.
2. `CHEF_DIRECTION_PROPOSAL_ID_UNKNOWN`:
   - action: refresh proposal mode output and use a currently returned `proposalId`.
3. `CHEF_DIRECTION_UNSUPPORTED`:
   - action: restate direction as one bounded operation with explicit anchor (for example `after <node|role> ...`).
4. `CHEF_DIRECTION_MULTI_ROLE_AMBIGUOUS`:
   - action: reduce ambiguity with selector terms (`first`, `latest`) or split into separate directions.
5. `CHEF_ROLE_AMBIGUOUS`:
   - action: re-run with `poc:pilot --direction` to obtain choice candidates and then apply with `--proposal-id`.

## Pilot-01 Qualification Gate (PF-POC-021)

Run this as the product-level pass/fail gate for lead-chef direction quality:

```bash
npm run poc:qualify:pilot
```

Gate scope:

1. role-based resolved direction apply path,
2. single-role ambiguity proposal-choice path,
3. apply selection success path,
4. missing/unknown `--proposal-id` deterministic failure payloads,
5. unsupported vague direction deterministic failure payload,
6. inspect/replay continuity for applied scenarios.

## Multi-Step Direction Pack (PF-POC-022)

When chef intent spans multiple topology mutations, chain bounded clauses with `then`.

```bash
npm run poc:pilot -- \
  --mode mock \
  --artifact .moonstone/pilot/chef-initial/artifact.json \
  --direction "After http-1, add an API check step using GET https://api.example.com/orders/summary. then connect http-2 to openai-success-1 on success." \
  --outdir .moonstone/pilot/chef-direction-pack-proposal
```

Expected proposal contract:

1. `status` is `proposal_pack_only`.
2. `proposalPack.packId` is deterministic for equivalent artifact + direction.
3. `proposalPack.proposals[]` is ordered by clause index and deterministic.
4. no run is executed until `--apply-direction` is supplied.

Apply full pack atomically:

```bash
npm run poc:pilot -- \
  --mode mock \
  --artifact .moonstone/pilot/chef-initial/artifact.json \
  --direction "After http-1, add an API check step using GET https://api.example.com/orders/summary. then connect http-2 to openai-success-1 on success." \
  --apply-direction \
  --input '{"text":"chef-direction-pack-apply"}' \
  --outdir .moonstone/pilot/chef-direction-pack-apply \
  --run-id chef-direction-pack-apply-001
```

Pack safety limits in v1:

1. clause separator is explicit `then` only,
2. max `3` clauses (`CHEF_DIRECTION_PACK_TOO_LARGE` on overflow),
3. apply is all-or-none over the full pack (no partial mutated artifact output).

## Direction-Pack Ambiguity Choice (PF-POC-023)

When exactly one clause in a direction pack is ambiguous, proposal mode now returns deterministic candidate packs instead of hard-failing.

```bash
npm run poc:pilot -- \
  --mode mock \
  --artifact .moonstone/pilot/chef-ambiguous/artifact.mutated.json \
  --direction "After summary step, add a summary step for the operator. then connect trigger to http-1 on always." \
  --outdir .moonstone/pilot/chef-direction-pack-choice-proposal
```

Expected proposal contract:

1. `status` is `proposal_pack_choice_required`.
2. `proposalPack` is `null`.
3. `proposalPackCandidates[]` is deterministic and ordered by the ambiguous-clause resolved node target.
4. each candidate includes deterministic `packId` and full `proposals[]`.

Apply with explicit pack selection:

```bash
npm run poc:pilot -- \
  --mode mock \
  --artifact .moonstone/pilot/chef-ambiguous/artifact.mutated.json \
  --direction "After summary step, add a summary step for the operator. then connect trigger to http-1 on always." \
  --apply-direction \
  --proposal-id "pack.<from-candidates>" \
  --input '{"text":"chef-direction-pack-choice-apply"}' \
  --outdir .moonstone/pilot/chef-direction-pack-choice-apply \
  --run-id chef-direction-pack-choice-apply-001
```

Pack ambiguity safety contract:

1. exactly one ambiguous clause is supported for candidate-pack generation.
2. missing `--proposal-id` on pack-choice apply fails closed with `CHEF_DIRECTION_PACK_PROPOSAL_ID_REQUIRED`.
3. unknown `--proposal-id` on pack-choice apply fails closed with `CHEF_DIRECTION_PACK_PROPOSAL_ID_UNKNOWN`.
4. multiple ambiguous clauses fail closed with `CHEF_DIRECTION_PACK_MULTI_AMBIGUOUS`.

## Chef Intent Pack Synthesis (PF-POC-024)

You can now express bounded multi-step intent without explicit `then` choreography.

```bash
npm run poc:pilot -- \
  --mode mock \
  --artifact .moonstone/pilot/chef-initial/artifact.json \
  --direction "Please check GET https://api.example.com/orders/summary and summarize result for the operator." \
  --outdir .moonstone/pilot/chef-intent-pack-proposal
```

Expected proposal contract:

1. `status` is `proposal_pack_only`.
2. `proposalPack.diagnostics.mode` is `chef-intent-pack-v1`.
3. `proposalPack.diagnostics.synthesisApplied` is `true`.
4. `proposalPack.diagnostics.derivedClauses[]` and `proposalPack.diagnostics.intentSignals[]` are deterministic.
5. `proposalPack.diagnostics.warnings[]` is deterministic (often empty for clear intent).
6. `proposalPack.proposals[]` is deterministic and ordered.
7. source artifact remains unchanged until apply confirmation.

Apply synthesized pack:

```bash
npm run poc:pilot -- \
  --mode mock \
  --artifact .moonstone/pilot/chef-initial/artifact.json \
  --direction "Please check GET https://api.example.com/orders/summary and summarize result for the operator." \
  --apply-direction \
  --input '{"text":"chef-intent-pack-apply"}' \
  --outdir .moonstone/pilot/chef-intent-pack-apply \
  --run-id chef-intent-pack-apply-001
```

Intent synthesis limits (v1):

1. bounded intent phrases only (HTTP check/enrichment + summary/report + failure-route patterns),
2. synthesized packs remain capped at `2-3` operations,
3. explicit dual-event summary intent is supported when bounded to `on success` + `on failed`,
4. unsupported vague intent still fails closed with `CHEF_DIRECTION_UNSUPPORTED`,
5. all synthesized packs still use the same pack apply safety contracts (atomic apply + inspect/replay continuity).

## Intent-Synthesis Explainability + Safety Guardrails (PF-POC-025)

Synthesis vs explicit-pack diagnostics:

1. synthesized (`no explicit then`, bounded inferable intent):
   - `proposalPack.diagnostics.mode = chef-intent-pack-v1`
   - `proposalPack.diagnostics.synthesisApplied = true`
   - `derivedClauses[]` records the inferred deterministic clause chain
   - `intentSignals[]` records deterministic extraction signals
2. explicit pack (`... then ...` provided by operator):
   - `proposalPack.diagnostics.mode = bounded-operation-direction-pack-v1`
   - `proposalPack.diagnostics.synthesisApplied = false`
   - `derivedClauses[] = []`, `intentSignals[] = []`

Fail-closed synthesis guardrails:

1. `CHEF_DIRECTION_INTENT_MULTI_URL_CONFLICT`:
   - trigger: one synthesized direction contains multiple URLs
   - action: split into explicit `then` clauses or keep one URL per direction
2. `CHEF_DIRECTION_INTENT_EVENT_CONFLICT`:
   - trigger: one synthesized direction mixes incompatible explicit event hints (for example `on success` + `on always`, or dual-event hints combined with route/send failure phrasing)
   - action: use a single explicit event, or use only the bounded dual pair (`on success` + `on failed`) without additional conflicting event hints

## Dual-Event Intent Synthesis (PF-POC-027)

Use this to synthesize one high-level direction into both success and failed review clauses.

```bash
npm run poc:pilot -- \
  --mode mock \
  --artifact .moonstone/pilot/chef-initial/artifact.json \
  --direction "Please check GET https://api.example.com/orders/summary and summarize result on success and on failed." \
  --outdir .moonstone/pilot/chef-intent-dual-event-proposal
```

Expected proposal contract:

1. `status` is `proposal_pack_only`.
2. `proposalPack.proposals[]` includes deterministic event-specific summary mutations:
   - one summary clause on `success`,
   - one summary clause on `failed`.
3. incompatible event mixes (for example `on success` + `on always`) fail closed with `CHEF_DIRECTION_INTENT_EVENT_CONFLICT`.

## Intent-Synthesis Qualification Gate (PF-POC-026)

Run this dedicated gate whenever intent-synthesis behavior is modified:

```bash
npm run poc:qualify:intent-synthesis
```

Gate scope:

1. synthesized high-level intent proposal pack diagnostics contract:
   - `mode = chef-intent-pack-v1`
   - `synthesisApplied = true`
   - deterministic `derivedClauses[]` and `intentSignals[]`
2. explicit `then` pack invariance contract:
   - `mode = bounded-operation-direction-pack-v1`
   - `synthesisApplied = false`
   - empty `derivedClauses[]` and `intentSignals[]`
3. bounded conflict fail-closed contract:
   - `CHEF_DIRECTION_INTENT_MULTI_URL_CONFLICT`
   - `CHEF_DIRECTION_INTENT_EVENT_CONFLICT`
4. vague direction fail-closed fallback:
   - `CHEF_DIRECTION_UNSUPPORTED`
5. one apply path with inspect/replay continuity evidence.

Operator guidance:

1. use this gate for synthesis-focused regressions before running full strict verification,
2. if this gate fails, do not broaden language patterns in the same slice,
3. remediate deterministic diagnostics/error-code drift first, then rerun strict gates.

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
