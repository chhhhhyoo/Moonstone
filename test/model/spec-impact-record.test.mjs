import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

test("bootstrap spec-impact record contains required frontmatter fields", async () => {
  const content = await fs.readFile("notes/spec-impact/2026-03-09-moonstone-bootstrap.md", "utf8");
  assert.match(content, /status:/);
  assert.match(content, /changed_areas:/);
  assert.match(content, /consulted_sources:/);
  assert.match(content, /decisions:/);
});
