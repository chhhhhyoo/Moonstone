#!/usr/bin/env ts-node

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawn } = require("child_process");

interface WorkerOptions {
  "job-dir"?: string;
  member?: string;
  "safe-member"?: string;
  command?: string;
  timeout?: string;
  [key: string]: string | boolean | undefined;
}

interface JobStatus {
  member: string;
  state:
    | "queued"
    | "running"
    | "done"
    | "error"
    | "timed_out"
    | "canceled"
    | "missing_cli";
  message?: string | null;
  startedAt?: string;
  finishedAt?: string;
  command: string;
  pid?: number | null;
  exitCode?: number | null;
  signal?: string | null;
}

function exitWithError(message: string): never {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function parseArgs(argv: string[]): WorkerOptions {
  const args = argv.slice(2);
  const out: WorkerOptions = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (!a.startsWith("--")) {
      continue;
    }

    const [key, rawValue] = a.split("=", 2);
    const normalizedKey = key.slice(2);
    if (rawValue != null) {
      out[normalizedKey] = rawValue;
      continue;
    }
    const next = args[i + 1];
    if (next == null || next.startsWith("--")) {
      out[normalizedKey] = true;
      continue;
    }
    out[normalizedKey] = next;
    i++;
  }
  return out;
}

function splitCommand(command: string): string[] | null {
  const tokens: string[] = [];
  let current = "";
  let inSingle = false;
  let inDouble = false;
  let escapeNext = false;

  for (const ch of String(command || "")) {
    if (escapeNext) {
      current += ch;
      escapeNext = false;
      continue;
    }

    if (!inSingle && ch === "\\") {
      escapeNext = true;
      continue;
    }

    if (!inDouble && ch === "'") {
      inSingle = !inSingle;
      continue;
    }

    if (!inSingle && ch === '"') {
      inDouble = !inDouble;
      continue;
    }

    if (!inSingle && !inDouble && /\s/.test(ch)) {
      if (current) tokens.push(current);
      current = "";
      continue;
    }

    current += ch;
  }

  if (current) tokens.push(current);
  if (inSingle || inDouble) return null;
  return tokens;
}

function atomicWriteJson(filePath: string, payload: any): void {
  const tmpPath = `${filePath}.${process.pid}.${crypto.randomBytes(4).toString("hex")}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(payload, null, 2), "utf8");
  fs.renameSync(tmpPath, filePath);
}

function main(): void {
  const options = parseArgs(process.argv);
  const jobDir = options["job-dir"] as string;
  const member = options["member"] as string;
  const safeMember = options["safe-member"] as string;
  const command = options["command"] as string;
  const timeoutSec = options["timeout"] ? Number(options["timeout"]) : 0;

  if (!jobDir) exitWithError("worker: missing --job-dir");
  if (!member) exitWithError("worker: missing --member");
  if (!safeMember) exitWithError("worker: missing --safe-member");
  if (!command) exitWithError("worker: missing --command");

  const membersRoot = path.join(jobDir, "members");
  const memberDir = path.join(membersRoot, safeMember);
  const statusPath = path.join(memberDir, "status.json");
  const outPath = path.join(memberDir, "output.txt");
  const errPath = path.join(memberDir, "error.txt");

  const promptPath = path.join(jobDir, "prompt.txt");
  const prompt = fs.existsSync(promptPath)
    ? fs.readFileSync(promptPath, "utf8")
    : "";

  const tokens = splitCommand(command);
  if (!tokens || tokens.length === 0) {
    atomicWriteJson(statusPath, {
      member,
      state: "error",
      message: "Invalid command string",
      finishedAt: new Date().toISOString(),
      command,
    });
    process.exit(1);
  }

  const program = tokens[0];
  const args = tokens.slice(1);

  atomicWriteJson(statusPath, {
    member,
    state: "running",
    startedAt: new Date().toISOString(),
    command,
    pid: null,
  });

  const outStream = fs.createWriteStream(outPath, { flags: "w" });
  const errStream = fs.createWriteStream(errPath, { flags: "w" });

  let child: any;
  try {
    child = spawn(program, [...args, prompt], {
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });
  } catch (error: any) {
    atomicWriteJson(statusPath, {
      member,
      state: "error",
      message:
        error && error.message ? error.message : "Failed to spawn command",
      finishedAt: new Date().toISOString(),
      command,
    });
    process.exit(1);
  }

  atomicWriteJson(statusPath, {
    member,
    state: "running",
    startedAt: new Date().toISOString(),
    command,
    pid: child.pid,
  });

  if (child.stdout) child.stdout.pipe(outStream);
  if (child.stderr) child.stderr.pipe(errStream);

  let timeoutHandle: NodeJS.Timeout | null = null;
  let timeoutTriggered = false;
  if (Number.isFinite(timeoutSec) && timeoutSec > 0) {
    timeoutHandle = setTimeout(() => {
      timeoutTriggered = true;
      try {
        if (child.pid) process.kill(child.pid, "SIGTERM");
      } catch {
        // ignore
      }
    }, timeoutSec * 1000);
    timeoutHandle.unref();
  }

  const finalize = (payload: JobStatus) => {
    try {
      outStream.end();
      errStream.end();
    } catch {
      // ignore
    }
    atomicWriteJson(statusPath, payload);
  };

  child.on("error", (error: any) => {
    const isMissing = error && error.code === "ENOENT";
    finalize({
      member,
      state: isMissing ? "missing_cli" : "error",
      message: error && error.message ? error.message : "Process error",
      finishedAt: new Date().toISOString(),
      command,
      exitCode: null,
      pid: child.pid,
    });
    process.exit(1);
  });

  child.on("exit", (code: number | null, signal: string | null) => {
    if (timeoutHandle) clearTimeout(timeoutHandle);
    const timedOut = Boolean(timeoutTriggered) && signal === "SIGTERM";
    const canceled = !timedOut && signal === "SIGTERM";
    finalize({
      member,
      state: timedOut
        ? "timed_out"
        : canceled
          ? "canceled"
          : code === 0
            ? "done"
            : "error",
      message: timedOut
        ? `Timed out after ${timeoutSec}s`
        : canceled
          ? "Canceled"
          : null,
      finishedAt: new Date().toISOString(),
      command,
      exitCode: typeof code === "number" ? code : null,
      signal: signal || null,
      pid: child.pid,
    });
    process.exit(code === 0 ? 0 : 1);
  });
}

main();
