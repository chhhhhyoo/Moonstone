# Evaluation Criteria Guide

Recommended evaluation criteria by decision type.

## Library/Framework Selection

| Criteria | Description | Measurement Method |
|----------|-------------|--------------------|
| **Performance** | Speed, memory usage, bundle size | Benchmarks, official documentation |
| **Learning Curve** | Time for the team to learn | Documentation quality, tutorial availability, conceptual complexity |
| **Ecosystem** | Plugins, extensions, third-party tools | Number of npm packages, GitHub stars |
| **Community** | Activity, answer speed | Stack Overflow questions, Discord/Slack activity |
| **Maintainability** | Long-term support, update frequency | Release cycle, issue resolution speed |
| **Type Support** | TypeScript support level | Built-in types, @types quality |
| **Documentation** | Official docs quality | Examples, up-to-dateness, searchability |
| **Adoption** | Industry usage status | npm downloads, enterprise use cases |

### Weight Examples

**Startup (Focus on fast development)**:
- Learning Curve: 30%
- Ecosystem: 25%
- Documentation: 20%
- Performance: 15%
- Maintainability: 10%

**Enterprise (Focus on stability)**:
- Maintainability: 30%
- Type Support: 20%
- Community: 20%
- Performance: 15%
- Documentation: 15%

---

## Architecture Pattern Decision

| Criteria | Description | Measurement Method |
|----------|-------------|--------------------|
| **Scalability** | Ease of handling increased load | Horizontal/Vertical scaling capability |
| **Complexity** | Implementation and operational complexity | Required infrastructure, learning cost |
| **Team Fit** | Suitability for team size | Conway's Law consideration |
| **Deployment** | CI/CD complexity | Number of pipeline stages |
| **Fault Isolation** | Impact of partial failures | Independent deployment capability |
| **Data Consistency** | Transaction handling | ACID vs Eventually Consistent |
| **OpEx** | Infrastructure and personnel costs | Number of servers, required DevOps staff |
| **Dev Speed** | Initial dev to MVP | Boilerplate, configuration complexity |

### Weight Examples

**Early Startup (MVP)**:
- Dev Speed: 35%
- Complexity: 25%
- OpEx: 20%
- Scalability: 10%
- Other: 10%

**Growth Stage (Scale-up)**:
- Scalability: 30%
- Fault Isolation: 20%
- Team Fit: 20%
- Deployment: 15%
- OpEx: 15%

---

## Implementation Approach Decision

| Criteria | Description | Measurement Method |
|----------|-------------|--------------------|
| **Impl Complexity** | Code volume, difficulty | LoC, abstraction level |
| **Testability** | Unit/Integration test difficulty | Mocking needs, dependencies |
| **Debuggability** | Difficulty of tracing issues | Logging, tracing support |
| **Performance** | Latency, throughput | Benchmarks |
| **Resource Usage** | CPU, Memory, Network | Profiling |
| **Compatibility** | Fit with current architecture | Refactoring effort required |
| **Maintainability** | Long-term management ease | Code readability, documentation |

---

## Database Selection

| Criteria | Description | Measurement Method |
|----------|-------------|--------------------|
| **Data Model** | Relational/Document/Graph/Key-Value | Requirement matching |
| **Query Flex** | Complex query support | SQL/NoSQL capabilities |
| **Scalability** | Horizontal scaling ease | Sharding, replication |
| **Consistency** | ACID vs BASE | Transaction requirements |
| **Performance** | Read/Write speed | Benchmarks |
| **Op Complexity** | Management overhead | Backup, monitoring, migration |
| **Cost** | License, infrastructure | TCO calculation |
| **Ecosystem** | ORMs, drivers, tools | Supported languages/frameworks |

---

## Recommendation Criteria by Situation

### "Need MVP Fast"
Priority: Learning Curve > Dev Speed > Documentation > Rest

### "Expect Massive Traffic"
Priority: Performance > Scalability > OpEx > Rest

### "Small Team (1-3 people)"
Priority: Low Complexity > Documentation > Community > Rest

### "Enterprise Environment"
Priority: Security > Maintainability > Type Support > Rest

### "Legacy Integration"
Priority: Compatibility > Migration Ease > Rest

---

## Reliability Evaluation Criteria

Reliability by information source:

| Source | Reliability | Note |
|--------|-------------|------|
| Official Docs | High | Accurate but can be biased |
| Independent Benchmark | High | Verify conditions |
| GitHub Issues | Med-High | Real usage experiences |
| Stack Overflow | Medium | Check dates |
| Reddit/HN | Medium | Diverse views, has noise |
| Blogs | Low-Med | Check author background |
| Marketing Material | Low | Biased |

**How to increase reliability**:
- Verify same info across multiple sources.
- Prioritize recent dates.
- Prioritize opinions based on actual usage experience.
- Check conditions/environment for benchmarks.