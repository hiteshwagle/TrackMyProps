# TrackMyProps Data Platform Engineering Skill

## Skill identity

**Name:** TrackMyProps Data Platform Principal Engineer  
**Scope:** `TrackMyProps/data-platform`  
**Primary agent:** Codex  
**Purpose:** Design and implement the production-grade data ingestion, transformation, quality, lineage, scheduling, and dataset publishing platform for TrackMyProps.

---

## 1. Mission

Act as the lead data architect, senior Python engineer, data engineer, ETL engineer, data quality engineer, geospatial data engineer, and Cloud Run Jobs engineer for TrackMyProps.

Build a reliable Australian property data platform that:

- ingests approved public, licensed, partner, and first-party datasets;
- normalises inconsistent source formats into canonical domain models;
- preserves raw source history and reproducibility;
- creates historical snapshots instead of overwriting important values;
- validates freshness, completeness, consistency, uniqueness, and plausibility;
- records source lineage, licence restrictions, and transformation history;
- prepares trusted datasets for the backend and AI platform;
- refreshes datasets according to their actual publication cadence;
- supports suburb, property, market, demographic, infrastructure, risk, school, rental, and financial intelligence;
- detects upstream schema changes and source failures;
- avoids unauthorised scraping, prohibited automation, or licence breaches;
- publishes versioned, quality-scored datasets;
- remains observable, testable, idempotent, and cost efficient.

The data platform is not the user-facing backend and is not the AI reasoning service.

Prioritise:

1. lawful and authorised data use;
2. traceability;
3. reproducibility;
4. data quality;
5. historical preservation;
6. clear canonical schemas;
7. idempotent processing;
8. explicit freshness;
9. operational resilience;
10. cost-efficient scheduled execution.

---

## 2. Approved technology stack

Use this stack unless an Architecture Decision Record approves a change.

| Concern | Approved technology |
|---|---|
| Language | Python 3.12 or later supported stable version |
| Job runtime | Google Cloud Run Jobs |
| Scheduling | Google Cloud Scheduler |
| Workflow coordination | Cloud Scheduler + Cloud Run Jobs initially |
| API framework | FastAPI only for internal control or diagnostics when needed |
| Dataframes | Polars preferred; Pandas allowed where library compatibility requires it |
| SQL and ORM | SQLAlchemy 2 |
| Database | Supabase PostgreSQL |
| Migrations | Alembic for data-platform-owned schemas |
| Geospatial | PostGIS, GeoPandas, Shapely, PyProj where justified |
| HTTP client | HTTPX |
| HTML parsing | BeautifulSoup and lxml |
| Browser automation | Playwright only where authorised and necessary |
| File formats | CSV, JSON, JSONL, Parquet, GeoJSON, XLSX, XML where required |
| Object storage | Supabase Storage or Google Cloud Storage according to architecture |
| Validation | Pydantic 2, Pandera or equivalent, custom validation rules |
| Testing | Pytest |
| Observability | Structured logs, OpenTelemetry, Cloud Logging and Monitoring |
| Error reporting | Sentry when configured |
| Secrets | Google Secret Manager and runtime environment variables |
| Packaging | `pyproject.toml` |
| Deployment | Docker images in Artifact Registry |

Prefer bulk extraction and set-based database operations over row-by-row processing.

Use Polars for new large transformations unless a source library requires Pandas or GeoPandas.

Do not use browser automation when an approved API, bulk download, open-data endpoint, feed, or licensed export exists.

---

## 3. Project structure

Create the project under:

```text
TrackMyProps/data-platform/
```

Use this structure:

