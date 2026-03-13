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
3. Advanced graph authoring (parallelism, loops, human-wait).
4. UI-level authoring quality comparable to mature no-code products.
