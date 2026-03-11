/* eslint-disable */
const fs = require("fs");
const path = require("path");

// Calculate project root relative to this script's location (two levels up from .gemini/scripts/)
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

const CONFIG = {
  targetFile: path.join(PROJECT_ROOT, ".gemini", "GEMINI.md"),
  sections: [
    { header: "[Commands]", root: ".gemini/commands", type: "files" },
    { header: "[Skills]", root: ".gemini/skills", type: "dirs" },
    { header: "[Specs]", root: "specs", type: "files_with_desc" },
    { header: "[Playbooks]", root: "notes", type: "files_with_desc" },
    { header: "[Docs]", root: "docs", type: "files_recursive" },
  ],
};

function getFirstLine(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed && !trimmed.startsWith("---") && !trimmed.startsWith("#")) {
        return trimmed.slice(0, 50) + "..."; // truncate
      }
      if (trimmed.startsWith("# ")) {
        return trimmed.replace(/^#\s+/, "");
      }
    }
    return "";
  } catch (e) {
    return "";
  }
}

function generateSection(config) {
  const absoluteRoot = path.resolve(PROJECT_ROOT, config.root);
  if (!fs.existsSync(absoluteRoot)) return "";

  const lines = [];
  const entries = fs.readdirSync(absoluteRoot, { withFileTypes: true });

  if (config.type === "dirs") {
    const skills = entries
      .filter((e) => e.isDirectory() && !e.name.startsWith("."))
      .map((e) => e.name);

    if (skills.length > 0) {
      lines.push(`|{${skills.join(",")}}`);
    }
  } else if (config.type === "files") {
    entries
      .filter((e) => e.isFile() && !e.name.startsWith("."))
      .forEach((e) => {
        lines.push(`|${e.name}`);
      });
  } else if (config.type === "files_with_desc") {
    entries
      .filter((e) => e.isFile() && e.name.endsWith(".md"))
      .forEach((e) => {
        const desc = getFirstLine(path.join(absoluteRoot, e.name));
        lines.push(`|${e.name}: ${desc}`);
      });
  } else if (config.type === "files_recursive") {
    entries.forEach((e) => {
      if (e.isFile() && e.name.endsWith(".md")) {
        lines.push(`|${e.name}`);
      } else if (e.isDirectory() && !e.name.startsWith(".")) {
        lines.push(`|${e.name}/*`);
      }
    });
  }

  if (lines.length === 0) return "";
  return `${config.header}|root: ./${config.root}\n${lines.join("\n")}`;
}

function main() {
  console.log(`Generating Cognitive Map for root: ${PROJECT_ROOT}...`);

  let mapContent =
    "## 🗺️ Cognitive Hub (Context Map)\nIMPORTANT: Prefer retrieval-led reasoning over pre-training-led. Read files below for specialized logic.\n\n";

  let totalItemsFound = 0;

  for (const section of CONFIG.sections) {
    const content = generateSection(section);
    if (content) {
      mapContent += content + "\n\n";
      totalItemsFound++;
    }
  }

  // Safety Gate: Don't update if everything is empty
  if (totalItemsFound === 0) {
    console.warn(
      "⚠️ No items found in any section. Aborting update to prevent map wipeout.",
    );
    return;
  }

  let fileContent = "";
  if (fs.existsSync(CONFIG.targetFile)) {
    fileContent = fs.readFileSync(CONFIG.targetFile, "utf8");
  } else {
    console.log(`Target file ${CONFIG.targetFile} not found. Creating it...`);
    fileContent = "# Gemini Project\n\n";
  }

  const startMarker = "## 🗺️ Cognitive Hub";
  const markerIndex = fileContent.indexOf(startMarker);

  if (markerIndex !== -1) {
    const nextSectionIndex = fileContent.indexOf(
      "\n## ",
      markerIndex + startMarker.length,
    );

    if (nextSectionIndex !== -1) {
      fileContent =
        fileContent.slice(0, markerIndex) +
        mapContent +
        fileContent.slice(nextSectionIndex);
    } else {
      fileContent = fileContent.slice(0, markerIndex) + mapContent;
    }
  } else {
    fileContent += "\n\n" + mapContent;
  }

  fs.writeFileSync(CONFIG.targetFile, fileContent);
  console.log(`Successfully updated ${CONFIG.targetFile}`);
}

main();
