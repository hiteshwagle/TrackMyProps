# TrackMyProps Australian Data Sources

## 1. Purpose

This document defines the recommended Australian data-source strategy for TrackMyProps.

It covers:

- official public data;
- state and territory data;
- commercial property providers;
- source access methods;
- licences;
- attribution;
- refresh frequency;
- data quality;
- historical coverage;
- pipeline ownership;
- storage and redistribution restrictions;
- source selection priorities;
- current implementation caveats.

This document reflects the source landscape reviewed in August 2026.

Data products, provider names, APIs, licences, pricing, and access conditions can change. Every production connector must verify the current source contract before implementation or renewal.

---

# 2. Source-governance principles

1. Prefer authoritative first-party sources.
2. Prefer APIs or bulk downloads over browser scraping.
3. Do not assume public visibility means commercial reuse is permitted.
4. Record the licence for every source.
5. Record attribution requirements.
6. Separate raw, canonical, and curated data.
7. Preserve source and publication dates.
8. Preserve historical versions.
9. Treat commercial-provider output as contract-controlled.
10. Do not redistribute provider data unless explicitly permitted.
11. Do not bypass authentication, paywalls, CAPTCHA, or technical controls.
12. Do not treat listing text as authoritative property-title data.
13. Do not combine incompatible geographies or periods silently.
14. Data quality and freshness must be visible to consumers.
15. Each dataset must have an owner and refresh policy.

---

# 3. Source classifications

Use the following access classes.

## 3.1 Open public

Data is available without a commercial contract and carries an open licence or explicit reuse terms.

Examples:

- ABS aggregate statistics;
- RBA statistical tables;
- selected data.gov.au datasets;
- selected state open-data datasets.

## 3.2 Public with attribution or conditions

Data is publicly accessible but requires:

- attribution;
- disclaimer;
- restricted representation;
- source-specific compliance.

## 3.3 Registration controlled

Data requires:

- account;
- API project;
- registration;
- approval;
- API token.

Registration does not imply unrestricted redistribution.

## 3.4 Commercial licensed

Data requires a negotiated contract, subscription, API plan, or data-extract agreement.

Terms may control:

- allowed product use;
- user count;
- display;
- caching;
- derived values;
- redistribution;
- storage;
- retention;
- territory;
- request volume;
- attribution.

## 3.5 Restricted or unsuitable

Sources should not be used when:

- licence is unclear;
- commercial reuse is prohibited;
- automated access is prohibited;
- personal data risk is excessive;
- source reliability is inadequate;
- access requires circumvention.

---

# 4. Source registry requirements

Every source must be registered with:

```text
source_id
source_name
source_owner
source_category
jurisdiction
official_landing_page
access_method
authentication_type
licence_name
licence_reference
commercial_use_allowed
redistribution_allowed
derived_outputs_allowed
raw_storage_allowed
maximum_retention
attribution_text
update_frequency
expected_publication_delay
source_timezone
rate_limit
personal_data_classification
contract_owner
contract_review_date
status
```

Valid source statuses:

```text
proposed
under_review
approved
active
degraded
suspended
retired
blocked
```

---

# 5. Source priority model

Score candidate sources by:

- authority;
- coverage;
- granularity;
- freshness;
- historical depth;
- stability;
- machine accessibility;
- legal usability;
- cost;
- quality;
- unique value;
- operational effort.

Suggested categories:

```text
Tier 1: authoritative foundation
Tier 2: high-value licensed market data
Tier 3: specialised official or commercial enrichment
Tier 4: experimental or optional
```

---

# 6. Australian Bureau of Statistics

## Source ID

```text
abs
```

## Priority

```text
Tier 1
```

## Recommended uses

- population;
- population growth;
- household composition;
- household income;
- employment;
- occupation;
- industry;
- dwelling structure;
- tenure;
- migration;
- building approvals;
- lending indicators where published;
- consumer prices;
- labour-market data;
- regional statistics;
- Census information;
- socioeconomic indices.

## Access methods

The ABS provides:

- ABS Data API;
- Data Explorer;
- CSV downloads;
- Excel downloads;
- Census DataPacks for historical Census products;
- TableBuilder;
- digital boundary downloads;
- geospatial web services.

The ABS Data API is available without an API key. It uses SDMX-style structures and supports JSON, CSV, and XML responses.

## Census timing

At August 2026:

- the 2026 Census is scheduled for 11 August 2026;
- first major 2026 Census data is planned for June 2027;
- second release is planned for October 2027;
- complex third-release products are planned for early to mid-2028.

