# Dashboard reminders

Owner-only dashboard alerts, using Sydney calendar dates. No email, SMS, push notifications, external messaging or background schedule is created. Dates are re-evaluated on opening the overview, when returning to the tab and every minute while visible.

## Behaviour

- Active/upcoming tenants with a lease end date generate an automatic expiry alert 60 days before expiry. Dates further away appear under All open. Ended tenancies and archived properties are excluded.
- Lease alert identity includes tenant ID and lease end date. Changing that date creates a fresh alert; completion of the previous expiry does not suppress the new expiry. Removing the tenant removes its derived alert. Stored historical action states remain in owner export.
- Manual reminders have a property, category (rent review, inspection, insurance renewal or other), title, date and notice period (7/30/60/90 days). They are single events; users create the next renewal or inspection when known. No legal due dates or recurring dates are inferred.
- Needs attention includes uncompleted, unsnoozed overdue/today/upcoming alerts within the notice period. All open also includes future and snoozed reminders. Completed alerts can be reopened.
- Seven-day snooze hides an alert until the Sydney date seven calendar days later. The underlying due date remains unchanged. Completing/reopening clears snooze. Manual reminders can be deleted with confirmation; automatic reminders are managed through tenancy dates/status or completion.
- Archive hides alerts; restoring the property restores the alerts with saved action states.

## Security and storage

`reminders` stores manual events and automatic lease action states in private D1. Every read/write uses trusted Sites owner identity; same-origin JSON mutations are required. Composite property/owner foreign key prevents cross-owner attachments. Lease action IDs are resolved against the authenticated owner's current derived list before saving. The API rejects injected ownership fields. Export includes all stored reminder records; derived lease dates also remain in tenant export.

## Validation

Five deterministic tests cover notice boundary, overdue/today, archived/ended records, snooze expiry, lease changes, timezone/calendar arithmetic and strict validation. Production Worker integration tests cover manual CRUD, automatic lease actions, owner isolation, origin checks, exports and archive/restore. Preview browser checks use temporary synthetic data, removed before packaging. No production records are created by tests.

## Cash flow comparison remains future work

The existing cash flow totals remain annualised entered items. Actual versus forecast would need separate expected schedules and dated received/paid transactions, monthly comparisons and explicit proration rules. This change does not label annualised entries as actual transactions or implement partial-year calculations.

## Recurring reminders extension

Manual reminders now support portfolio-wide scope, bills/maintenance, optional AUD amount, notes and an uploaded document link. Repeat choices: once, weekly, fortnightly, monthly, quarterly, six-monthly or yearly. Notice is 0–365 days before due. Optional end date and maximum count stop repeats at whichever occurs first. Monthly/yearly dates stay anchored to the original day, clamped to the target month's last day.

Occurrences are derived from an owner-scoped series and individually saved when acted on. Past unpaid occurrences remain visible alongside the next future occurrence. Completion is a task acknowledgement and never creates a financial transaction. Snoozing affects only the occurrence. Pause/resume applies to the series; edit supports one occurrence or splitting this-and-future into a new series atomically. Existing earlier occurrences retain their schedule. Portfolio reminders have a null property reference; property-scoped records retain composite ownership foreign keys. Document links require authenticated ownership and matching property, and private download authorization remains enforced. Deleted documents cannot be downloaded through old links.

Completion records remain exportable. Repetition is derived when the dashboard loads rather than by a background scheduler. Email has not been enabled; future email delivery will require opt-in settings and an idempotent delivery ledger. The UI currently presents one upcoming occurrence per series together with all missed occurrences (bounded at 5,000 derivations per series).
