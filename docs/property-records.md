# Private property photos, documents and tenant records

Implemented 29 October 2026 for the existing owner-only Sites web application. This extends the accepted property-management slice and supersedes earlier file/tenant deferrals.

## User journey

Open a property from My properties or Overview. The property workspace contains Photos, Documents and Tenants tabs. Save a property before attaching files or tenant records.

- Photos: JPG/JPEG, PNG and WebP; Originals up to 20 MiB, with a crop preview before upload. New photos are saved as JPEGs no larger than 800,000 bytes (800 KB), 10 per property. Multiple selection processes one crop at a time, with zoom/position controls, 4:3, 16:9, square and original proportions. Output has a maximum edge of 2048 pixels without upscaling. JPEG quality is selected to fit the limit, with additional downscaling when needed; small results are not padded to 700–800 KB. Uploads are sequential with status and partial-failure messages. Existing stored photos are not retroactively modified. The latest photo is shown on the property card. Photos can be opened or downloaded; confirmed removal deletes stored bytes and metadata.
- Documents: PDF, DOCX, XLSX, TXT and CSV; 10 MiB per file, 20 per property. Metadata shows name, type, size and upload date. Documents are downloaded as attachments rather than executed or rendered inline. TXT/CSV must be UTF-8. Older DOC/XLS and HEIC photos are not supported.
- Tenants: full name required; optional email, phone, lease start/end dates, rent amount/frequency, bond amount and notes. Status is active/upcoming/ended and is explicitly owner-selected, not automatically changed by date. Records can be edited and permanently removed after confirmation. Unsaved tenant changes prompt before changing tabs or closing the property workspace.
- Tenant rent is informational. It does not create or alter income entries, preventing duplicate counting. No messages, invitations, screening decisions or tenant access are introduced.

## API and persistence

D1 tables `property_files` and `tenants` use composite `(property_id, owner_id)` foreign keys to the existing property ownership key. A new immutable migration adds these tables; the earlier migration is unchanged. Files use a private R2 bucket bound as `BUCKET`.

| Route                                                 | Purpose                                                    |
| ----------------------------------------------------- | ---------------------------------------------------------- |
| GET `/api/v1/properties/:id/resources`                | Owner-only file metadata and tenant details                |
| POST `/api/v1/properties/:id/files?kind=photo         | document`                                                  | Bounded binary upload with an encoded `X-File-Name` header |
| GET `/api/v1/files/:id`                               | Owner-only image rendering or document attachment download |
| GET `/api/v1/files/:id?download=1`                    | Force attachment download                                  |
| DELETE `/api/v1/files/:id`                            | Remove object and metadata                                 |
| POST `/api/v1/properties/:id/tenants`                 | Create tenant                                              |
| PUT/DELETE `/api/v1/properties/:id/tenants/:tenantId` | Edit/remove the matching owner-scoped tenant               |

Every route authenticates with Sites identity. All reads/writes derive owner ID on the server; metadata never returns private object keys. Mutations require same-origin requests. Uploads require `application/octet-stream`; bodies are read with a byte limit before storage. Allowed extension and basic signature must agree. File names are bounded, stripped of control characters and path prefixes, and safely encoded in download headers. SVG, HTML, executables, empty and oversized uploads are rejected. Downloads use private/no-store caching and nosniff; documents force attachment delivery. The composite foreign key provides a second barrier against cross-owner child attachment.

File creation writes private bytes before metadata and attempts cleanup if metadata insertion fails. Removal is retryable: remove the object first, then its owner-scoped metadata. D1/R2 do not provide a single cross-service transaction. Per-property count checks are application-level limits; simultaneous uploads from multiple sessions can temporarily exceed them. The UI uploads sequentially.

## Export, privacy and limitations

The owner export includes tenant records and file metadata; binary attachments must be downloaded separately. Other users and anonymous requests cannot access either files or tenant data. Existing cloud data is not migrated or modified.

No antivirus service, OCR, content extraction, document verification, tenant invitations, rent collection, tenancy compliance interpretation, date-driven reminders or automated screening is included. Office/PDF checks validate basic signatures, not document safety or semantic validity. Upload only trusted files. No identity documents, birthdays or government identifier fields are requested by the tenant form.

A future verified account-deletion workflow must remove every owner's R2 object, file row and tenant record alongside existing portfolio records. Do not claim account deletion is complete before that end-to-end workflow is implemented.

## Photo optimisation validation

Browser test: a 14,575,447-byte synthetic PNG was cropped to square and compressed to a 793,896-byte JPEG before any upload. Geometry tests cover aspect ratio, edge positioning, zoom bounds and no upscaling. The private upload API now rejects 800,001-byte photos and accepts 800,000-byte photos. Source files and temporary visual QA routes are not published.

## Verification

TypeScript and production build; 16 unit tests for calculations and input/file validation; 77 production-Worker integration assertions covering ownership, upload/download bytes, type/size limits, cross-account denial, file removal, tenant create/edit/remove, foreign keys, cover-photo references and exports. Browser layout/interaction checks use a temporary synthetic-only fixture; that route and fixture prop are removed before final packaging.
