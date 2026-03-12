import net from "node:net";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export function parseJsonOutput(stdout, commandLabel) {
  const trimmed = String(stdout ?? "").trim();
  if (!trimmed) {
    throw new Error(`${commandLabel} produced empty stdout.`);
  }
  try {
    return JSON.parse(trimmed);
  } catch (error) {
    throw new Error(
      `${commandLabel} produced non-JSON stdout: ${error instanceof Error ? error.message : String(error)}\n${trimmed}`
    );
  }
}

export async function runNodeScript(args, options = {}) {
  try {
    return await execFileAsync(process.execPath, args, {
      cwd: options.cwd ?? process.cwd(),
      env: {
        ...process.env,
        ...(options.env ?? {})
      }
    });
  } catch (error) {
    if (error && typeof error === "object" && "stdout" in error) {
      const stdout = String(error.stdout ?? "");
      const stderr = String(error.stderr ?? "");
      throw new Error(
        `Command failed: node ${args.join(" ")}\nstdout:\n${stdout}\nstderr:\n${stderr}`
      );
    }
    throw error;
  }
}

export function spawnNodeScript(args, options = {}) {
  return spawn(process.execPath, args, {
    cwd: options.cwd ?? process.cwd(),
    env: {
      ...process.env,
      ...(options.env ?? {})
    },
    stdio: options.stdio ?? "pipe"
  });
}

export async function stopNodeProcess(child, graceMs = 200) {
  if (!child || child.killed || child.exitCode !== null) {
    return;
  }
  child.kill("SIGTERM");
  await new Promise((resolve) => setTimeout(resolve, graceMs));
  if (child.exitCode === null) {
    child.kill("SIGKILL");
  }
}

export async function waitForHttpOk(url, timeoutMs = 8_000, intervalMs = 100) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // continue polling
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error(`Timed out waiting for healthy HTTP endpoint: ${url}`);
}

export async function getAvailablePort() {
  return await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Could not resolve available port."));
        return;
      }
      const { port } = address;
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(port);
      });
    });
    server.on("error", reject);
  });
}
