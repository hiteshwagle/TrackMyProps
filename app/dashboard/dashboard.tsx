'use client';
import { useEffect, useState, useRef, type ReactNode } from 'react';
import {
  LayoutDashboard,
  Building2,
  ChartNoAxesCombined,
  Settings2,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRight,
  LogOut,
  Search,
  X,
  Wallet,
  Download,
  ChevronRight,
  Archive,
  RotateCcw,
  Pencil,
  Trash2,
  ShieldCheck,
  LoaderCircle,
  AlertCircle,
  Check,
  Home,
  CalendarDays,
} from 'lucide-react';
import { Brand, HouseArt } from '../visuals';
import PropertyResources from './property-resources';
import Reminders from './reminders';
import type { Property, PropertyInput, CashFlowItem, Summary } from '../../lib/domain';
type Portfolio = { properties: Property[]; items: CashFlowItem[]; summary: Summary };
type View = 'dashboard' | 'properties' | 'analytics' | 'settings';
const types = [
  ['house', 'House'],
  ['apartment_unit', 'Apartment / unit'],
  ['townhouse', 'Townhouse'],
  ['villa', 'Villa'],
  ['land', 'Land'],
  ['commercial', 'Commercial'],
  ['other', 'Other'],
];
const frequencies = ['weekly', 'fortnightly', 'monthly', 'quarterly', 'annually'];
function aud(v: string | null, compact = false) {
  if (v === null) return '—';
  const [whole, fraction = '00'] = v.split('.');
  const formatted = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${whole.startsWith('-') ? '−' : ''}$${formatted.replace('-', '')}${compact && fraction === '00' ? '' : '.' + fraction.padEnd(2, '0')}`;
}
function today() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Australia/Sydney',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}
async function request<T = unknown>(path: string, method = 'GET', data?: unknown) {
  const response = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: data === undefined ? undefined : JSON.stringify(data),
    cache: 'no-store',
  });
  const result = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(result.error || 'Unable to complete this request.');
  return result as T;
}
export default function Dashboard({
  user,
  signOutHref,
}: {
  user: { name: string; email: string };
  signOutHref: string;
}) {
  const [view, setView] = useState<View>('dashboard');
  const [data, setData] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'active' | 'archived'>('active');
  const [year, setYear] = useState(Number(today().slice(0, 4)));
  const [monthly, setMonthly] = useState(false);
  const [edit, setEdit] = useState<Property | 'new' | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [resourcesDirty, setResourcesDirty] = useState(false);
  useEffect(() => setResourcesDirty(false), [selected]);
  const [itemType, setItemType] = useState<'income' | 'expense' | null>(null);
  const [busy, setBusy] = useState(false);
  async function refresh() {
    setError('');
    try {
      setData(await request<Portfolio>(`/api/v1/portfolio?year=${year}`));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void refresh();
  }, [year]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 5000);
    return () => clearTimeout(t);
  }, [notice]);
  const s = data?.summary;
  const property = data?.properties.find((p) => p.id === selected);
  const visible = (data?.properties || []).filter(
    (p) =>
      p.status === status &&
      `${p.display_name} ${p.suburb} ${p.state} ${p.address_line_1}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  async function changeStatus(p: Property) {
    if (
      !window.confirm(
        p.status === 'active'
          ? 'Archive this property? It will be excluded from current portfolio totals.'
          : 'Restore this property to your active portfolio?',
      )
    )
      return;
    setBusy(true);
    setError('');
    try {
      await request(`/api/v1/properties/${p.id}`, 'PATCH', {
        status: p.status === 'active' ? 'archived' : 'active',
      });
      await refresh();
      setNotice(p.status === 'active' ? 'Property archived.' : 'Property restored.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function deleteItem(item: CashFlowItem) {
    if (!window.confirm(`Remove “${item.name}”? This entry will be deleted.`)) return;
    setBusy(true);
    try {
      await request(`/api/v1/cash-flow/${item.id}`, 'DELETE');
      await refresh();
      setNotice('Entry removed.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <a href="/dashboard" className="brand-link">
          <Brand />
        </a>
        <div className="workspace-label">YOUR WORKSPACE</div>
        <nav aria-label="Portfolio navigation">
          {[
            { id: 'dashboard', name: 'Overview', icon: LayoutDashboard },
            { id: 'properties', name: 'My properties', icon: Building2 },
            { id: 'analytics', name: 'Analytics', icon: ChartNoAxesCombined },
            { id: 'settings', name: 'Settings', icon: Settings2 },
          ].map((n) => (
            <button
              key={n.id}
              className={view === n.id ? 'active' : ''}
              onClick={() => setView(n.id as View)}
              aria-current={view === n.id ? 'page' : undefined}
            >
              <n.icon size={19} />
              <span>{n.name}</span>
              {n.id === 'properties' && data ? (
                <small>{data.properties.filter((p) => p.status === 'active').length}</small>
              ) : null}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="small-icon">
            <ShieldCheck size={20} />
          </span>
          <b>Your space. Your portfolio.</b>
          <p>Private records, connected to your ChatGPT account.</p>
        </div>
        <div className="sidebar-profile">
          <span className="user-avatar">{user.name.slice(0, 1).toUpperCase()}</span>
          <div>
            <b>{user.name}</b>
            <small>Personal portfolio</small>
          </div>
          <a href={signOutHref} target="_top" title="Sign out" aria-label="Sign out">
            <LogOut size={17} />
          </a>
        </div>
      </aside>
      <div className="app-content">
        <header className="app-topbar">
          <span>
            My workspace <ChevronRight size={13} />
            <b>
              {view === 'dashboard'
                ? 'Overview'
                : view === 'properties'
                  ? 'My properties'
                  : view === 'analytics'
                    ? 'Analytics'
                    : 'Settings'}
            </b>
          </span>
          <div className="app-topbar-right">
            <span className="live-label">
              <span className="green-dot" /> Private portfolio
            </span>
            <span className="user-avatar small">{user.name.slice(0, 1).toUpperCase()}</span>
          </div>
        </header>
        <main className="workspace-main">
          <div className="workspace-title">
            <div>
              <span className="eyebrow">
                {view === 'dashboard'
                  ? 'A LITTLE CLARITY, EVERY DAY.'
                  : view === 'properties'
                    ? 'EVERY DETAIL IN ITS PLACE.'
                    : view === 'analytics'
                      ? 'YOUR NUMBERS, IN PERSPECTIVE.'
                      : 'MAKE YOURSELF AT HOME.'}
              </span>
              <h1>
                {view === 'dashboard'
                  ? `Your portfolio, ${user.name.split(' ')[0]}.`
                  : view === 'properties'
                    ? 'A home for every property.'
                    : view === 'analytics'
                      ? 'See the bigger picture.'
                      : 'Your workspace settings.'}
              </h1>
              <p>
                {view === 'dashboard'
                  ? 'A considered view of where your properties stand.'
                  : view === 'properties'
                    ? 'The details, the numbers and the bigger picture — together.'
                    : view === 'analytics'
                      ? 'Understand your portfolio using the information you’ve entered.'
                      : 'Your account and your data, in one place.'}
              </p>
            </div>
            {view !== 'settings' && (
              <button className="button" onClick={() => setEdit('new')}>
                <Plus size={17} /> Add property
              </button>
            )}
          </div>
          {error && (
            <div role="alert" className="alert error">
              <AlertCircle size={18} />
              <span>{error}</span>
              <button onClick={() => void refresh()}>Try again</button>
            </div>
          )}
          {notice && (
            <div role="status" className="alert success">
              <Check size={17} />
              {notice}
            </div>
          )}
          {loading ? (
            <div className="loading-state">
              <LoaderCircle className="spin" /> Bringing your portfolio into view…
            </div>
          ) : null}
          {!loading && data && (
            <>
              {view === 'dashboard' && (
                <Reminders properties={data.properties} onOpen={setSelected} />
              )}
              {(view === 'dashboard' || view === 'analytics') && (
                <>
                  <div className="metrics-grid">
                    <Metric
                      label="Portfolio value"
                      value={aud(s!.assets, true)}
                      sub={
                        s!.missing_values
                          ? `${s!.missing_values} missing value(s) · Incomplete`
                          : 'User-entered current values'
                      }
                      icon={<Building2 size={18} />}
                    />
                    <Metric
                      label="Outstanding debt"
                      value={aud(s!.debt, true)}
                      sub={
                        s!.missing_loans
                          ? `${s!.missing_loans} missing loan balance(s) · Incomplete`
                          : 'Entered remaining loan balances'
                      }
                      icon={<Wallet size={18} />}
                    />
                    <Metric
                      label="Total equity"
                      value={aud(s!.equity, true)}
                      sub={
                        s!.missing_equity
                          ? `${s!.missing_equity} incomplete property record(s)`
                          : 'Known property values minus debt'
                      }
                      icon={<ChartNoAxesCombined size={18} />}
                      accent
                    />
                    <Metric
                      label="Active properties"
                      value={String(s!.property_count).padStart(2, '0')}
                      sub={`${data.properties.filter((p) => p.status === 'archived').length} archived · excluded from totals`}
                      icon={<Home size={18} />}
                    />
                  </div>
                  <div className="dashboard-panels">
                    <section className="panel cash-panel">
                      <div className="panel-heading">
                        <div>
                          <span className="eyebrow">FOLLOW THE MONEY</span>
                          <h2>Your entered cash flow</h2>
                        </div>
                        <label className="year-select">
                          Calendar year
                          <select
                            aria-label="Calendar year"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                          >
                            {Array.from(
                              { length: 10 },
                              (_, i) => Number(today().slice(0, 4)) + 1 - i,
                            ).map((y) => (
                              <option key={y}>{y}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <div className="cash-summary">
                        <div>
                          <span>{monthly ? 'Monthly average' : 'Annualised net'}</span>
                          <strong>{aud(monthly ? s!.monthly_net : s!.net)}</strong>
                        </div>
                        <div className="segmented">
                          <button
                            className={!monthly ? 'selected' : ''}
                            onClick={() => setMonthly(false)}
                          >
                            Annual
                          </button>
                          <button
                            className={monthly ? 'selected' : ''}
                            onClick={() => setMonthly(true)}
                          >
                            Monthly avg.
                          </button>
                        </div>
                      </div>
                      <div className="cash-row">
                        <span>
                          <i className="income-icon">
                            <ArrowDownLeft size={16} />
                          </i>
                          Annualised income
                        </span>
                        <b>{aud(s!.income)}</b>
                      </div>
                      <div className="cash-row">
                        <span>
                          <i className="expense-icon">
                            <ArrowUpRight size={16} />
                          </i>
                          Annualised expenses
                        </span>
                        <b>{aud(s!.expenses)}</b>
                      </div>
                      <div className="panel-footnote">
                        Based on entered items. Loan repayments and other costs are included only if
                        you add them as expenses. Not actual transaction history.
                      </div>
                    </section>
                    <section className="panel portfolio-composition">
                      <div className="panel-heading">
                        <div>
                          <span className="eyebrow">A BALANCED PERSPECTIVE</span>
                          <h2>Your equity position</h2>
                        </div>
                        <span className="icon-muted">
                          <ChartNoAxesCombined size={20} />
                        </span>
                      </div>
                      {s!.assets &&
                      s!.debt &&
                      BigInt(s!.assets.replace('.', '')) > 0n &&
                      BigInt(s!.debt.replace('.', '')) <= BigInt(s!.assets.replace('.', '')) ? (
                        <>
                          <div className="position-visual">
                            <div
                              className="position-ring"
                              style={{
                                background: `conic-gradient(#315d47 0% ${Number((BigInt(s!.debt.replace('.', '')) * 10000n) / BigInt(s!.assets.replace('.', ''))) / 100}%, #d9e5a1 0% 100%)`,
                              }}
                            >
                              <div>
                                <small>Known equity</small>
                                <strong>{aud(s!.equity, true)}</strong>
                                <span>
                                  {s!.missing_equity
                                    ? 'Incomplete portfolio'
                                    : 'AUD · entered values'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="position-legend">
                            <span>
                              <i /> Debt
                            </span>
                            <b>{aud(s!.debt, true)}</b>
                            <span>
                              <i /> Equity
                            </span>
                            <b>{aud(s!.equity, true)}</b>
                          </div>
                        </>
                      ) : (
                        <div className="composition-empty">
                          <div className="empty-ring">
                            <Building2 size={28} />
                          </div>
                          <p>
                            {s!.property_count
                              ? 'Add complete current values and loan balances to view the breakdown.'
                              : 'Your bigger picture starts with one property.'}
                          </p>
                        </div>
                      )}
                    </section>
                  </div>
                </>
              )}
              {view === 'dashboard' && (
                <section className="dashboard-property-section">
                  <div className="list-section-heading">
                    <div>
                      <h2>
                        Your properties{' '}
                        <span className="count-pill">
                          {data.properties.filter((p) => p.status === 'active').length}
                        </span>
                      </h2>
                      <p>A place for every part of your portfolio.</p>
                    </div>
                    <button
                      className="text-link"
                      onClick={() => {
                        setView('properties');
                        setStatus('active');
                      }}
                    >
                      View all properties <ArrowRight size={16} />
                    </button>
                  </div>
                  {data.properties.some((p) => p.status === 'active') ? (
                    <div className="property-grid">
                      {data.properties
                        .filter((p) => p.status === 'active')
                        .slice(0, 3)
                        .map((p, i) => (
                          <PropertyCard
                            key={p.id}
                            property={p}
                            index={i}
                            onOpen={() => setSelected(p.id)}
                          />
                        ))}
                    </div>
                  ) : (
                    <EmptyPortfolio onAdd={() => setEdit('new')} />
                  )}
                </section>
              )}
              {view === 'properties' && (
                <>
                  <div className="property-toolbar">
                    <div className="segmented">
                      <button
                        className={status === 'active' ? 'selected' : ''}
                        onClick={() => setStatus('active')}
                      >
                        Active
                      </button>
                      <button
                        className={status === 'archived' ? 'selected' : ''}
                        onClick={() => setStatus('archived')}
                      >
                        Archived
                      </button>
                    </div>
                    <label className="search-field">
                      <Search size={17} />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search your properties"
                        aria-label="Search your properties"
                      />
                    </label>
                  </div>
                  {visible.length ? (
                    <div className="property-grid">
                      {visible.map((p, i) => (
                        <PropertyCard
                          key={p.id}
                          property={p}
                          index={i}
                          onOpen={() => setSelected(p.id)}
                        />
                      ))}
                    </div>
                  ) : status === 'active' && !search ? (
                    <EmptyPortfolio onAdd={() => setEdit('new')} />
                  ) : (
                    <div className="empty-results">
                      <Search />
                      <h3>No properties found</h3>
                      <p>
                        {search
                          ? 'Try another name, address or suburb.'
                          : 'Your archived properties will appear here.'}
                      </p>
                    </div>
                  )}
                </>
              )}
              {view === 'analytics' && (
                <>
                  <section className="panel analytics-table">
                    <div className="panel-heading">
                      <div>
                        <h2>Property by property</h2>
                        <p>Annualised income and expenses · Calendar year {year} · AUD</p>
                      </div>
                      <a
                        href="/api/v1/export"
                        className="button button-outline button-small"
                        download
                      >
                        <Download size={15} /> Export
                      </a>
                    </div>
                    <div className="table-scroll">
                      <table>
                        <thead>
                          <tr>
                            <th>Property</th>
                            <th>Current value</th>
                            <th>Loan balance</th>
                            <th>Income</th>
                            <th>Expenses</th>
                            <th>Net</th>
                          </tr>
                        </thead>
                        <tbody>
                          {s!.breakdown.map((p) => (
                            <tr key={p.id}>
                              <td>
                                <button onClick={() => setSelected(p.id)}>
                                  {p.name}
                                  <ArrowUpRight size={13} />
                                </button>
                              </td>
                              <td>{aud(p.value, true)}</td>
                              <td>{aud(p.debt, true)}</td>
                              <td>{aud(p.income)}</td>
                              <td>{aud(p.expenses)}</td>
                              <td>{aud(p.net)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {!s!.breakdown.length && (
                        <p className="table-empty">
                          Add your first property to start building your picture.
                        </p>
                      )}
                    </div>
                  </section>
                  <section className="calculation-note">
                    <ShieldCheck size={19} />
                    <div>
                      <h3>Clarity includes the assumptions.</h3>
                      <ul>
                        {s!.assumptions.map((a) => (
                          <li key={a}>{a}</li>
                        ))}
                      </ul>
                      <small>
                        Calculation version {s!.calculation_version}. Values are owner-entered; no
                        automated valuation or tax calculation.
                      </small>
                    </div>
                  </section>
                </>
              )}
              {view === 'settings' && (
                <div className="settings-panels">
                  <section className="panel settings-panel">
                    <h2>Your account</h2>
                    <p>Sign-in is managed by your ChatGPT account.</p>
                    <dl>
                      <div>
                        <dt>Name</dt>
                        <dd>{user.name}</dd>
                      </div>
                      <div>
                        <dt>Email</dt>
                        <dd>{user.email}</dd>
                      </div>
                      <div>
                        <dt>Portfolio access</dt>
                        <dd>Private · only your signed-in account</dd>
                      </div>
                      <div>
                        <dt>Defaults</dt>
                        <dd>Australia · AUD · square metres · Sydney time</dd>
                      </div>
                    </dl>
                    <a href={signOutHref} target="_top" className="button button-outline">
                      <LogOut size={16} /> Sign out
                    </a>
                  </section>
                  <section className="panel settings-panel">
                    <h2>Your portfolio data</h2>
                    <p>
                      Download the properties and income/expense entries stored in this workspace.
                    </p>
                    <a href="/api/v1/export" className="button button-outline" download>
                      <Download size={16} /> Export portfolio JSON
                    </a>
                    <div className="settings-info">
                      <ShieldCheck size={18} />
                      <span>
                        This is a new workspace. Historical Firebase or Supabase records have not
                        been imported. No external property-data providers are connected.
                      </span>
                    </div>
                  </section>
                </div>
              )}
            </>
          )}
          <footer className="workspace-footer">
            <span>
              <span className="green-dot" /> A clearer picture, one property at a time.
            </span>
            <span>TrackMyProps · AUD</span>
          </footer>
        </main>
      </div>
      {edit && (
        <PropertyForm
          property={edit === 'new' ? null : edit}
          onClose={() => setEdit(null)}
          onSaved={async (propertyId) => {
            setEdit(null);
            await refresh();
            setSelected(propertyId);
            setNotice('Property saved. Add photos, documents or tenant details in its workspace.');
          }}
        />
      )}
      {property && !edit && !itemType && (
        <Modal
          title={property.display_name}
          subtitle={`${property.address_line_1}, ${property.suburb} ${property.state} ${property.postcode}`}
          onClose={() => {
            if (!resourcesDirty || window.confirm('Discard your unsaved property changes?'))
              setSelected(null);
          }}
        >
          <div className="property-workspace">
            <div className="workspace-property-header">
              <span className={`status-chip ${property.status}`}>{property.status}</span>
              <button
                className="button button-outline button-small"
                onClick={() => {
                  if (!resourcesDirty || window.confirm('Discard your unsaved property changes?')) {
                    setResourcesDirty(false);
                    setEdit(property);
                  }
                }}
              >
                <Pencil size={14} /> Edit property
              </button>
              <button
                className="icon-button"
                disabled={busy}
                onClick={() => void changeStatus(property)}
                title={property.status === 'active' ? 'Archive property' : 'Restore property'}
              >
                {property.status === 'active' ? <Archive size={18} /> : <RotateCcw size={18} />}
              </button>
            </div>
            <div className="detail-stats">
              <div>
                <span>Current value</span>
                <b>{aud(property.current_value)}</b>
                <small>{property.current_value_as_of || 'Not recorded'}</small>
              </div>
              <div>
                <span>Remaining loan</span>
                <b>{aud(property.has_loan === false ? '0.00' : property.remaining_loan_balance)}</b>
                <small>
                  {property.has_loan === false
                    ? 'No loan'
                    : property.loan_balance_as_of || 'Not recorded'}
                </small>
              </div>
              <div>
                <span>Purchase price</span>
                <b>{aud(property.purchase_price)}</b>
                <small>{property.purchase_date}</small>
              </div>
            </div>
            <div className="property-facts">
              <span>{property.bedrooms} beds</span>
              <span>{property.bathrooms} baths</span>
              <span>{property.car_spaces} cars</span>
              <span>{property.land_area_sqm} m² land</span>
              <span>{property.building_area_sqm} m² building</span>
            </div>
            {property.notes && <p className="property-notes">{property.notes}</p>}
            <PropertyResources
              propertyId={property.id}
              onPhotosChanged={refresh}
              onDirtyChange={setResourcesDirty}
            />
            {(['income', 'expense'] as const).map((type) => (
              <section className="item-section" key={type}>
                <div className="list-section-heading">
                  <h3>{type === 'income' ? 'Income' : 'Expenses'}</h3>
                  <button className="text-link" onClick={() => setItemType(type)}>
                    <Plus size={15} /> Add {type}
                  </button>
                </div>
                {data!.items
                  .filter((i) => i.property_id === property.id && i.type === type)
                  .map((i) => (
                    <div className="item-row" key={i.id}>
                      <span className={`ledger-icon ${type === 'income' ? 'green' : 'amber'}`}>
                        {type === 'income' ? (
                          <ArrowDownLeft size={17} />
                        ) : (
                          <ArrowUpRight size={17} />
                        )}
                      </span>
                      <div>
                        <b>{i.name}</b>
                        <small>
                          {i.frequency === 'one_off'
                            ? `One-off · ${i.occurrence_date}`
                            : `${i.frequency} · from ${i.start_date}${i.end_date ? ' to ' + i.end_date : ''}`}
                        </small>
                      </div>
                      <strong>{aud(i.amount)}</strong>
                      <button
                        className="icon-button"
                        aria-label={`Remove ${i.name}`}
                        disabled={busy}
                        onClick={() => void deleteItem(i)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                {!data!.items.some((i) => i.property_id === property.id && i.type === type) && (
                  <p className="empty-item">
                    No {type === 'income' ? 'income' : 'expense'} entries yet. Add an entry to build
                    your annualised picture.
                  </p>
                )}
              </section>
            ))}
            <p className="panel-footnote">
              Amounts remain as entered. Frequency-normalised totals appear in Analytics. Record
              loan repayments as expense entries if you want them included.
            </p>
          </div>
        </Modal>
      )}
      {property && itemType && (
        <ItemForm
          type={itemType}
          property={property}
          onClose={() => setItemType(null)}
          onSaved={async () => {
            setItemType(null);
            await refresh();
            setNotice('Entry saved.');
          }}
        />
      )}
    </div>
  );
}
function Metric({
  label,
  value,
  sub,
  icon,
  accent = false,
}: {
  label: string;
  value: string;
  sub: string;
  icon: ReactNode;
  accent?: boolean;
}) {
  return (
    <div className={`metric-card ${accent ? 'metric-accent' : ''}`}>
      <div>
        <span>{label}</span>
        <i>{icon}</i>
      </div>
      <strong>{value}</strong>
      <small>{sub}</small>
    </div>
  );
}
function EmptyPortfolio({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="empty-portfolio">
      <div className="empty-house">
        <HouseArt variant={1} />
      </div>
      <div>
        <span className="eyebrow">THIS IS WHERE IT ALL COMES TOGETHER</span>
        <h2>
          Your first property.
          <br />
          <em>Your first clearer picture.</em>
        </h2>
        <p>Add the details you know. Build the rest as you go.</p>
        <button className="button" onClick={onAdd}>
          <Plus size={16} /> Add your first property
        </button>
      </div>
    </div>
  );
}
function PropertyCard({
  property: p,
  index,
  onOpen,
}: {
  property: Property;
  index: number;
  onOpen: () => void;
}) {
  return (
    <button className="property-card" onClick={onOpen}>
      <div className="property-art">
        {p.photo_id ? (
          <img src={'/api/v1/files/' + p.photo_id} alt={p.display_name} loading="lazy" />
        ) : (
          <HouseArt variant={index % 3} />
        )}
        <span className="status-chip">
          {p.status === 'active' ? 'In your portfolio' : 'Archived'}
        </span>
      </div>
      <div className="property-card-body">
        <span className="property-location">
          {p.suburb}, {p.state}
        </span>
        <div>
          <h3>{p.display_name}</h3>
          <ArrowUpRight size={19} />
        </div>
        <p>{p.address_line_1}</p>
        <div className="property-card-facts">
          {p.bedrooms} beds <i /> {p.bathrooms} baths <i /> {p.land_area_sqm} m²
        </div>
        <div className="property-value">
          <span>Current value</span>
          <b>{aud(p.current_value, true)}</b>
        </div>
      </div>
    </button>
  );
}
function Modal({
  title,
  subtitle,
  children,
  onClose,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    const prior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prior;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-labelledby="modal-title"
    >
      <div className="modal-header">
        <div>
          <h2 id="modal-title">{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <button className="icon-button" onClick={onClose} aria-label="Close dialog">
          <X size={21} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
function useUnsaved(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);
}
function Field({
  label,
  name,
  required = false,
  type = 'text',
  value,
  min,
  step,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  value?: string | number | null;
  min?: string;
  step?: string;
  children?: ReactNode;
}) {
  return (
    <label className="form-field">
      <span>
        {label}
        {required && <i> *</i>}
      </span>
      {children || (
        <input
          name={name}
          type={type}
          defaultValue={value ?? ''}
          required={required}
          min={min}
          step={step}
          maxLength={type === 'text' ? 200 : undefined}
        />
      )}
    </label>
  );
}
function PropertyForm({
  property: p,
  onClose,
  onSaved,
}: {
  property: Property | null;
  onClose: () => void;
  onSaved: (propertyId: string) => Promise<void>;
}) {
  const [step, setStep] = useState(1);
  const [hasLoan, setHasLoan] = useState(
    p?.has_loan === true ? 'yes' : p?.has_loan === false ? 'no' : 'unknown',
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  useUnsaved(dirty);
  const ref = useRef<HTMLFormElement>(null);
  function close() {
    if (!dirty || window.confirm('Discard your unsaved property details?')) onClose();
  }
  function next() {
    setError('');
    const fields = ref.current?.querySelectorAll(
      ':scope > fieldset:first-of-type input, :scope > fieldset:first-of-type select',
    );
    if (
      fields &&
      Array.from(fields).every((node) =>
        (node as unknown as { reportValidity(): boolean }).reportValidity(),
      )
    )
      setStep(2);
  }
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step === 1) {
      next();
      return;
    }
    const visible = Array.from(
      e.currentTarget.querySelectorAll(
        'fieldset:not([hidden]) input, fieldset:not([hidden]) select',
      ),
    );
    if (
      !visible.every(
        (field) =>
          (field as unknown as { disabled: boolean }).disabled ||
          (field as unknown as { reportValidity(): boolean }).reportValidity(),
      )
    )
      return;
    setSaving(true);
    setError('');
    const f = new FormData(e.currentTarget);
    const str = (n: string) => String(f.get(n) || '').trim();
    const optional = (n: string) => str(n) || null;
    const number = (n: string) => Number(str(n));
    const loan = (n: string) => (hasLoan === 'yes' ? optional(n) : null);
    const input: PropertyInput = {
      display_name: str('display_name'),
      address_line_1: str('address_line_1'),
      address_line_2: str('address_line_2'),
      suburb: str('suburb'),
      state: str('state') as PropertyInput['state'],
      postcode: str('postcode'),
      property_type: str('property_type') as PropertyInput['property_type'],
      bedrooms: number('bedrooms'),
      bathrooms: number('bathrooms'),
      car_spaces: number('car_spaces'),
      land_area_sqm: number('land_area_sqm'),
      building_area_sqm: number('building_area_sqm'),
      purchase_date: str('purchase_date'),
      purchase_price: str('purchase_price'),
      current_value: optional('current_value'),
      current_value_as_of: optional('current_value_as_of'),
      has_loan: hasLoan === 'unknown' ? null : hasLoan === 'yes',
      original_loan_amount: loan('original_loan_amount'),
      remaining_loan_balance: loan('remaining_loan_balance'),
      loan_balance_as_of: loan('loan_balance_as_of'),
      annual_interest_rate: loan('annual_interest_rate'),
      repayment_amount: loan('repayment_amount'),
      repayment_frequency: loan('repayment_frequency') as PropertyInput['repayment_frequency'],
      next_repayment_date: loan('next_repayment_date'),
      notes: str('notes'),
    };
    try {
      const saved = await request<{ result: { id: string }[] }>(
        p ? `/api/v1/properties/${p.id}` : '/api/v1/properties',
        p ? 'PUT' : 'POST',
        input,
      );
      await onSaved(saved.result[0].id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <Modal
      title={p ? 'Edit your property' : 'A new chapter for your portfolio.'}
      subtitle="Start with the property. Then add the financial picture."
      onClose={close}
    >
      <form
        ref={ref}
        noValidate
        className="property-form"
        onSubmit={save}
        onChange={() => setDirty(true)}
      >
        <div className="form-steps">
          <button type="button" className={step === 1 ? 'active' : ''} onClick={() => setStep(1)}>
            <span>1</span> Property details
          </button>
          <span />
          <button type="button" className={step === 2 ? 'active' : ''} onClick={next}>
            <span>2</span> Financial picture
          </button>
        </div>
        {error && (
          <div className="alert error" role="alert">
            {error}
          </div>
        )}
        <fieldset hidden={step !== 1} disabled={saving}>
          <div className="form-grid">
            <Field label="Property name" name="display_name" required value={p?.display_name} />
            <Field label="Property type" name="property_type">
              <select name="property_type" defaultValue={p?.property_type || 'house'}>
                {types.map(([v, l]) => (
                  <option value={v} key={v}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Street address"
              name="address_line_1"
              required
              value={p?.address_line_1}
            />
            <Field label="Unit / address line 2" name="address_line_2" value={p?.address_line_2} />
            <Field label="Suburb" name="suburb" required value={p?.suburb} />
            <Field label="State / territory" name="state">
              <select name="state" defaultValue={p?.state || 'NSW'}>
                {['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT'].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Postcode" name="postcode" required value={p?.postcode} />
            <Field
              label="Bedrooms"
              name="bedrooms"
              required
              type="number"
              min="0"
              step="0.5"
              value={p?.bedrooms}
            />
            <Field
              label="Bathrooms"
              name="bathrooms"
              required
              type="number"
              min="0"
              step="0.5"
              value={p?.bathrooms}
            />
            <Field
              label="Car spaces"
              name="car_spaces"
              required
              type="number"
              min="0"
              step="1"
              value={p?.car_spaces}
            />
            <Field
              label="Land area (m²)"
              name="land_area_sqm"
              required
              type="number"
              min="0.01"
              step="0.01"
              value={p?.land_area_sqm}
            />
            <Field
              label="Building area (m²)"
              name="building_area_sqm"
              required
              type="number"
              min="0.01"
              step="0.01"
              value={p?.building_area_sqm}
            />
            <Field
              label="Purchase date"
              name="purchase_date"
              required
              type="date"
              value={p?.purchase_date}
            />
            <Field
              label="Purchase price (AUD)"
              name="purchase_price"
              required
              type="number"
              min="0.01"
              step="0.01"
              value={p?.purchase_price}
            />
          </div>
          <label className="form-field">
            <span>Notes</span>
            <textarea name="notes" maxLength={2000} rows={3} defaultValue={p?.notes || ''} />
          </label>
          <p className="form-hint">
            Australian properties · areas in square metres. Address entry is manual in this release.
          </p>
        </fieldset>
        <fieldset hidden={step !== 2} disabled={saving}>
          <h3 className="form-section-title">What is it worth today?</h3>
          <p className="form-hint">
            Optional. Enter your own estimate and its date; this is not a verified valuation.
          </p>
          <div className="form-grid">
            <Field
              label="Current value (AUD)"
              name="current_value"
              type="number"
              min="0.01"
              step="0.01"
              value={p?.current_value}
            />
            <Field
              label="Value as of"
              name="current_value_as_of"
              type="date"
              value={p?.current_value_as_of}
            />
          </div>
          <h3 className="form-section-title">The loan picture</h3>
          <label className="form-field">
            <span>Does this property have a loan?</span>
            <select value={hasLoan} onChange={(e) => setHasLoan(e.target.value)}>
              <option value="unknown">Not recorded yet</option>
              <option value="no">No loan</option>
              <option value="yes">Yes, record a loan</option>
            </select>
          </label>
          <fieldset hidden={hasLoan !== 'yes'} disabled={hasLoan !== 'yes' || saving}>
            <div className="form-grid">
              <Field
                label="Original loan amount (AUD)"
                name="original_loan_amount"
                required={hasLoan === 'yes'}
                type="number"
                min="0.01"
                step="0.01"
                value={p?.original_loan_amount}
              />
              <Field
                label="Remaining balance (AUD)"
                name="remaining_loan_balance"
                required={hasLoan === 'yes'}
                type="number"
                min="0"
                step="0.01"
                value={p?.remaining_loan_balance}
              />
              <Field
                label="Balance as of"
                name="loan_balance_as_of"
                required={hasLoan === 'yes'}
                type="date"
                value={p?.loan_balance_as_of}
              />
              <Field
                label="Annual interest rate (%)"
                name="annual_interest_rate"
                required={hasLoan === 'yes'}
                type="number"
                min="0"
                step="0.000001"
                value={p?.annual_interest_rate}
              />
              <Field
                label="Repayment amount (AUD)"
                name="repayment_amount"
                required={hasLoan === 'yes'}
                type="number"
                min="0.01"
                step="0.01"
                value={p?.repayment_amount}
              />
              <Field label="Repayment frequency" name="repayment_frequency">
                <select
                  name="repayment_frequency"
                  defaultValue={p?.repayment_frequency || 'monthly'}
                >
                  {frequencies.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </Field>
              <Field
                label="Next repayment date"
                name="next_repayment_date"
                required={hasLoan === 'yes'}
                type="date"
                value={p?.next_repayment_date}
              />
            </div>
          </fieldset>
          <p className="form-hint">
            One simple loan per property. Repayments are informational and are not automatically
            added as expenses.
          </p>
        </fieldset>
        <div className="form-actions">
          <button
            type="button"
            className="button button-outline"
            onClick={step === 1 ? close : () => setStep(1)}
            disabled={saving}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button
            type={step === 1 ? 'button' : 'submit'}
            onClick={
              step === 1
                ? (event) => {
                    event.preventDefault();
                    next();
                  }
                : undefined
            }
            className="button"
            disabled={saving}
          >
            {saving ? <LoaderCircle size={17} className="spin" /> : null}
            {step === 1 ? 'Continue' : saving ? 'Saving…' : 'Save property'}
            {step === 1 && <ArrowRight size={16} />}
          </button>
        </div>
      </form>
    </Modal>
  );
}
function ItemForm({
  type,
  property,
  onClose,
  onSaved,
}: {
  type: 'income' | 'expense';
  property: Property;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [frequency, setFrequency] = useState(type === 'income' ? 'weekly' : 'annually');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  useUnsaved(dirty);
  function close() {
    if (!dirty || window.confirm('Discard your unsaved entry?')) onClose();
  }
  return (
    <Modal title={`Add ${type}`} subtitle={property.display_name} onClose={close}>
      <form
        className="property-form"
        onChange={() => setDirty(true)}
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setBusy(true);
          setError('');
          try {
            await request('/api/v1/cash-flow', 'POST', {
              property_id: property.id,
              type,
              name: f.get('name'),
              amount: f.get('amount'),
              frequency,
              start_date: frequency === 'one_off' ? null : f.get('start_date'),
              end_date: frequency === 'one_off' ? null : f.get('end_date') || null,
              occurrence_date: frequency === 'one_off' ? f.get('occurrence_date') : null,
            });
            await onSaved();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {error && (
          <div className="alert error" role="alert">
            {error}
          </div>
        )}
        <fieldset disabled={busy}>
          <div className="form-grid">
            <Field label="Entry name" name="name" required />
            <Field
              label="Amount (AUD)"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              required
            />
            <Field label="Frequency" name="frequency">
              <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                {[...frequencies, 'one_off'].map((f) => (
                  <option value={f} key={f}>
                    {f.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </Field>
            {frequency === 'one_off' ? (
              <Field
                key="once"
                label="Occurrence date"
                name="occurrence_date"
                type="date"
                required
              />
            ) : (
              <>
                <Field key="start" label="Start date" name="start_date" type="date" required />
                <Field key="end" label="End date (optional)" name="end_date" type="date" />
              </>
            )}
          </div>
          <p className="form-hint">
            Recurring entries are annualised by frequency. Partial-year entries are not prorated.
            One-off entries appear only in their calendar year.
          </p>
        </fieldset>
        <div className="form-actions">
          <button type="button" className="button button-outline" onClick={close} disabled={busy}>
            Cancel
          </button>
          <button className="button" disabled={busy}>
            {busy ? 'Saving…' : `Save ${type}`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
