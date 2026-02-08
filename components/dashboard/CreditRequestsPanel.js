import React, { useState, useEffect } from 'react';

export default function CreditRequestsPanel({ user }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fulfillingId, setFulfillingId] = useState(null);
  const [fulfillModal, setFulfillModal] = useState(null);
  const [creditsToAssign, setCreditsToAssign] = useState(5);
  const [emailCreditsToAssign, setEmailCreditsToAssign] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/valentine/credit-requests', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.success) {
        setList(data.data?.requests || []);
      } else {
        setError(data.message || 'Failed to load credit requests');
      }
    } catch (err) {
      setError('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function openFulfillModal(request) {
    setFulfillModal({
      id: request.id,
      userName: request.userName,
      userEmail: request.userEmail,
      requestedCredits: request.requestedCredits ?? 0,
      requestedEmailCredits: request.requestedEmailCredits ?? 0,
    });
    setCreditsToAssign(request.requestedCredits ?? 5);
    setEmailCreditsToAssign(request.requestedEmailCredits ?? 0);
    setError('');
  }

  function closeFulfillModal() {
    setFulfillModal(null);
    setCreditsToAssign(5);
    setEmailCreditsToAssign(0);
  }

  async function handleFulfillSubmit(e) {
    e.preventDefault();
    if (!fulfillModal) return;
    if (Number(creditsToAssign) === 0 && Number(emailCreditsToAssign) === 0) {
      setError('Assign at least 1 link or email credit.');
      return;
    }
    const id = fulfillModal.id;
    setFulfillingId(id);
    setError('');
    try {
      const res = await fetch(`/api/valentine/credit-requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          creditsToAdd: Math.max(0, Math.min(1000, Number(creditsToAssign) || 0)),
          emailCreditsToAdd: Math.max(0, Math.min(1000, Number(emailCreditsToAssign) || 0)),
        }),
      });
      const data = await res.json();
      if (data.success) {
        closeFulfillModal();
        setList((prev) => prev.filter((r) => r.id !== id));
        const linkAdded = data.data?.creditsAdded ?? creditsToAssign;
        const emailAdded = data.data?.emailCreditsAdded ?? emailCreditsToAssign;
        const parts = [];
        if (linkAdded > 0) parts.push(`${linkAdded} link credits`);
        if (emailAdded > 0) parts.push(`${emailAdded} email credits`);
        setSuccessMessage(`Credits added: ${parts.join(', ')} assigned to user.`);
        setTimeout(() => setSuccessMessage(''), 6000);
      } else {
        setError(data.message || 'Failed to fulfill request');
      }
    } catch (err) {
      setError('Failed to fulfill request. Please try again.');
    } finally {
      setFulfillingId(null);
    }
  }

  const pending = list.filter((r) => r.status === 'pending');
  const others = list.filter((r) => r.status !== 'pending');

  const role = (user?.role || '').toLowerCase();
  const isDeveloper = role === 'developer' || role === 'superadmin';

  return (
    <div className="credit-requests-panel">
      <header className="credit-requests-header">
        <h2 className="credit-requests-title">Valentine credit requests</h2>
        <p className="credit-requests-desc">
          Users request link and email credits here. Pricing: 10 link credits for $0.30 USD / Rs 30 PKR; 10 email credits for $0.20 USD / Rs 20 PKR. Mark as paid and add credits after receiving payment.
        </p>
        {isDeveloper && (
          <p className="credit-requests-dev-options">
            <a href="/dashboard#valentine-urls" className="credit-requests-dev-link">Valentine Links</a>
            {' · '}
            <a href="/dashboard#credit-requests" className="credit-requests-dev-link">Credit Requests</a> (this page)
          </p>
        )}
      </header>

      {error && (
        <div className="credit-requests-alert" role="alert">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="credit-requests-success" role="status">
          {successMessage}
        </div>
      )}

      {fulfillModal && (
        <div className="credit-requests-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="credit-requests-fulfill-title">
          <div className="credit-requests-modal">
            <h3 id="credit-requests-fulfill-title" className="credit-requests-modal-title">Assign credits</h3>
            <p className="credit-requests-modal-p">
              {fulfillModal.userName || '—'} ({fulfillModal.userEmail || '—'}) — requested {fulfillModal.requestedCredits} link credits, {fulfillModal.requestedEmailCredits} email credits. Assign credits to add to their account.
            </p>
            <form onSubmit={handleFulfillSubmit} className="credit-requests-fulfill-form">
              <div className="credit-requests-form-group">
                <label htmlFor="credit-requests-credits-input">Link credits to assign</label>
                <input
                  id="credit-requests-credits-input"
                  type="number"
                  min={0}
                  max={1000}
                  value={creditsToAssign}
                  onChange={(e) => setCreditsToAssign(Number(e.target.value) || 0)}
                  disabled={fulfillingId === fulfillModal.id}
                />
              </div>
              <div className="credit-requests-form-group">
                <label htmlFor="credit-requests-email-credits-input">Email credits to assign</label>
                <input
                  id="credit-requests-email-credits-input"
                  type="number"
                  min={0}
                  max={1000}
                  value={emailCreditsToAssign}
                  onChange={(e) => setEmailCreditsToAssign(Number(e.target.value) || 0)}
                  disabled={fulfillingId === fulfillModal.id}
                />
              </div>
              <div className="credit-requests-modal-actions">
                <button
                  type="button"
                  className="credit-requests-btn-secondary"
                  onClick={closeFulfillModal}
                  disabled={fulfillingId === fulfillModal.id}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="credit-requests-btn-fulfill"
                  disabled={fulfillingId === fulfillModal.id || (Number(creditsToAssign) === 0 && Number(emailCreditsToAssign) === 0)}
                >
                  {fulfillingId === fulfillModal.id ? 'Adding…' : 'Mark paid & add credits'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="credit-requests-loading">Loading requests…</div>
      ) : list.length === 0 ? (
        <div className="credit-requests-empty">No credit requests yet.</div>
      ) : (
        <div className="credit-requests-list">
          {pending.length > 0 && (
            <section>
              <h3 className="credit-requests-subtitle">Pending</h3>
              <ul className="credit-requests-ul">
                {pending.map((r) => (
                  <li key={r.id} className="credit-requests-card">
                    <div className="credit-requests-card-main">
                      <span className="credit-requests-user">{r.userName || '—'} ({r.userEmail || '—'})</span>
                      <span className="credit-requests-meta">
                        {[r.requestedCredits > 0 && `${r.requestedCredits} link`, r.requestedEmailCredits > 0 && `${r.requestedEmailCredits} email`].filter(Boolean).join(', ') || '0'} credits · ${r.amountUsd} USD / Rs {r.amountPkr} PKR
                      </span>
                      {r.message && <p className="credit-requests-msg">{r.message}</p>}
                      <span className="credit-requests-date">
                        {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}
                      </span>
                    </div>
                    <div className="credit-requests-card-actions">
                      <button
                        type="button"
                        className="credit-requests-btn-fulfill"
                        onClick={() => openFulfillModal(r)}
                        disabled={fulfillingId === r.id}
                      >
                        {fulfillingId === r.id ? 'Adding…' : 'Mark paid & add credits'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {others.length > 0 && (
            <section>
              <h3 className="credit-requests-subtitle">Processed</h3>
              <ul className="credit-requests-ul">
                {others.map((r) => (
                  <li key={r.id} className="credit-requests-card credit-requests-card-processed">
                    <div className="credit-requests-card-main">
                      <span className="credit-requests-user">{r.userName || '—'} ({r.userEmail || '—'})</span>
                      <span className="credit-requests-meta">
                        {[r.requestedCredits > 0 && `${r.requestedCredits} link`, r.requestedEmailCredits > 0 && `${r.requestedEmailCredits} email`].filter(Boolean).join(', ') || '0'} credits · {r.status}
                      </span>
                      <span className="credit-requests-date">
                        {r.processedAt ? new Date(r.processedAt).toLocaleString() : ''}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      <style jsx>{`
        .credit-requests-panel {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .credit-requests-header {
          margin-bottom: 0.25rem;
        }
        .credit-requests-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.35rem 0;
        }
        .credit-requests-desc {
          font-size: 0.9rem;
          color: #64748b;
          margin: 0;
          line-height: 1.5;
        }
        .credit-requests-dev-options {
          font-size: 0.85rem;
          color: #475569;
          margin: 0.5rem 0 0 0;
        }
        .credit-requests-dev-link {
          color: #2563eb;
          font-weight: 500;
          text-decoration: none;
        }
        .credit-requests-dev-link:hover {
          text-decoration: underline;
        }
        .credit-requests-alert {
          padding: 0.75rem 1rem;
          background: #fef2f2;
          color: #b91c1c;
          border-radius: 0.5rem;
          font-size: 0.9rem;
        }
        .credit-requests-loading,
        .credit-requests-empty {
          color: #64748b;
          font-size: 0.95rem;
          padding: 1.5rem;
        }
        .credit-requests-subtitle {
          font-size: 1rem;
          font-weight: 600;
          color: #334155;
          margin: 0 0 0.5rem 0;
        }
        .credit-requests-ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .credit-requests-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1rem 1.25rem;
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem;
        }
        .credit-requests-card-processed {
          opacity: 0.85;
        }
        .credit-requests-card-main {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-width: 0;
        }
        .credit-requests-user {
          font-weight: 600;
          color: #0f172a;
          font-size: 0.95rem;
        }
        .credit-requests-meta {
          font-size: 0.85rem;
          color: #64748b;
        }
        .credit-requests-msg {
          font-size: 0.85rem;
          color: #475569;
          margin: 0.25rem 0 0 0;
          white-space: pre-wrap;
        }
        .credit-requests-date {
          font-size: 0.8rem;
          color: #94a3b8;
          margin-top: 0.25rem;
        }
        .credit-requests-card-actions {
          flex-shrink: 0;
        }
        .credit-requests-btn-fulfill {
          padding: 0.5rem 1rem;
          background: #059669;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 500;
          font-size: 0.9rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .credit-requests-btn-fulfill:hover:not(:disabled) {
          background: #047857;
        }
        .credit-requests-btn-fulfill:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .credit-requests-success {
          padding: 0.75rem 1rem;
          background: #ecfdf5;
          color: #059669;
          border-radius: 0.5rem;
          font-size: 0.9rem;
        }
        .credit-requests-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        .credit-requests-modal {
          background: #fff;
          border-radius: 1rem;
          padding: 1.5rem;
          max-width: 420px;
          width: 100%;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
        }
        .credit-requests-modal-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.75rem 0;
        }
        .credit-requests-modal-p {
          font-size: 0.9rem;
          color: #64748b;
          margin: 0 0 1rem 0;
          line-height: 1.5;
        }
        .credit-requests-fulfill-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .credit-requests-form-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .credit-requests-form-group label {
          font-size: 0.9rem;
          font-weight: 500;
          color: #334155;
        }
        .credit-requests-form-group input {
          padding: 0.5rem 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 1rem;
        }
        .credit-requests-modal-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
        }
        .credit-requests-btn-secondary {
          padding: 0.5rem 1rem;
          background: #f1f5f9;
          color: #475569;
          border: none;
          border-radius: 0.5rem;
          font-weight: 500;
          font-size: 0.9rem;
          cursor: pointer;
        }
        .credit-requests-btn-secondary:hover:not(:disabled) {
          background: #e2e8f0;
        }
        .credit-requests-btn-secondary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
