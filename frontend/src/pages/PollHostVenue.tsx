/**
 * Interactive Polling — Single-page Host (venue-based).
 * Route: /poll/join/:venueCode/host
 * Three columns: Share (QR + links) | Poll Setup & Controls | Live results preview.
 * No separate Create Poll page; creation happens here via Start Poll.
 */
import { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSocket } from '../lib/socket';
import type { Socket } from 'socket.io-client';
import { QRCodePanel } from '../components/trivia-room/QRCodePanel';
import { getStoredVenue } from './PollVenueStart';
import '../styles/join.css';

const POLL_TEMPLATES: Record<string, string[]> = {
  Events: [
    'What kind of event would you like to see us host?',
    'Which night works best for trivia?',
    'What theme should our next party have?',
  ],
  'Food & Drink': [
    'What drink should we add to the menu?',
    'What food should we add to the menu?',
    'What\'s your go-to order?',
  ],
  Music: [
    'What song should we play next?',
    'Which decade should we feature?',
    'Who\'s your favorite artist?',
  ],
  Feedback: [
    'How was your experience today?',
    'What could we do better?',
    'What do you love most about this place?',
  ],
};

type PollPayload = {
  pollId: string;
  question: string;
  responseType: string;
  options: string[];
  locked: boolean;
  venueName: string;
  logoUrl: string | null;
  showTicker: boolean;
  grouped: { top8: { label: string; count: number; percentage: number }[]; otherCount: number; total: number };
  recentSubmission: { text: string; at: number } | null;
};

