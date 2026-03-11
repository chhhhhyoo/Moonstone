const fs = require('fs');
const path = require('path');

const workflows = {
  "feature": {
    "name": "New Feature Development",
    "steps": [
      { "skill": "brainstorming", "reason": "Clarify requirements and design." },
      { "skill": "using-git-worktrees", "reason": "Isolate changes in a new branch/worktree." },
      { "skill": "writing-plans", "reason": "Create a detailed implementation plan." },
      { "skill": "test-driven-development", "reason": "Implement using TDD loop." },
      { "skill": "verification-before-completion", "reason": "Final quality gate before PR." }
    ]
  },
  "bugfix": {
    "name": "Bug Fix",
    "steps": [
      { "skill": "systematic-debugging", "reason": "Reproduce and diagnose the issue." },
      { "skill": "using-git-worktrees", "reason": "Isolate the fix." },
      { "skill": "test-driven-development", "reason": "Write a regression test first." },
      { "skill": "verification-before-completion", "reason": "Ensure no regressions." }
    ]
  },
  "refactor": {
    "name": "Refactoring",
    "steps": [
      { "skill": "codebase-investigator", "reason": "Understand the current implementation." },
      { "skill": "writing-plans", "reason": "Plan the refactoring steps." },
      { "skill": "test-driven-development", "reason": "Ensure tests cover the changes." },
      { "skill": "verification-before-completion", "reason": "Verify system integrity." }
    ]
  },
  "skill_creation": {
    "name": "Skill Creation",
    "steps": [
      { "skill": "skill-creator", "reason": "Scaffold and define the new skill." },
      { "skill": "manage-skills", "reason": "Audit the new skill (Supervision mode)." }
    ]
  }
};

function suggestWorkflow(query) {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('create skill') || lowerQuery.includes('new skill') || lowerQuery.includes('make a skill') || lowerQuery.includes('add capability')) {
    return workflows.skill_creation;
  } else if (lowerQuery.includes('bug') || lowerQuery.includes('fix') || lowerQuery.includes('error') || lowerQuery.includes('fail')) {
    return workflows.bugfix;
  } else if (lowerQuery.includes('refactor') || lowerQuery.includes('clean') || lowerQuery.includes('structure')) {
    return workflows.refactor;
  } else {
    // Default to feature dev
    return workflows.feature;
  }
}

// Simple CLI arg handling
const query = process.argv.slice(2).join(' ');
if (!query) {
  console.log("Usage: node orchestrate.cjs <task description>");
  process.exit(0);
}

const suggestion = suggestWorkflow(query);

console.log(`\nRecommended Workflow: ${suggestion.name}\n`);
suggestion.steps.forEach((step, index) => {
  console.log(`${index + 1}. [${step.skill}]: ${step.reason}`);
});
console.log("\nTo start, activate the first skill in the chain.");
console.log("NOTE: If this workflow does not seem to fit your task, use 'skill-creator' to build a custom skill.");
