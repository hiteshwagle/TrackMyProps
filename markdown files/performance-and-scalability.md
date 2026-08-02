
# TrackMyProps Performance and Scalability

## 1. Purpose

This document defines the performance, scalability, capacity-planning and optimisation standards for the TrackMyProps platform.

Applies to:

- Frontend
- Backend
- AI Platform
- Data Platform
- Supabase
- Google Cloud Run

---

# 2. Goals

The platform must:

- remain responsive under growth
- scale horizontally where practical
- degrade gracefully
- optimise cost and latency
- provide measurable SLOs

---

# 3. Performance principles

1. Measure before optimising.
2. Prefer stateless services.
3. Cache only where business rules allow.
4. Optimise database access before increasing hardware.
5. Use asynchronous processing for long-running work.
6. Every optimisation must preserve correctness.
7. Every API must have latency objectives.

---

# 4. Service Level Objectives

| Component | Target |
|---|---|
| API availability | 99.9% |
| Backend p95 latency | <500 ms (non-AI) |
| Authentication | <1 s |
| AI request acknowledgement | <2 s |
| Scheduled jobs | Complete within configured SLA |
| Mobile app startup | <3 s on supported devices |

---

# 5. API latency budgets

Target p95:

- Read APIs: 300 ms
- Write APIs: 500 ms
- Search APIs: 700 ms
- Document upload acknowledgement: 2 s
- AI orchestration start: 2 s

Long-running work should return an operation ID and continue asynchronously.

---

# 6. Cloud Run scaling

Configure:

- minimum instances for critical APIs
- maximum instances to control cost
- concurrency based on workload
- CPU always allocated only where justified
- request timeout per endpoint
- startup probes
- readiness probes

---

# 7. Database optimisation

Guidelines:

- proper indexes
- avoid N+1 queries
- use pagination
- batch writes
- use transactions appropriately
- analyse query plans
- archive historical data where appropriate

---

# 8. ORM guidance

- eager load where beneficial
- avoid unnecessary object graphs
- use bulk operations
- keep transactions short

---

# 9. Caching strategy

Cache categories:

- Public reference data
- Demographic datasets
- AI outputs with TTL
- Configuration
- Feature flags

Do NOT cache:

- authorisation decisions beyond safe limits
- secrets
- mutable financial calculations requiring fresh data

Support cache invalidation via events.

---

# 10. AI caching

Agent-specific TTL examples:

- Demographics: 30 days
- Market summaries: 24 hours
- Prediction agent: 6 hours
- Portfolio recommendation: configurable
- Property analysis: optionally disabled for always-fresh execution

Every cache entry stores:

- agent version
- prompt version
- dataset version
- expiry
- scope

---

# 11. Queue processing

Use asynchronous queues for:

- document analysis
- email sending
- notifications
- AI execution
- dataset refresh
- exports

Workers must be idempotent.

---

# 12. Background jobs

Cloud Run Jobs should:

- support retries
- checkpoint progress
- emit metrics
- avoid duplicate work

---

# 13. File uploads

Large uploads should:

- stream where possible
- validate type
- scan for malware
- generate signed URLs
- process asynchronously

---

# 14. Frontend optimisation

- lazy loading
- route splitting
- image optimisation
- optimistic UI where safe
- React Query/TanStack Query for server state
- Zustand for client state
- virtualised lists

---

# 15. Mobile optimisation

- minimise bundle size
- avoid blocking startup
- background sync
- offline cache
- efficient image handling

---

# 16. Rate limiting

Apply per:

- IP
- user
- household
- API key
- AI endpoint

Return HTTP 429 with retry guidance.

---

# 17. Capacity planning

Track:

- active users
- concurrent sessions
- API RPS
- AI executions/hour
- storage growth
- database size
- queue depth

Review quarterly.

---

# 18. Observability

Monitor:

- latency
- throughput
- error rate
- saturation
- cache hit rate
- queue age
- DB query duration
- Cloud Run scaling
- AI cost

---

# 19. Load testing

Perform:

- API load tests
- spike tests
- soak tests
- failover tests
- AI concurrency tests

Before major releases.

---

# 20. Performance budgets

Define budgets for:

- JS bundle size
- container image size
- database query count
- AI token usage
- storage consumption
- monthly infrastructure cost

CI should fail when critical budgets are exceeded.

---

# 21. Codex rules

Codex must:

1. paginate list endpoints
2. add indexes for query patterns
3. avoid N+1 queries
4. use async processing for long tasks
5. implement configurable caching
6. emit metrics
7. benchmark critical paths
8. support horizontal scaling
9. minimise memory usage
10. document performance assumptions

---

# 22. Definition of done

Performance readiness exists when:

- SLOs defined
- dashboards implemented
- load tests passed
- caching documented
- scaling validated
- rate limits enforced
- bottlenecks measured
- optimisation decisions documented
