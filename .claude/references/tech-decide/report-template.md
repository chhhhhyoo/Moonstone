# Technical Decision Report Template

Reference for `/tech-decide` — use this structure when generating decision reports.

## Full Report Structure

```markdown
# Technical Decision Report: [Topic]

**Date**: YYYY-MM-DD
**Decision Type**: [Library Selection | Architecture Decision | Implementation Method | Tech Stack]

---

## 1. Conclusion (Executive Summary)

**Recommendation: [Option Name]**

[1-2 sentence summary of key reasons for recommendation]

**Reliability**: [High | Medium | Low] - [Basis for reliability judgment]

---

## 2. Decision Context

### Problem Definition
[Clearly state what needs to be decided]

### Comparison Targets
- Option A: [Name] - [One-line description]
- Option B: [Name] - [One-line description]

### Project Context
- **Project Scale**: [Small | Medium | Large]
- **Team Size**: [N people]
- **Existing Stack**: [Relevant technologies]

---

## 3. Evaluation Criteria

| Criteria | Weight | Description |
|----------|--------|-------------|
| [Criteria 1] | [X%] | [Why it matters] |
| [Criteria 2] | [X%] | [Why it matters] |
| **Total** | **100%** | |

---

## 4. Detailed Option Analysis

### Option A: [Name]

**Pros:**
- [Pro 1] (Source: [source], Reliability: [level])

**Cons:**
- [Con 1] (Source: [source], Reliability: [level])

**Good Fit For:** [scenarios]
**Bad Fit For:** [scenarios]

---

## 5. Comprehensive Comparison

| Criteria (Weight) | Option A | Option B |
|-------------------|----------|----------|
| [Criteria 1] (X%) | 4/5 | 3/5 |
| **Weighted Avg** | **X.X** | **X.X** |

---

## 6. Recommendation Rationale

1. **[Reason 1]**: [Explanation + Source]
2. **[Reason 2]**: [Explanation + Source]

---

## 7. Risks and Considerations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| [Risk 1] | [level] | [level] | [plan] |

---

## 8. Alternative Scenarios

If [Condition A] → Re-evaluate [Option Y]

---

## 9. Next Steps

1. [Action item 1]
2. [Action item 2]

---

## 10. Sources

- [URL 1]: [description]
- [URL 2]: [description]
```

## Quick Decision Template

For cases requiring fast decisions:

```markdown
# Quick Decision: [Topic]

## Conclusion
**Recommendation: [Option Name]** - [One-line reason]

## Comparison
| | Option A | Option B |
|---|----------|----------|
| Pros | [1-2 items] | [1-2 items] |
| Cons | [1-2 items] | [1-2 items] |
| Fit | [Scenario] | [Scenario] |

## Key Rationale
1. [Reason 1]
2. [Reason 2]

## Caution
- [Cautionary note]
```
