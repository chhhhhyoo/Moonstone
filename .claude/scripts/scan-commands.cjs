const fs = require('fs');
const path = require('path');

// Scan .claude/commands/ directory for all command files
const commandsDir = path.resolve(__dirname, '../commands');

function extractMetadata(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Extract first heading as name
    const nameMatch = content.match(/^#\s+(.+)/m);
    // Extract first paragraph or description
    const descMatch = content.match(/^#\s+.+\n\n(.+)/m);
    // Check if it accepts arguments
    const hasArgs = content.includes('$ARGUMENTS');

    if (nameMatch) {
      return {
        name: path.basename(filePath, '.md'),
        title: nameMatch[1].trim(),
        description: descMatch ? descMatch[1].trim() : '',
        hasArguments: hasArgs,
        path: filePath
      };
    }
  } catch (e) {
    // Ignore errors
  }
  return null;
}

function scanDir(dir) {
  const commands = [];
  if (!fs.existsSync(dir)) return commands;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isFile() && entry.name.endsWith('.md')) {
      const metadata = extractMetadata(fullPath);
      if (metadata) {
        commands.push(metadata);
      }
    } else if (entry.isDirectory()) {
      // Scan subdirectories for nested commands
      const subEntries = fs.readdirSync(fullPath, { withFileTypes: true });
      for (const subEntry of subEntries) {
        if (subEntry.isFile() && subEntry.name.endsWith('.md')) {
          const subPath = path.join(fullPath, subEntry.name);
          const metadata = extractMetadata(subPath);
          if (metadata) {
            metadata.name = `${entry.name}/${path.basename(subEntry.name, '.md')}`;
            commands.push(metadata);
          }
        }
      }
    }
  }
  return commands;
}

try {
  const commands = scanDir(commandsDir);
  console.log(JSON.stringify(commands, null, 2));
  console.log(`\nTotal commands: ${commands.length}`);
} catch (error) {
  console.error("Error scanning commands:", error.message);
  process.exit(1);
}