TrackMyProps must continue using 2021 Census data and other current ABS series until relevant 2026 Census data is officially released.

## Geography transition

ASGS Edition 4 began releasing in July 2026.

The ABS states that:

- Edition 4 is being progressively released;
- the 2026 Census will use Edition 4;
- some current statistics will continue using Edition 3 during the transition.

TrackMyProps must store:

```text
geography_standard
geography_edition
geography_code
boundary_effective_date
```

Never join Edition 3 and Edition 4 areas by name alone.

## Suggested pipeline IDs

```text
abs_asgs_boundaries
abs_census_2021
abs_census_2026_when_released
abs_population_estimates
abs_regional_statistics
abs_building_approvals
abs_labour_force
abs_consumer_prices
abs_lending_indicators
abs_seifa
```

## Refresh

Depends on dataset:

```text
Census: multi-year staged release
Population: periodic
CPI and labour: monthly or quarterly depending on series
Building approvals: monthly
Geography: edition and annual non-ABS updates
```

## Quality considerations

- Census is a point-in-time population snapshot.
- Small-area data may be perturbed or suppressed.
- Statistical and administrative geographies differ.
- Postal Areas are approximations, not Australia Post delivery boundaries.
- Suburbs and Localities are statistical approximations.
- ASGS boundaries must be versioned.

## Recommended use

Use ABS as the demographic and statistical-geography foundation.

---

# 7. Australian Statistical Geography Standard

## Source ID

```text
abs_asgs
```

## Priority

```text
Tier 1
```

## Uses

- Mesh Blocks;
- SA1;
- SA2;
- SA3;
- SA4;
- states and territories;
- Greater Capital City Statistical Areas;
- future Edition 4 non-ABS structures;
- geography correspondences;
- boundary mapping.

## Current implementation note

As of August 2026:

- Edition 4 Main Structure and GCCSA have been released;
- Edition 4 non-ABS structures such as LGA, Postal Areas, and Suburbs and Localities have later scheduled releases;
- Edition 3 remains necessary for datasets not yet transitioned.

## Access methods

- Shapefile;
- GeoPackage;
- allocation files;
- correspondences;
- ArcGIS map and feature services;
- downloadable boundaries.

## Pipeline requirements

- ingest each edition independently;
- preserve GDA2020 coordinate reference information;
- validate polygon geometry;
- create PostGIS indexes;
- store correspondences;
- avoid overwriting previous boundaries;
- provide geography conversion only with documented approximation.

---

# 8. Reserve Bank of Australia

## Source ID

```text
rba
```

## Priority

```text
Tier 1
```

## Recommended uses

- cash rate target;
- lending rates;
- inflation and inflation expectations;
- exchange rates;
- credit and financial aggregates;
- housing lending indicators;
- historical forecasts;
- selected banking and financial-market series.

## Access methods

The RBA publishes:

- statistical tables;
- CSV and spreadsheet downloads;
- statistical releases;
- chart data;
- change notices.

## Refresh

Depends on table:

```text
daily
weekly
monthly
quarterly
on monetary-policy decision
```

## Operational requirement

Monitor the RBA changes-to-statistical-tables notices.

The RBA reported in 2026 that some statistical releases could be delayed during reporting-system changes. Pipeline freshness must rely on actual publication dates, not assumed schedules.

## Suggested pipeline IDs

```text
rba_cash_rate
rba_lending_rates
rba_financial_aggregates
rba_inflation
rba_exchange_rates
rba_housing_credit
```

## Recommended use

Use RBA as the authoritative macroeconomic and interest-rate source.

Do not infer future rate decisions.

---

# 9. Data.gov.au

## Source ID

```text
data_gov_au
```

## Priority

```text
Tier 1 catalogue, source-specific quality
```

## Purpose

Data.gov.au is a national catalogue for Australian Government and participating state, territory, local-government, and research datasets.

## Important licence rule

The portal’s own general material is commonly provided under Creative Commons attribution terms, but each dataset may carry its own licence, source metadata, disclaimer, and access conditions.

The connector must use the licence attached to the individual dataset.

## Uses

- planning applications;
- infrastructure;
- environmental data;
- hazard data;
- administrative boundaries;
- public facilities;
- transport;
- local-government datasets;
- government registers.

## Access

Possible formats:

```text
CSV
JSON
GeoJSON
Shapefile
GeoPackage
WMS
WFS
ArcGIS REST
API
ZIP
Excel
```

## Quality concerns

