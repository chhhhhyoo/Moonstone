import test from "node:test";
import assert from "node:assert/strict";
import { parseMarkdownTable, validateStrategyTrackers } from "../../../scripts/strategy-tracker-lib.mjs";

function buildMilestones(contentRow) {
  return parseMarkdownTable(
    `
| milestone_id | title | status | owner | target_window | depends_on | exit_criteria |
|---|---|---|---|---|---|---|
${contentRow}
    `.trim(),
    "docs/strategy/MILESTONES.md"
  );
}

function buildActions(contentRow) {
  return parseMarkdownTable(
    `
| action_id | linked_milestone_id | priority | owner | due_window | blocking_risk | definition_of_done | status | evidence_ref |
|---|---|---|---|---|---|---|---|---|
${contentRow}
    `.trim(),
    "docs/strategy/FUTURE-ACTIONS.md"
  );
}

test("strategy tracker validation passes for valid records", () => {
  const milestones = buildMilestones(
    "| PF-BOOT-001 | Bootstrap | done | core | 2026-Q1 | none | Merged and green |"
  );
  const actions = buildActions(
    "| ACT-001 | PF-BOOT-001 | high | infra | 2026-Q1 | Protection unavailable | Documented fallback policy | blocked | docs/logs/2026-03-09.md#act-001-blocked-evidence |"
  );

  const errors = validateStrategyTrackers(milestones, actions);
  assert.deepEqual(errors, []);
});

test("strategy tracker validation fails on invalid status token", () => {
  const milestones = buildMilestones(
    "| PF-BOOT-001 | Bootstrap | active | core | 2026-Q1 | none | Merged and green |"
  );
  const actions = buildActions(
    "| ACT-001 | PF-BOOT-001 | high | infra | 2026-Q1 | Risk | Done | planned | none |"
  );

  const errors = validateStrategyTrackers(milestones, actions);
  assert.equal(errors.some((error) => error.includes("invalid status")), true);
});

test("strategy tracker validation fails when linked milestone does not exist", () => {
  const milestones = buildMilestones(
    "| PF-BOOT-001 | Bootstrap | done | core | 2026-Q1 | none | Merged and green |"
  );
  const actions = buildActions(
    "| ACT-001 | PF-RUNTIME-999 | high | infra | 2026-Q1 | Risk | Done | planned | none |"
  );

  const errors = validateStrategyTrackers(milestones, actions);
  assert.equal(errors.some((error) => error.includes("links unknown milestone")), true);
});

test("strategy tracker validation fails on duplicate IDs", () => {
  const milestones = parseMarkdownTable(
    `
| milestone_id | title | status | owner | target_window | depends_on | exit_criteria |
|---|---|---|---|---|---|---|
| PF-BOOT-001 | Bootstrap A | done | core | 2026-Q1 | none | A |
| PF-BOOT-001 | Bootstrap B | done | core | 2026-Q1 | none | B |
    `.trim(),
    "docs/strategy/MILESTONES.md"
  );
  const actions = parseMarkdownTable(
    `
| action_id | linked_milestone_id | priority | owner | due_window | blocking_risk | definition_of_done | status | evidence_ref |
|---|---|---|---|---|---|---|---|---|
| ACT-001 | PF-BOOT-001 | high | infra | 2026-Q1 | Risk | Done | planned | none |
| ACT-001 | PF-BOOT-001 | high | infra | 2026-Q1 | Risk | Done | planned | none |
    `.trim(),
    "docs/strategy/FUTURE-ACTIONS.md"
  );

  const errors = validateStrategyTrackers(milestones, actions);
  assert.equal(errors.some((error) => error.includes("Duplicate milestone_id")), true);
  assert.equal(errors.some((error) => error.includes("Duplicate action_id")), true);
});
