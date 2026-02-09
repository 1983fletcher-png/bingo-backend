/**
 * Interactive Polling — Host view.
 * Route: /poll/:pollId/host — QR, controls (lock, clear, reset, export, ticker), display link.
 */
import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSocket, getSocketBackendLabel, isBackendUrlSet } from '../lib/socket';
import type { Socket } from 'socket.io-client';
import { QRCodePanel } from '../components/trivia-room/QRCodePanel';
import '../styles/join.css';

const POLL_HOST_KEY = 'playroom_poll_host';

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

function getStoredHostToken(pollId: string): string | null {
  try {
    const raw = localStorage.getItem(POLL_HOST_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data?.pollId === pollId ? data.hostToken : null;
  } catch {
    return null;
  }
}

function saveHostToken(pollId: string, hostToken: string) {
  try {
    localStorage.setItem(POLL_HOST_KEY, JSON.stringify({ pollId, hostToken }));
  } catch (_) {}
}

export default function PollHost() {
  const { pollId } = useParams<{ pollId: string }>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [payload, setPayload] = useState<PollPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const hostToken = pollId ? getStoredHostToken(pollId) : null;

  const join = useCallback(() => {
    if (!socket?.connected || !pollId) return;
    socket.emit('poll:join', { pollId, role: 'host', hostToken });
  }, [socket, pollId, hostToken]);

  useEffect(() => {
    if (!pollId) return;
    const s = getSocket();
    setSocket(s);
    setConnected(s.connected);
    if (hostToken) saveHostToken(pollId, hostToken);
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onUpdate = (p: PollPayload) => setPayload(p);
    const onErr = (e: { message?: string }) => setError(e?.message || 'Error');
    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('poll:update', onUpdate);
    s.on('poll:error', onErr);
    join();
    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('poll:update', onUpdate);
      s.off('poll:error', onErr);
    };
  }, [pollId, join, hostToken]);


  const lock = () => {
    if (socket?.connected && pollId && hostToken) socket.emit('poll:lock', { pollId, hostToken, locked: true });
  };
  const unlock = () => {
    if (socket?.connected && pollId && hostToken) socket.emit('poll:lock', { pollId, hostToken, locked: false });
  };
  const clear = () => {
    if (socket?.connected && pollId && hostToken && window.confirm('Clear all responses?')) socket.emit('poll:clear', { pollId, hostToken });
  };
  const reset = () => {
    if (socket?.connected && pollId && hostToken && window.confirm('Reset poll (clear and unlock)?')) socket.emit('poll:reset', { pollId, hostToken });
  };
  const toggleTicker = () => {
    if (socket?.connected && pollId && hostToken) socket.emit('poll:ticker', { pollId, hostToken, show: !payload?.showTicker });
  };
  const exportData = (format: 'json' | 'csv') => {
    if (!socket?.connected || !pollId || !hostToken) return;
    socket.emit('poll:export', { pollId, hostToken });
    const onExport = (data: Record<string, unknown> & { grouped?: { label: string; count: number }[]; total?: number; question?: string }) => {
      socket?.off('poll:export-ok', onExport);
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `poll-${pollId}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
      } else {
        const rows = [['Question', data.question ?? ''], ['Total responses', String(data.total ?? 0)], []];
        const grp = data.grouped;
        if (Array.isArray(grp)) {
          rows.push(['Answer', 'Count']);
          grp.forEach((e) => rows.push([e.label, String(e.count)]));
        }
        const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `poll-${pollId}-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
      }
    };
    socket.once('poll:export-ok', onExport);
  };

  if (!pollId) {
    return (
      <div className="join-page">
        <p>Missing poll ID.</p>
        <Link to="/">Go home</Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="join-page">
        <p>{error}</p>
        <Link to="/">Go home</Link>
      </div>
    );
  }

  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/poll/${pollId}` : '';
  const displayUrl = typeof window !== 'undefined' ? `${window.location.origin}/poll/${pollId}/display` : '';

  return (
    <div className="join-page" style={{ maxWidth: 640, margin: '0 auto' }}>
      <p style={{ marginBottom: 16 }}>
        <Link to="/" className="join-page__back">← Back to home</Link>
      </p>

      {!connected && (
        <div style={{ marginBottom: 16, padding: 12, background: 'var(--warning)', color: '#1a1a1a', borderRadius: 8, fontSize: 14 }}>
          <p style={{ margin: 0, fontWeight: 600 }}>Not connected to server</p>
          <p style={{ margin: '6px 0 0', fontSize: 13 }}>
            Buttons below won&apos;t work until the app connects. This build uses: <strong>{getSocketBackendLabel()}</strong>.
            {!isBackendUrlSet() && (
              <span> Set <strong>VITE_SOCKET_URL</strong> in Netlify to your Railway URL and redeploy (build-time variable).</span>
            )}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start', marginBottom: 24 }}>
        <div style={{ flex: '0 0 auto' }}>
          <QRCodePanel joinUrl={joinUrl} label="Scan to vote" size={160} />
          <p style={{ marginTop: 8, fontSize: 14, fontWeight: 600 }}>Poll code: {pollId}</p>
          <a href={joinUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, wordBreak: 'break-all' }}>{joinUrl}</a>
          <p style={{ marginTop: 12 }}>
            <a href={displayUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, fontWeight: 600 }}>
              Open display for TV →
            </a>
          </p>
        </div>
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <h1 style={{ fontSize: 20, margin: '0 0 8px' }}>{payload?.question || 'Loading…'}</h1>
          {payload?.venueName && <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>{payload.venueName}</p>}
          <p style={{ marginTop: 12, fontSize: 14 }}>
            {payload?.grouped?.total ?? 0} response(s) · {payload?.locked ? 'Locked' : 'Open'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
            {payload?.locked ? (
              <button type="button" className="join-page__btn" onClick={unlock} disabled={!connected}>Unlock poll</button>
            ) : (
              <button type="button" className="join-page__btn" onClick={lock} disabled={!connected}>Lock poll</button>
            )}
            <button type="button" className="join-page__btn" style={{ background: 'var(--surface)', color: 'var(--text)' }} onClick={toggleTicker} disabled={!connected}>
              Live ticker: {payload?.showTicker ? 'On' : 'Off'}
            </button>
            <button type="button" className="join-page__btn" style={{ background: 'var(--surface)', color: 'var(--text)' }} onClick={clear} disabled={!connected}>Clear results</button>
            <button type="button" className="join-page__btn" style={{ background: 'var(--surface)', color: 'var(--text)' }} onClick={reset} disabled={!connected}>Reset poll</button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="join-page__btn" style={{ flex: 1, background: 'var(--surface)', color: 'var(--text)' }} onClick={() => exportData('csv')} disabled={!connected}>Export CSV</button>
              <button type="button" className="join-page__btn" style={{ flex: 1, background: 'var(--surface)', color: 'var(--text)' }} onClick={() => exportData('json')} disabled={!connected}>Export JSON</button>
            </div>
          </div>
        </div>
      </div>

      {payload?.grouped && payload.grouped.top8.length > 0 && (
        <div style={{ marginTop: 24, padding: 16, background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 16 }}>Top answers</h2>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {payload.grouped.top8.map((e, i) => (
              <li key={i} style={{ marginBottom: 4 }}>{e.label} — {e.count} ({e.percentage}%)</li>
            ))}
          </ul>
          {payload.grouped.otherCount > 0 && (
            <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-muted)' }}>Other answers: {payload.grouped.otherCount}</p>
          )}
        </div>
      )}
    </div>
  );
}