```text
data-platform/
├── app/
│   ├── main.py
│   ├── cli.py
│   ├── core/
│   │   ├── config.py
│   │   ├── logging.py
│   │   ├── telemetry.py
│   │   ├── exceptions.py
│   │   ├── constants.py
│   │   ├── feature_flags.py
│   │   └── time.py
│   ├── registry/
│   │   ├── sources.py
│   │   ├── datasets.py
│   │   ├── pipelines.py
│   │   └── schedules.py
│   ├── connectors/
│   │   ├── base.py
│   │   ├── http/
│   │   ├── api/
│   │   ├── files/
│   │   ├── databases/
│   │   ├── storage/
│   │   ├── browser/
│   │   └── partner/
│   ├── sources/
│   │   ├── abs/
│   │   ├── rba/
│   │   ├── data_gov_au/
│   │   ├── state_open_data/
│   │   ├── local_government/
│   │   ├── schools/
│   │   ├── crime/
│   │   ├── transport/
│   │   ├── planning/
│   │   ├── hazards/
│   │   ├── property_market/
│   │   ├── rental_market/
│   │   ├── infrastructure/
│   │   ├── geospatial/
│   │   └── licensed/
│   ├── ingestion/
│   │   ├── extractors/
│   │   ├── downloaders/
│   │   ├── decompression/
│   │   ├── parsers/
│   │   ├── checkpoints/
│   │   └── manifests/
│   ├── canonical/
│   │   ├── geography.py
│   │   ├── property.py
│   │   ├── suburb.py
│   │   ├── market.py
│   │   ├── rental.py
│   │   ├── demographics.py
│   │   ├── schools.py
│   │   ├── crime.py
│   │   ├── infrastructure.py
│   │   ├── hazards.py
│   │   ├── rates.py
│   │   ├── planning.py
│   │   └── lineage.py
│   ├── transformations/
│   │   ├── cleaning/
│   │   ├── normalisation/
│   │   ├── matching/
│   │   ├── deduplication/
│   │   ├── aggregation/
│   │   ├── geospatial/
│   │   ├── enrichment/
│   │   └── features/
│   ├── quality/
│   │   ├── rules.py
│   │   ├── validators.py
│   │   ├── anomaly_detection.py
│   │   ├── thresholds.py
│   │   ├── scoring.py
│   │   └── reports.py
│   ├── lineage/
│   │   ├── service.py
│   │   ├── models.py
│   │   ├── manifests.py
│   │   └── licences.py
│   ├── persistence/
│   │   ├── session.py
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── bulk.py
│   │   ├── staging.py
│   │   └── publishing.py
│   ├── pipelines/
│   │   ├── base.py
│   │   ├── demographics/
│   │   ├── market/
│   │   ├── rental/
│   │   ├── schools/
│   │   ├── crime/
│   │   ├── infrastructure/
│   │   ├── planning/
│   │   ├── hazards/
│   │   ├── rates/
│   │   ├── geospatial/
│   │   └── property/
│   ├── publishing/
│   │   ├── datasets.py
│   │   ├── views.py
│   │   ├── materialized_views.py
│   │   ├── notifications.py
│   │   └── cache_events.py
│   ├── jobs/
│   │   ├── runner.py
│   │   ├── backfill.py
│   │   ├── refresh.py
│   │   ├── verify.py
│   │   ├── reconcile.py
│   │   └── cleanup.py
│   └── schemas/
│       ├── source.py
│       ├── dataset.py
│       ├── pipeline.py
│       ├── quality.py
│       ├── lineage.py
│       └── job.py
├── migrations/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── contract/
│   ├── sources/
│   ├── transformations/
│   ├── quality/
│   ├── pipelines/
│   ├── geospatial/
│   └── fixtures/
├── docs/
│   ├── sources/
│   ├── datasets/
│   ├── pipelines/
│   ├── schemas/
│   ├── quality/
│   ├── lineage/
│   ├── licences/
│   └── runbooks/
├── scripts/
├── pyproject.toml
├── alembic.ini
├── Dockerfile
├── .dockerignore
├── .env.example
├── README.md
├── SETUP.md
└── SKILL.md
```

Rules:

- Each source has its own module.
- Each pipeline has a stable identifier and version.
- Raw extraction, normalisation, validation, and publishing remain separate stages.
- Do not mix source-specific field names into canonical models.
- Do not publish datasets that fail critical quality checks.
- Avoid irreversible transformations without preserving source artefacts.
- Do not create a generic `utils.py` dumping ground.
- Every significant transformation must be testable independently.
- Every dataset must have explicit ownership and documentation.

---

## 4. Architectural boundaries

### 4.1 Data platform responsibilities

The data platform owns:

- source registration;
- source access configuration;
- extraction and downloading;
- raw-file manifests;
- parsing;
- canonical mapping;
- entity resolution;
- deduplication;
- geospatial normalisation;
- historical snapshots;
- transformations;
- quality validation;
- source lineage;
- licence metadata;
- dataset versioning;
- scheduled refresh;
- backfills;
- publishing approved datasets;
- refresh and invalidation events.

### 4.2 Backend responsibilities

The backend owns:

- user and household data;
- owned property records;
- loans, income, expenses, leases, documents, and approvals;
- user-facing APIs;
- user permissions;
- application calculations;
- notifications and subscriptions;
- AI execution requests.

The data platform must not access user-specific financial data unless a narrowly defined internal pipeline requires it and the architecture explicitly approves it.

### 4.3 AI platform responsibilities

The AI platform owns:

- interpretation;
- specialist-agent reasoning;
- recommendation synthesis;
- model routing;
- AI-specific caching;
- conversation and learning workflows.

The data platform provides trustworthy, versioned inputs. It does not generate final investment recommendations.

### 4.4 Frontend responsibilities

The frontend displays data and user workflows. It does not query raw data-platform staging tables directly.

---

## 5. Source governance

Every source must be registered before implementation.

Required source metadata:

```python
SourceDefinition(
    source_id="abs_census",
    display_name="Australian Bureau of Statistics Census",
    provider="Australian Bureau of Statistics",
    source_type="public_api",
    jurisdiction="Australia",
    access_method="bulk_download",
    licence_id="...",
    terms_url="...",
    refresh_cadence="quinquennial",
    expected_publication_lag="...",
    contains_personal_data=False,
    allows_redistribution=True,
    allows_derived_outputs=True,
    rate_limit_policy=...,
    authentication_type="none",
    owner="data-platform",
)
```

Each source definition must document:

- provider;
- dataset name;
- official source location;
- access method;
- licence;
- terms of use;
- attribution requirements;
- redistribution rights;
- derived-data rights;
- commercial-use rights;
- rate limits;
- authentication requirements;
- geographic coverage;
- time coverage;
- expected refresh cadence;
- publication delay;
- data dictionary;
- schema version;
- contact or support path;
- personal or sensitive data classification;
- retention restrictions;
- caching restrictions;
- whether automated access is permitted.

Do not implement a source when rights or access conditions are unclear. Record it as blocked pending legal or commercial review.

---

## 6. Authorised scraping rules

Scraping is allowed only where:

- the site terms permit it;
- robots and technical restrictions are respected where applicable;
- the data is lawful to collect and use;
- commercial use is permitted for TrackMyProps;
- there is no approved API, licensed feed, or bulk download that should be used instead;
- request frequency is conservative;
- personal information is not collected without a valid legal and product basis;
- credentials, session cookies, or access controls are not bypassed;
- CAPTCHA, anti-bot protections, paywalls, and technical access restrictions are not circumvented.

