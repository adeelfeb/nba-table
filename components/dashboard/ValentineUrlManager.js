import React, { useState, useEffect } from 'react';

const THEMES = [
  { value: 'classic', label: 'Classic' },
  { value: 'romantic', label: 'Romantic' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'blush', label: 'Blush' },
];

const COLORS = [
  { value: 'rose', label: 'Rose' },
  { value: 'crimson', label: 'Crimson' },
  { value: 'blush', label: 'Blush' },
  { value: 'gold', label: 'Gold' },
  { value: 'lavender', label: 'Lavender' },
  { value: 'coral', label: 'Coral' },
];

const EMAIL_THEME_OPTIONS = [
  { value: 'classic_rose', label: 'Classic Rose' },
  { value: 'classic_crimson', label: 'Classic Crimson' },
  { value: 'classic_blush', label: 'Classic Blush' },
  { value: 'classic_gold', label: 'Classic Gold' },
  { value: 'classic_lavender', label: 'Classic Lavender' },
  { value: 'classic_coral', label: 'Classic Coral' },
  { value: 'romantic_rose', label: 'Romantic Rose' },
  { value: 'romantic_crimson', label: 'Romantic Crimson' },
  { value: 'romantic_blush', label: 'Romantic Blush' },
  { value: 'romantic_gold', label: 'Romantic Gold' },
  { value: 'romantic_lavender', label: 'Romantic Lavender' },
  { value: 'romantic_coral', label: 'Romantic Coral' },
  { value: 'minimal_rose', label: 'Minimal Rose' },
  { value: 'minimal_crimson', label: 'Minimal Crimson' },
  { value: 'minimal_blush', label: 'Minimal Blush' },
  { value: 'minimal_gold', label: 'Minimal Gold' },
  { value: 'minimal_lavender', label: 'Minimal Lavender' },
  { value: 'minimal_coral', label: 'Minimal Coral' },
  { value: 'vintage_rose', label: 'Vintage Rose' },
  { value: 'vintage_crimson', label: 'Vintage Crimson' },
  { value: 'vintage_blush', label: 'Vintage Blush' },
  { value: 'vintage_gold', label: 'Vintage Gold' },
  { value: 'vintage_lavender', label: 'Vintage Lavender' },
  { value: 'vintage_coral', label: 'Vintage Coral' },
  { value: 'blush_rose', label: 'Blush Rose' },
  { value: 'blush_crimson', label: 'Blush Crimson' },
  { value: 'blush_blush', label: 'Blush Pink' },
  { value: 'blush_gold', label: 'Blush Gold' },
  { value: 'blush_lavender', label: 'Blush Lavender' },
  { value: 'blush_coral', label: 'Blush Coral' },
];

function HeartIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function LinkIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function CopyIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function EditIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function CheckIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function ValentineUrlManager() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [copiedSlug, setCopiedSlug] = useState(null);
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientEmail: '',
    emailSubject: '',
    emailBody: '',
    emailTheme: 'classic_rose',
    welcomeText: "You've got something special",
    mainMessage: '',
    buttonText: 'Open',
    theme: 'classic',
    themeColor: 'rose',
    decorations: [],
  });

  useEffect(() => {
    fetchList();
  }, []);

  async function fetchList() {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/valentine', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.success) {
        setList(data.data?.valentineUrls || []);
      } else {
        setError(data.message || 'Failed to load');
      }
    } catch (err) {
      setError('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function getFullUrl(slug) {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/valentine/${slug}`;
  }

  async function copyLink(slug) {
    const url = getFullUrl(slug);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    } catch {
      setError('Could not copy. Please copy the URL manually.');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setSaving(true);
    try {
      const url = editingId ? `/api/valentine/${editingId.id}` : '/api/valentine';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        await fetchList();
        const emailSent = data.data?.emailSent;
        setSuccessMessage(emailSent ? 'Link saved. Email sent to the recipient.' : 'Link saved.');
        setTimeout(() => setSuccessMessage(''), 5000);
        resetForm();
      } else {
        setError(data.message || 'Failed to save');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!confirm(`Delete this Valentine link for "${item.recipientName}"?`)) return;
    try {
      const res = await fetch(`/api/valentine/${item.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.success) {
        setList((prev) => prev.filter((x) => x.id !== item.id));
      } else {
        setError(data.message || 'Failed to delete');
      }
    } catch (err) {
      setError('Failed to delete');
    }
  }

  function resetForm() {
    setFormData({
      recipientName: '',
      recipientEmail: '',
      emailSubject: '',
      emailBody: '',
      emailTheme: 'classic_rose',
      welcomeText: "You've got something special",
      mainMessage: '',
      buttonText: 'Open',
      theme: 'classic',
      themeColor: 'rose',
      decorations: [],
    });
    setEditingId(null);
    setShowForm(false);
  }

  function handleEdit(item) {
    setFormData({
      recipientName: item.recipientName,
      recipientEmail: item.recipientEmail || '',
      emailSubject: item.emailSubject || '',
      emailBody: item.emailBody || '',
      emailTheme: item.emailTheme || 'classic_rose',
      welcomeText: item.welcomeText || "You've got something special",
      mainMessage: item.mainMessage || '',
      buttonText: item.buttonText || 'Open',
      theme: item.theme || 'classic',
      themeColor: item.themeColor || 'rose',
      decorations: Array.isArray(item.decorations) ? item.decorations : [],
    });
    setEditingId({ id: item.id });
    setShowForm(true);
  }

  const DECORATION_OPTIONS = [
    { value: 'flowers', label: 'Flowers' },
    { value: 'teddy', label: 'Teddy bear' },
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'hearts', label: 'Hearts' },
  ];

  function toggleDecoration(value) {
    const list = formData.decorations || [];
    const next = list.includes(value) ? list.filter((d) => d !== value) : [...list, value];
    setFormData({ ...formData, decorations: next });
  }

  const showEmailOptions = formData.recipientEmail && formData.recipientEmail.trim().length > 0;

  return (
    <div className="valentine-manager">
      <header className="valentine-hero">
        <div className="valentine-hero-content">
          <div className="valentine-hero-badge">
            <HeartIcon size={16} />
            <span>Share something special</span>
          </div>
          <h2 className="valentine-hero-title">
            <span className="valentine-title-icon" aria-hidden><HeartIcon size={28} /></span>
            Valentine Links
          </h2>
          <p className="valentine-hero-desc">
            Create a unique, secure link with a custom message and theme. Only people with the link can see the page.
          </p>
          {!showForm && (
            <button
              type="button"
              className="valentine-btn-primary"
              onClick={() => setShowForm(true)}
              aria-label="Create new Valentine link"
            >
              <HeartIcon size={20} />
              Create New Link
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="valentine-alert" role="alert">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="valentine-success" role="status">
          {successMessage}
        </div>
      )}

      {showForm && (
        <article className="valentine-form-card" aria-labelledby="valentine-form-title">
          <h3 id="valentine-form-title" className="valentine-form-title">
            {editingId ? 'Edit Valentine Link' : 'Create Valentine Link'}
          </h3>
          <form onSubmit={handleSubmit} className="valentine-form">
            <fieldset className="valentine-fieldset">
              <legend className="valentine-legend">Link & recipient</legend>
            <div className="valentine-form-group">
              <label htmlFor="valentine-recipient-name">Recipient name (for you; used in the URL slug)</label>
              <input
                id="valentine-recipient-name"
                type="text"
                value={formData.recipientName}
                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                placeholder="e.g. Jane"
                required
                disabled={!!editingId}
                autoComplete="off"
              />
              {editingId && <span className="valentine-hint">Slug cannot be changed after creation.</span>}
            </div>
            <div className="valentine-form-group">
              <label htmlFor="valentine-recipient-email">Recipient email (optional)</label>
              <input
                id="valentine-recipient-email"
                type="email"
                value={formData.recipientEmail}
                onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                placeholder="e.g. jane@example.com"
                disabled={saving}
                autoComplete="email"
              />
              <span className="valentine-hint">If provided, we&apos;ll send the link to this address. When set, you can customize the email below.</span>
            </div>
            </fieldset>
            {showEmailOptions && (
              <fieldset className="valentine-fieldset valentine-email-options">
                <legend className="valentine-legend">Email options</legend>
                <div className="valentine-form-group">
                  <label>Email subject</label>
                  <input
                    type="text"
                    value={formData.emailSubject}
                    onChange={(e) => setFormData({ ...formData, emailSubject: e.target.value })}
                    placeholder="e.g. You've got something special, Jane"
                    maxLength={200}
                    disabled={saving}
                  />
                </div>
                <div className="valentine-form-group">
                  <label>Email body</label>
                  <textarea
                    value={formData.emailBody}
                    onChange={(e) => setFormData({ ...formData, emailBody: e.target.value })}
                    placeholder="Optional message shown in the email before the link button. Leave blank for default text."
                    rows={3}
                    maxLength={2000}
                    disabled={saving}
                  />
                </div>
                <div className="valentine-form-group">
                  <label>Email theme</label>
                  <select
                    value={formData.emailTheme}
                    onChange={(e) => setFormData({ ...formData, emailTheme: e.target.value })}
                    disabled={saving}
                  >
                    {EMAIL_THEME_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <span className="valentine-hint">Visual style of the email (colors and layout).</span>
                </div>
              </fieldset>
            )}
            <fieldset className="valentine-fieldset">
              <legend className="valentine-legend">Page content & theme</legend>
            <div className="valentine-form-group">
              <label htmlFor="valentine-welcome">Welcome text</label>
              <input
                id="valentine-welcome"
                type="text"
                value={formData.welcomeText}
                onChange={(e) => setFormData({ ...formData, welcomeText: e.target.value })}
                placeholder="You've got something special"
                maxLength={200}
                autoComplete="off"
              />
            </div>
            <div className="valentine-form-group">
              <label>Main message (shown after they click the button)</label>
              <textarea
                value={formData.mainMessage}
                onChange={(e) => setFormData({ ...formData, mainMessage: e.target.value })}
                placeholder="Your heartfelt message..."
                rows={4}
                maxLength={2000}
              />
            </div>
            <div className="valentine-form-group">
              <label>Button text</label>
              <input
                type="text"
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                placeholder="Open"
                maxLength={50}
              />
            </div>
            <div className="valentine-form-row">
              <div className="valentine-form-group">
                <label>Theme</label>
                <select
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                >
                  {THEMES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="valentine-form-group">
                <label>Color</label>
                <select
                  value={formData.themeColor}
                  onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                >
                  {COLORS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="valentine-form-group">
              <label>Page decorations (optional)</label>
              <p className="valentine-hint">Show animated icons on the shared page. Select any combination.</p>
              <div className="valentine-decorations">
                {DECORATION_OPTIONS.map((opt) => (
                  <label key={opt.value} className="valentine-decoration-check">
                    <input
                      type="checkbox"
                      checked={(formData.decorations || []).includes(opt.value)}
                      onChange={() => toggleDecoration(opt.value)}
                      disabled={saving}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            </fieldset>
            <div className="valentine-form-actions">
              <button type="button" className="valentine-btn-secondary" onClick={resetForm} disabled={saving}>Cancel</button>
              <button type="submit" className="valentine-btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </article>
      )}

      {loading ? (
        <div className="valentine-loading-wrap" aria-busy="true" aria-live="polite">
          <div className="valentine-loading-dots">
            <span /><span /><span />
          </div>
          <p className="valentine-loading-text">Loading your Valentine links…</p>
        </div>
      ) : (
        <div className="valentine-list-wrap">
          {list.length === 0 && !showForm ? (
            <div className="valentine-empty" role="status">
              <div className="valentine-empty-icon">
                <HeartIcon size={56} />
              </div>
              <h3 className="valentine-empty-title">No Valentine links yet</h3>
              <p className="valentine-empty-desc">Create one and share the link with someone special.</p>
              <button
                type="button"
                className="valentine-btn-primary valentine-empty-cta"
                onClick={() => setShowForm(true)}
              >
                <HeartIcon size={20} />
                Create your first link
              </button>
            </div>
          ) : list.length > 0 ? (
            <ul className="valentine-list" aria-label="Your Valentine links">
              {list.map((item) => (
                <li key={item.id} className="valentine-card">
                  <div className="valentine-card-accent" aria-hidden />
                  <div className="valentine-card-body">
                    <div className="valentine-card-top">
                      <span className="valentine-card-recipient">For: {item.recipientName}</span>
                      <span className="valentine-card-theme">{item.theme} / {item.themeColor}</span>
                      <div className="valentine-card-actions">
                        <button
                          type="button"
                          className={`valentine-icon-btn ${copiedSlug === item.slug ? 'valentine-copied' : ''}`}
                          onClick={() => copyLink(item.slug)}
                          title={copiedSlug === item.slug ? 'Copied' : 'Copy link'}
                          aria-label={copiedSlug === item.slug ? 'Link copied' : 'Copy link'}
                        >
                          {copiedSlug === item.slug ? <CheckIcon size={18} /> : <CopyIcon size={18} />}
                          {copiedSlug === item.slug ? ' Copied!' : ' Copy'}
                        </button>
                        <a href={getFullUrl(item.slug)} target="_blank" rel="noopener noreferrer" className="valentine-icon-btn" title="Open in new tab">
                          <LinkIcon size={18} />
                          Open
                        </a>
                        <button type="button" className="valentine-icon-btn" onClick={() => handleEdit(item)} title="Edit">
                          <EditIcon size={18} />
                          Edit
                        </button>
                        <button type="button" className="valentine-icon-btn valentine-delete" onClick={() => handleDelete(item)} title="Delete">
                          <TrashIcon size={18} />
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="valentine-card-url"
                      onClick={() => copyLink(item.slug)}
                      title="Click to copy URL"
                    >
                      <code>{getFullUrl(item.slug)}</code>
                    </button>
                    {item.welcomeText && <p className="valentine-card-preview">Welcome: &ldquo;{item.welcomeText}&rdquo;</p>}
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}

      <style jsx>{`
        .valentine-manager {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        /* Hero header */
        .valentine-hero {
          position: relative;
          padding: 1.75rem 1.5rem;
          background: linear-gradient(145deg, #fef7f8 0%, #fff5f7 50%, #fef2f2 100%);
          border: 1px solid rgba(225, 29, 72, 0.12);
          border-radius: 1.25rem;
          overflow: hidden;
        }
        .valentine-hero::before {
          content: '';
          position: absolute;
          top: -40%;
          right: -20%;
          width: 60%;
          height: 140%;
          background: radial-gradient(ellipse, rgba(225, 29, 72, 0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .valentine-hero-content {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-width: 52ch;
        }
        .valentine-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          align-self: flex-start;
          padding: 0.35rem 0.85rem;
          background: rgba(225, 29, 72, 0.12);
          color: #be123c;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.03em;
          border-radius: 999px;
        }
        .valentine-hero-badge :global(svg) {
          flex-shrink: 0;
        }
        .valentine-hero-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.6rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .valentine-title-icon {
          color: #e11d48;
          flex-shrink: 0;
        }
        .valentine-hero-desc {
          margin: 0;
          color: #64748b;
          font-size: 0.95rem;
          line-height: 1.6;
        }
        .valentine-hero-content .valentine-btn-primary {
          align-self: flex-start;
          margin-top: 0.25rem;
        }

        .valentine-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #e11d48, #be123c);
          color: white;
          border: none;
          padding: 0.75rem 1.35rem;
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 14px rgba(225, 29, 72, 0.35);
        }
        .valentine-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(225, 29, 72, 0.4);
        }
        .valentine-btn-primary:focus-visible {
          outline: 2px solid #e11d48;
          outline-offset: 2px;
        }
        .valentine-btn-secondary {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
          padding: 0.6rem 1.1rem;
          border-radius: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .valentine-btn-secondary:hover {
          background: #e2e8f0;
        }
        .valentine-btn-secondary:focus-visible {
          outline: 2px solid #64748b;
          outline-offset: 2px;
        }

        .valentine-alert {
          padding: 0.85rem 1.1rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          border-radius: 0.75rem;
          font-size: 0.9rem;
          line-height: 1.5;
        }
        .valentine-success {
          padding: 0.85rem 1.1rem;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #047857;
          border-radius: 0.75rem;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        /* Form card */
        .valentine-form-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 1.25rem;
          padding: 1.75rem;
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06);
        }
        .valentine-form-title {
          margin: 0 0 1.25rem 0;
          font-size: 1.2rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.01em;
        }
        .valentine-form {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .valentine-fieldset {
          border: none;
          margin: 0 0 1.5rem 0;
          padding: 0;
        }
        .valentine-legend {
          font-size: 0.9rem;
          font-weight: 600;
          color: #475569;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
          width: 100%;
        }
        .valentine-form-group {
          margin-bottom: 1rem;
        }
        .valentine-form-group:last-child {
          margin-bottom: 0;
        }
        .valentine-form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 0.4rem;
        }
        .valentine-form-group input,
        .valentine-form-group textarea,
        .valentine-form-group select {
          width: 100%;
          padding: 0.65rem 0.85rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.6rem;
          font-size: 0.95rem;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .valentine-form-group input:focus,
        .valentine-form-group textarea:focus,
        .valentine-form-group select:focus {
          outline: none;
          border-color: #e11d48;
          box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.12);
        }
        .valentine-form-group input:disabled {
          background: #f8fafc;
          color: #64748b;
          cursor: not-allowed;
        }
        .valentine-hint {
          display: block;
          font-size: 0.8rem;
          color: #64748b;
          margin-top: 0.3rem;
          line-height: 1.45;
        }
        .valentine-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .valentine-email-options {
          padding: 1.25rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.85rem;
        }
        .valentine-email-options .valentine-legend {
          margin-bottom: 1rem;
        }
        .valentine-decorations {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem 1.25rem;
          margin-top: 0.5rem;
        }
        .valentine-decoration-check {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #334155;
          cursor: pointer;
          padding: 0.4rem 0;
        }
        .valentine-decoration-check input {
          width: 1.1rem;
          height: 1.1rem;
          accent-color: #e11d48;
        }
        .valentine-form-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }
        .valentine-form-actions button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Loading state */
        .valentine-loading-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 2.5rem;
        }
        .valentine-loading-dots {
          display: flex;
          gap: 0.5rem;
        }
        .valentine-loading-dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e11d48;
          animation: valentine-dot 1.2s ease-in-out infinite;
        }
        .valentine-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .valentine-loading-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes valentine-dot {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.6; }
          40% { transform: scale(1.2); opacity: 1; }
        }
        .valentine-loading-text {
          margin: 0;
          color: #64748b;
          font-size: 0.95rem;
        }

        /* Empty state */
        .valentine-empty {
          text-align: center;
          padding: 2.75rem 1.5rem;
          background: linear-gradient(180deg, #fef7f8 0%, #fff 100%);
          border: 1px dashed rgba(225, 29, 72, 0.25);
          border-radius: 1.25rem;
          color: #64748b;
        }
        .valentine-empty-icon {
          margin-bottom: 1rem;
          color: #e11d48;
          opacity: 0.85;
        }
        .valentine-empty-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.15rem;
          font-weight: 600;
          color: #0f172a;
        }
        .valentine-empty-desc {
          margin: 0 0 1.25rem 0;
          font-size: 0.95rem;
          line-height: 1.5;
          max-width: 36ch;
          margin-left: auto;
          margin-right: auto;
        }
        .valentine-empty-cta {
          margin: 0 auto;
        }

        /* Link list & cards */
        .valentine-list-wrap {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .valentine-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .valentine-card {
          position: relative;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 1.1rem;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
          transition: box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .valentine-card:hover {
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.08);
          border-color: #fecaca;
        }
        .valentine-card-accent {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #e11d48, #f43f5e);
        }
        .valentine-card-body {
          padding: 1.25rem 1.25rem 1.25rem;
        }
        .valentine-card-top {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .valentine-card-recipient {
          font-weight: 600;
          color: #0f172a;
          font-size: 1rem;
        }
        .valentine-card-theme {
          font-size: 0.78rem;
          color: #64748b;
          background: #f1f5f9;
          padding: 0.3rem 0.6rem;
          border-radius: 0.4rem;
          font-weight: 500;
        }
        .valentine-card-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-left: auto;
        }
        .valentine-icon-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.75rem;
          font-size: 0.85rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          color: #475569;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }
        .valentine-icon-btn:hover {
          background: #e2e8f0;
          color: #334155;
        }
        .valentine-icon-btn:focus-visible {
          outline: 2px solid #64748b;
          outline-offset: 2px;
        }
        .valentine-icon-btn.valentine-copied {
          background: #ecfdf5;
          color: #047857;
          border-color: #a7f3d0;
        }
        .valentine-icon-btn.valentine-delete:hover {
          background: #fef2f2;
          color: #b91c1c;
          border-color: #fecaca;
        }
        .valentine-card-url {
          display: block;
          width: 100%;
          margin: 0;
          padding: 0.6rem 0.75rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          cursor: pointer;
          text-align: left;
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .valentine-card-url:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }
        .valentine-card-url code {
          font-size: 0.8rem;
          color: #64748b;
          word-break: break-all;
          font-family: ui-monospace, monospace;
        }
        .valentine-card-preview {
          margin: 0.6rem 0 0 0;
          font-size: 0.9rem;
          color: #64748b;
          line-height: 1.5;
        }

        @media (max-width: 640px) {
          .valentine-form-row {
            grid-template-columns: 1fr;
          }
          .valentine-card-actions {
            margin-left: 0;
          }
          .valentine-hero {
            padding: 1.25rem 1.25rem;
          }
          .valentine-hero-title {
            font-size: 1.4rem;
          }
        }
      `}</style>
    </div>
  );
}
