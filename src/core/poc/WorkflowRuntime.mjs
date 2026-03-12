import { randomUUID } from "node:crypto";
import {
  normalizeWorkflowArtifact,
  validateWorkflowArtifact,
  getOutgoingEdges,
  renderTemplate
} from "./WorkflowArtifact.mjs";
import {
  resolveRetryPolicy,
  computeBackoffMs,
  buildIdempotencyKey
} from "./RetryPolicy.mjs";
import {
  createOperationCommand,
  createOperationReceipt
} from "./OperationEnvelope.mjs";

function errorToMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function safeJson(value) {
  try {
    return structuredClone(value);
  } catch {
    return JSON.parse(JSON.stringify(value));
  }
}

function removeQueuedNode(queue, nodeId) {
  const index = queue.indexOf(nodeId);
  if (index >= 0) {
    queue.splice(index, 1);
  }
}

function buildScope(state, input) {
  return {
    input,
    run: {
      runId: state.runId,
      status: state.status,
      queue: [...state.queue],
      attempts: { ...state.attempts }
    },
    lastReceipt: state.lastReceipt,
    nodeResults: state.nodeResults
  };
}

function resolveNodePayload(node, scope) {
  if (node.type === "action.http") {
    return {
      url: renderTemplate(String(node.config.url ?? ""), scope),
      method: String(node.config.method ?? "GET").toUpperCase(),
      headers: safeJson(node.config.headers ?? {}),
      body: safeJson(node.config.body)
    };
  }

  if (node.type === "action.openai") {
    return {
      model: String(node.config.model ?? ""),
      prompt: renderTemplate(String(node.config.prompt ?? ""), scope)
    };
  }

  return safeJson(node.config ?? {});
}

export class WorkflowRuntime {
  constructor({
    journalStore,
    connectorExecutors,
    now = () => new Date(),
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    uuid = () => randomUUID()
  }) {
    this.journalStore = journalStore;
    this.connectorExecutors = connectorExecutors ?? {};
    this.now = now;
    this.sleep = sleep;
    this.uuid = uuid;
  }

  async run({ artifact, input = {}, runId = null, crashAfterCommands = null }) {
    const normalized = normalizeWorkflowArtifact(artifact);
    validateWorkflowArtifact(normalized);

    const currentRunId = runId ?? this.uuid();
    const state = {
      runId: currentRunId,
      status: "running",
      queue: /** @type {string[]} */ ([]),
      attempts: /** @type {Record<string, number>} */ ({}),
      nodeResults: /** @type {Record<string, any>} */ ({}),
      lastReceipt: null,
      pendingCommands: /** @type {Map<string, any>} */ (new Map()),
      emittedCommands: 0,
      continuations: /** @type {Map<string, any>} */ (new Map())
    };

    const runStarted = {
      eventType: "run_started",
      at: this.now().toISOString(),
      runId: currentRunId,
      artifact: normalized,
      input: safeJson(input)
    };
    await this.journalStore.appendEvent(currentRunId, runStarted);

    await this.enqueueFrom(state, normalized, "trigger", "always", input, "trigger");
    await this.processQueue(state, normalized, input, { crashAfterCommands });

    if (state.status === "running") {
      state.status = "completed";
    }

    await this.journalStore.appendEvent(currentRunId, {
      eventType: "run_finished",
      at: this.now().toISOString(),
      runId: currentRunId,
      status: state.status,
      queueSize: state.queue.length,
      pendingCommands: state.pendingCommands.size
    });

    return this.toSummary(state, normalized);
  }

  async replay({ runId }) {
    const events = await this.journalStore.readEvents(runId);
    const state = this.reconstructState(events);
    const artifact = state.artifact;
    return {
      runId,
      status: state.status,
      queue: [...state.queue],
      attempts: { ...state.attempts },
      nodeResults: state.nodeResults,
      pendingCommands: [...state.pendingCommands.values()],
      artifactId: artifact ? artifact.artifactId : null,
      artifactVersion: artifact ? artifact.artifactVersion : null,
      eventCount: events.length
    };
  }

  async resume({ runId }) {
    const events = await this.journalStore.readEvents(runId);
    const state = this.reconstructState(events);
    if (!state.artifact) {
      throw new Error(`Cannot resume run '${runId}' without artifact in journal.`);
    }

    if (state.status === "completed") {
      return this.toSummary(state, state.artifact);
    }

    const input = state.input ?? {};
    await this.reconcileIncompleteContinuations(state);
    await this.reconcileContinuationGap(state, state.artifact, input);

    for (const command of [...state.pendingCommands.values()]) {
      await this.dispatchExistingCommand(state, state.artifact, input, command);
    }

    await this.processQueue(state, state.artifact, input, {});

    if (state.status === "running") {
      state.status = "completed";
      await this.journalStore.appendEvent(runId, {
        eventType: "run_finished",
        at: this.now().toISOString(),
        runId,
        status: state.status,
        queueSize: state.queue.length,
        pendingCommands: state.pendingCommands.size
      });
    }

    return this.toSummary(state, state.artifact);
  }

