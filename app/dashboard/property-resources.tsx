'use client';
import { useEffect, useRef, useState } from 'react';
import {
  Camera,
  FileText,
  Users,
  Upload,
  Download,
  Trash2,
  Pencil,
  Plus,
  LoaderCircle,
  ShieldCheck,
  X,
} from 'lucide-react';
import type {
  PropertyResources as Resources,
  Tenant,
  TenantInput,
} from '../../lib/resources-domain';
import { uploadLimits } from '../../lib/resources-domain';
type Section = 'photo' | 'document' | 'tenant';
async function api<T = unknown>(path: string, method = 'GET', body?: unknown) {
  const response = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  });
  const result = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(result.error || 'Unable to complete this request.');
  return result as T;
}
function displayMoney(value: string | null) {
  return value === null ? 'Not recorded' : 'AUD ' + value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
export default function PropertyResources({
  propertyId,
  onPhotosChanged,
  onDirtyChange,
}: {
  propertyId: string;
  onPhotosChanged: () => Promise<void>;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [data, setData] = useState<Resources | null>(null);
  const [section, setSection] = useState<Section>('photo');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [progress, setProgress] = useState('');
  const [editing, setEditing] = useState<Tenant | 'new' | null>(null);
  const [dirty, setDirty] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const base = `/api/v1/properties/${propertyId}`;
  async function reload() {
    try {
      setData(await api<Resources>(base + '/resources'));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void reload();
  }, [propertyId]);
  useEffect(() => {
    onDirtyChange(dirty);
    if (!dirty) return;
    const listener = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', listener);
    return () => window.removeEventListener('beforeunload', listener);
  }, [dirty, onDirtyChange]);
  function discard() {
    if (!dirty || window.confirm('Discard your unsaved tenant details?')) {
      setEditing(null);
      setDirty(false);
      return true;
    }
    return false;
  }
  function switchSection(next: Section) {
    if (busy || !discard()) return;
    setSection(next);
    setError('');
    setNotice('');
  }
  async function upload(files: FileList | null) {
    if (!files?.length || section === 'tenant') return;
    const kind = section;
    const chosen = Array.from(files);
    const existing = data?.files.filter((f) => f.kind === kind).length || 0;
    const max = kind === 'photo' ? uploadLimits.photos : uploadLimits.documents;
    if (existing + chosen.length > max) {
      setError(
        `Choose up to ${max - existing} more ${kind === 'photo' ? 'photos' : 'documents'} for this property.`,
      );
      if (input.current) input.current.value = '';
      return;
    }
    const maxBytes = kind === 'photo' ? uploadLimits.photoBytes : uploadLimits.documentBytes;
    if (chosen.some((f) => !f.size || f.size > maxBytes)) {
      setError(
        `Each ${kind} must be non-empty and no larger than ${kind === 'photo' ? 5 : 10} MB.`,
      );
      if (input.current) input.current.value = '';
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    let uploaded = 0;
    try {
      for (const file of chosen) {
        setProgress(`Uploading ${uploaded + 1} of ${chosen.length}: ${file.name}`);
        const response = await fetch(base + `/files?kind=${kind}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'X-File-Name': encodeURIComponent(file.name),
          },
          body: file,
        });
        const result = (await response.json()) as { error?: string };
        if (!response.ok) throw new Error(result.error || `Could not upload ${file.name}.`);
        uploaded++;
      }
      setNotice(`${uploaded} ${uploaded === 1 ? 'file' : 'files'} uploaded.`);
    } catch (e) {
      setError((e as Error).message + (uploaded ? ` ${uploaded} earlier file(s) were saved.` : ''));
    } finally {
      await reload();
      if (uploaded && kind === 'photo') await onPhotosChanged();
      setBusy(false);
      setProgress('');
      if (input.current) input.current.value = '';
    }
  }
  async function removeFile(id: string, name: string, kind: string) {
    if (!window.confirm(`Permanently remove “${name}” from this property?`)) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await api('/api/v1/files/' + id, 'DELETE');
      await reload();
      if (kind === 'photo') await onPhotosChanged();
      setNotice('File removed.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function removeTenant(tenant: Tenant) {
    if (!window.confirm(`Permanently remove tenant details for ${tenant.full_name}?`)) return;
    setBusy(true);
    setError('');
    try {
      await api(base + '/tenants/' + tenant.id, 'DELETE');
      await reload();
      setNotice('Tenant details removed.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const files = data?.files.filter((f) => f.kind === section) || [];
  return (
    <section className="property-resources">
      <div className="resources-title">
        <div>
          <h3>Make this property your own.</h3>
          <p>Photos, paperwork and the people who call it home.</p>
        </div>
        <ShieldCheck size={18} />
      </div>
      <div className="resource-tabs" role="tablist" aria-label="Property records">
        {[
          {
            id: 'photo',
            label: 'Photos',
            icon: Camera,
            count: data?.files.filter((f) => f.kind === 'photo').length,
          },
          {
            id: 'document',
            label: 'Documents',
            icon: FileText,
            count: data?.files.filter((f) => f.kind === 'document').length,
          },
          { id: 'tenant', label: 'Tenants', icon: Users, count: data?.tenants.length },
        ].map((tab) => (
          <button
            role="tab"
            key={tab.id}
            aria-selected={section === tab.id}
            disabled={busy}
            onClick={() => switchSection(tab.id as Section)}
            className={section === tab.id ? 'active' : ''}
          >
            <tab.icon size={15} />
            {tab.label}
            <span>{tab.count || 0}</span>
          </button>
        ))}
      </div>
      {error && (
        <div className="alert error" role="alert">
          {error}
          <button onClick={() => void reload()}>Retry</button>
        </div>
      )}
      {notice && (
        <div className="alert success" role="status">
          {notice}
        </div>
      )}
      {loading ? (
        <div className="resources-loading">
          <LoaderCircle className="spin" size={18} /> Loading property records…
        </div>
      ) : !data ? (
        <p className="empty-item">Property records could not be loaded. Please retry.</p>
      ) : section === 'tenant' ? (
        <>
          {editing ? (
            <TenantEditor
              key={editing === 'new' ? 'new' : editing.id}
              tenant={editing === 'new' ? null : editing}
              disabled={busy}
              onDirty={() => setDirty(true)}
              onCancel={discard}
              onSave={async (value) => {
                setBusy(true);
                setError('');
                try {
                  await api(
                    base + '/tenants' + (editing === 'new' ? '' : '/' + editing.id),
                    editing === 'new' ? 'POST' : 'PUT',
                    value,
                  );
                  setEditing(null);
                  setDirty(false);
                  await reload();
                  setNotice('Tenant details saved.');
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            />
          ) : (
            <>
              <div className="resource-actions">
                <p>Keep tenant and lease details privately with this property.</p>
                <button
                  className="button button-outline button-small"
                  disabled={busy}
                  onClick={() => {
                    setEditing('new');
                    setDirty(false);
                    setError('');
                    setNotice('');
                  }}
                >
                  <Plus size={14} /> Add tenant
                </button>
              </div>
              {data.tenants.length ? (
                <div className="tenant-list">
                  {data.tenants.map((tenant) => (
                    <article className="tenant-card" key={tenant.id}>
                      <div className="tenant-card-top">
                        <span className="tenant-avatar">
                          <Users size={17} />
                        </span>
                        <div>
                          <h4>{tenant.full_name}</h4>
                          <span className={`tenant-status ${tenant.status}`}>{tenant.status}</span>
                        </div>
                        <button
                          className="icon-button"
                          aria-label={`Edit tenant ${tenant.full_name}`}
                          disabled={busy}
                          onClick={() => {
                            setEditing(tenant);
                            setDirty(false);
                            setError('');
                            setNotice('');
                          }}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label={`Remove tenant ${tenant.full_name}`}
                          disabled={busy}
                          onClick={() => void removeTenant(tenant)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="tenant-contact">
                        {tenant.email && <span>{tenant.email}</span>}
                        {tenant.phone && <span>{tenant.phone}</span>}
                      </div>
                      <dl className="tenant-facts">
                        <div>
                          <dt>Lease period</dt>
                          <dd>
                            {tenant.lease_start || 'Start not recorded'} →{' '}
                            {tenant.lease_end || 'No end recorded'}
                          </dd>
                        </div>
                        <div>
                          <dt>Rent</dt>
                          <dd>
                            {displayMoney(tenant.rent_amount)}
                            {tenant.rent_frequency ? ' / ' + tenant.rent_frequency : ''}
                          </dd>
                        </div>
                        <div>
                          <dt>Bond</dt>
                          <dd>{displayMoney(tenant.bond_amount)}</dd>
                        </div>
                      </dl>
                      {tenant.notes && <p className="tenant-notes">{tenant.notes}</p>}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="resource-empty">
                  <Users size={25} />
                  <h4>No tenant details yet</h4>
                  <p>Add a tenant when the property is rented, or leave this blank.</p>
                </div>
              )}
              <p className="resource-hint">
                Tenant rent is a reference only. Add an income entry to include rent in your
                analytics. No emails or invitations are sent to tenants.
              </p>
            </>
          )}
        </>
      ) : (
        <>
          <div className="resource-actions">
            <p>
              {section === 'photo'
                ? 'JPG, PNG or WebP · up to 5 MB each · 10 photos per property'
                : 'PDF, Word (.docx), Excel (.xlsx), TXT or CSV · up to 10 MB each · 20 documents per property'}
            </p>
            <button
              className="button button-outline button-small"
              disabled={busy}
              onClick={() => input.current?.click()}
            >
              {busy ? <LoaderCircle className="spin" size={14} /> : <Upload size={14} />}{' '}
              {busy ? 'Uploading…' : section === 'photo' ? 'Upload photos' : 'Upload documents'}
            </button>
            <input
              ref={input}
              className="file-input"
              type="file"
              multiple
              aria-label={
                section === 'photo' ? 'Choose property photos' : 'Choose property documents'
              }
              accept={section === 'photo' ? '.jpg,.jpeg,.png,.webp' : '.pdf,.docx,.xlsx,.txt,.csv'}
              onChange={(event) => void upload(event.target.files)}
              disabled={busy}
            />
          </div>
          {progress && (
            <p className="upload-progress" role="status">
              <LoaderCircle className="spin" size={14} />
              {progress}
            </p>
          )}
          {files.length ? (
            section === 'photo' ? (
              <div className="photo-grid">
                {files.map((file, index) => (
                  <figure className="property-photo" key={file.id}>
                    <a
                      href={'/api/v1/files/' + file.id}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${file.name}`}
                    >
                      <img src={'/api/v1/files/' + file.id} alt={file.name} loading="lazy" />
                    </a>
                    {index === 0 && <span className="photo-cover-label">Latest photo</span>}
                    <figcaption>
                      <span title={file.name}>{file.name}</span>
                      <a
                        className="icon-button"
                        href={'/api/v1/files/' + file.id + '?download=1'}
                        download
                        aria-label={`Download ${file.name}`}
                      >
                        <Download size={13} />
                      </a>
                      <button
                        className="icon-button"
                        disabled={busy}
                        aria-label={`Remove ${file.name}`}
                        onClick={() => void removeFile(file.id, file.name, file.kind)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <div className="document-list">
                {files.map((file) => (
                  <div className="document-row" key={file.id}>
                    <span className="document-icon">
                      <FileText size={18} />
                    </span>
                    <div>
                      <b>{file.name}</b>
                      <small>
                        {file.name.split('.').pop()?.toUpperCase()} ·{' '}
                        {(file.size / 1024 / 1024).toFixed(2)} MB ·{' '}
                        {new Date(file.created_at).toLocaleDateString('en-AU', {
                          timeZone: 'Australia/Sydney',
                        })}
                      </small>
                    </div>
                    <a
                      className="icon-button"
                      href={'/api/v1/files/' + file.id + '?download=1'}
                      download
                      aria-label={`Download ${file.name}`}
                    >
                      <Download size={15} />
                    </a>
                    <button
                      className="icon-button"
                      disabled={busy}
                      aria-label={`Remove ${file.name}`}
                      onClick={() => void removeFile(file.id, file.name, file.kind)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="resource-empty">
              {section === 'photo' ? <Camera size={25} /> : <FileText size={25} />}
              <h4>
                {section === 'photo'
                  ? 'Bring your property into view.'
                  : 'A home for the paperwork.'}
              </h4>
              <p>
                {section === 'photo'
                  ? 'Add property photos. Your latest photo will appear on its portfolio card.'
                  : 'Keep lease agreements, insurance papers and other records together.'}
              </p>
            </div>
          )}
          <p className="resource-hint">
            <ShieldCheck size={12} />
            {section === 'photo'
              ? 'Photos are private. The latest upload is shown on your property card.'
              : 'Documents are private and downloaded as files. Only upload files you trust and are authorised to store.'}
          </p>
        </>
      )}
    </section>
  );
}
function TenantEditor({
  tenant,
  disabled,
  onSave,
  onCancel,
  onDirty,
}: {
  tenant: Tenant | null;
  disabled: boolean;
  onSave: (data: TenantInput) => Promise<void>;
  onCancel: () => void;
  onDirty: () => void;
}) {
  return (
    <form
      className="tenant-editor"
      onChange={onDirty}
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const value = (name: string) => String(form.get(name) || '').trim();
        await onSave({
          full_name: value('full_name'),
          email: value('email'),
          phone: value('phone'),
          status: value('status') as TenantInput['status'],
          lease_start: value('lease_start') || null,
          lease_end: value('lease_end') || null,
          rent_amount: value('rent_amount') || null,
          rent_frequency: value('rent_amount')
            ? ((value('rent_frequency') || null) as TenantInput['rent_frequency'])
            : null,
          bond_amount: value('bond_amount') || null,
          notes: value('notes'),
        });
      }}
    >
      <div className="tenant-editor-title">
        <h4>{tenant ? 'Edit tenant details' : 'New tenant details'}</h4>
        <button
          type="button"
          className="icon-button"
          aria-label="Cancel tenant changes"
          disabled={disabled}
          onClick={onCancel}
        >
          <X size={16} />
        </button>
      </div>
      <fieldset disabled={disabled}>
        <div className="form-grid">
          <label className="form-field">
            <span>Tenant full name *</span>
            <input
              name="full_name"
              required
              maxLength={150}
              defaultValue={tenant?.full_name || ''}
            />
          </label>
          <label className="form-field">
            <span>Tenancy status</span>
            <select name="status" defaultValue={tenant?.status || 'active'}>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="ended">Ended</option>
            </select>
          </label>
          <label className="form-field">
            <span>Email (optional)</span>
            <input type="email" name="email" maxLength={320} defaultValue={tenant?.email || ''} />
          </label>
          <label className="form-field">
            <span>Phone (optional)</span>
            <input type="tel" name="phone" maxLength={40} defaultValue={tenant?.phone || ''} />
          </label>
          <label className="form-field">
            <span>Lease start (optional)</span>
            <input type="date" name="lease_start" defaultValue={tenant?.lease_start || ''} />
          </label>
          <label className="form-field">
            <span>Lease end (optional)</span>
            <input type="date" name="lease_end" defaultValue={tenant?.lease_end || ''} />
          </label>
          <label className="form-field">
            <span>Rent amount (AUD, optional)</span>
            <input
              type="number"
              name="rent_amount"
              min="0"
              step="0.01"
              defaultValue={tenant?.rent_amount || ''}
            />
          </label>
          <label className="form-field">
            <span>Rent frequency</span>
            <select name="rent_frequency" defaultValue={tenant?.rent_frequency || 'weekly'}>
              <option value="weekly">Weekly</option>
              <option value="fortnightly">Fortnightly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
          <label className="form-field">
            <span>Bond amount (AUD, optional)</span>
            <input
              type="number"
              name="bond_amount"
              min="0"
              step="0.01"
              defaultValue={tenant?.bond_amount || ''}
            />
          </label>
        </div>
        <label className="form-field tenant-notes-field">
          <span>Notes (optional)</span>
          <textarea name="notes" rows={3} maxLength={2000} defaultValue={tenant?.notes || ''} />
        </label>
      </fieldset>
      <div className="form-actions">
        <button
          type="button"
          className="button button-outline"
          onClick={onCancel}
          disabled={disabled}
        >
          Cancel
        </button>
        <button className="button" disabled={disabled}>
          {disabled ? 'Saving…' : 'Save tenant'}
        </button>
      </div>
    </form>
  );
}