- data.gov.au often points to another source portal;
- catalogue modification date may not equal source-data date;
- local datasets vary significantly in quality;
- some records are archived or third-party copies;
- licence details may be source specific;
- schemas can change without strong version guarantees.

## Recommended approach

Use data.gov.au primarily for discovery.

Where possible, connect to the original publishing agency rather than a copied resource.

---

# 10. State and territory open-data portals

TrackMyProps should maintain source adapters by jurisdiction.

Potential portals include:

```text
Data.NSW
data.vic.gov.au
Queensland Government open data
Data.SA
data.wa.gov.au / Landgate services
data.tas.gov.au
ACT Open Data
Northern Territory open data
```

Use cases:

- planning applications;
- development approvals;
- land parcels;
- sales records;
- valuations;
- crime;
- schools;
- transport;
- infrastructure;
- flood;
- bushfire;
- zoning;
- heritage;
- environmental overlays.

Every dataset must be reviewed independently.

---

# 11. State property-sales and valuation data

Property transaction and valuation access differs by jurisdiction.

Potential authoritative bodies include:

```text
NSW Valuer General and Spatial Services
Land Use Victoria / Valuer-General Victoria
Queensland Titles Queensland and Valuer-General related services
Land Services SA / Valuer-General South Australia
Landgate Western Australia
The LIST and Valuer-General Tasmania
ACT Government land and planning services
Northern Territory land-information services
```

## Data may include

- settled sales;
- contract dates;
- sale prices;
- land valuations;
- property identifiers;
- parcel references;
- address;
- zoning;
- title or plan references.

## Important constraints

- some data is open;
- some is paid;
- some is available through bulk extracts;
- some requires licensed resupply agreements;
- personal ownership information may be restricted;
- publication delay differs;
- transaction coverage may exclude non-market transfers;
- price and property attributes may require additional cleansing.

## Recommended approach

Do not build eight incompatible property models.

Create a state adapter that maps into:

```text
canonical_property
canonical_sale
canonical_land_valuation
canonical_parcel
```

---

# 12. Geoscape Australia

## Source ID

```text
geoscape
```

## Priority

```text
Tier 1 or Tier 2 depending on product and licence
```

## Recommended uses

- authoritative address matching;
- buildings;
- parcels;
- property relationships;
- geocoded addresses;
- land and location reference data;
- nationally consistent identifiers.

## Access

Geoscape offers commercial data products and services. Exact API, feed, usage, storage, and redistribution rights require contract confirmation.

## Strategic value

A consistent national address and property identifier can reduce:

- duplicate properties;
- unit-number errors;
- postcode mismatches;
- failed joins between state sources;
- ambiguous listing matches.

## Recommended use

Evaluate Geoscape early for the national property identity layer.

Do not assume all product data is open because Geoscape also participates in public-sector data ecosystems.

---

# 13. G-NAF and national address data

## Potential use

- address validation;
- address normalisation;
- geocoding;
- matching;
- unit and street-level structure.

## Implementation requirements

- verify the current publisher and licence;
- preserve address identifiers;
- version releases;
- do not treat address presence as proof of an active dwelling;
- reconcile with property, parcel, and building identifiers;
- handle retired and alias addresses.

A commercial address API may be operationally simpler than self-hosting national address releases.

---

# 14. Australian schools data

## Potential sources

- ACARA My School;
- Australian Government Department of Education;
- state and territory education departments;
- approved school-location datasets;
- commercial property providers offering school APIs.

## Potential fields

- school identifier;
- name;
- sector;
- school type;
- year levels;
- enrolment;
- location;
- funding;
- selected performance information;
- attendance information;
- catchment or zone where officially published.

## Important constraints

- My School supports school-level information, but bulk or API reuse terms must be confirmed;
- performance data needs careful contextual interpretation;
- catchments are state controlled and can change;
- proximity does not prove enrolment eligibility;
- school quality should not be reduced to one score;
- demographic or school information must not be used for discriminatory profiling.

## Recommended implementation

Phase 1:

- official school locations;
- school type;
- distance and travel-time estimates;
- clearly sourced public attributes.

Phase 2:

- licensed or approved richer school metrics.

---

# 15. Crime and safety data

Crime data is primarily published by state and territory agencies.

Potential agencies include:

```text
NSW Bureau of Crime Statistics and Research
Crime Statistics Agency Victoria
Queensland Police Service open data
South Australia Police
Western Australia Police
Tasmania Police
ACT Policing
Northern Territory Police
```

## Potential fields

- offence category;
- period;
- geography;
- incident count;
- rate;
- denominator;
- suppression flag.

## Challenges