  async inspect({ runId }) {
    const events = await this.journalStore.readEvents(runId);
    return {
      runId,
      timeline: events
    };
  }

  reconstructState(events) {
    const state = {
      runId: "",
      status: "running",
      queue: /** @type {string[]} */ ([]),
      attempts: /** @type {Record<string, number>} */ ({}),
      nodeResults: /** @type {Record<string, any>} */ ({}),
      lastReceipt: null,
      pendingCommands: /** @type {Map<string, any>} */ (new Map()),
      emittedCommands: 0,
      artifact: /** @type {any} */ (null),
      input: /** @type {Record<string, any>} */ ({}),
      lastEvent: /** @type {any} */ (null),
      continuations: /** @type {Map<string, any>} */ (new Map())
    };

    for (const event of events) {
      state.lastEvent = event;
      switch (event.eventType) {
        case "run_started":
          state.runId = event.runId;
          state.artifact = normalizeWorkflowArtifact(event.artifact);
          state.input = event.input ?? {};
          state.status = "running";
          break;
        case "node_enqueued":
          state.queue.push(event.nodeId);
          if (event.continuationId && state.continuations.has(event.continuationId)) {
            state.continuations.get(event.continuationId).enqueuedNodeIds.add(event.nodeId);
          }
          break;
        case "node_dequeued":
          removeQueuedNode(state.queue, event.nodeId);
          break;
        case "command_emitted":
          state.pendingCommands.set(event.command.commandId, event.command);
          state.attempts[event.command.nodeId] = Math.max(
            state.attempts[event.command.nodeId] ?? 0,
            event.command.attempt
          );
          state.emittedCommands += 1;
          break;
        case "receipt_recorded":
          state.pendingCommands.delete(event.receipt.commandId);
          state.lastReceipt = event.receipt;
          state.nodeResults[event.receipt.nodeId] = event.receipt;
          break;
        case "run_finished":
          state.status = event.status;
          break;
        case "node_terminal_failed":
          state.status = "failed";
          break;
        case "continuation_planned":
          state.continuations.set(event.continuationId, {
            continuationId: event.continuationId,
            fromNodeId: event.fromNodeId,
            outcome: event.outcome,
            reason: event.reason,
            nodeIds: event.nodeIds ?? [],
            enqueuedNodeIds: new Set(),
            applied: false
          });
          break;
        case "continuation_applied":
          if (state.continuations.has(event.continuationId)) {
            state.continuations.get(event.continuationId).applied = true;
          }
          break;
        default:
          break;
      }
    }

    return state;
  }

  async reconcileIncompleteContinuations(state) {
    if (state.status !== "running") {
      return;
    }

    for (const continuation of state.continuations.values()) {
      const missingNodeIds = continuation.nodeIds.filter((nodeId) => !continuation.enqueuedNodeIds.has(nodeId));
      if (missingNodeIds.length === 0) {
        if (!continuation.applied) {
          continuation.applied = true;
          await this.journalStore.appendEvent(state.runId, {
            eventType: "continuation_applied",
            at: this.now().toISOString(),
            runId: state.runId,
            continuationId: continuation.continuationId,
            nodeCount: continuation.nodeIds.length
          });
        }
        continue;
      }

      await this.journalStore.appendEvent(state.runId, {
        eventType: "continuation_recovered",
        at: this.now().toISOString(),
        runId: state.runId,
        continuationId: continuation.continuationId,
        missingNodeIds
      });

      for (const nodeId of missingNodeIds) {
        await this.enqueueNode(
          state,
          state.runId,
          nodeId,
          `resume-continuation:${continuation.continuationId}`,
          continuation.continuationId
        );
        continuation.enqueuedNodeIds.add(nodeId);
      }

      continuation.applied = true;
      await this.journalStore.appendEvent(state.runId, {
        eventType: "continuation_applied",
        at: this.now().toISOString(),
        runId: state.runId,
        continuationId: continuation.continuationId,
        nodeCount: continuation.nodeIds.length
      });
    }
  }

