/**
 * Interactive Polling — TV Display (venue-based). Never scrolls.
 * Route: /poll/join/:venueCode/display — viewport-only layout.
 */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSocket } from '../lib/socket';
import '../styles/join.css';

const QR_API = 'https://api.qrserver.com/v1/create-qr-code/';

type PollPayload = {
  pollId: string;
  question: string;
  venueName: string;
  logoUrl: string | null;
  showTicker: boolean;
  grouped: {
    top8: { label: string; count: number; percentage: number }[];
    otherCount: number;
    total: number;
  };
  recentSubmission: { text: string; at: number } | null;
};

const PROFANITY = ['ass', 'butt', 'damn', 'crap', 'shit', 'fuck', 'bitch', 'dick', 'hell', 'piss'];
function mask(t: string) {
  if (!t) return '';
  let out = t;
  const re = new RegExp(PROFANITY.join('|'), 'gi');
  return out.replace(re, (m) => m[0] + '***');
}

export default function PollDisplayVenue() {
  const { venueCode } = useParams<{ venueCode: string }>();
  const [payload, setPayload] = useState<PollPayload | null>(null);
  const [tickerItems, setTickerItems] = useState<string[]>([]);
  const [noActive, setNoActive] = useState(false);

  useEffect(() => {
    if (!venueCode) return;
    const s = getSocket();
    let hasJoined = false;
    const join = () => {
      if (!hasJoined && s.connected && venueCode) {
        hasJoined = true;
        s.emit('poll:join-by-venue', { venueCode: venueCode.toUpperCase(), role: 'display' });
      }
    };
    const onUpdate = (p: PollPayload) => {
      setPayload(p);
      setNoActive(false);
      if (p.recentSubmission && p.showTicker)
        setTickerItems((prev) => [p.recentSubmission!.text, ...prev.slice(0, 14)]);
    };
    const onNoActive = () => {
      setPayload(null);
      setNoActive(true);
    };
    s.on('connect', join);
    s.on('poll:update', onUpdate);
    s.on('poll:no-active', onNoActive);
    if (s.connected) join();
    return () => {
      s.off('connect', join);
      s.off('poll:update', onUpdate);
      s.off('poll:no-active', onNoActive);
    };
  }, [venueCode]);

  const vc = (venueCode || '').trim().toUpperCase();
  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/poll/join/${vc}` : '';
  const qrSize = 200;
  const qrSrc = joinUrl ? `${QR_API}?size=${qrSize}x${qrSize}&margin=6&data=${encodeURIComponent(joinUrl)}` : '';

  if (!venueCode) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, textAlign: 'center' }}>
        <p>Missing venue code.</p>
      </div>
    );
  }

  if (noActive && !payload) {
    return (
      <div
        style={{
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg)',
          color: 'var(--text)',
          padding: 32,
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: 'clamp(24px, 4vw, 48px)', margin: 0 }}>No active poll</p>
        <p style={{ fontSize: 'clamp(16px, 2vw, 24px)', color: 'var(--text-muted)', marginTop: 16 }}>Check back soon.</p>
      </div>
    );
  }

  if (!payload) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--text)' }}>
        <p>Connecting…</p>
      </div>
    );
  }

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg)',
        color: 'var(--text)',
        padding: 'clamp(16px, 2vw, 32px)',
        boxSizing: 'border-box',
      }}
    >
      {payload.logoUrl && (
        <img src={payload.logoUrl} alt="" style={{ height: 48, marginBottom: 12, objectFit: 'contain' }} />
      )}
      <h1
        style={{
          fontSize: 'clamp(28px, 5vw, 56px)',
          margin: '0 0 8px',
          textAlign: 'center',
          lineHeight: 1.2,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {payload.question}
      </h1>
      {payload.venueName && (
        <p style={{ margin: 0, fontSize: 'clamp(14px, 1.5vw, 22px)', color: 'var(--text-muted)', textAlign: 'center', flexShrink: 0 }}>{payload.venueName}</p>
      )}

      <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 24, alignItems: 'stretch', marginTop: 16 }}>
        <div style={{ flex: 1, minWidth: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {payload.grouped?.top8?.map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
              <span style={{ flex: '0 0 40px', fontWeight: 700, fontSize: 'clamp(16px, 2.5vw, 28px)' }}>#{i + 1}</span>
              <span style={{ flex: '1 1 200px', fontSize: 'clamp(16px, 2.5vw, 28px)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {mask(e.label)}
              </span>
              <span style={{ flex: '0 0 48px', textAlign: 'right', fontWeight: 700, fontSize: 'clamp(14px, 2vw, 22px)' }}>{e.count}</span>
              <div style={{ flex: '0 0 120px', height: 24, background: 'var(--surface)', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ width: `${e.percentage}%`, height: '100%', background: 'var(--accent)', borderRadius: 8, minWidth: e.count > 0 ? 6 : 0 }} />
              </div>
            </div>
          ))}
          {payload.grouped?.otherCount > 0 && (
            <p style={{ marginTop: 4, fontSize: 'clamp(14px, 1.5vw, 20px)', color: 'var(--text-muted)', flexShrink: 0 }}>Other: {payload.grouped.otherCount}</p>
          )}
        </div>

        {payload.showTicker && tickerItems.length > 0 && (
          <div style={{ flex: '0 0 180px', padding: 12, background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'auto' }}>
            <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Live</p>
            {tickerItems.map((item, i) => (
              <p key={i} style={{ margin: '4px 0', fontSize: 13 }}>{mask(item)}</p>
            ))}
          </div>
        )}
      </div>

      <div style={{ flexShrink: 0, marginTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <p style={{ margin: 0, fontSize: 'clamp(14px, 1.5vw, 22px)', fontWeight: 600 }}>Scan to vote</p>
        {qrSrc && <img src={qrSrc} alt="QR to vote" style={{ width: qrSize, height: qrSize, borderRadius: 12, border: '3px solid var(--border)' }} />}
      </div>
    </div>
  );
}
