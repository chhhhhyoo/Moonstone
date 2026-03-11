import * as fs from 'fs';
import * as path from 'path';

type T = 'happy'|'bad_input'|'system_failure'|'security';

interface TestCase {
  id?: string;
  type?: T;
  command?: string[];
  timeout_ms?: number;
}

function main() {
  const dir = path.join(process.cwd(),'test','integration','conformance');
  if (!fs.existsSync(dir)) {
    console.error("❌ Conformance lint failed:");
    console.error("  - Missing directory: test/integration/conformance");
    process.exit(1);
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  if (!files.length) {
    console.error("❌ Conformance lint failed:");
    console.error("  - No conformance json files found in test/integration/conformance");
    process.exit(1);
  }
  const seen: Record<T, number> = { happy:0, bad_input:0, system_failure:0, security:0 };
  const errors: string[] = [];

  for (const f of files) {
    const p = path.join(dir,f);
    let cases: TestCase[] = [];
    try { cases = JSON.parse(fs.readFileSync(p,'utf-8')); }
    catch { errors.push(`Invalid JSON: ${f}`); continue; }

    for (const c of cases) {
      if (!c.id) errors.push(`${f}: missing id`);
      if (!c.type) errors.push(`${f}: ${c.id||'(unknown)'} missing type`);
      if (!c.command || !Array.isArray(c.command) || c.command.length === 0) errors.push(`${f}: ${c.id||'(unknown)'} command must be non-empty array`);
      if (!c.timeout_ms || c.timeout_ms < 1) errors.push(`${f}: ${c.id||'(unknown)'} timeout_ms required`);
      if (c.type) seen[c.type] += 1;
    }
  }

  (Object.keys(seen) as T[]).forEach(k => { if (seen[k] === 0) errors.push(`Suite missing required test type: ${k}`); });

  if (errors.length) {
    console.error('❌ Conformance lint failed:');
    errors.forEach(e => console.error('  - ' + e));
    process.exit(1);
  }

  console.log('✅ Conformance lint passed');
}
main();