- categories differ by jurisdiction;
- geography differs;
- reporting practices differ;
- offence occurrence is not the same as conviction;
- small counts may be suppressed;
- population-normalised rates require matching population periods;
- cross-state comparisons can be misleading.

## Recommended approach

- build one adapter per jurisdiction;
- preserve original categories;
- map to a broad canonical category only when documented;
- display methodology and period;
- avoid a simplistic “safe suburb” claim.

---

# 16. Planning and development applications

Potential sources:

- state planning portals;
- local council APIs;
- data.gov.au;
- ArcGIS services;
- council open-data feeds;
- commercial providers.

## Potential fields

- application ID;
- address;
- application type;
- description;
- status;
- lodgement date;
- decision date;
- estimated cost;
- documents;
- coordinates.

## Challenges

- highly fragmented;
- address quality;
- duplicate applications;
- inconsistent statuses;
- documents may contain personal information;
- active application does not guarantee construction;
- approved application does not guarantee completion.

## Recommended use

Use planning data as a signal, not proof of future supply or infrastructure delivery.

---

# 17. Infrastructure projects

Potential official sources:

- Infrastructure Australia;
- federal budget and project portals;
- state transport departments;
- state infrastructure agencies;
- local councils;
- data.gov.au;
- project-specific official sites.

## Canonical stages

```text
proposed
announced
business_case
funded
procurement
under_construction
completed
cancelled
delayed
unknown
```

## Required fields

```text
project_id
name
type
location
status
announced_date
planned_start
planned_completion
actual_completion
estimated_cost
funding_status
source
last_verified_at
```

## Rule

Do not treat an announced or proposed project as completed infrastructure.

---

# 18. Transport and accessibility

Potential sources:

- state transport open-data portals;
- GTFS feeds;
- road-network data;
- official station and stop datasets;
- approved maps providers.

## Uses

- distance to station;
- service availability;
- public-transport accessibility;
- travel time;
- road proximity;
- future transport projects.

## Constraints

- timetable access does not guarantee service reliability;
- travel time changes by time and date;
- maps-provider licence may restrict storage;
- historical GTFS requires deliberate archiving.

---

# 19. Flood data

Potential official sources:

- state flood portals;
- local councils;
- emergency and environment agencies;
- national flood studies;
- commercial risk providers.

## Challenges

- flood layers differ by study and probability;
- local studies may supersede broad layers;
- absence of a layer does not mean no risk;
- model date and climate assumptions matter;
- property-level interpretation may require professional assessment.

## Required metadata

```text
hazard_type
study_name
study_date
probability_or_scenario
resolution
geometry
limitations
source
```

Do not convert all flood data into a single binary flag without preserving methodology.

---

# 20. Bushfire data

Potential official sources:

- state fire agencies;
- planning agencies;
- environment departments;
- designated bushfire-prone-area layers;
- vegetation and fire-history datasets.

## Important distinction

Separate:

- bushfire-prone land designation;
- historical fire extent;
- modelled hazard;
- building-standard requirement;
- current emergency warning.

Do not infer insurance availability or construction compliance.

---

# 21. Climate and environmental risk

Potential sources:

- Bureau of Meteorology;
- CSIRO;
- state environment agencies;
- Geoscience Australia;
- commercial climate-risk providers;
- official sea-level, heat, rainfall, and hazard datasets.

## Uses

- historical climate;
- heat exposure;
- rainfall;
- cyclone;
- coastal exposure;
- long-term climate scenarios;
- environmental constraints.

## Requirements

- show scenario;
- show horizon;
- show spatial resolution;
- show model limitations;
- separate historical observation from projection.

---

# 22. Bureau of Meteorology

## Recommended uses

- historical rainfall;
- temperature;
- climate normals;
- severe weather and climate data;
- selected observational data.

## Access

BOM data access varies by dataset and service.

Verify:

- current API or bulk-access mechanism;
- attribution;
- request restrictions;
- commercial reuse;
- observation versus forecast terms.

Weather forecasts are not core property-market data and should generally be retrieved on demand rather than permanently ingested.

---

# 23. Australian Business Register and ASIC

## Potential uses

- validate property-management or service-provider business identity;
- ABN status;
- entity name;
- GST registration where publicly available;
- licence-related enrichment through relevant registers.

## Constraints

- ABN data has terms and attribution;
- ASIC company extracts may involve fees or licence conditions;
- identity validation is not quality endorsement;
- do not expose unnecessary personal sole-trader details.

These sources are optional for later property-manager and tradie ecosystems.

---

# 24. Cotality

## Source ID

