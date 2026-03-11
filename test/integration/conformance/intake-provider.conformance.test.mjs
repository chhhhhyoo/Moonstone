import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { ResearchProviderProxy } from "../../../src/provider/mock/ResearchProviderProxy.mjs";

test("provider conformance: valid query returns expected contract", async () => {
  const fixture = JSON.parse(
    await fs.readFile("test/integration/conformance/fixtures/intake-provider.json", "utf8")
  );
  const provider = new ResearchProviderProxy();
  const result = await provider.query({ query: fixture.query });

  assert.equal(result.source, fixture.expectedSource);
  assert.equal(Array.isArray(result.items), true);
  assert.equal(result.items.length > 0, true);
  for (const field of fixture.requiredItemFields) {
    assert.equal(field in result.items[0], true);
  }
});

test("provider conformance: empty query fails closed", async () => {
  const provider = new ResearchProviderProxy();
  await assert.rejects(async () => provider.query({ query: "" }));
});
