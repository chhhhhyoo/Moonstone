import * as fs from "fs";

const LAZY = [
  "[TODO]",
  "TODO:",
  "TBD",
  "To be determined",
  "[Insert text]",
  "lorem ipsum",
];

function main() {
  if (!fs.existsSync("SPEC.md")) process.exit(0);
  const txt = fs.readFileSync("SPEC.md", "utf-8");
  const errors: string[] = [
    ...LAZY.filter((m) => txt.includes(m)).map(
      (m) => `Placeholder found: ${m}`,
    ),
    ...(txt.toLowerCase().includes("todo") && !LAZY.some((m) => txt.includes(m))
      ? ["General TODO detected (case-insensitive)"]
      : []),
  ];

  if (/^## .+\n\s*\n## /m.test(txt))
    errors.push("Empty section detected (heading followed by heading).");

  if (errors.length) {
    console.error("SPEC lint failed:");
    errors.forEach((e) => console.error("  - " + e));
    process.exit(1);
  }
  console.log("SPEC lint passed");
}
main();
