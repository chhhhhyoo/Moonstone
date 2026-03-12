import path from "node:path";
import { mkdir, appendFile, readFile, readdir } from "node:fs/promises";

export class FileRunJournalStore {
  constructor({ rootDir = ".moonstone/poc-journal" } = {}) {
    this.rootDir = rootDir;
  }

  getRunPath(runId) {
    return path.join(this.rootDir, `${runId}.jsonl`);
  }

  async ensureRoot() {
    await mkdir(this.rootDir, { recursive: true });
  }

  async appendEvent(runId, event) {
    await this.ensureRoot();
    const line = `${JSON.stringify(event)}\n`;
    await appendFile(this.getRunPath(runId), line, "utf8");
  }

  async readEvents(runId) {
    const content = await readFile(this.getRunPath(runId), "utf8");
    return content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "")
      .map((line) => JSON.parse(line));
  }

  async listRunIds() {
    await this.ensureRoot();
    const entries = await readdir(this.rootDir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".jsonl"))
      .map((entry) => entry.name.replace(/\.jsonl$/, ""));
  }
}
