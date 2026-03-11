# Technical Decision Report Template

## Overall Structure

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

### 2.1 Problem Definition
[Clearly state what needs to be decided]

### 2.2 Comparison Targets
- Option A: [Name] - [One-line description]
- Option B: [Name] - [One-line description]
- Option C: [Name] - [One-line description]

### 2.3 Project Context
- **Project Scale**: [Small | Medium | Large]
- **Team Size**: [N people]
- **Existing Stack**: [Relevant technologies]
- **Special Requirements**: [If any]

---

## 3. Evaluation Criteria

| Criteria | Weight | Description |
|----------|--------|-------------|
| [Criteria 1] | [X%] | [Why it matters] |
| [Criteria 2] | [X%] | [Why it matters] |
| [Criteria 3] | [X%] | [Why it matters] |
| [Criteria 4] | [X%] | [Why it matters] |
| **Total** | **100%** | |

---

## 4. Detailed Option Analysis

### 4.1 Option A: [Name]

**Overview**: [2-3 sentence description]

**Pros**:
- ✅ [Pro 1]
  - Source: [Official Docs | Reddit | HN | Expert Opinion | Code Analysis]
  - Reliability: [High | Medium | Low]

- ✅ [Pro 2]
  - Source: [...]
  - Reliability: [...]

**Cons**:
- ❌ [Con 1]
  - Source: [...]
  - Reliability: [...]

**Good Fit For**:
- [Scenario 1]
- [Scenario 2]

**Bad Fit For**:
- [Scenario 1]
- [Scenario 2]

---

### 4.2 Option B: [Name]
[Repeat same structure]

---

### 4.3 Option C: [Name]
[Repeat same structure]

---

## 5. Comprehensive Comparison Table

### 5.1 Score by Criteria (5-point scale)

| Criteria (Weight) | Option A | Option B | Option C |
|-------------------|----------|----------|----------|
| [Criteria 1] (X%) | ⭐⭐⭐⭐ (4) | ⭐⭐⭐ (3) | ⭐⭐⭐⭐⭐ (5) |
| [Criteria 2] (X%) | ⭐⭐⭐ (3) | ⭐⭐⭐⭐⭐ (5) | ⭐⭐ (2) |
| [Criteria 3] (X%) | ⭐⭐⭐⭐ (4) | ⭐⭐⭐⭐ (4) | ⭐⭐⭐ (3) |
| **Weighted Avg** | **X.X** | **X.X** | **X.X** |

### 5.2 Quick Comparison

| Aspect | Option A | Option B | Option C |
|--------|----------|----------|----------|
| Learning Curve | Steep | Gentle | Average |
| Community | Very Active | Growing | Stable |
| Maturity | Mature | New | Mature |
| Bundle Size | Large | Small | Average |

---

## 6. Recommendation Rationale

### 6.1 Key Reasons

1. **[Reason 1 Title]**
   - Explanation: [Detailed explanation]
   - Source: [Specific source]

2. **[Reason 2 Title]**
   - Explanation: [Detailed explanation]
   - Source: [Specific source]

3. **[Reason 3 Title]**
   - Explanation: [Detailed explanation]
   - Source: [Specific source]

### 6.2 Judgment Based on Project Context

[Explain why this choice fits the current project situation]

---

## 7. Risks and Considerations

### 7.1 Risks on Adoption

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| [Risk 1] | [High|Med|Low] | [High|Med|Low] | [Plan] |
| [Risk 2] | [...] | [...] | [...] |

### 7.2 Migration Considerations

- [Consideration 1]
- [Consideration 2]

### 7.3 Long-term Considerations

- [Consideration 1]
- [Consideration 2]

---

## 8. Alternative Scenarios

### 8.1 If [Condition A]?
→ [Option Y] might be better. Reason: [...]

### 8.2 If [Condition B]?
→ Consider [Option Z]. Reason: [...]

---

## 9. Reference Sources

### Official Documentation
- [Link 1]
- [Link 2]

### Community Discussions
- [Reddit/HN Link 1]
- [Reddit/HN Link 2]

### Blogs/Articles
- [Link 1]
- [Link 2]

### Benchmarks/Comparisons
- [Link 1]
- [Link 2]

---

## 10. Reconfirm Conclusion

**Final Recommendation: [Option Name]**

[Summarize key reasons one last time]

**Next Steps**:
1. [Concrete Action Item 1]
2. [Concrete Action Item 2]
3. [Concrete Action Item 3]
```

## Simplified Version (Quick Decision)

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