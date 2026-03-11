import fs from "node:fs";

const LAZY_MARKERS = [
  "[TODO]",
  "TODO:",
  "TBD",
  "To be determined",
  "[Insert text]",
  "lorem ipsum"
];

function main() {
  if (!fs.existsSync("SPEC.md")) {
    process.exit(0);
  }

  const content = fs.readFileSync("SPEC.md", "utf8");
  const errors = [];

  for (const marker of LAZY_MARKERS) {
    if (content.includes(marker)) {
      errors.push(`Placeholder found: ${marker}`);
    }
  }

  if (content.toLowerCase().includes("todo") && !LAZY_MARKERS.some((marker) => content.includes(marker))) {
    errors.push("General TODO detected (case-insensitive)");
  }

  if (/^## .+\n\s*\n## /m.test(content)) {
    errors.push("Empty section detected (heading followed by heading).");
  }

  if (errors.length > 0) {
    console.error("SPEC lint failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("SPEC lint passed");
}

main();