  async reconcileContinuationGap(state, artifact, input) {
    if (state.status !== "running") {
      return;
    }
    if (state.pendingCommands.size > 0 || state.queue.length > 0) {
      return;
    }
    if (!state.lastReceipt) {
      return;
    }

    const lastReceipt = state.lastReceipt;
    if (lastReceipt.outcome === "success") {
      await this.enqueueFrom(
        state,
        artifact,
        lastReceipt.nodeId,
        "success",
        input,
        `resume-success:${lastReceipt.nodeId}`
      );
      return;
    }

    const currentNode = artifact.nodes.find((entry) => entry.id === lastReceipt.nodeId);
    const retryPolicy = resolveRetryPolicy({
      artifactDefaults: artifact.defaults?.retry,
      nodeRetry: currentNode?.retry
    });

    if (lastReceipt.attempt < retryPolicy.maxAttempts) {
      const nextAttempt = lastReceipt.attempt + 1;
      const backoffMs = computeBackoffMs({
        attempt: lastReceipt.attempt,
        backoffMs: retryPolicy.backoffMs,
        maxBackoffMs: retryPolicy.maxBackoffMs
      });

      const hasRetryScheduledInTail =
        state.lastEvent?.eventType === "retry_scheduled" &&
        state.lastEvent?.nodeId === lastReceipt.nodeId &&
        state.lastEvent?.attempt === nextAttempt;

      if (!hasRetryScheduledInTail) {
        await this.journalStore.appendEvent(state.runId, {
          eventType: "retry_scheduled",
          at: this.now().toISOString(),
          runId: state.runId,
          nodeId: lastReceipt.nodeId,
          attempt: nextAttempt,
          backoffMs
        });
      }

      if (backoffMs > 0) {
        await this.sleep(backoffMs);
      }

      await this.enqueueNode(state, state.runId, lastReceipt.nodeId, `resume-retry:${nextAttempt}`);
      return;
    }

    const failureEdges = await this.enqueueFrom(
      state,
      artifact,
      lastReceipt.nodeId,
      "failed",
      input,
      `resume-failed:${lastReceipt.nodeId}`
    );

    if (failureEdges === 0 && state.lastEvent?.eventType !== "node_terminal_failed") {
      state.status = "failed";
      await this.journalStore.appendEvent(state.runId, {
        eventType: "node_terminal_failed",
        at: this.now().toISOString(),
        runId: state.runId,
        nodeId: lastReceipt.nodeId,
        reason: lastReceipt.error ?? "resume-terminal-failed-without-failure-edge"
      });
    }
  }

  /**
   * @param {any} state
   * @param {string} runId
   * @param {string} nodeId
   * @param {string} reason
   * @param {string | null} [continuationId]
   */
  async enqueueNode(state, runId, nodeId, reason, continuationId = null) {
    state.queue.push(nodeId);
    await this.journalStore.appendEvent(runId, {
      eventType: "node_enqueued",
      at: this.now().toISOString(),
      runId,
      nodeId,
      reason,
      continuationId,
      queueSize: state.queue.length
    });
  }

  async enqueueFrom(state, artifact, fromNodeId, outcome, input, reason) {
    const scope = buildScope(state, input);
    const nextEdges = getOutgoingEdges(artifact, fromNodeId, outcome, scope);
    if (nextEdges.length === 0) {
      return 0;
    }

    const continuationId = this.uuid();
    const nodeIds = nextEdges.map((edge) => edge.to);
    const continuation = {
      continuationId,
      fromNodeId,
      outcome,
      reason,
      nodeIds,
      enqueuedNodeIds: new Set(),
      applied: false
    };
    state.continuations.set(continuationId, continuation);
    await this.journalStore.appendEvent(state.runId, {
      eventType: "continuation_planned",
      at: this.now().toISOString(),
      runId: state.runId,
      continuationId,
      fromNodeId,
      outcome,
      reason,
      nodeIds
    });

    for (const nodeId of nodeIds) {
      await this.enqueueNode(state, state.runId, nodeId, reason, continuationId);
      continuation.enqueuedNodeIds.add(nodeId);
    }

    continuation.applied = true;
    await this.journalStore.appendEvent(state.runId, {
      eventType: "continuation_applied",
      at: this.now().toISOString(),
      runId: state.runId,
      continuationId,
      nodeCount: nodeIds.length
    });
    return nextEdges.length;
  }

