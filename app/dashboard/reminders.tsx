'use client';
import { useEffect, useState, useCallback } from 'react';
import { Bell, Plus, Check, Clock, X } from 'lucide-react';
import type { Property } from '../../lib/domain';
import type { Alert } from '../../lib/reminders-domain';
async function request(path: string, method = 'GET', data?: unknown) {
  const r = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: data === undefined ? undefined : JSON.stringify(data),
    cache: 'no-store',
  });
  const result = (await r.json()) as {
    error?: string;
    alerts: Alert[];
    documents: { id: string; name: string }[];
  };
  if (!r.ok) throw new Error(result.error || 'Unable to update reminders.');
  return result;
}
const labels = {
  overdue: 'Overdue',
  today: 'Due today',
  upcoming: 'Upcoming',
  later: 'Scheduled',
  snoozed: 'Snoozed',
  completed: 'Completed',
  paused: 'Paused',
};
function dateLabel(day: string) {
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(day + 'T00:00:00Z'));
}
export default function Reminders({
  properties,
  onOpen,
}: {
  properties: Property[];
  onOpen: (id: string) => void;
}) {
  const [documents, setDocuments] = useState<{ id: string; name: string }[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Alert | null>(null);
  const [form, setForm] = useState(false);
  const [filter, setFilter] = useState('due');
  const active = properties.filter((p) => p.status === 'active');
  const refresh = useCallback(async () => {
    try {
      const result = await request('/api/v1/reminders');
      setAlerts(result.alerts);
      setDocuments(result.documents ?? []);
      setError('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh, properties]);
  useEffect(() => {
    const update = () => {
      if (!document.hidden) void refresh();
    };
    const timer = setInterval(update, 60000);
    document.addEventListener('visibilitychange', update);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', update);
    };
  }, [refresh]);
  async function action(alert: Alert, action: string) {
    if (action === 'delete' && !window.confirm(`Delete “${alert.title}”?`)) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await request(
        `/api/v1/reminders/${encodeURIComponent(alert.id)}`,
        action === 'delete' ? 'DELETE' : 'PATCH',
        action === 'delete' ? undefined : { action },
      );
      await refresh();
      setNotice(
        action === 'snooze'
          ? 'Reminder snoozed for 7 days.'
          : action === 'complete'
            ? 'Reminder completed.'
            : action === 'reopen'
              ? 'Reminder reopened.'
              : action === 'pause'
                ? 'Repeating reminder paused.'
                : action === 'resume'
                  ? 'Repeating reminder resumed.'
                  : 'Reminder deleted.',
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const due = alerts.filter((a) => ['overdue', 'today', 'upcoming'].includes(a.state));
  const shown = alerts.filter((a) =>
    filter === 'due' ? due.includes(a) : filter === 'completed' ? a.completed : !a.completed,
  );
  return (
    <section className="panel reminders-panel" aria-labelledby="reminders-title">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">STAY A STEP AHEAD</span>
          <h2 id="reminders-title">
            <Bell size={20} /> Property reminders <small>{due.length}</small>
          </h2>
        </div>
        <button
          className="button secondary"
          disabled={busy}
          onClick={() => {
            setEditing(null);
            setForm(!form);
          }}
        >
          <Plus size={16} /> Add reminder
        </button>
      </div>
      <p className="reminders-intro">
        Lease expiry alerts appear automatically 60 days before the lease ends. Add your own dates
        for other events. Dashboard alerts only · Sydney time.
      </p>
      {error && (
        <div className="alert error" role="alert">
          {error}
          <button onClick={() => void refresh()}>Retry</button>
        </div>
      )}
      {notice && <p role="status">{notice}</p>}
      {form && (
        <form
          className="reminder-form"
          key={editing?.id ?? 'new'}
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setBusy(true);
            setError('');
            try {
              const input = {
                property_id: editing ? editing.property_id : fd.get('property_id') || null,
                kind: fd.get('kind'),
                title: fd.get('title'),
                due_date: fd.get('due_date'),
                notice_days: Number(fd.get('notice_days')),
                repeat: fd.get('repeat'),
                amount: fd.get('amount') || null,
                notes: fd.get('notes'),
                document_id: fd.get('document_id') || null,
                end_date: fd.get('end_date') || null,
                repeat_count: fd.get('repeat_count') ? Number(fd.get('repeat_count')) : null,
              };
              await request(
                editing
                  ? `/api/v1/reminders/${encodeURIComponent(editing.id)}`
                  : '/api/v1/reminders',
                editing ? 'PATCH' : 'POST',
                editing ? { action: 'edit', scope: fd.get('scope') || 'one', data: input } : input,
              );
              await refresh();
              setForm(false);
              setNotice('Reminder added.');
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            Property
            <select
              name="property_id"
              defaultValue={editing?.property_id ?? ''}
              disabled={!!editing}
            >
              <option value="">Portfolio-wide</option>
              {active.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Event
            <select name="kind" defaultValue={editing?.kind ?? 'bill'}>
              <option value="bill">Bill / payment</option>
              <option value="maintenance">Maintenance</option>
              <option value="rent_review">Rent review</option>
              <option value="inspection">Inspection</option>
              <option value="insurance">Insurance renewal</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="reminder-title-input">
            Reminder title
            <input
              name="title"
              defaultValue={editing?.title}
              required
              maxLength={150}
              placeholder="e.g. Review landlord insurance"
            />
          </label>
          <label>
            Due date
            <input type="date" name="due_date" defaultValue={editing?.due_date} required />
          </label>
          <label>
            Show alert how many days before (0 = due date)
            <input
              type="number"
              name="notice_days"
              min="0"
              max="365"
              required
              defaultValue={editing?.notice_days ?? 7}
            />
          </label>
          <label>
            Repeat
            <select name="repeat" defaultValue={editing?.repeat ?? 'once'}>
              {[
                'once',
                'weekly',
                'fortnightly',
                'monthly',
                'quarterly',
                'six_monthly',
                'yearly',
              ].map((v) => (
                <option key={v} value={v}>
                  {v.replace('_', ' ')}
                </option>
              ))}
            </select>
          </label>
          <label>
            Amount (AUD, optional)
            <input
              name="amount"
              inputMode="decimal"
              pattern="[0-9]+(\.[0-9]{1,2})?"
              defaultValue={editing?.amount ?? ''}
            />
          </label>
          <label>
            End on (optional)
            <input name="end_date" type="date" defaultValue={editing?.end_date ?? ''} />
          </label>
          <label>
            Maximum occurrences (optional)
            <input
              name="repeat_count"
              type="number"
              min="1"
              max="1000"
              defaultValue={editing?.repeat_count ?? ''}
            />
          </label>
          <label className="reminder-title-input">
            Notes (optional)
            <textarea name="notes" maxLength={2000} defaultValue={editing?.notes ?? ''} />
          </label>
          <label>
            Link uploaded document (optional)
            <select name="document_id" defaultValue={editing?.document_id ?? ''}>
              <option value="">None</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
          {editing?.series_id && (
            <label>
              Apply changes to
              <select name="scope">
                <option value="one">This occurrence only</option>
                <option value="future">This and future occurrences</option>
              </select>
            </label>
          )}
          <div className="reminder-actions">
            <button className="button" disabled={busy}>
              Save reminder
            </button>
            <button
              type="button"
              className="button secondary"
              disabled={busy}
              onClick={() => setForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      <div className="reminder-filters" role="group" aria-label="Reminder filter">
        {[
          ['due', 'Needs attention'],
          ['all', 'All open'],
          ['completed', 'Completed'],
        ].map(([id, label]) => (
          <button key={id} aria-pressed={filter === id} onClick={() => setFilter(id)}>
            {label}
          </button>
        ))}
      </div>
      {loading ? (
        <p>Loading reminders…</p>
      ) : !shown.length ? (
        <div className="reminder-empty">
          <Check size={22} />
          <b>{filter === 'due' ? 'Nothing needs your attention.' : 'No reminders here yet.'}</b>
          <p>
            {!active.length
              ? 'Add a property to start tracking important dates.'
              : 'Add lease dates under a property’s Tenants tab, or create a reminder above.'}
          </p>
        </div>
      ) : (
        <ul className="reminder-list">
          {shown.map((a) => (
            <li key={a.id}>
              <div className="reminder-copy">
                <span className={`reminder-badge ${a.state}`}>{labels[a.state]}</span>
                <b>{a.title}</b>
                <button
                  className="reminder-property"
                  onClick={() => a.property_id && onOpen(a.property_id)}
                >
                  {a.property_name}
                </button>
                <small>
                  Due {dateLabel(a.due_date)}
                  {a.state === 'overdue' ? ` · ${-a.days} days overdue` : ''}
                  {a.snoozed_until && a.state === 'snoozed'
                    ? ` · Returns ${dateLabel(a.snoozed_until)}`
                    : ''}
                  {a.automatic ? ' · From tenancy' : ''}
                  {a.series_id ? ` · ${a.repeat?.replace('_', ' ')}` : ''}
                  {a.amount ? ` · AUD $${a.amount}` : ''}
                  {a.document_id && (
                    <a href={`/api/v1/files/${a.document_id}`}>Download linked document</a>
                  )}
                  {a.notes && (
                    <span style={{ display: 'block', whiteSpace: 'pre-wrap' }}>{a.notes}</span>
                  )}
                </small>
              </div>
              <div className="reminder-actions">
                {a.completed ? (
                  <button disabled={busy} onClick={() => void action(a, 'reopen')}>
                    Reopen
                  </button>
                ) : (
                  <>
                    <button disabled={busy} onClick={() => void action(a, 'complete')}>
                      <Check size={14} /> Complete
                    </button>
                    <button disabled={busy} onClick={() => void action(a, 'snooze')}>
                      <Clock size={14} /> Snooze 7 days
                    </button>
                  </>
                )}
                {!a.automatic && (
                  <button
                    disabled={busy}
                    onClick={() => {
                      setEditing(a);
                      setForm(true);
                    }}
                  >
                    Edit
                  </button>
                )}
                {a.series_id && (
                  <button
                    disabled={busy}
                    onClick={() => void action(a, a.paused ? 'resume' : 'pause')}
                  >
                    {a.paused ? 'Resume repeat' : 'Pause repeat'}
                  </button>
                )}
                {!a.automatic && !a.series_id && (
                  <button
                    disabled={busy}
                    aria-label={`Delete ${a.title}`}
                    onClick={() => void action(a, 'delete')}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
