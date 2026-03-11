// @ts-nocheck
import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';

interface TestCase {
  id: string;
  type?: string;
  command: string[];
  timeout_ms: number;
  expect?: { exit_code?: number; stdout_contains?: string[]; stderr_contains?: string[]; };
  forbid?: { stdout_contains?: string[]; stderr_contains?: string[]; };
}

const SAFE_BINS = new Set(['node', 'python', 'python3', 'echo', 'cat', 'ls', 'grep']);
const DENY_RE = /(rm\s+-rf\b|mkfs\b|dd\s+if=\b|:\(\)\{:\||\/dev\/sd[a-z])/;

function isSafe(tc: TestCase): string | null {
  const [bin, ...args] = tc.command;
  if (!SAFE_BINS.has(bin)) return `Binary not allowed: ${bin}`;
  if (DENY_RE.test(tc.command.join(' '))) return 'denylisted signature detected';

  if (bin === 'node') {
    const banned = new Set(['-e', '--eval', '-p', '--print']);
    if (args.some(a => banned.has(a))) return 'node eval/print flags not allowed';
    const first = args[0] || '';
    if (!first || first.startsWith('-')) return 'node first arg must be a script path';
    if (path.isAbsolute(first)) return 'absolute paths not allowed';
    if (first.includes('..')) return 'path traversal not allowed';
  }
  return null;
}

function tail(s: string, n = 4000) { return s.length <= n ? s : s.slice(-n); }

async function runOne(tc: TestCase) {
  const safe = isSafe(tc);
  if (safe) return { ok: false, reasons: [`BLOCKED: ${safe}`], stdout: '', stderr: '', code: null as number | null };

  const [bin, ...args] = tc.command;

  return new Promise<{ ok: boolean; reasons: string[]; stdout: string; stderr: string; code: number | null }>(resolve => {
    const child = child_process.spawn(bin, args, { shell: false });

    let stdout = '', stderr = '';
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; child.kill('SIGKILL'); }, tc.timeout_ms);

    child.stdout.on('data', d => stdout += d.toString());
    child.stderr.on('data', d => stderr += d.toString());

    child.on('error', err => { clearTimeout(timer); resolve({ ok: false, reasons: [`Spawn error: ${err.message}`], stdout, stderr, code: null }); });

    child.on('close', code => {
      clearTimeout(timer);
      const reasons: string[] = [];
      if (timedOut) reasons.push(`Timed out (${tc.timeout_ms}ms)`);

      const exp = tc.expect?.exit_code ?? 0;
      if (code !== exp) reasons.push(`Exit code ${code} (expected ${exp})`);

      (tc.expect?.stdout_contains || []).forEach(s => { if (!stdout.includes(s)) reasons.push(`Missing stdout: "${s}"`); });
      (tc.expect?.stderr_contains || []).forEach(s => { if (!stderr.includes(s)) reasons.push(`Missing stderr: "${s}"`); });
      (tc.forbid?.stdout_contains || []).forEach(s => { if (stdout.includes(s)) reasons.push(`Forbidden stdout: "${s}"`); });
      (tc.forbid?.stderr_contains || []).forEach(s => { if (stderr.includes(s)) reasons.push(`Forbidden stderr: "${s}"`); });

      resolve({ ok: reasons.length === 0, reasons, stdout, stderr, code });
    });
  });
}

async function main() {
  const dir = path.join(process.cwd(), 'test', 'integration', 'conformance');
  if (!fs.existsSync(dir)) {
    console.error('Missing conformance directory: test/integration/conformance');
    process.exit(1);
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  if (!files.length) {
    console.error('No conformance tests found in test/integration/conformance');
    process.exit(1);
  }

  let fails = 0;
  console.log('Running conformance tests (shell=false)');

  for (const f of files) {
    let cases: TestCase[] = [];
    try { cases = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8')); }
    catch { console.error(`Parse error: ${f}`); fails++; continue; }

    for (const tc of cases) {
      process.stdout.write(`Running ${tc.id}... `);
      const res = await runOne(tc);
      if (res.ok) console.log('PASS');
      else {
        console.log('FAIL');
        res.reasons.forEach(r => console.log(`  - ${r}`));
        console.log('  --- stdout (tail) ---'); console.log(tail(res.stdout));
        console.log('  --- stderr (tail) ---'); console.log(tail(res.stderr));
        fails++;
      }
    }
  }

  process.exit(fails ? 1 : 0);
}
main();
