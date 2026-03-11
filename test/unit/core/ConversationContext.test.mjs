import test from "node:test";
import assert from "node:assert/strict";
import { normalizeConversationContext } from "../../../src/core/ConversationContext.mjs";

test("normalizeConversationContext fills defaults", () => {
  const context = normalizeConversationContext({
    source: "rest",
    conversationId: "conv-1",
    userId: "user-1"
  });
  assert.equal(context.source, "rest");
  assert.equal(context.conversationId, "conv-1");
  assert.equal(context.userId, "user-1");
  assert.equal(typeof context.requestId, "string");
  assert.equal(typeof context.receivedAt, "string");
  assert.deepEqual(context.metadata, {});
});

test("normalizeConversationContext rejects missing required fields", () => {
  assert.throws(() => normalizeConversationContext({ source: "rest" }));
});