  async processQueue(state, artifact, input, options) {
    const nodeIndex = new Map(artifact.nodes.map((node) => [node.id, node]));

    while (state.queue.length > 0) {
      const nodeId = state.queue[0];
      await this.journalStore.appendEvent(state.runId, {
        eventType: "node_dequeued",
        at: this.now().toISOString(),
        runId: state.runId,
        nodeId,
        queueSize: state.queue.length - 1
      });
      state.queue.shift();

      const node = nodeIndex.get(nodeId);
      if (!node) {
        state.status = "failed";
        await this.journalStore.appendEvent(state.runId, {
          eventType: "node_terminal_failed",
          at: this.now().toISOString(),
          runId: state.runId,
          nodeId,
          reason: "unknown-node"
        });
        continue;
      }

      const attempt = (state.attempts[nodeId] ?? 0) + 1;
      state.attempts[nodeId] = attempt;

      const scope = buildScope(state, input);
      const payload = resolveNodePayload(node, scope);
      const idempotencyKey = buildIdempotencyKey({ runId: state.runId, nodeId, attempt });
      const command = createOperationCommand({
        runId: state.runId,
        nodeId,
        connectorType: node.type,
        payload,
        attempt,
        idempotencyKey,
        now: this.now
      });

      state.pendingCommands.set(command.commandId, command);
      state.emittedCommands += 1;
      await this.journalStore.appendEvent(state.runId, {
        eventType: "command_emitted",
        at: this.now().toISOString(),
        runId: state.runId,
        command
      });

      if (options.crashAfterCommands && state.emittedCommands === options.crashAfterCommands) {
        throw new Error("Injected crash after command emission.");
      }

      await this.dispatchExistingCommand(state, artifact, input, command, node);
    }
  }

  async dispatchExistingCommand(state, artifact, input, command, nodeFromQueue = null) {
    const node = nodeFromQueue ?? artifact.nodes.find((entry) => entry.id === command.nodeId);
    if (!node) {
      throw new Error(`Cannot dispatch command for unknown node '${command.nodeId}'.`);
    }

    const executor = this.connectorExecutors[command.connectorType];
    if (!executor) {
      throw new Error(`Missing connector executor: ${command.connectorType}`);
    }

    const startedAt = Date.now();
    let receipt = null;

    try {
      const result = await executor({
        node: {
          ...node,
          config: {
            ...node.config,
            ...command.payload
          }
        },
        command,
        scope: buildScope(state, input)
      });
      receipt = createOperationReceipt({
        command,
        runId: command.runId,
        nodeId: command.nodeId,
        attempt: command.attempt,
        outcome: "success",
        result,
        durationMs: Date.now() - startedAt,
        now: this.now
      });
    } catch (error) {
      receipt = createOperationReceipt({
        command,
        runId: command.runId,
        nodeId: command.nodeId,
        attempt: command.attempt,
        outcome: "failed",
        error: errorToMessage(error),
        durationMs: Date.now() - startedAt,
        now: this.now
      });
    }

    state.pendingCommands.delete(command.commandId);
    state.lastReceipt = receipt;
    state.nodeResults[command.nodeId] = receipt;

    await this.journalStore.appendEvent(state.runId, {
      eventType: "receipt_recorded",
      at: this.now().toISOString(),
      runId: state.runId,
      receipt
    });

    if (receipt.outcome === "success") {
      await this.enqueueFrom(state, artifact, command.nodeId, "success", input, `success:${command.nodeId}`);
      return;
    }

    const currentNode = artifact.nodes.find((entry) => entry.id === command.nodeId);
    const retryPolicy = resolveRetryPolicy({
      artifactDefaults: artifact.defaults?.retry,
      nodeRetry: currentNode?.retry
    });

    if (command.attempt < retryPolicy.maxAttempts) {
      const backoffMs = computeBackoffMs({
        attempt: command.attempt,
        backoffMs: retryPolicy.backoffMs,
        maxBackoffMs: retryPolicy.maxBackoffMs
      });

      await this.journalStore.appendEvent(state.runId, {
        eventType: "retry_scheduled",
        at: this.now().toISOString(),
        runId: state.runId,
        nodeId: command.nodeId,
        attempt: command.attempt + 1,
        backoffMs
      });

      if (backoffMs > 0) {
        await this.sleep(backoffMs);
      }

      await this.enqueueNode(state, state.runId, command.nodeId, `retry:${command.attempt + 1}`);
      return;
    }

    const failureEdges = await this.enqueueFrom(
      state,
      artifact,
      command.nodeId,
      "failed",
      input,
      `failed:${command.nodeId}`
    );

    if (failureEdges === 0) {
      state.status = "failed";
      await this.journalStore.appendEvent(state.runId, {
        eventType: "node_terminal_failed",
        at: this.now().toISOString(),
        runId: state.runId,
        nodeId: command.nodeId,
        reason: receipt.error ?? "node-failed-without-failure-edge"
      });
    }
  }

  toSummary(state, artifact) {
    return {
      runId: state.runId,
      artifactId: artifact.artifactId,
      artifactVersion: artifact.artifactVersion,
      status: state.status,
      attempts: state.attempts,
      nodeResults: state.nodeResults,
      pendingCommands: [...state.pendingCommands.values()]
    };
  }
}
