import * as fs from 'fs';
type ToolType = 'read'|'list'|'write'|'action';

interface ToolSchema {
  name?: string;
  description?: string;
  "x-tool-type"?: ToolType;
  inputSchema?: { type?: string; properties?: Record<string, any>; };
}

function fail(errs: string[]) {
  console.error('❌ Tool validation failed:');
  errs.forEach(e => console.error('  - ' + e));
  process.exit(1);
}

function main() {
  const p = process.argv[2];
  if (!p) fail(['Usage: validate_tool.ts <path/to/tool.json>']);

  let data: ToolSchema;
  try { data = JSON.parse(fs.readFileSync(p,'utf-8')); }
  catch { fail(['Invalid JSON']); return; }

  const errors: string[] = [];
  if (!data.name) errors.push('Missing name');
  if (!data["x-tool-type"]) errors.push('Missing x-tool-type');
  if (!data.description || data.description.length < 60) errors.push('Description too short (>=60 chars). Include Use when / Do not use.');
  if (data.description) {
    const d = data.description.toLowerCase();
    if (!d.includes('use when')) errors.push('Description must include "Use when"');
    if (!(d.includes('do not use') || d.includes("don't use"))) errors.push('Description must include "Do not use"');
  }
  if (!data.inputSchema || data.inputSchema.type !== 'object') errors.push('inputSchema.type must be "object"');
  const props = data.inputSchema?.properties || {};
  if (!Object.keys(props).length) errors.push('inputSchema.properties must be non-empty');

  if (data["x-tool-type"] === 'list') {
    if (!('limit' in props || 'pageSize' in props)) errors.push('[list] Missing limit/pageSize');
    if (!('cursor' in props || 'pageToken' in props)) errors.push('[list] Missing cursor/pageToken');
    if (!('fields' in props || 'select' in props)) errors.push('[list] Add fields/select to bound payload');
  }
  if (data["x-tool-type"] === 'write' || data["x-tool-type"] === 'action') {
    if (!('dryRun' in props || 'confirm' in props || 'idempotencyKey' in props)) errors.push('[write/action] Missing dryRun/confirm/idempotencyKey');
  }

  if (errors.length) fail(errors);
  console.log('✅ Tool schema valid');
}
main();
