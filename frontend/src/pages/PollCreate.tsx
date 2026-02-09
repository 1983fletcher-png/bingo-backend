/**
 * Interactive Polling — Create Poll (single screen, no wizard).
 * Route: /poll/create → on success redirect to /poll/:pollId/host
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSocket } from '../lib/socket';

const POLL_HOST_KEY = 'playroom_poll_host';
function saveHostToken(pollId: string, hostToken: string) {
  try {
    localStorage.setItem(POLL_HOST_KEY, JSON.stringify({ pollId, hostToken }));
  } catch (_) {}
}
import type { Socket } from 'socket.io-client';
import '../styles/join.css';

type ResponseType = 'open' | 'multiple';

export default function PollCreate() {
  const navigate = useNavigate();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [question, setQuestion] = useState('');
  const [responseType, setResponseType] = useState<ResponseType>('open');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [venueName, setVenueName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = getSocket();
    setSocket(s);
    const onCreated = (data: { pollId: string; hostToken: string }) => {
      setSubmitting(false);
      saveHostToken(data.pollId, data.hostToken);
      navigate(`/poll/${data.pollId}/host`, { replace: true, state: { hostToken: data.hostToken } });
    };
    const onErr = (data: { message?: string }) => {
      setSubmitting(false);
      setError(data?.message || 'Failed to create poll');
    };
    s.on('poll:created', onCreated);
    s.on('poll:error', onErr);
    return () => {
      s.off('poll:created', onCreated);
      s.off('poll:error', onErr);
    };
  }, [navigate]);

  const addOption = () => {
    if (options.length >= 10) return;
    setOptions((prev) => [...prev, '']);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const setOption = (index: number, value: string) => {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const q = question.trim();
    if (!q) {
      setError('Poll question is required');
      return;
    }
    if (!socket?.connected) {
      setError('Not connected. Try again.');
      return;
    }
    setSubmitting(true);
    const opts = responseType === 'multiple'
      ? options.map((o) => o.trim()).filter(Boolean)
      : [];
    if (responseType === 'multiple' && opts.length < 2) {
      setError('Add at least 2 options for multiple choice');
      setSubmitting(false);
      return;
    }
    socket.emit('poll:create', {
      question: q,
      responseType,
      options: responseType === 'multiple' ? opts : undefined,
      venueName: venueName.trim() || undefined,
      logoUrl: logoUrl.trim() || undefined,
    });
  };

  return (
    <div className="join-page" style={{ maxWidth: 520, margin: '0 auto' }}>
      <p style={{ marginBottom: 24 }}>
        <Link to="/" className="join-page__back">← Back to home</Link>
      </p>
      <h1 className="join-page__title" style={{ marginBottom: 8 }}>Create a poll</h1>
      <p className="join-page__intro" style={{ marginBottom: 24 }}>
        One question, one QR. Collect live crowd input and see results instantly.
      </p>

      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600 }}>Poll question (required)</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What drink should we add to the menu?"
          className="join-page__input"
          style={{ minHeight: 100, resize: 'vertical', marginBottom: 20 }}
          maxLength={300}
          required
        />

        <fieldset style={{ marginBottom: 20, border: 'none', padding: 0 }}>
          <legend style={{ marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Response type</legend>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <input type="radio" name="responseType" checked={responseType === 'open'} onChange={() => setResponseType('open')} />
            Open text
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="radio" name="responseType" checked={responseType === 'multiple'} onChange={() => setResponseType('multiple')} />
            Multiple choice
          </label>
        </fieldset>

        {responseType === 'multiple' && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: 14, fontWeight: 600 }}>Multiple choice options (max 10)</label>
              <button type="button" onClick={addOption} disabled={options.length >= 10} className="join-page__btn" style={{ padding: '8px 16px', fontSize: 13 }}>
                Add option
              </button>
            </div>
            {options.map((opt, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => setOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  className="join-page__input"
                  style={{ flex: 1, marginBottom: 0 }}
                  maxLength={80}
                />
                <button type="button" onClick={() => removeOption(i)} disabled={options.length <= 2} style={{ padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, cursor: options.length <= 2 ? 'not-allowed' : 'pointer' }}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600 }}>Venue name (optional)</label>
        <input
          type="text"
          value={venueName}
          onChange={(e) => setVenueName(e.target.value)}
          placeholder="Your venue or event name"
          className="join-page__input"
          style={{ marginBottom: 12 }}
        />
        <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600 }}>Logo URL (optional)</label>
        <input
          type="url"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://… image URL for display"
          className="join-page__input"
          style={{ marginBottom: 24 }}
        />

        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
          Display: Top 8 results · Group similar answers · Profanity filter — all on by default.
        </p>

        {error && <p style={{ color: 'var(--error)', marginBottom: 16 }}>{error}</p>}

        <button type="submit" className="join-page__btn" disabled={submitting}>
          {submitting ? 'Creating…' : 'Start poll'}
        </button>
      </form>
    </div>
  );
}