```text
cotality
```

## Former branding

The Australian CoreLogic property-data business has transitioned to the Cotality brand. Legacy product pages and contracts may still reference CoreLogic or RP Data Pty Ltd.

## Priority

```text
Tier 2 commercial
```

## Potential data

- residential property attributes;
- sales history;
- listings;
- valuation estimates;
- rental estimates;
- images;
- market insights;
- location attributes;
- climate risk;
- development applications;
- commercial-property data;
- ownership and tenancy data for approved products.

Cotality states that its broader Australian and New Zealand property view covers more than 14 million properties.

## Access

Potential delivery:

- REST APIs;
- OAuth 2.0;
- data feeds;
- reports;
- web products;
- commercial APIs.

Its commercial API documentation describes JSON over REST and refreshes within 24 hours for that product.

## Contract questions

Confirm:

```text
residential API availability
allowed consumer display
AVM display rules
confidence-field requirements
required disclaimers
image rights
raw storage
cache period
derived metrics
redistribution
per-user access
request limits
historical retention
property identifier use
```

## Recommended use

Evaluate for:

- canonical property enrichment;
- sales;
- valuation;
- comparable sales;
- rental estimates;
- property attributes;
- market data.

Do not subscribe only to a human-facing RP Data plan and assume automated extraction is allowed.

---

# 25. PropTrack

## Source ID

```text
proptrack
```

## Priority

```text
Tier 2 commercial
```

## Potential data

Official PropTrack API documentation describes services for:

- OAuth 2.0 authentication;
- address matching and suggestions;
- property details;
- sale history;
- listing history;
- property attributes;
- transactions;
- listings;
- suburb market statistics;
- supply and demand;
- rent insights;
- sale insights;
- required disclaimers.

PropTrack states its data covers more than 12 million properties and is associated with REA Group and realestate.com.au data.

## Access

- APIs;
- developer documentation;
- data extracts;
- negotiated commercial access.

## Strategic value

Strong candidate for:

- listing discovery;
- address matching;
- listing history;
- property history;
- market metrics;
- rental insights.

## Contract questions

Confirm:

- right to display listing information;
- listing image rights;
- refresh requirements;
- removal of withdrawn listings;
- disclaimer API usage;
- retention;
- caching;
- consumer application use;
- data-derived AI outputs;
- model-training restrictions;
- geography coverage;
- sandbox and production limits.

---

# 26. Domain APIs

## Source ID

```text
domain
```

## Priority

```text
Tier 2 commercial or registration controlled
```

## Potential products

The Domain developer portal lists packages for:

- address suggestions;
- agents and listings;
- listing management;
- price estimation;
- properties and locations;
- property enrichment;
- portfolio functionality;
- rental automated valuation estimates;
- schools data;
- webhooks;
- market and demographic information.

## Access

- developer account;
- projects;
- sandbox;
- production plans;
- package-specific access.

## Strategic value

Potential source for:

- listings;
- estimates;
- rental estimates;
- schools;
- auctions;
- location metrics;
- listing webhooks.

## Contract questions

Confirm:

- production pricing;
- package quotas;
- consumer-display rights;
- estimate disclaimers;
- caching;
- image use;
- redistribution;
- webhooks;
- listing-management scope;
- user authentication requirements.

---

# 27. Commercial-provider selection

Do not purchase all providers initially.

Run a structured proof of concept.

Score each provider on:

```text
property coverage
listing freshness
sale-history coverage
rental coverage
AVM quality
address matching
API usability
historical depth
data quality
consumer display rights
derived-output rights
AI-use rights
price
support
Australian hosting and privacy
```

## Recommended proof-of-concept tests

Use a synthetic or internally approved address set covering:

- capital-city houses;
- capital-city apartments;
- regional areas;
- new developments;
- units with ambiguous addresses;
- properties with sparse sales;
- recently sold properties;
- active listings;
- withdrawn listings.

Do not upload one provider’s licensed data to another provider.

---

# 28. Listing-source strategy

Recommended hierarchy:

```text
1. Licensed listing API or feed
2. Licensed commercial data extract
3. User-submitted listing URL processed only where permitted
4. Manual user entry
```

Avoid general website scraping.

Required listing fields:

```text
provider
listing_id
property_id
address
listing_status
listing_type
price_text
price_min
price_max
auction_date
listed_at
updated_at_source
withdrawn_at
sold_at
agent_reference
source_url_reference
licence_constraints
```

Listing status must be refreshed and withdrawn content handled according to contract.

---

# 29. Automated valuation models

Potential providers:

