import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";

const CONFORMANCE_DIR = path.join(process.cwd(), "test", "integration", "conformance");
const SAFE_BINS = new Set(["node", "python", "python3", "echo", "cat", "ls", "grep"]);
const DENY_RE = /(rm\s+-rf\b|mkfs\b|dd\s+if=\b|:\(\)\{:\||\/dev\/sd[a-z])/;

function listFiles(root, predicate, options = {}) {
  const { skipDirs = new Set() } = options;
  const entries = readdirSync(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      if (skipDirs.has(entry.name)) {
        continue;
      }
      files.push(...listFiles(full, predicate, options));
      continue;
    }
    if (entry.isFile() && predicate(entry.name, full)) {
      files.push(full);
    }
  }
  return files;
}

function tail(text, length = 4000) {
  if (text.length <= length) {
    return text;
  }
  return text.slice(-length);
}

function isSafeCommand(command) {
  const [bin, ...args] = command;
  if (!SAFE_BINS.has(bin)) {
    return `Binary not allowed: ${bin}`;
  }
  if (DENY_RE.test(command.join(" "))) {
    return "Denylisted command signature detected";
  }
  if (bin === "node") {
    const bannedFlags = new Set(["-e", "--eval", "-p", "--print"]);
    if (args.some((arg) => bannedFlags.has(arg))) {
      return "node eval/print flags are not allowed";
    }
    const firstArg = args[0] ?? "";
    if (!firstArg || firstArg.startsWith("-")) {
      return "node first arg must be a relative script path";
    }
    if (path.isAbsolute(firstArg)) {
      return "absolute script paths are not allowed";
    }
    if (firstArg.includes("..")) {
      return "path traversal is not allowed";
    }
  }
  return null;
}

async function runJsonCase(testCase) {
  const safetyViolation = isSafeCommand(testCase.command);
  if (safetyViolation) {
    return { ok: false, reasons: [`BLOCKED: ${safetyViolation}`], stdout: "", stderr: "" };
  }

  const [bin, ...args] = testCase.command;
  return new Promise((resolve) => {
    const child = spawn(bin, args, { shell: false });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, testCase.timeout_ms);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      clearTimeout(timeout);
      resolve({
        ok: false,
        reasons: [`Spawn error: ${error.message}`],
        stdout,
        stderr
      });
    });

    child.on("close", (code) => {
      clearTimeout(timeout);
      const reasons = [];
      if (timedOut) {
        reasons.push(`Timed out (${testCase.timeout_ms}ms)`);
      }

      const expectedExitCode = testCase.expect?.exit_code ?? 0;
      if (code !== expectedExitCode) {
        reasons.push(`Exit code ${code} (expected ${expectedExitCode})`);
      }

      for (const expected of testCase.expect?.stdout_contains ?? []) {
        if (!stdout.includes(expected)) {
          reasons.push(`Missing stdout: "${expected}"`);
        }
      }
      for (const expected of testCase.expect?.stderr_contains ?? []) {
        if (!stderr.includes(expected)) {
          reasons.push(`Missing stderr: "${expected}"`);
        }
      }
      for (const forbidden of testCase.forbid?.stdout_contains ?? []) {
        if (stdout.includes(forbidden)) {
          reasons.push(`Forbidden stdout: "${forbidden}"`);
        }
      }
      for (const forbidden of testCase.forbid?.stderr_contains ?? []) {
        if (stderr.includes(forbidden)) {
          reasons.push(`Forbidden stderr: "${forbidden}"`);
        }
      }

      resolve({ ok: reasons.length === 0, reasons, stdout, stderr });
    });
  });
}

async function runJsonSuites(jsonSuiteFiles) {
  let failures = 0;
  for (const file of jsonSuiteFiles) {
    let testCases;
    try {
      testCases = JSON.parse(readFileSync(file, "utf8"));
    } catch {
      console.error(`FAIL: parse error in ${path.relative(process.cwd(), file)}`);
      failures += 1;
      continue;
    }

    if (!Array.isArray(testCases)) {
      console.error(`FAIL: ${path.relative(process.cwd(), file)} root must be an array`);
      failures += 1;
      continue;
    }

    for (const testCase of testCases) {
      const testId = typeof testCase?.id === "string" && testCase.id.length > 0 ? testCase.id : "(unknown)";
      if (!Array.isArray(testCase?.command) || testCase.command.length === 0) {
        console.error(`FAIL: ${testId} in ${path.relative(process.cwd(), file)} has invalid command array`);
        failures += 1;
        continue;
      }
      if (typeof testCase?.timeout_ms !== "number" || testCase.timeout_ms < 1) {
        console.error(`FAIL: ${testId} in ${path.relative(process.cwd(), file)} has invalid timeout_ms`);
        failures += 1;
        continue;
      }

      process.stdout.write(`Running ${testId}... `);
      const result = await runJsonCase(testCase);
      if (result.ok) {
        console.log("PASS");
        continue;
      }
      console.log("FAIL");
      for (const reason of result.reasons) {
        console.log(`  - ${reason}`);
      }
      console.log("  --- stdout (tail) ---");
      console.log(tail(result.stdout));
      console.log("  --- stderr (tail) ---");
      console.log(tail(result.stderr));
      failures += 1;
    }
  }
  return failures;
}

function runMjsSuites(mjsSuiteFiles) {
  const result = spawnSync("node", ["--test", ...mjsSuiteFiles], { stdio: "inherit" });
  return result.status ?? 1;
}

async function main() {
  try {
    statSync(CONFORMANCE_DIR);
  } catch {
    console.error("FAIL: missing conformance directory test/integration/conformance");
    process.exit(1);
  }

  const jsonSuiteFiles = listFiles(
    CONFORMANCE_DIR,
    (name) => name.endsWith(".json"),
    { skipDirs: new Set(["fixtures"]) }
  );
  const mjsSuiteFiles = listFiles(CONFORMANCE_DIR, (name) => name.endsWith(".test.mjs"));

  if (jsonSuiteFiles.length === 0 && mjsSuiteFiles.length === 0) {
    console.error("FAIL: no conformance suites found (.json or .test.mjs)");
    process.exit(1);
  }

  let failures = 0;
  if (jsonSuiteFiles.length > 0) {
    console.log("Running JSON conformance suites (shell=false)");
    failures += await runJsonSuites(jsonSuiteFiles);
  } else {
    console.log("INFO: No JSON conformance suites found outside fixtures; skipping JSON runner.");
  }

  if (mjsSuiteFiles.length > 0) {
    console.log("Running .mjs conformance test suites");
    const status = runMjsSuites(mjsSuiteFiles);
    if (status !== 0) {
      failures += 1;
    }
  } else {
    console.log("INFO: No .test.mjs conformance suites found; skipping Node test runner.");
  }

  process.exit(failures > 0 ? 1 : 0);
}

await main();
