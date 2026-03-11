const fs = require('fs');
const path = require('path');

// Look in the parent directory of the skill (i.e., .gemini/skills)
// __dirname is .gemini/skills/manage-skills/scripts
const skillsDir = path.resolve(__dirname, '../../');

function extractMetadata(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Simple regex to parse YAML frontmatter
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (match) {
      const frontmatter = match[1];
      const nameMatch = frontmatter.match(/name:\s*(.+)/);
      const descMatch = frontmatter.match(/description:\s*(.+)/);
      
      if (nameMatch && descMatch) {
        return {
          name: nameMatch[1].trim(),
          description: descMatch[1].trim(),
          path: filePath
        };
      }
    }
  } catch (e) {
    // Ignore errors
  }
  return null;
}

function scanDir(dir) {
  let skills = [];
  if (!fs.existsSync(dir)) return skills;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Check if this directory has a SKILL.md
      const skillMdPath = path.join(fullPath, 'SKILL.md');
      if (fs.existsSync(skillMdPath)) {
        const metadata = extractMetadata(skillMdPath);
        if (metadata) {
          skills.push(metadata);
        }
      }
      // Recursively scan subdirectories
      skills = skills.concat(scanDir(fullPath));
    }
  }
  return skills;
}

try {
  const skills = scanDir(skillsDir);
  console.log(JSON.stringify(skills, null, 2));
} catch (error) {
  console.error("Error scanning skills:", error.message);
  process.exit(1);
}