For every scraper:

- create a source definition;
- record legal and licence approval status;
- set an explicit rate limit;
- identify allowed URL patterns;
- identify prohibited fields;
- implement retries with backoff;
- support conditional requests where possible;
- use stable selectors and schema tests;
- detect page-template changes;
- store retrieval timestamps;
- preserve source references where permitted;
- include an immediate kill switch;
- provide a runbook.

Browser automation must be the last resort.

Never create a scraper intended to obtain “100% of data” from a third-party website without explicit rights and a technically realistic completeness definition.

---

## 7. Dataset classes

Use three major data layers.

### 7.1 Raw layer

Purpose:

- preserve source artefacts as received;
- support replay and audit;
- record checksums and retrieval metadata.

Examples:

- downloaded CSV;
- API response pages;
- compressed archives;
- HTML snapshots where permitted;
- JSON payloads;
- shapefiles;
- Excel workbooks.

Raw artefacts should be immutable.

Required metadata:

- source ID;
- retrieval job ID;
- retrieved timestamp;
- source URL or object reference;
- HTTP metadata where applicable;
- checksum;
- size;
- compression;
- content type;
- source version;
- licence reference;
- parser version;
- retention policy.

### 7.2 Canonical layer

Purpose:

- map source fields to stable TrackMyProps schemas;
- normalise types, units, geography, dates, and identifiers;
- retain source references.

Examples:

- canonical suburb demographics;
- canonical school record;
- canonical market observation;
- canonical comparable sale;
- canonical hazard area;
- canonical interest-rate observation.

### 7.3 Curated layer

Purpose:

- publish consumer-ready datasets;
- calculate approved aggregates and features;
- provide quality-scored, versioned views for backend and AI usage.

Examples:

- suburb monthly market metrics;
- rental yield series;
- supply and demand metrics;
- demographics summaries;
- infrastructure proximity metrics;
- risk indicators;
- school accessibility metrics;
- prediction feature tables.

Do not delete raw history merely because a curated dataset has been generated.

---

## 8. Canonical geography model

Geography is a core dependency.

Support canonical entities such as:

- country;
- state or territory;
- local government area;
- statistical area levels;
- suburb or locality;
- postcode;
- mesh block where licensed and appropriate;
- property parcel or address identifier where available;
- point, polygon, and boundary geometry;
- effective date and boundary version.

Required geography fields may include:

- stable internal ID;
- official external IDs;
- canonical name;
- aliases;
- state;
- postcode associations;
- parent geography IDs;
- geometry;
- centroid;
- bounding box;
- effective start and end dates;
- source dataset version.

Never assume a suburb maps to exactly one postcode or one LGA.

Store many-to-many relationships where reality requires them.

All spatial reference systems must be explicit.

Transform published geometries to an approved common coordinate system while preserving source CRS metadata.

---

## 9. Property and address matching

Property identity is difficult and must not rely on address strings alone.

Use layered matching:

1. approved source property identifier;
2. parcel or title reference where licensed;
3. geocoded address and unit;
4. normalised address components;
5. fuzzy match within constrained geography;
6. manual or review queue for uncertain matches.

Normalise:

- unit and lot;
- street number;
- street suffix;
- street name;
- street type;
- locality;
- state;
- postcode;
- geocode;
- source property ID.

Record:

- match method;
- confidence;
- candidates;
- source IDs;
- matching version;
- review status.

Do not merge two property records when confidence is below the approved threshold.

---

## 10. Core canonical datasets

Design canonical schemas for at least the following.

### 10.1 Market observations

Possible fields:

- geography ID;
- property type;
- bedroom count;
- period;
- median sale price;
- mean sale price;
- transaction count;
- upper and lower quartiles;
- days on market;
- vendor discount;
- auction clearance;
- listing volume;
- withdrawn listings;
- data source;
- effective date;
- publication date;
- quality score.

### 10.2 Sales and comparable properties

Possible fields:

- property ID;
- address reference;
- contract date;
- settlement date;
- sale price;
- property type;
- land area;
- building area;
- bedrooms;
- bathrooms;
- parking;
- sale method;
- source;
- confidence;
- licence restrictions.

Never expose fields beyond licence permissions.

### 10.3 Rental observations

Possible fields:

- geography ID;
- property type;
- bedroom count;
- weekly rent;
- rental listing count;
- vacancy rate;
- days listed;
- rental growth;
- period;
- source;
- publication date.

### 10.4 Demographics

Possible fields:

- geography ID;
- population;
- population growth;
- household count;
- household size;
- age distributions;
- income distributions;
- employment metrics;
- tenure type;
- dwelling type;
- migration indicators;
- census year or period;
- source version.

### 10.5 Schools

Possible fields:

- school ID;
- name;
- sector;
- level;
- status;
- coordinates;
- enrolment;
- catchment reference where permitted;
- performance or ranking metrics only when lawful and methodologically defensible;
- source;
- effective date.

Avoid presenting simplistic school scores without documenting methodology.

### 10.6 Crime and safety

Possible fields:

- geography ID;
- offence category;
- incident count;
- rate;
- population denominator;
- period;
- source;
- suppression status;
- confidence.

Respect source suppression and privacy rules.

### 10.7 Infrastructure

Possible fields:

- project ID;
- project type;
- status;
- announced date;
- planned start;
- planned completion;
- actual completion;
- estimated cost;
- responsible authority;
- geometry;
- affected geography;
- source;
- confidence.

Clearly distinguish announced, funded, approved, under construction, and completed projects.

### 10.8 Planning and development

Possible fields:

- planning application ID;
- development type;
- status;
- lodgement date;
- decision date;
- location;
- dwelling count;
- source;
- coverage limitations.

### 10.9 Hazards and environment

Possible fields:

- hazard type;
- hazard class;
- geometry;
- effective date;
- return interval or severity where available;
- source;
- limitations;
- resolution;
- confidence.

Potential categories:

- flood;
- bushfire;
- coastal erosion;
- heat;
- severe weather;
- contamination;
- subsidence;
- climate projection.

### 10.10 Interest rates and economic indicators

Possible fields:

- indicator ID;
- value;
- unit;
- observation date;
- effective date;
- publication date;
- revision status;
- source.

Potential indicators:

- RBA cash rate;
- CPI;
- wage growth;
- unemployment;
- construction approvals;
- building costs;
- lending indicators.

---

## 11. Historical snapshots and slowly changing data

Do not overwrite historically meaningful values.

Use append-only observations or effective-dated records for:

- market metrics;
- rents;
- vacancy;
- demographics;
- school attributes;
- infrastructure status;
- hazard maps;
- rates;
- planning status;
- source metadata;
- dataset versions.

Where entity attributes change, use an appropriate slowly changing dimension strategy.

Required fields may include:

- `valid_from`;
- `valid_to`;
- `is_current`;
- `observed_at`;
- `published_at`;
- `ingested_at`;
- `source_version`;
- `pipeline_version`.

Distinguish:

- when the real-world fact applied;
- when the provider published it;
- when TrackMyProps retrieved it;
- when the platform published the transformed dataset.

---

## 12. Pipeline contract

Every pipeline must define:

```python
PipelineDefinition(
    pipeline_id="abs_demographics_sa2",
    version="1.0.0",
    source_ids=["abs_census"],
    output_dataset_ids=["demographics_sa2"],
    schedule_id="abs_demographics_refresh",
    extraction_mode="incremental_or_full",
    quality_profile="demographics_strict",
    idempotency_key_strategy="source_version",
)
```

Required metadata:

- pipeline ID;
- semantic version;
- description;
- owner;
- source IDs;
- output dataset IDs;
- input schema versions;
- output schema versions;
- extraction mode;
- checkpoint strategy;
- idempotency strategy;
- schedule;
- timeout;
- retry policy;
- expected row count range;
- quality profile;
- failure policy;
- backfill support;
- dependencies;
- downstream invalidation events.

Required stages:

```text
register job
    ↓
acquire source
    ↓
verify raw artefact
    ↓
parse
    ↓
stage
    ↓
normalise
    ↓
match and deduplicate
    ↓
validate
    ↓
calculate quality score
    ↓
publish atomically
    ↓
record lineage
    ↓
emit refresh events
```

Do not publish partial datasets unless the dataset contract explicitly supports partition-level publication.

---

## 13. Incremental loading and idempotency

Each pipeline must define how repeated execution behaves.

Supported incremental patterns:

- provider cursor;
- updated-since timestamp;
- publication version;
- source file checksum;
- partition date;
- change-data capture;
- snapshot comparison;
- full replacement into staging followed by atomic swap.

Use stable natural or source keys where available.

For every load:

- compute an idempotency key;
- record the job;
- detect already completed identical work;
- prevent duplicate observations;
- allow safe retry;
- separate job retry from business duplication.

Never rely only on job start time as the idempotency key.

---

## 14. Staging and publishing

Use staging tables or temporary schemas.

Publishing process:

1. load candidate data into staging;
2. validate schema;
3. validate row counts;
4. run quality rules;
5. compare against current published data;
6. calculate anomaly report;
7. approve automatically only if thresholds pass;
8. publish atomically;
9. update dataset version;
10. emit downstream events;
11. retain rollback reference.

Support rollback to the previous dataset version.

Do not mutate published tables row by row during a long ingestion when consumers may observe inconsistent intermediate state.

---

## 15. Data quality framework

Quality must be formal and measurable.

Dimensions:

- completeness;
- validity;
- uniqueness;
- consistency;
- timeliness;
- accuracy proxy;
- referential integrity;
- geographic coverage;
- temporal coverage;
- plausibility;
- source conformity.

Example rules:

- required fields are not null;
- postcodes match expected format;
- state is consistent with postcode and geography mapping;
- median price is non-negative;
- transaction count is an integer;
- rental yield falls within plausible bounds;
- dates are not implausibly in the future;
- geometry is valid;
- coordinates fall within expected Australian bounds;
- source IDs are unique within source scope;
- current effective-dated records do not overlap;
- suppressed values remain suppressed;
- totals reconcile where provider documentation requires them;
- row-count changes remain within configured tolerance.

Rule severity:

- critical;
- error;
- warning;
- informational.

Critical failures block publication.

Warnings may allow publication but reduce quality score and create an operational alert.

---

## 16. Anomaly detection

Use deterministic and statistical checks.

Potential checks:

- sudden row-count changes;
- unexpected null-rate increase;
- schema additions or removals;
- extreme value changes;
- impossible negative values;
- geographic coverage loss;
- duplicate-rate increase;
- stale publication date;
- missing partitions;
- distribution shift;
- major disagreement between independent sources.

Do not automatically “correct” anomalous values without preserving the original and documenting the rule.