- Cotality;
- PropTrack;
- Domain;
- lender or valuation partners;
- future internally validated model.

## Required AVM fields

```text
estimate
lower_bound
upper_bound
confidence
valuation_date
model_version
provider
property_match_quality
required_disclaimer
```

## Rules

- do not show an estimate without its date;
- show confidence or range where available;
- never describe AVM as a certified valuation;
- preserve provider disclaimer;
- do not average AVMs without a validated methodology;
- check contract rights before storing historical estimates.

---

# 30. Rental estimates

Potential sources:

- actual lease entered by user;
- property manager statement;
- commercial rental AVM;
- active rental listings;
- suburb bedroom-level median;
- agent appraisal.

Recommended hierarchy depends on purpose.

For current property cash flow:

```text
actual lease > verified manager statement > user-confirmed rent
```

For opportunity analysis:

```text
rental AVM + comparable rentals + suburb benchmark
```

Never treat asking rent as achieved rent.

---

# 31. Vacancy-rate data

Potential sources:

- commercial market providers;
- SQM Research or another licensed provider;
- state or industry reports;
- inferred listing models.

Any vacancy metric must document:

- geography;
- dwelling scope;
- method;
- numerator;
- denominator;
- date;
- source;
- revision.

Do not combine vacancy metrics from incompatible methodologies.

---

# 32. SQM Research and specialist market providers

Specialist providers may offer:

- vacancy rates;
- listings;
- asking prices;
- stock on market;
- rental data;
- distress indicators.

Access and redistribution rights must be commercially confirmed.

Do not scrape published charts or reports into a commercial product without permission.

---

# 33. DSR Data and scoring providers

Commercial suburb-scoring providers may offer:

- demand and supply measures;
- market timing indicators;
- suburb rankings;
- investment scores;
- risk indicators.

Before integration, verify:

```text
API or feed availability
methodology transparency
data licensing
consumer display rights
historical values
score stability
derived-output rights
AI use
```

TrackMyProps should not adopt an external score as its own unexplained truth.

Preserve component evidence.

---

# 34. PriceFinder and related professional platforms

Professional property research platforms may provide:

- property search;
- sales;
- ownership;
- valuation;
- reports;
- comparable properties.

A user subscription does not automatically permit API automation, bulk extraction, or redistribution.

Only integrate through an approved API or data licence.

---

# 35. Maps and geocoding providers

Potential providers:

- Google Maps Platform;
- Geoscape;
- Mapbox;
- HERE;
- state address services;
- open geospatial datasets.

## Uses

- address suggestions;
- geocoding;
- reverse geocoding;
- distance;
- route;
- travel time;
- map display.

## Restrictions

Maps providers commonly restrict:

- permanent storage;
- mixing with competing maps;
- caching;
- display outside approved maps;
- use of place IDs;
- bulk geocoding.

Choose one primary policy and document allowed storage.

Do not treat geocoder output as an authoritative property-title record.

---

# 36. OpenStreetMap

Potential uses:

- map base layer through an approved tile provider;
- roads and points of interest;
- spatial enrichment.

Requirements:

- comply with Open Database Licence;
- provide attribution;
- do not overload public tile servers;
- use an approved tile provider or self-hosting arrangement for production;
- review share-alike implications for derived databases.

OpenStreetMap should not replace authoritative parcel, sale, or valuation data.

---

# 37. Property images

Possible sources:

- licensed listing providers;
- user uploads;
- commercial property-data libraries;
- approved street imagery.

Image rights are separate from factual data rights.

Required controls:

```text
image_provider
image_id
licence
display_expiry
download_allowed
derivative_allowed
attribution
```

Do not permanently copy listing images without explicit rights.

---

# 38. User-provided data

User data is a primary source for:

- purchase price;
- settlement;
- current loan;
- actual rent;
- actual expenses;
- lease;
- valuation;
- documents;
- goals;
- assumptions.

Classify as:

```text
user_provided
```

User-provided data must:

- retain provenance;
- support correction;
- be validated;
- not be represented as independently verified;
- override estimates only according to explicit product rules.

---

# 39. Uploaded documents

Potential documents:

- contract;
- loan statement;
- rental statement;
- strata report;
- building report;
- valuation;
- council rates;
- lease;
- insurance;
- depreciation schedule.

Extraction must store:

```text
document_id
page
section
extracted_value
confidence
parser_version
user_confirmation
```

Do not silently overwrite structured records with extracted values.

Use a review-and-confirm workflow.

---

# 40. Source-of-truth hierarchy

Suggested examples.

