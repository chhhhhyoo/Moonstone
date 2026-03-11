---
name: capture-skill
description: Capture learnings, patterns, or workflows from the current conversation into a new or existing skill. Use when the user wants to save what was learned or after ANY and EVERY significant task completion to preserve knowledge.
---

# Capture Skill from Conversation

This skill helps you extract knowledge, patterns, and workflows from the current conversation and persist them as a reusable skill.

## When to Use

- **Explicitly**: User says "capture this", "save this", "make a skill out of this".
- **Implicitly**: After resolving a complex bug, designing a system, or figuring out a tricky workflow. **Always check if the current session produced reusable knowledge.**[IMPORTANT]

## Capture Process

### Phase 1: Identify What to Capture

Review the conversation for:

- **Workflows**: Steps that worked (discarding what didn't).
- **Domain knowledge**: Non-obvious facts, configurations, or constraints discovered
- **Insights**: "Aha!" moments or domain constraints.
- **Patterns**: Code patterns, command sequences, or templates that worked well
- **Decision rationale**: Why certain approaches were chosen over alternatives

Summarize what you plan to capture and confirm with the user before proceeding.

### Phase 2: Determine Scope & Name
- **Project-specific**: Store in `.gemini/skills/<skill-name>/`.
- **Name**: kebab-case, action-oriented (e.g., `debug-k8s-pods`, `scaffold-react-component`).
- **Check Existing**: Run `ls .gemini/skills/` to see if you should update an existing skill instead.

### Phase 3: Draft the Skill Content(The "Skillification")
Don't just copy-paste chat logs. Create a **clean, instructional guide**.

When capturing into a **new skill**:

**Structure:**
1.  **Frontmatter**: `name` and `description` (crucial for triggering).
2.  **Instructions**: Step-by-step, imperative mood.
3.  **Examples**: Concrete code or command examples.
**Use the Template**:
Refer to `templates/SKILL_TEMPLATE.md` (bundled with this skill) for the ideal structure.

1.  Create the directory: `mkdir -p .gemini/skills/<skill-name>/`
2.  Write the file: `write_file .gemini/skills/<skill-name>/SKILL.md`
3.  (Optional) Add assets/scripts if needed in `.gemini/skills/<skill-name>/assets/` etc.

1. Choose a descriptive name (lowercase, hyphens, max 64 chars)
2. Write a specific description including WHAT and WHEN (third person)
3. Distill the conversation into concise, actionable instructions
4. Include concrete examples drawn from the conversation
5. Add any utility scripts or commands that were used

When updating an **existing skill**:

1. Read the existing SKILL.md
2. Identify where new learnings fit (new section, updated steps, additional examples)
3. Integrate without duplicating existing content
4. Preserve the existing structure and voice

### Phase 4: Distillation Guidelines

The goal is to transform a messy conversation into clean, reusable instructions.

**Do:**
- Extract the final working approach, not the failed attempts (unless gotchas are instructive)
- Generalize from the specific case discussed (replace hardcoded values with placeholders)
- Include the "why" behind non-obvious steps
- Add context the agent wouldn't know without this conversation
- Keep it under 500 lines

**Don't:**
- Include conversation artifacts ("as we discussed", "you mentioned")
- Repeat information the agent already knows
- Include overly specific details that won't transfer to other situations
- Add verbose explanations where a code example suffices

### Phase 5: Write and Verify

1. Create/update the skill file(s)
2. Verify the SKILL.md is under 500 lines
3. Check that the description is specific and includes trigger terms
4. Confirm with the user that the captured content is accurate

## Example: Capturing a Debugging Workflow

If a conversation involved debugging a tricky deployment issue, the captured skill might look like:

```markdown
---
name: debug-k8s-deployments
description: Debug Kubernetes deployment failures including CrashLoopBackOff, image pull errors, and resource limits. Use when pods are failing to start or deployments are stuck.
---

# Debug K8s Deployments

## Diagnostic Steps

1. Check pod status: `kubectl get pods -n <namespace> | grep -v Running`
2. Get events: `kubectl describe pod <pod> -n <namespace>`
3. Check logs: `kubectl logs <pod> -n <namespace> --previous`

## Common Issues

### CrashLoopBackOff
- Check if the entrypoint command exists in the container
- Verify environment variables are set (especially secrets)
- Look for OOMKilled in `describe` output → increase memory limits

### ImagePullBackOff
- Verify image tag exists: `docker manifest inspect <image>`
- Check imagePullSecrets are configured for private registries
```

Note how this captures the diagnostic sequence and common solutions without any conversation artifacts.

## Handling Edge Cases

**Conversation had multiple topics**: Ask which specific learning to capture, or suggest creating separate skills for distinct topics.

**Learning is too small for a skill**: Suggest creating a GEMINI rule (`boilerplate-be/GEMINI.md`) instead, which is better suited for single-line or short guidelines.

**Existing skill needs major rewrite**: Confirm with the user whether to restructure the existing skill or create a new one that supersedes it.

## Synergies (Skill Integration)

`capture-skill` is the "evolution mechanism" of the agent:

- **+ `reflexion`**: Identify high-value patterns during `reflexion`, then use `capture-skill` to formalize them into reusable skills.
- **+ `manage-skills`**: Once a skill is captured, `manage-skills` is used to audit, maintain, and list it in the library.
- **+ `systematic-debugging`**: If a complex debugging session yields a reusable diagnostic workflow, capture it immediately.

## Exit Protocol (Mandatory)

1.  **Reconcile Memory**: Turn discoveries in `findings.md` MUST be moved to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallize Gems**: Extract high-value insights (ADRs, patterns, root causes) and append to `docs/learnings.md`.
3.  **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Chain Next Step**: Hand off to the next appropriate expert via `activate_skill`.
