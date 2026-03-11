import test from "node:test";
import assert from "node:assert/strict";
import { buildSessionKey, buildSessionScope } from "../../../src/core/SessionKey.mjs";

test("buildSessionScope uses thread when available", () => {
  const scope = buildSessionScope({
    source: "rest",
    conversationId: "conv-1",
    threadId: "thread-9",
    userId: "user-3"
  });
  assert.equal(scope, "rest:conv-1:thread-9:user-3");
});

test("buildSessionScope uses '-' when thread is missing", () => {
  const scope = buildSessionScope({
    source: "rest",
    conversationId: "conv-1",
    threadId: null,
    userId: "user-3"
  });
  assert.equal(scope, "rest:conv-1:-:user-3");
});

test("buildSessionKey appends agent id", () => {
  const key = buildSessionKey(
    { source: "rest", conversationId: "conv-1", threadId: null, userId: "user-3" },
    "intake"
  );
  assert.equal(key, "rest:conv-1:-:user-3:intake");
});