Anomaly thresholds must be versioned and dataset specific.

---

## 17. Data quality scoring

Create a quality score from explicit factors rather than an undocumented subjective number.

Possible components:

- completeness score;
- freshness score;
- source reliability score;
- coverage score;
- validation pass rate;
- anomaly severity;
- matching confidence;
- methodological suitability.

Store:

- overall score;
- component scores;
- rule results;
- calculation version;
- timestamp;
- dataset version.

Consumers must be able to retrieve quality and freshness metadata with the data.

---

## 18. Lineage

Every published record or aggregate must be traceable to:

- source;
- raw artefact;
- extraction job;
- parser version;
- transformation version;
- matching version;
- quality profile;
- published dataset version.

Lineage levels:

### Dataset lineage

Tracks source datasets and pipeline relationships.

### Partition lineage

Tracks a time or geography partition.

### Record lineage

Use where technically and commercially justified, especially for high-value property or comparable-sale records.

### Aggregate lineage

Records the input period, geography, filters, and aggregation method.

Example:

```text
suburb_monthly_metrics v2026.08
    ← canonical_sales v2026.08
    ← provider_export_2026_08_01.csv
    ← source: licensed_property_provider
```

Never publish an AI-ready metric without enough metadata to explain how it was produced.

---

## 19. Licence and attribution controls

Maintain a licence registry.

Required fields:

- licence ID;
- source ID;
- licence name;
- legal text or reference;
- effective dates;
- allowed uses;
- prohibited uses;
- redistribution rules;
- attribution text;
- display restrictions;
- retention restrictions;
- derivative-work rules;
- geographic restrictions;
- user-tier restrictions;
- contract owner;
- review date.

Publishing logic must enforce source restrictions.

Examples:

- internal use only;
- derived metrics allowed but raw data not redistributable;
- display limited to authenticated subscribers;
- property-level data prohibited, suburb aggregates allowed;
- attribution required in reports;
- retention limited to contract term.

Do not assume that access to data grants redistribution rights.

---

## 20. Geospatial processing

Geospatial pipelines must:

- validate geometry;
- record CRS;
- transform coordinates explicitly;
- handle multipart geometries;
- detect invalid polygons;
- use spatial indexes;
- avoid unnecessary geometry precision;
- preserve source resolution;
- version boundaries;
- document buffer and distance methods;
- distinguish straight-line distance from travel time.

Potential derived features:

- distance to station;
- distance to school;
- distance to hospital;
- distance to employment centre;
- overlap with hazard polygon;
- count of development applications nearby;
- infrastructure proximity;
- amenity density;
- boundary membership.

All derived geospatial metrics must record:

- source geometry version;
- method;
- coordinate system;
- distance units;
- buffer radius;
- calculation version.

---

## 21. Data freshness policies

Refresh according to source cadence, not an arbitrary global interval.

Example initial policies:

| Dataset | Suggested refresh |
|---|---|
| RBA cash rate | On announcement day plus verification |
| Economic indicators | On official publication schedule |
| Property listings | As permitted by licensed source or feed |
| Comparable sales | Daily or provider cadence |
| Rental listings | Daily or provider cadence |
| Vacancy rates | Monthly or source cadence |
| Market aggregates | Monthly or after source refresh |
| Demographics | On official release |
| Census | On release and revised release |
| Schools | Termly, quarterly, or source cadence |
| Crime | Monthly or quarterly by jurisdiction |
| Infrastructure | Weekly or monthly |
| Planning applications | Daily or weekly where approved |
| Hazard maps | On provider update |
| Boundaries | On official release |
| Interest-rate products | Only from licensed or approved sources |

Each dataset registry entry must include:

- expected refresh cadence;
- maximum acceptable staleness;
- next expected publication;
- last successful refresh;
- current published version;
- current quality score;
- freshness status.

---

## 22. Scheduled jobs

Use Cloud Scheduler to invoke Cloud Run Jobs or an authenticated internal trigger.

Suggested job classes:

- source discovery;
- full refresh;
- incremental refresh;
- reconciliation;
- quality verification;
- stale-dataset detection;
- backfill;
- materialized-view refresh;
- lineage verification;
- raw-retention cleanup;
- failed-job retry;
- licence review reminder metadata.

Schedules must be stored in code or versioned configuration and documented.

Avoid overlapping executions for the same source partition unless the pipeline explicitly supports concurrency.

Use Cloud Run Job task parallelism only when partitioning is safe.

---

## 23. Backfills

Every time-series pipeline should support controlled backfills.

Backfill parameters may include:

- start date;
- end date;
- geography;
- source version;
- dataset partition;
- overwrite policy;
- dry run;
- maximum partitions.

Backfills must:

- use separate job IDs;
- avoid overwriting newer valid data accidentally;
- produce lineage;
- run quality checks;
- emit downstream invalidation only for changed partitions;
- support pause and retry;
- document expected cost.

Do not run unbounded backfills from production commands.

---

## 24. Data reconciliation

Where multiple sources cover similar facts, do not merge them blindly.

Define:

- preferred source;
- fallback source;
- reconciliation rules;
- date alignment;
- unit conversion;
- geographic alignment;
- conflict threshold;
- confidence rules.

Store both source values where needed.

Example:

```text
Source A median rent: $610, period July 2026
Source B median rent: $595, rolling quarter to July 2026
```

These are not automatically conflicting because methodology differs.

Document methodology before comparison.

---

## 25. Derived metrics and feature engineering

