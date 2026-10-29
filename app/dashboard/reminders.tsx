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
  const result = (await r.json()) as { error?: string; alerts: Alert[] };
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
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(false);
  const [filter, setFilter] = useState('due');
  const active = properties.filter((p) => p.status === 'active');
  const refresh = useCallback(async () => {
    try {
      const result = await request('/api/v1/reminders');
      setAlerts(result.alerts);
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
          disabled={!active.length || busy}
          onClick={() => setForm(!form)}
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
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setBusy(true);
            setError('');
            try {
              await request('/api/v1/reminders', 'POST', {
                property_id: fd.get('property_id'),
                kind: fd.get('kind'),
                title: fd.get('title'),
                due_date: fd.get('due_date'),
                notice_days: Number(fd.get('notice_days')),
              });
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
            <select name="property_id" required>
              {active.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Event
            <select name="kind">
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
              required
              maxLength={150}
              placeholder="e.g. Review landlord insurance"
            />
          </label>
          <label>
            Due date
            <input type="date" name="due_date" required />
          </label>
          <label>
            Show alert before
            <select name="notice_days" defaultValue="30">
              {[7, 30, 60, 90].map((n) => (
                <option key={n} value={n}>
                  {n} days
                </option>
              ))}
            </select>
          </label>
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
                <button className="reminder-property" onClick={() => onOpen(a.property_id)}>
                  {a.property_name}
                </button>
                <small>
                  Due {dateLabel(a.due_date)}
                  {a.state === 'overdue' ? ` · ${-a.days} days overdue` : ''}
                  {a.snoozed_until && a.state === 'snoozed'
                    ? ` · Returns ${dateLabel(a.snoozed_until)}`
                    : ''}
                  {a.automatic ? ' · From tenancy' : ''}
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
