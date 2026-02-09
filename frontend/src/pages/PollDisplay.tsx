/**
 * Interactive Polling — Display view (TV / projector).
 * Route: /poll/:pollId/display — Top 8, Other bucket, live ticker, QR at bottom.
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getSocket } from '../lib/socket';
import type { Socket } from 'socket.io-client';
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
function maskForDisplay(text: string): string {
  if (!text) return '';
  let out = text;
  const re = new RegExp(PROFANITY.join('|'), 'gi');
  out = out.replace(re, (m) => m[0] + '***');
  return out;
}

export default function PollDisplay() {
  const { pollId } = useParams<{ pollId: string }>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [payload, setPayload] = useState<PollPayload | null>(null);
  const [tickerItems, setTickerItems] = useState<string[]>([]);

  const join = useCallback(() => {
    if (!socket?.connected || !pollId) return;
    socket.emit('poll:join', { pollId, role: 'display' });
  }, [socket, pollId]);

  useEffect(() => {
    if (!pollId) return;
    const s = getSocket();
    setSocket(s);
    const onUpdate = (p: PollPayload) => {
      setPayload(p);
      if (p.recentSubmission && p.showTicker) {
        setTickerItems((prev) => [p.recentSubmission!.text, ...prev.slice(0, 14)]);
      }
    };
    s.on('poll:update', onUpdate);
    join();
    return () => {
      s.off('poll:update', onUpdate);
    };
  }, [pollId, join]);

  if (!pollId) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <p>Missing poll ID.</p>
      </div>
    );
  }

  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/poll/${pollId}` : '';
  const qrSrc = joinUrl ? `${QR_API}?size=120x120&margin=4&data=${encodeURIComponent(joinUrl)}` : '';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        padding: 32,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {payload?.logoUrl && (
        <img src={payload.logoUrl} alt="" style={{ height: 48, marginBottom: 16, objectFit: 'contain' }} />
      )}
      <h1 style={{ fontSize: 'clamp(24px, 4vw, 42px)', margin: '0 0 8px', textAlign: 'center', maxWidth: 900 }}>
        {payload?.question || 'Loading…'}
      </h1>
      {payload?.venueName && (
        <p style={{ margin: 0, fontSize: 18, color: 'var(--text-muted)' }}>{payload.venueName}</p>
      )}

      <div style={{ flex: 1, width: '100%', maxWidth: 900, marginTop: 32, display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {payload?.grouped?.top8?.map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ flex: '0 0 40px', fontWeight: 700, fontSize: 18 }}>#{i + 1}</span>
              <span style={{ flex: '1 1 200px', fontSize: 'clamp(16px, 2.5vw, 24px)', fontWeight: 600 }}>
                {maskForDisplay(e.label)}
              </span>
              <span style={{ flex: '0 0 60px', textAlign: 'right', fontWeight: 700 }}>{e.count}</span>
              <div
                style={{
                  flex: '0 0 120px',
                  height: 24,
                  background: 'var(--surface)',
                  borderRadius: 12,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${e.percentage}%`,
                    height: '100%',
                    background: 'var(--accent)',
                    borderRadius: 12,
                    minWidth: e.count > 0 ? 4 : 0,
                  }}
                />
              </div>
            </div>
          ))}
          {payload?.grouped && payload.grouped.otherCount > 0 && (
            <p style={{ marginTop: 8, fontSize: 18, color: 'var(--text-muted)' }}>
              Other answers: {payload.grouped.otherCount}
            </p>
          )}
        </div>

        {payload?.showTicker && tickerItems.length > 0 && (
          <div
            style={{
              padding: 16,
              background: 'var(--surface)',
              borderRadius: 12,
              border: '1px solid var(--border)',
              minWidth: 200,
              maxHeight: 300,
              overflow: 'auto',
            }}
          >
            <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Live
            </p>
            {tickerItems.map((item, i) => (
              <p key={i} style={{ margin: '4px 0', fontSize: 14 }}>{maskForDisplay(item)}</p>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>Scan to vote</p>
        {qrSrc && <img src={qrSrc} alt="QR code to vote" style={{ width: 120, height: 120, borderRadius: 8, border: '2px solid var(--border)' }} />}
      </div>
    </div>
  );
}