export default function PollHostVenue() {
  const { venueCode } = useParams<{ venueCode: string }>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [payload, setPayload] = useState<PollPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [responseType, setResponseType] = useState<'open' | 'multiple'>('open');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [currentPollId, setCurrentPollId] = useState<string | null>(null);
  const [pollHostToken, setPollHostToken] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const venue = useMemo(() => (venueCode ? getStoredVenue() : null), [venueCode]);
  const venueToken = venue && venue.venueCode === (venueCode || '').toUpperCase() ? venue.hostToken : null;

  useEffect(() => {
    if (!venueCode || !venueToken) return;
    const s = getSocket();
    setSocket(s);
    setConnected(s.connected);
    let hasJoined = false;
    const joinVenue = () => {
      if (!hasJoined && s.connected && venueCode) {
        hasJoined = true;
        s.emit('poll:join-by-venue', { venueCode: venueCode.toUpperCase(), role: 'host', hostToken: venueToken });
      }
    };
    const onConnect = () => {
      setConnected(true);
      joinVenue();
    };
    const onDisconnect = () => setConnected(false);
    const onUpdate = (p: PollPayload) => {
      setPayload(p);
      setCurrentPollId(p?.pollId ?? null);
    };
    const onNoActive = () => {
      setPayload(null);
      setCurrentPollId(null);
      setPollHostToken(null);
    };
    const onStarted = (data: { pollId: string; hostToken: string }) => {
      setCurrentPollId(data.pollId);
      setPollHostToken(data.hostToken);
      setStarting(false);
    };
    const onEnded = () => {
      setPayload(null);
      setCurrentPollId(null);
      setPollHostToken(null);
    };
    const onErr = (e: { message?: string }) => setError(e?.message || 'Error');
    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('poll:update', onUpdate);
    s.on('poll:no-active', onNoActive);
    s.on('poll:started', onStarted);
    s.on('poll:ended', onEnded);
    s.on('poll:error', onErr);
    if (s.connected) joinVenue();
    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('poll:update', onUpdate);
      s.off('poll:no-active', onNoActive);
      s.off('poll:started', onStarted);
      s.off('poll:ended', onEnded);
      s.off('poll:error', onErr);
    };
  }, [venueCode, venueToken]);

  const vc = (venueCode || '').trim().toUpperCase();
  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/poll/join/${vc}` : '';
  const displayUrl = typeof window !== 'undefined' ? `${window.location.origin}/poll/join/${vc}/display` : '';

  const addOption = () => {
    if (options.length >= 10) return;
    setOptions((prev) => [...prev, '']);
  };
  const removeOption = (i: number) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, idx) => idx !== i));
  };
  const setOption = (i: number, v: string) => {
    setOptions((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
  };

  const handleStartPoll = (e: React.FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (!q || !socket?.connected || !vc || !venueToken) {
      if (!q) setError('Enter a poll question');
      return;
    }
    setError(null);
    setStarting(true);
    const opts = responseType === 'multiple'
      ? options.map((o) => o.trim()).filter(Boolean)
      : [];
    if (responseType === 'multiple' && opts.length < 2) {
      setError('Add at least 2 options for multiple choice');
      setStarting(false);
      return;
    }
    socket.emit('poll:start', {
      venueCode: vc,
      hostToken: venueToken,
      question: q,
      responseType,
      options: responseType === 'multiple' ? opts : undefined,
    });
  };

  const handleEndPoll = () => {
    if (!socket?.connected || !vc || !venueToken) return;
    if (!window.confirm('End this poll? Results will be saved.')) return;
    socket.emit('poll:end', { venueCode: vc, hostToken: venueToken });
  };

  const hostAuth = pollHostToken || venueToken;
  const lock = () => {
    if (socket?.connected && currentPollId && hostAuth)
      socket.emit('poll:lock', { pollId: currentPollId, hostToken: hostAuth, locked: true });
  };
  const unlock = () => {
    if (socket?.connected && currentPollId && hostAuth)
      socket.emit('poll:lock', { pollId: currentPollId, hostToken: hostAuth, locked: false });
  };
  const toggleTicker = () => {
    if (socket?.connected && currentPollId && hostAuth)
      socket.emit('poll:ticker', { pollId: currentPollId, hostToken: hostAuth, show: !payload?.showTicker });
  };

  const pickTemplate = (q: string) => {
    setQuestion(q);
    setTemplateOpen(false);
  };

  if (!venueCode) {
    return (
      <div className="join-page">
        <p>Missing venue.</p>
        <Link to="/">← Back to Playroom</Link>
      </div>
    );
  }

  if (!venueToken) {
    return (
      <div className="join-page">
        <p>Invalid or expired venue. Start a new poll from the home page.</p>
        <Link to="/poll/start">Start polling</Link>
      </div>
    );
  }

  return (
    <div className="join-page" style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <p style={{ marginBottom: 16 }}>
        <Link to="/" className="join-page__back">← Back to Playroom</Link>
      </p>

      {error && (
        <div style={{ marginBottom: 16, padding: 12, background: 'var(--error)', color: '#fff', borderRadius: 8 }} onClick={() => setError(null)}>
          {error}
        </div>
      )}

      {!connected && (
        <div style={{ marginBottom: 16, padding: 12, background: 'var(--warning)', color: '#1a1a1a', borderRadius: 8, fontSize: 14 }}>
          Not connected. Buttons will work once connected.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) minmax(280px, 1.4fr) minmax(200px, 1fr)', gap: 24, alignItems: 'start' }}>
        {/* LEFT — Share (QR + links only) */}
        <div style={{ position: 'sticky', top: 16 }}>
          <QRCodePanel joinUrl={joinUrl} label="Scan to vote" size={180} />
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <a href={joinUrl} target="_blank" rel="noopener noreferrer" className="join-page__btn" style={{ textAlign: 'center', fontSize: 13 }}>Open player link</a>
            <a href={displayUrl} target="_blank" rel="noopener noreferrer" className="join-page__btn" style={{ textAlign: 'center', fontSize: 13, background: 'var(--surface)', color: 'var(--text)' }}>Open TV display</a>
          </div>
          <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: connected ? 'var(--success)' : 'var(--text-muted)' }} />
            {connected ? 'Connected' : 'Connecting…'}
          </p>
          {payload && (
            <p style={{ marginTop: 4, fontSize: 13, color: 'var(--text-muted)' }}>
              {payload.locked ? 'Voting closed' : 'Voting open'}
            </p>
          )}
        </div>

        {/* CENTER — Poll Setup & Controls */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>Poll setup & controls</h2>
          <form onSubmit={handleStartPoll} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Poll question</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your poll question…"
                className="join-page__input"
                style={{ minHeight: 80, width: '100%', resize: 'vertical' }}
                maxLength={300}
                disabled={!!currentPollId}
              />
              <p style={{ marginTop: 4, fontSize: 12, color: 'var(--text-muted)' }}>e.g. What drink should we add to the menu?</p>
            </div>

            <div style={{ position: 'relative' }}>
              <button type="button" className="join-page__btn" style={{ background: 'var(--surface)', color: 'var(--text)' }} onClick={() => setTemplateOpen(!templateOpen)}>
                Templates {templateOpen ? '▲' : '▼'}
              </button>
              {templateOpen && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 100, maxHeight: 280, overflowY: 'auto' }}>
                  {Object.entries(POLL_TEMPLATES).map(([cat, questions]) => (
                    <div key={cat} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>{cat}</div>
                      {questions.map((q, i) => (
                        <button key={i} type="button" style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: 'var(--text)' }} onClick={() => pickTemplate(q)}>
                          {q}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <span style={{ fontSize: 14, fontWeight: 600, marginRight: 12 }}>Response type</span>
              <label style={{ marginRight: 12 }}>
                <input type="radio" name="responseType" checked={responseType === 'open'} onChange={() => setResponseType('open')} disabled={!!currentPollId} /> Open text
              </label>
              <label>
                <input type="radio" name="responseType" checked={responseType === 'multiple'} onChange={() => setResponseType('multiple')} disabled={!!currentPollId} /> Multiple choice
              </label>
            </div>

            {responseType === 'multiple' && (
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Options (max 10)</label>
                {options.map((opt, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => setOption(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      className="join-page__input"
                      style={{ flex: 1 }}
                      maxLength={80}
                      disabled={!!currentPollId}
                    />
                    <button type="button" onClick={() => removeOption(i)} disabled={options.length <= 2 || !!currentPollId} style={{ padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>Remove</button>
                  </div>
                ))}
                <button type="button" onClick={addOption} disabled={options.length >= 10 || !!currentPollId} className="join-page__btn" style={{ fontSize: 13 }}>Add option</button>
              </div>
            )}

            {!currentPollId ? (
              <button type="submit" className="join-page__btn" disabled={!connected || starting || !question.trim()}>
                {starting ? 'Starting…' : 'Start poll'}
              </button>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button type="button" className="join-page__btn" onClick={handleEndPoll} disabled={!connected}>End poll</button>
                {payload?.locked ? (
                  <button type="button" className="join-page__btn" style={{ background: 'var(--surface)', color: 'var(--text)' }} onClick={unlock} disabled={!connected}>Unlock</button>
                ) : (
                  <button type="button" className="join-page__btn" style={{ background: 'var(--surface)', color: 'var(--text)' }} onClick={lock} disabled={!connected}>Lock</button>
                )}
                <button type="button" className="join-page__btn" style={{ background: 'var(--surface)', color: 'var(--text)' }} onClick={toggleTicker} disabled={!connected}>
                  Ticker: {payload?.showTicker ? 'On' : 'Off'}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* RIGHT — Live results preview */}
        <div style={{ position: 'sticky', top: 16, padding: 16, background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>Live results</h2>
          {!payload ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No active poll. Start a poll to see results here.</p>
          ) : (
            <>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>{payload.grouped?.total ?? 0} response(s)</p>
              {payload.grouped?.top8?.length ? (
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
                  {payload.grouped.top8.slice(0, 5).map((e, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>{e.label} — {e.count}</li>
                  ))}
                  {payload.grouped.otherCount > 0 && <li style={{ color: 'var(--text-muted)' }}>Other: {payload.grouped.otherCount}</li>}
                </ul>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No responses yet.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