## Property address

```text
approved national address source
then authoritative state source
then licensed property provider
then user-entered address
```

## Purchase price

```text
user-confirmed settlement document
then authoritative sale record
then licensed provider record
then user entry
```

## Current rent

```text
active verified lease
then property-manager statement
then user-confirmed rent
then rental AVM or market estimate
```

## Current property value

```text
certified valuation
then bank valuation
then recent agent appraisal
then approved AVM
then user estimate
```

The hierarchy must remain configurable.

---

# 41. Canonical dataset design

Raw sources should map into:

```text
canonical.geographies
canonical.addresses
canonical.properties
canonical.parcels
canonical.property_sales
canonical.property_listings
canonical.rental_observations
canonical.market_observations
canonical.demographic_observations
canonical.schools
canonical.crime_observations
canonical.infrastructure_projects
canonical.planning_applications
canonical.hazard_areas
canonical.economic_indicators
```

Every canonical record requires:

```text
source_id
source_record_id
dataset_version
observed_date
published_date
ingested_at
quality_score
licence_reference
```

---

# 42. Curated datasets

Recommended curated outputs:

```text
suburb_market_metrics
suburb_demographic_metrics
suburb_risk_metrics
suburb_infrastructure_metrics
property_comparable_sales
property_rental_comparables
property_market_context
prediction_features
listing_match_features
```

Curated data must never remove source traceability.

---

# 43. Refresh strategy

## Event or publication driven

Use when source release dates are known.

Examples:

- RBA decisions;
- ABS publication;
- Census releases.

## Scheduled polling

Use for:

- provider APIs;
- listing updates;
- planning feeds;
- council datasets.

## Conditional retrieval

Use:

- ETag;
- Last-Modified;
- checksum;
- source version.

## On demand

Use for:

- property-specific valuation;
- current listing;
- route calculation;
- document analysis.

---

# 44. Recommended initial source roadmap

## Phase 1

Implement:

```text
ABS Data API
ASGS boundaries
RBA statistical tables
one approved maps/geocoding provider
user-entered portfolio data
```

## Phase 2

Implement:

```text
official school locations
selected state crime datasets
selected planning and infrastructure data
selected flood and bushfire layers
```

## Phase 3

Select one primary commercial property provider for:

```text
address matching
property attributes
sales
market metrics
rental data
valuation estimates
```

## Phase 4

Add one listing provider or listing feed.

## Phase 5

Add specialist providers only when they contribute demonstrable unique value.

---

# 45. Primary commercial-provider recommendation process

TrackMyProps should issue a structured request for information to:

```text
Cotality
PropTrack
Domain
```

Request:

- API catalogue;
- sample payload;
- sandbox;
- price;
- quota;
- coverage;
- latency;
- historical depth;
- AVM metrics;
- display terms;
- caching terms;
- storage terms;
- AI and derived-output rights;
- consumer app rights;
- listing image rights;
- attribution;
- termination and data-deletion requirements.

Do not select solely on lowest price.

---

# 46. Data quality score

Score each dataset by:

```text
authority
completeness
validity
uniqueness
timeliness
coverage
consistency
match confidence
```

The quality score must not hide critical failures.

A dataset with a high overall score but missing one entire state must still show the coverage failure.

---

# 47. Source conflict resolution

When sources disagree:

1. preserve both observations;
2. compare effective dates;
3. compare authority;
4. compare property-match quality;
5. apply source hierarchy;
6. expose conflict where material;
7. allow user confirmation;
8. never silently overwrite history.

Example:

```text
user says 3 bedrooms
provider says 2 bedrooms
listing says 3 bedrooms
```

Store the conflict and selected resolution.

---

# 48. Historical data

Preserve time-series history for:

- sale prices;
- listing status;
- asking price;
- rent;
- valuation;
- market metrics;
- demographics;
- crime;
- planning status;
- project status;
- hazard-version changes;
- interest rates.

Do not overwrite observations in place.

---

# 49. Licence enforcement

The source registry must support machine-enforced policy.

Examples:

```text
allow_raw_storage
allow_user_display
allow_export
allow_derived_metric
allow_ai_context
allow_model_training
maximum_cache_hours
required_attribution
required_disclaimer
```

The backend and AI platform must not assume that because data is present in curated tables it may be displayed or exported without conditions.

---

# 50. Personal information

Avoid collecting:

- owner names;
- tenant names;
- private contact details;
- personal title records;
- unnecessary sole-trader data.

If a commercial source includes personal data:

