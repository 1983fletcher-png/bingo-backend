/**
 * Interactive Polling — Player view (venue-based). Same link for every poll.
 * Route: /poll/join/:venueCode — join by venue, show current poll or no-active state.
 */
import { useState, useEffect } from 'react';
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

export default function PollPlayerVenue() {
  const { venueCode } = useParams<{ venueCode: string }>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [payload, setPayload] = useState<PollPayload | null>(null);
  const [text, setText] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitCooldown, setSubmitCooldown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noActive, setNoActive] = useState(false);
  const [connectionTimeout, setConnectionTimeout] = useState(false);

  useEffect(() => {
    if (!venueCode) return;
    setConnectionTimeout(false);
    setNoActive(false);
    const s = getSocket();
    setSocket(s);
    let hasJoined = false;
    const join = () => {
      if (!hasJoined && s.connected && venueCode) {
        hasJoined = true;
        s.emit('poll:join-by-venue', { venueCode: venueCode.toUpperCase(), role: 'player' });
      }
    };
    const onUpdate = (p: PollPayload) => {
      setPayload(p);
      setNoActive(false);
    };
    const onNoActive = () => {
      setPayload(null);
      setNoActive(true);
    };
    const onErr = (e: { message?: string }) => setError(e?.message || 'Error');
    s.on('connect', join);
    s.on('poll:update', onUpdate);
    s.on('poll:no-active', onNoActive);
    s.on('poll:error', onErr);
    if (s.connected) join();
    const t = window.setTimeout(() => setConnectionTimeout(true), 8000);
    return () => {
      window.clearTimeout(t);
      s.off('connect', join);
      s.off('poll:update', onUpdate);
      s.off('poll:no-active', onNoActive);
      s.off('poll:error', onErr);
    };
  }, [venueCode]);

  const canSubmit = payload && !payload.locked && socket?.connected;
  const isMultiple = payload?.responseType === 'multiple';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payload?.pollId || !socket?.connected || submitCooldown || payload.locked) return;
    if (isMultiple) {
      if (!selectedOption) return;
      socket.emit('poll:submit', { pollId: payload.pollId, optionId: selectedOption });
    } else {
      const t = text.trim();
      if (!t) return;
      socket.emit('poll:submit', { pollId: payload.pollId, text: t });
    }
    setSubmitted(true);
    setSubmitCooldown(true);
    setTimeout(() => setSubmitCooldown(false), 1500);
  };

  if (!venueCode) {
    return (
      <div className="join-page">
        <p>Missing venue code.</p>
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

  if (noActive && !payload) {
    return (
      <div className="join-page" style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', padding: 48 }}>
        <p style={{ fontSize: 18, marginBottom: 8 }}>No active poll</p>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Check back soon. Your host will start a poll shortly.</p>
      </div>
    );
  }

  if (!payload && connectionTimeout) {
    return (
      <div className="join-page" style={{ textAlign: 'center', padding: 48 }}>
        <p>Connecting…</p>
        <p style={{ marginTop: 16, fontSize: 14, color: 'var(--text-muted)' }}>Couldn&apos;t load. Check your connection.</p>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="join-page" style={{ textAlign: 'center', padding: 48 }}>
        <p>Connecting…</p>
      </div>
    );
  }

  return (
    <div className="join-page" style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ fontSize: 22, margin: '0 0 24px', lineHeight: 1.3 }}>{payload.question}</h1>

      {submitted && payload.locked ? (
        <p style={{ padding: 16, background: 'var(--surface)', borderRadius: 12, color: 'var(--success)', fontWeight: 600 }}>Thanks! Your response was recorded.</p>
      ) : submitted ? (
        <div style={{ marginBottom: 20 }}>
          <p style={{ padding: 16, background: 'var(--surface)', borderRadius: 12, color: 'var(--success)', fontWeight: 600 }}>Thanks! You can change your answer until the host locks the poll.</p>
          <button type="button" className="join-page__btn" style={{ marginTop: 12, background: 'var(--surface)', color: 'var(--text)' }} onClick={() => setSubmitted(false)}>Change answer</button>
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

      {payload.locked && !submitted && <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>This poll is closed.</p>}

      <footer style={{ marginTop: 'auto', paddingTop: 32, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
        Hosted by The Playroom
      </footer>
    </div>
  );
}