Derived metrics must have explicit formulas and versions.

Potential metrics:

- gross rental yield;
- net rental yield proxy;
- price growth;
- rental growth;
- transaction momentum;
- listing absorption;
- days-on-market trend;
- supply score;
- demand score;
- affordability ratio;
- vacancy trend;
- demographic momentum;
- infrastructure score;
- risk exposure score;
- school access score;
- diversification features;
- prediction features.

Each feature definition must include:

- feature ID;
- formula;
- input datasets;
- filters;
- aggregation level;
- window;
- missing-data treatment;
- version;
- owner;
- quality requirements;
- known limitations.

Do not embed opaque AI-generated scores into canonical data without a separate model registry and evaluation process.

---

## 26. Prediction feature store considerations

The data platform may publish prediction-ready feature tables.

Requirements:

- point-in-time correctness;
- no future-data leakage;
- stable entity keys;
- feature timestamps;
- source versions;
- null handling;
- training and inference consistency;
- feature calculation version;
- backfill capability;
- reproducible snapshots.

Prediction outputs belong to the AI or model-serving layer, but feature generation belongs here when deterministic.

Do not train on revised data and infer on unrevised data without documenting the mismatch.

---

## 27. Schema evolution

Each canonical and curated dataset must have a schema version.

Schema changes require:

- compatibility assessment;
- migration plan;
- contract tests;
- downstream-impact review;
- documentation;
- rollback plan.

Categories:

- backward compatible;
- conditionally compatible;
- breaking.

Breaking changes require a new major schema version.

Do not rename or repurpose fields silently.

Deprecate fields before removal where practical.

---

## 28. API and dataset contracts

Consumers should access data through:

- backend APIs;
- approved database views;
- materialized views;
- controlled service APIs;
- exports where permitted.

Do not grant frontend clients direct access to raw or staging schemas.

Every curated dataset contract must define:

- dataset ID;
- schema version;
- primary key;
- partition key;
- time semantics;
- geography semantics;
- nullable fields;
- quality metadata;
- freshness metadata;
- licence restrictions;
- example queries;
- downstream consumers.

---

## 29. Publishing and downstream invalidation

After successful publication, emit structured events such as:

- `dataset.published`;
- `dataset.partition_updated`;
- `dataset.quality_degraded`;
- `dataset.stale`;
- `market_metrics.updated`;
- `demographics.updated`;
- `comparable_sales.updated`;
- `rates.updated`;
- `hazards.updated`;
- `prediction_features.updated`.

Event payload should include:

- event ID;
- dataset ID;
- dataset version;
- changed partitions;
- published timestamp;
- quality score;
- previous version;
- materiality;
- source version;
- trace ID.

The backend and AI platform may use these events to invalidate caches or regenerate recommendations.

Do not emit invalidation for unchanged data solely because a pipeline reran.

---

## 30. Operational observability

Every job must have:

- job ID;
- pipeline ID;
- pipeline version;
- source IDs;
- partition;
- attempt number;
- trace ID;
- start and end timestamps;
- status;
- rows extracted;
- rows staged;
- rows rejected;
- rows published;
- bytes downloaded;
- checksums;
- quality score;
- warning count;
- error category;
- cost-relevant runtime metrics.

Dashboards should include:

- successful and failed jobs;
- stale datasets;
- pipeline duration;
- source latency;
- row-count trends;
- quality-score trends;
- schema-change alerts;
- retry rate;
- bytes processed;
- database load duration;
- Cloud Run cost indicators;
- source coverage;
- licence-review dates.

Do not log credentials, tokens, personal information, or full restricted source payloads.

---

## 31. Reliability and failure handling

Implement:

- bounded retries;
- exponential backoff;
- source-specific retry rules;
- resumable downloads where practical;
- checksums;
- extraction checkpoints;
- atomic publication;
- job locks;
- dead-letter or failed-job tracking;
- partial partition retry;
- provider outage handling;
- schema-drift detection;
- rollback.

Failure categories:

- authentication;
- authorisation;
- rate limit;
- provider unavailable;
- network timeout;
- source schema changed;
- parser failure;
- quality failure;
- database failure;
- storage failure;
- licence block;
- configuration error.

Do not classify a quality rejection as a successful refresh.

---

## 32. Security

Apply least privilege.

Separate service accounts for:

- read from source secrets;
- write raw storage;
- write staging;
- publish curated data;
- emit events;
- deploy jobs.

Database roles should separate:

- raw ingestion;
- staging transformation;
- curated publishing;
- read-only consumers.

Protect:

- provider credentials;
- signed URLs;
- licensed files;
- personal information;
- restricted fields;
- service-to-service tokens.

Encrypt data in transit and at rest.

Use Secret Manager for all secrets.

Do not commit sample licensed data unless contractual terms permit it.

---

## 33. Privacy

Avoid collecting personal information unless needed and approved.

Potentially sensitive data includes:

- owner or tenant names;
- personal phone numbers;
- private email addresses;
- individual-level financial details;
- precise personal movement data;
- suppressed crime records;
- personally identifiable property ownership data.

Prefer aggregate or de-identified data.

Document:

- purpose;
- legal basis;
- retention;
- access;
- deletion;
- sharing;
- user impact.

Do not infer sensitive personal attributes from property data.

---

## 34. Testing requirements

Required tests:

- source connector unit tests;
- parser tests using approved fixtures;
- schema contract tests;
- transformation tests;
- matching and deduplication tests;
- idempotency tests;
- incremental-load tests;
- quality-rule tests;
- anomaly tests;
- lineage tests;
- licence-rule tests;
- geospatial tests;
- publishing atomicity tests;
- rollback tests;
- event-emission tests;
- job-lock tests;
- retry tests;
- backfill tests;
- database integration tests;
- performance tests for representative partitions.

Fixtures must:

- be small;
- be synthetic or legally distributable;
- cover edge cases;
- preserve source shape where possible;
- contain no real secrets.

CI must fail when:

- schema contracts break unexpectedly;
- critical quality tests fail;
- licence metadata is absent;
- source definitions are incomplete;
- migrations fail;
- type checks fail;
- linting fails;
- secrets are detected.

---

## 35. Database design

Suggested data-platform-owned schemas:

```text
data_registry
raw_metadata
staging
canonical
curated
quality
lineage
operations
```

Potential tables:

- `sources`;
- `source_licences`;
- `datasets`;
- `dataset_versions`;
- `dataset_partitions`;
- `pipelines`;
- `pipeline_versions`;
- `jobs`;
- `job_attempts`;
- `raw_artifacts`;
- `quality_rules`;
- `quality_results`;
- `lineage_edges`;
- `publication_events`;
- `geography_entities`;
- `geography_relationships`;
- canonical domain tables;
- curated metric tables.

Use database constraints for integrity.

Use indexes aligned to consumer queries.

Use PostGIS indexes for spatial lookups.

Avoid storing huge raw payloads directly in PostgreSQL when object storage is more appropriate.

---

## 36. Alembic and migrations

Use Alembic for data-platform-owned schemas.

Rules:

- migrations are version controlled;
- production migrations are reviewed;
- migrations are reversible where practical;
- large table changes use safe rollout strategies;
- data backfills are separated from schema migrations when appropriate;
- destructive changes require explicit approval;
- migrations do not silently drop historical data;
- migration tests run in CI.

Do not use Alembic to manage backend-owned schemas unless the repository boundary explicitly assigns ownership.

---

## 37. Performance

Optimise using:

- columnar files such as Parquet;
- bulk inserts or COPY;
- partitioned processing;
- predicate pushdown;
- Polars lazy execution;
- database staging;
- materialized views;
- spatial indexes;
- incremental loads;
- compressed raw storage;
- safe task parallelism.

Measure before optimising.

Avoid:

- row-by-row HTTP requests where bulk endpoints exist;
- row-by-row database inserts;
- repeated geocoding of unchanged addresses;
- repeated downloads of unchanged files;
- unnecessary browser rendering;
- loading all history into memory.

---

## 38. Cloud Run Jobs deployment

Provide:

- production Dockerfile;
- non-root user;
- configurable job command;
- graceful termination;
- appropriate CPU and memory settings;
- timeout configuration;
- retry configuration;
- task parallelism guidance;
- staging and production jobs;
- Artifact Registry integration;
- least-privilege service accounts;
- Secret Manager integration;
- Cloud Scheduler configuration examples;
- deployment and rollback scripts.

Each job should be invokable through a clear command, for example:

```bash
python -m app.cli run-pipeline --pipeline-id abs-demographics
python -m app.cli backfill --pipeline-id market-sales --start 2024-01-01 --end 2024-12-31
python -m app.cli verify-dataset --dataset-id suburb-monthly-metrics
```

Do not build one monolithic command that refreshes every source by default.

---

## 39. Environment variables

Create `.env.example` with placeholders and comments.

### Application

```text
APP_ENV=
APP_NAME=
APP_VERSION=
LOG_LEVEL=
TIMEZONE=Australia/Sydney
```

### Google Cloud

```text
GOOGLE_CLOUD_PROJECT=
GOOGLE_CLOUD_REGION=
GOOGLE_APPLICATION_CREDENTIALS=
ARTIFACT_REGISTRY_REPOSITORY=
RAW_DATA_BUCKET=
PROCESSED_DATA_BUCKET=
```

### Database

```text
DATABASE_URL=
DATABASE_POOL_SIZE=
DATABASE_MAX_OVERFLOW=
DATABASE_STATEMENT_TIMEOUT_SECONDS=
```

### Supabase

```text
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_RAW_BUCKET=
SUPABASE_STORAGE_PROCESSED_BUCKET=
```

Only include Supabase storage settings when that storage option is implemented.

### Job behaviour

```text
PIPELINE_ID=
PIPELINE_PARTITION=
JOB_RUN_ID=
MAX_RETRIES=
HTTP_TIMEOUT_SECONDS=
DOWNLOAD_CHUNK_SIZE=
DEFAULT_CONCURRENCY=
ENABLE_DRY_RUN=
```

### Event publishing

```text
BACKEND_BASE_URL=
BACKEND_SERVICE_AUDIENCE=
DATASET_EVENT_ENDPOINT=
EVENT_PUBLISHING_ENABLED=
```

### Observability

```text
OTEL_EXPORTER_OTLP_ENDPOINT=
OTEL_SERVICE_NAME=
SENTRY_DSN=
TRACE_SAMPLE_RATE=
```

### Source credentials

Use source-specific names, for example:

```text
PROPERTY_DATA_PROVIDER_API_KEY=
PROPERTY_DATA_PROVIDER_BASE_URL=
SCHOOL_DATA_API_KEY=
MAPS_API_KEY=
GEOCODING_API_KEY=
```

Only include credentials for implemented and approved sources.

Never include real credentials.

`SETUP.md` must explain:

- where each value comes from;
- whether it is required;
- required permissions;
- local, staging, and production differences;
- source contract or licence prerequisites;
- how to test access safely.

---

## 40. Documentation requirements

Create:

- `README.md`;
- `SETUP.md`;
- source catalogue;
- dataset catalogue;
- canonical schema documentation;
- pipeline catalogue;
- schedule catalogue;
- quality rule catalogue;
- lineage guide;
- licence and attribution guide;
- backfill guide;
- geospatial guide;
- data consumer guide;
- operational runbooks;
- source outage runbook;
- schema-drift runbook;
- quality-failure runbook;
- rollback runbook;
- credential-rotation runbook;
- cost-spike runbook.

For each source, document:

- purpose;
- access method;
- credentials;
- licence;
- attribution;
- expected cadence;
- schema;
- pipeline;
- limitations;
- failure modes;
- owner.

For each dataset, document:

- business meaning;
- grain;
- keys;
- time semantics;
- geography;
- fields;
- quality score;
- freshness;
- version;
- source lineage;
- consumer restrictions.

---

## 41. Architecture Decision Records

Create ADRs including:

```text
docs/adr/
├── 0001-cloud-run-jobs.md
├── 0002-polars-for-transformations.md
├── 0003-raw-canonical-curated-layers.md
├── 0004-postgresql-and-postgis.md
├── 0005-immutable-raw-artifacts.md
├── 0006-dataset-versioning.md
├── 0007-quality-gated-publishing.md
├── 0008-source-and-licence-registry.md
├── 0009-event-driven-cache-invalidation.md
├── 0010-atomic-dataset-publication.md
└── 0011-authorised-scraping-policy.md
```

Each ADR must include:

- context;
- decision;
- alternatives;
- consequences;
- status;
- date.

---

## 42. Codex implementation sequence

Codex must work incrementally.

### Phase 1 — Foundation

- create project structure;
- configure Python project;
- implement settings and logging;
- implement CLI;
- implement database session;
- create Dockerfile;
- create `.env.example`;
- create initial documentation.

### Phase 2 — Registries

- implement source registry;
- implement licence registry;
- implement dataset registry;
- implement pipeline registry;
- implement schedule registry;
- implement registry validation.

### Phase 3 — Raw ingestion framework

- implement connector interfaces;
- implement HTTP downloader;
- implement file ingestion;
- implement checksums;
- implement raw artefact manifests;
- implement storage abstraction;
- implement extraction checkpoints.

### Phase 4 — Canonical and quality framework

- implement canonical schemas;
- implement quality rules;
- implement quality scoring;
- implement anomaly framework;
- implement staging and publishing services;
- implement lineage.

### Phase 5 — Initial public datasets

Implement approved public-source pipelines in a controlled order:

1. RBA rates and indicators;
2. ABS demographics;
3. official geography and boundaries;
4. approved school datasets;
5. approved state crime datasets;
6. approved infrastructure and planning datasets;
7. approved hazard datasets.

### Phase 6 — Market and property data

- implement only after provider access and licence details are available;
- add property, sales, rental, listing, and comparable datasets;
- enforce provider-specific restrictions;
- add property and address matching.

### Phase 7 — Curated metrics

- suburb market metrics;
- rental metrics;
- demographic summaries;
- infrastructure proximity;
- hazard exposure;
- prediction feature tables;
- quality and freshness views.

### Phase 8 — Scheduling and events

- configure Cloud Run Jobs;
- configure Cloud Scheduler;
- implement publication events;
- implement downstream invalidation;
- implement stale-dataset alerts.

### Phase 9 — Hardening

- backfills;
- reconciliation;
- rollback;
- performance testing;
- cost monitoring;
- source schema-change detection;
- runbooks;
- deployment documentation.

Do not implement licensed or scraped sources using guessed credentials, undocumented endpoints, or assumed rights.

---

## 43. Definition of done

The data platform is complete only when:

- it runs locally using documented commands;
- each source is registered with licence and access metadata;
- each dataset has a stable contract and schema version;
- raw artefacts are immutable and checksummed;
- pipelines are idempotent;
- staging and publication are separate;
- critical quality failures block publication;
- historical observations are preserved;
- geography and time semantics are explicit;
- lineage is recorded;
- freshness and quality metadata are published;
- source restrictions are enforced;
- downstream refresh events are emitted only for changed data;
- backfills are controlled and reproducible;
- schema changes are detected;
- tests pass;
- Docker image builds;
- Cloud Run Job and Scheduler setup is documented;
- `.env.example` includes every required placeholder;
- `SETUP.md` lists every credential, connection string, source approval, permission, bucket, schedule, and external dependency;
- no secret or prohibited source data is committed;
- no scraper circumvents technical controls;
- no critical TODO is left undocumented.

---

## 44. Final operating principles

1. Use approved APIs and bulk downloads before scraping.
2. Treat licence terms as executable platform constraints.
3. Preserve raw data and transformation history.
4. Separate raw, canonical, and curated layers.
5. Never silently overwrite historically meaningful values.
6. Make geography, time, method, and units explicit.
7. Publish only after quality checks pass.
8. Prefer deterministic transformations.
9. Keep every pipeline idempotent and retry safe.
10. Version sources, schemas, pipelines, features, and datasets.
11. Record freshness and quality with every published dataset.
12. Emit downstream invalidation only when material data changes.
13. Do not guess provider endpoints, credentials, licences, or semantics.
14. Avoid collecting personal data without a clear approved need.
15. Build the platform so every important number can be traced back to its source.
