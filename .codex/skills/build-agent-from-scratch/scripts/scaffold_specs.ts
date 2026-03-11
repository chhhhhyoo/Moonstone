import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

function exists(p: string) { try { fs.accessSync(p); return true; } catch { return false; } }
function ensureDir(p: string) { fs.mkdirSync(p, { recursive: true }); }

function likelyFirstRun(): boolean {
  if (!exists('.git')) return true;
  try { execSync('git rev-parse --verify HEAD', { stdio: 'ignore' }); return false; }
  catch { return true; }
}

function specTouched(): boolean {
  try {
    const st = execSync('git status --porcelain SPEC.md specs', { encoding: 'utf-8' }).trim();
    return st.length > 0;
  } catch { return true; }
}

function main() {
  ensureDir('specs');
  ensureDir(path.join('tests','conformance'));

  if (!likelyFirstRun() && exists('SPEC.md') && !specTouched()) {
    console.error('❌ Gate failed: SPEC.md/specs unchanged. Update spec before scaffolding.');
    process.exit(1);
  }

  const subs = ['01-architecture.md','02-workflows.md','03-tooling.md','04-validation.md'];
  for (const f of subs) {
    const p = path.join('specs', f);
    if (!exists(p)) fs.writeFileSync(p, `---\nspecVersion: 1.0.0\nrole: sub-spec\n---\n# ${f}\n\n## Purpose\n`);
  }
  console.log('✅ Scaffold complete');
}
main();
