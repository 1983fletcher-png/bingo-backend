/**
 * Interactive Polling — Player view (phone). Scan QR → this page.
 * Route: /poll/:pollId — question, input, submit, venue drawer (collapsed), footer.
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getSocket } from '../lib/socket';
import type { Socket } from 'socket.io-client';
import '../styles/join.css';

type PollPayload = {
  pollId: string;
  question: string;
  responseType: string;
  options: string[];
  locked: boolean;
  venueName: string;
  grouped: { total: number };
};

export default function PollPlayer() {
  const { pollId } = useParams<{ pollId: string }>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [payload, setPayload] = useState<PollPayload | null>(null);
  const [text, setText] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitCooldown, setSubmitCooldown] = useState(false);
  const [venueDrawerOpen, setVenueDrawerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionTimeout, setConnectionTimeout] = useState(false);

  const join = useCallback(() => {
    if (!socket?.connected || !pollId) return;
    socket.emit('poll:join', { pollId, role: 'player' });
  }, [socket, pollId]);

  useEffect(() => {
    if (!pollId) return;
    setConnectionTimeout(false);
    const s = getSocket();
    setSocket(s);
    const onUpdate = (p: PollPayload) => setPayload(p);
    const onErr = (e: { message?: string }) => setError(e?.message || 'Error');
    s.on('poll:update', onUpdate);
    s.on('poll:error', onErr);
    join();
    const t = window.setTimeout(() => {
      setConnectionTimeout((prev) => {
        if (prev) return prev;
        return true;
      });
    }, 8000);
    return () => {
      window.clearTimeout(t);
      s.off('poll:update', onUpdate);
      s.off('poll:error', onErr);
    };
  }, [pollId, join]);

  const canSubmit = payload && !payload.locked && socket?.connected;
  const isMultiple = payload?.responseType === 'multiple';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pollId || !socket?.connected || submitCooldown) return;
    if (payload?.locked) return;
    if (isMultiple) {
      if (!selectedOption) return;
      socket.emit('poll:submit', { pollId, optionId: selectedOption });
    } else {
      const t = text.trim();
      if (!t) return;
      socket.emit('poll:submit', { pollId, text: t });
    }
    setSubmitted(true);
    setSubmitCooldown(true);
    setTimeout(() => setSubmitCooldown(false), 1500);
  };

  if (!pollId) {
    return (
      <div className="join-page">
        <p>Missing poll ID.</p>
        <a href="/">Go home</a>
      </div>
    );
  }

  if (error) {
    return (
      <div className="join-page">
        <p>{error}</p>
        <a href="/">Go home</a>
      </div>
    );
  }

  return (
    <div className="join-page" style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!payload ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <p>Connecting…</p>
          {connectionTimeout && (
            <p style={{ marginTop: 16, fontSize: 14, color: 'var(--text-muted)', maxWidth: 320, marginLeft: 'auto', marginRight: 'auto' }}>
              Couldn&apos;t load the poll. Check your connection. On the live site, the host may need to set the backend URL (VITE_SOCKET_URL) in Netlify and redeploy.
            </p>
          )}
        </div>
      ) : (
        <>
          <h1 style={{ fontSize: 22, margin: '0 0 24px', lineHeight: 1.3 }}>{payload.question}</h1>

          {submitted && payload.locked ? (
            <p style={{ padding: 16, background: 'var(--surface)', borderRadius: 12, color: 'var(--success)', fontWeight: 600 }}>
              Thanks! Your response was recorded.
            </p>
          ) : submitted ? (
            <div style={{ marginBottom: 20 }}>
              <p style={{ padding: 16, background: 'var(--surface)', borderRadius: 12, color: 'var(--success)', fontWeight: 600 }}>
                Thanks! You can change your answer until the host locks the poll.
              </p>
              <button
                type="button"
                className="join-page__btn"
                style={{ marginTop: 12, background: 'var(--surface)', color: 'var(--text)' }}
                onClick={() => setSubmitted(false)}
              >
                Change answer
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {isMultiple ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {payload.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className="join-page__btn"
                      style={{
                        background: selectedOption === opt ? 'var(--accent)' : 'var(--surface)',
                        color: selectedOption === opt ? '#fff' : 'var(--text)',
                        border: selectedOption === opt ? '2px solid var(--accent)' : '2px solid var(--border)',
                      }}
                      onClick={() => setSelectedOption(opt)}
                      disabled={payload.locked}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Your answer"
                  className="join-page__input"
                  style={{ marginBottom: 20 }}
                  maxLength={500}
                  disabled={payload.locked}
                  autoFocus
                />
              )}
              <button type="submit" className="join-page__btn" disabled={!canSubmit || submitCooldown || (isMultiple ? !selectedOption : !text.trim())}>
                {submitCooldown ? 'Sending…' : 'Submit'}
              </button>
            </form>
          )}

          {payload.locked && !submitted && (
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>This poll is closed.</p>
          )}

          {/* Venue drawer — collapsed by default */}
          {payload.venueName && (
            <div style={{ marginTop: 32, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <button
                type="button"
                onClick={() => setVenueDrawerOpen((o) => !o)}
                style={{
                  width: '100%',
                  padding: 12,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--text)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {payload.venueName} {venueDrawerOpen ? '▼' : '▶'}
              </button>
              {venueDrawerOpen && (
                <div style={{ marginTop: 8, padding: 12, background: 'var(--surface)', borderRadius: 8, fontSize: 14, color: 'var(--text-muted)' }}>
                  <p style={{ margin: 0 }}>Venue info — add menu link, events, social in a future update.</p>
                </div>
              )}
            </div>
          )}

          <footer style={{ marginTop: 'auto', paddingTop: 32, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
            Hosted by The Playroom
          </footer>
        </>
      )}
    </div>
  );
}
