export class ActorStore {
  constructor({ ttlMs = 10 * 60 * 1000 } = {}) {
    this.ttlMs = ttlMs;
    this.store = new Map();
    this.scopeIndex = new Map();
  }

  setAgent({ sessionScope, sessionKey, agent, state }) {
    const now = Date.now();
    this.store.set(sessionKey, { sessionScope, sessionKey, agent, state, touchedAt: now });
    this.scopeIndex.set(sessionScope, sessionKey);
  }

  getAgentByScope(sessionScope) {
    const key = this.scopeIndex.get(sessionScope);
    if (!key) {
      return null;
    }
    const row = this.store.get(key);
    if (!row) {
      this.scopeIndex.delete(sessionScope);
      return null;
    }
    if (Date.now() - row.touchedAt > this.ttlMs) {
      this.clearActor(row.sessionKey);
      return null;
    }
    return row;
  }

  touchSession(sessionKey, nextState) {
    const row = this.store.get(sessionKey);
    if (!row) {
      return;
    }
    row.touchedAt = Date.now();
    if (nextState) {
      row.state = nextState;
    }
    this.store.set(sessionKey, row);
  }

  clearActor(sessionKey) {
    const row = this.store.get(sessionKey);
    if (!row) {
      return;
    }
    this.store.delete(sessionKey);
    this.scopeIndex.delete(row.sessionScope);
  }
}
