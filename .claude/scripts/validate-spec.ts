import * as fs from 'fs';

const REQUIRED = [/^## Vision/m, /^## Goals/m, /^## Non-goals/m, /^## Success criteria/m, /^## Extended TOC/m, /^## Decision log/m];

function main() {
  if (!fs.existsSync('SPEC.md')) { console.error('Missing SPEC.md'); process.exit(1); }
  const txt = fs.readFileSync('SPEC.md', 'utf-8');

  if (!txt.startsWith('---') || !txt.includes('specVersion:')) {
    console.error('SPEC.md missing YAML frontmatter with specVersion');
    process.exit(1);
  }

  const missing = REQUIRED.filter(r => !r.test(txt));
  if (missing.length) {
    console.error('Missing required sections:');
    missing.forEach(r => console.error('  - ' + r.source));
    process.exit(1);
  }

  console.log('SPEC structure valid');
}
main();