- review privacy purpose;
- limit fields;
- restrict access;
- set retention;
- prevent AI exposure unless required;
- document Australian Privacy Principles considerations.

---

# 51. Reliability classifications

Use:

```text
authoritative
high
medium
experimental
unknown
```

Examples:

- official published cash rate: authoritative;
- licensed settled-sales feed: high, subject to coverage;
- active asking price: medium for valuation use;
- AI-inferred renovation quality: experimental;
- unsourced internet claim: unknown and not production eligible.

---

# 52. Source outage behaviour

For each connector define:

```text
timeout
retry
backoff
circuit breaker
maximum stale use
criticality
fallback source
alert
```

Do not automatically switch to a semantically different source without recording it.

---

# 53. Monitoring

Track:

```text
source_request_count
source_error_rate
source_latency
source_rate_limit
source_schema_change
source_last_success
source_publication_date
rows_ingested
rows_rejected
match_rate
quality_score
dataset_age
contract_expiry
```

Alert before contract or credential expiry.

---

# 54. Security

Source credentials must be stored in Secret Manager.

Do not:

- include credentials in URLs;
- log access tokens;
- store provider payloads beyond contract;
- expose raw provider responses to clients;
- let AI call arbitrary provider endpoints;
- place commercial credentials in frontend.

---

# 55. Testing

Each source connector requires:

- contract fixture;
- parser tests;
- schema-drift tests;
- authentication tests;
- pagination tests;
- rate-limit tests;
- idempotency tests;
- quality tests;
- licence-policy tests;
- sample reconciliation;
- safe outage behaviour.

Live-source tests must be opt-in and quota controlled.

---

# 56. Required documentation per source

Create:

```text
docs/data-sources/<source-id>.md
```

Each file must contain:

```text
owner
purpose
datasets
access
authentication
licence
commercial rights
attribution
schema
refresh
history
quality
limitations
storage
retention
consumer rules
pipeline
monitoring
contract owner
renewal date
```

---

# 57. Required source decision records

Create an ADR when:

- selecting the primary commercial property provider;
- selecting the listing provider;
- selecting geocoding;
- creating a cross-provider identity strategy;
- using an inferred metric;
- using a source with unusual licence terms;
- replacing a provider.

---

# 58. Environment variables

Potential values:

```text
ABS_DATA_API_BASE_URL=
RBA_DATA_BASE_URL=
GEOSCAPE_API_BASE_URL=
GEOSCAPE_CLIENT_ID=
GEOSCAPE_CLIENT_SECRET=
COTALITY_API_BASE_URL=
COTALITY_CLIENT_ID=
COTALITY_CLIENT_SECRET=
PROPTRACK_API_BASE_URL=
PROPTRACK_CLIENT_ID=
PROPTRACK_CLIENT_SECRET=
DOMAIN_API_BASE_URL=
DOMAIN_CLIENT_ID=
DOMAIN_CLIENT_SECRET=
GOOGLE_MAPS_API_KEY=
```

Only add configured providers.

Do not invent endpoint values.

---

# 59. Codex rules

Codex must:

1. create a source registry;
2. create a licence registry;
3. verify source terms before connector implementation;
4. prefer APIs and bulk downloads;
5. keep one adapter per source;
6. preserve raw artefacts when allowed;
7. preserve source versions and dates;
8. map into canonical schemas;
9. create quality and lineage records;
10. create historical snapshots;
11. enforce provider display and retention rules;
12. never scrape protected sites;
13. never infer redistribution rights;
14. add connector and licence-policy tests;
15. document all required credentials.

---

# 60. Definition of done

The data-source strategy is complete when:

- ABS and ASGS connectors are defined;
- RBA connectors are defined;
- state-source strategy exists;
- geography versions are handled;
- schools, crime, planning, infrastructure, and hazard strategies exist;
- commercial-provider candidates are documented;
- provider contract questions are prepared;
- one primary property-data provider can be selected through evidence;
- listing access is licensed;
- source and licence registries exist;
- attribution is supported;
- data freshness is visible;
- source conflicts are preserved;
- raw, canonical, and curated layers are separated;
- personal data is minimised;
- monitoring and contract-expiry alerts exist;
- no production source relies on unauthorised scraping.

---

# 61. Final source principle

For every TrackMyProps data point, the platform must be able to answer:

```text
Who published it?
How was it accessed?
What licence applies?
When was it observed and published?
How fresh is it?
How reliable is it?
May it be stored, displayed, exported, and used by AI?
Which pipeline transformed it?
Can the original source be traced?
```

If these questions cannot be answered, the data is not ready for production.
