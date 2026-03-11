const milestoneRequiredHeaders = [
  "milestone_id",
  "title",
  "status",
  "owner",
  "target_window",
  "depends_on",
  "exit_criteria"
];

const actionRequiredHeaders = [
  "action_id",
  "linked_milestone_id",
  "priority",
  "owner",
  "due_window",
  "blocking_risk",
  "definition_of_done",
  "status",
  "evidence_ref"
];

const allowedStatuses = new Set(["planned", "in_progress", "blocked", "done"]);

function parseRow(rowText) {
  const trimmed = rowText.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) {
    return null;
  }
  return trimmed
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim());
}

export function parseMarkdownTable(content, label) {
  const lines = String(content).split("\n");
  const tableLines = lines
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|"));

  if (tableLines.length < 3) {
    throw new Error(`${label}: markdown table not found or incomplete.`);
  }

  const header = parseRow(tableLines[0]);
  const divider = parseRow(tableLines[1]);
  if (!header || !divider || header.length !== divider.length) {
    throw new Error(`${label}: malformed header or divider row.`);
  }

  for (const cell of divider) {
    if (!/^:?-{3,}:?$/.test(cell)) {
      throw new Error(`${label}: invalid divider row.`);
    }
  }

  const rows = [];
  for (const rawRow of tableLines.slice(2)) {
    const cells = parseRow(rawRow);
    if (!cells) {
      throw new Error(`${label}: malformed row: ${rawRow}`);
    }
    if (cells.length !== header.length) {
      throw new Error(`${label}: column mismatch in row: ${rawRow}`);
    }
    rows.push(cells);
  }

  return { header, rows };
}

function rowToRecord(header, row) {
  const record = {};
  for (let i = 0; i < header.length; i += 1) {
    record[header[i]] = row[i];
  }
  return record;
}

function ensureHeaders(requiredHeaders, actualHeaders, label, errors) {
  for (const requiredHeader of requiredHeaders) {
    if (!actualHeaders.includes(requiredHeader)) {
      errors.push(`${label}: missing required column '${requiredHeader}'`);
    }
  }
}

function pushIfEmpty(value, field, rowLabel, errors) {
  if (!value || value.trim() === "") {
    errors.push(`${rowLabel}: '${field}' cannot be empty`);
  }
}

export function validateStrategyTrackers(milestonesTable, actionsTable) {
  const errors = [];

  ensureHeaders(
    milestoneRequiredHeaders,
    milestonesTable.header,
    "docs/strategy/MILESTONES.md",
    errors
  );
  ensureHeaders(
    actionRequiredHeaders,
    actionsTable.header,
    "docs/strategy/FUTURE-ACTIONS.md",
    errors
  );

  if (errors.length > 0) {
    return errors;
  }

  const milestoneRecords = milestonesTable.rows.map((row) =>
    rowToRecord(milestonesTable.header, row)
  );
  const actionRecords = actionsTable.rows.map((row) =>
    rowToRecord(actionsTable.header, row)
  );

  const milestoneIds = new Set();
  for (const milestone of milestoneRecords) {
    const label = `milestone '${milestone.milestone_id || "(missing)"}'`;
    pushIfEmpty(milestone.milestone_id, "milestone_id", label, errors);
    pushIfEmpty(milestone.status, "status", label, errors);

    if (milestone.milestone_id && milestoneIds.has(milestone.milestone_id)) {
      errors.push(`Duplicate milestone_id: ${milestone.milestone_id}`);
    }
    milestoneIds.add(milestone.milestone_id);

    if (milestone.status && !allowedStatuses.has(milestone.status)) {
      errors.push(
        `Milestone '${milestone.milestone_id}' has invalid status '${milestone.status}'.`
      );
    }
  }

  for (const milestone of milestoneRecords) {
    const dependsOn = milestone.depends_on;
    if (!dependsOn || dependsOn === "none") {
      continue;
    }
    if (!milestoneIds.has(dependsOn)) {
      errors.push(
        `Milestone '${milestone.milestone_id}' depends_on unknown milestone '${dependsOn}'.`
      );
    }
  }

  const actionIds = new Set();
  for (const action of actionRecords) {
    const label = `action '${action.action_id || "(missing)"}'`;
    pushIfEmpty(action.action_id, "action_id", label, errors);
    pushIfEmpty(action.linked_milestone_id, "linked_milestone_id", label, errors);
    pushIfEmpty(action.status, "status", label, errors);
    pushIfEmpty(action.evidence_ref, "evidence_ref", label, errors);

    if (action.action_id && actionIds.has(action.action_id)) {
      errors.push(`Duplicate action_id: ${action.action_id}`);
    }
    actionIds.add(action.action_id);

    if (action.status && !allowedStatuses.has(action.status)) {
      errors.push(`Action '${action.action_id}' has invalid status '${action.status}'.`);
    }
    if (
      action.linked_milestone_id &&
      !milestoneIds.has(action.linked_milestone_id)
    ) {
      errors.push(
        `Action '${action.action_id}' links unknown milestone '${action.linked_milestone_id}'.`
      );
    }
  }

  return errors;
}
