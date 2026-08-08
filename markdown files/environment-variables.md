
# TrackMyProps Environment Variables

## 1. Purpose

This document is the single source of truth for every configuration value used across TrackMyProps.

Principles:

- Secrets are stored in Google Secret Manager (or Supabase Secrets where applicable).
- Non-sensitive configuration may be stored as environment variables.
- Never hardcode credentials.
- Never expose server-side secrets to the frontend.

---

# 2. Environment matrix

The implemented application commands support:

- development;
- production.

CI and staging configuration remain future decisions. Every implemented environment has separate ignored runtime files and committed templates.

---

# 3. Frontend (Expo)

Public variables (EXPO_PUBLIC_*):

```text
EXPO_PUBLIC_APP_ENV
EXPO_PUBLIC_BACKEND_URL
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
EXPO_PUBLIC_TERMS_URL
EXPO_PUBLIC_ACCOUNT_DELETION_EMAIL
```

Never expose:

- service role keys
- AI provider keys
- database URLs
- webhook secrets

---

# 4. Backend

```text
TRACKMYPROPS_ENVIRONMENT
TRACKMYPROPS_SUPABASE_URL
TRACKMYPROPS_SUPABASE_PUBLISHABLE_KEY
TRACKMYPROPS_FRONTEND_ORIGINS
```

The publishable key is used only to verify user access tokens through Supabase Auth. No backend secret or service-role key is implemented.

---

# 5. AI Platform

```text
AI_DEFAULT_MODEL
AI_EMBEDDING_MODEL
AI_PROVIDER
OPENAI_API_KEY
ANTHROPIC_API_KEY
GOOGLE_API_KEY
VOYAGE_API_KEY
LANGGRAPH_CHECKPOINT_BACKEND
MAX_AGENT_RUNTIME_SECONDS
DEFAULT_CACHE_TTL
```

---

# 6. Data Platform

```text
DATA_PIPELINE_ENV
RAW_BUCKET
CANONICAL_BUCKET
CURATED_BUCKET
SCRAPE_USER_AGENT
MAX_CONCURRENT_JOBS
JOB_TIMEOUT_SECONDS
```

---

# 7. Google Cloud

```text
GOOGLE_CLOUD_PROJECT
GOOGLE_CLOUD_REGION
GOOGLE_APPLICATION_CREDENTIALS (local only)
ARTIFACT_REGISTRY
CLOUD_RUN_SERVICE
CLOUD_RUN_JOB
SECRET_MANAGER_PREFIX
```

---

# 8. Supabase

```text
SUPABASE_DB_HOST
SUPABASE_DB_PORT
SUPABASE_DB_NAME
SUPABASE_DB_USER
SUPABASE_DB_PASSWORD
SUPABASE_JWT_SECRET
SUPABASE_STORAGE_BUCKET
```

---

# 9. Email

```text
EMAIL_PROVIDER
SENDGRID_API_KEY
EMAIL_FROM
EMAIL_REPLY_TO
EMAIL_SANDBOX_MODE
```

---

# 10. Payments

```text
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
REVENUECAT_API_KEY
```

---

# 11. Property providers

Create one section per provider:

```text
PROVIDER_ENABLED
PROVIDER_API_KEY
PROVIDER_BASE_URL
PROVIDER_RATE_LIMIT
```

---

# 12. Maps

```text
GOOGLE_MAPS_API_KEY
MAP_TILE_PROVIDER
GEOCODING_PROVIDER
```

---

# 13. Feature flags

```text
FEATURE_PREDICTIONS
FEATURE_EOI
FEATURE_AI_COACH
FEATURE_PORTFOLIO_RECOMMENDER
FEATURE_MARKET_ALERTS
```

---

# 14. Security

```text
MFA_REQUIRED
RATE_LIMIT_ENABLED
CSRF_ENABLED
SIGNED_URL_TTL_SECONDS
MAX_UPLOAD_MB
```

---

# 15. Observability

```text
OTEL_EXPORTER_ENDPOINT
SENTRY_DSN
METRICS_NAMESPACE
TRACE_SAMPLE_RATE
```

---

# 16. Naming rules

- UPPER_SNAKE_CASE
- Boolean values: true/false
- Durations in seconds unless documented
- URLs must be absolute
- Prefix public Expo variables with EXPO_PUBLIC_

---

# 17. Secret rotation

Every secret must record:

- owner
- purpose
- rotation frequency
- last rotated
- next rotation

---

# 18. Documentation

Maintain:

```text
docs/config/
├── environment-variables.md
├── secrets-register.md
├── provider-config.md
└── rotation-schedule.md
```

---

# 19. Codex rules

Codex must:

1. never hardcode secrets
2. load configuration from environment
3. validate required variables at startup
4. fail fast for missing required configuration
5. separate public and private variables
6. document every new variable
7. remove unused variables

---

# 20. Definition of done

Configuration management is complete when:

- every variable is documented
- secrets are externalised
- startup validation exists
- environments are isolated
- rotation policy exists
- no secrets are committed to Git
