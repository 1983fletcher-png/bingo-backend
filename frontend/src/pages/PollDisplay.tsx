/**
 * Interactive Polling — Display view (TV / projector).
 * Route: /poll/:pollId/display — Top 8, Other bucket, live ticker, QR at bottom.
 * Universal casting support: Chromecast, AirPlay, screen mirroring instructions.
 */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSocket } from '../lib/socket';
import '../styles/join.css';

const QR_API = 'https://api.qrserver.com/v1/create-qr-code/';

function CastingHelper({ displayUrl }: { displayUrl: string }) {
  const [showHelp, setShowHelp] = useState(false);
  const [isChrome, setIsChrome] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ua = navigator.userAgent.toLowerCase();
    setIsChrome(ua.includes('chrome') && !ua.includes('edg'));
    setIsSafari(ua.includes('safari') && !ua.includes('chrome'));
    setIsMobile(/android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua));
  }, []);

  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}>
      <button
        onClick={() => setShowHelp(!showHelp)}
        style={{
          padding: '10px 16px',
          background: 'var(--accent)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        📺 Cast to TV
      </button>
      {showHelp && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 8,
            width: 320,
            maxWidth: '90vw',
            background: 'var(--bg)',
            border: '2px solid var(--border)',
            borderRadius: 12,
            padding: 20,
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Cast to any device</h3>
            <button
              onClick={() => setShowHelp(false)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: 20,
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: 0,
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ×
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {isChrome && (
              <div>
                <strong style={{ display: 'block', marginBottom: 4 }}>Chromecast / Google TV:</strong>
                <span>Click the cast icon in Chrome toolbar (top right) → select your TV</span>
              </div>
            )}
            {isSafari && (
              <div>
                <strong style={{ display: 'block', marginBottom: 4 }}>AirPlay (Apple TV):</strong>
                <span>Click AirPlay icon in Safari toolbar → select your Apple TV</span>
              </div>
            )}
            {isMobile && (
              <div>
                <strong style={{ display: 'block', marginBottom: 4 }}>Screen mirroring:</strong>
                <span>
                  {isMobile && /iphone|ipad/i.test(navigator.userAgent)
                    ? 'Control Center → Screen Mirroring → select device'
                    : 'Pull down notifications → Cast / Screen mirror → select device'}
                </span>
              </div>
            )}
            <div>
              <strong style={{ display: 'block', marginBottom: 4 }}>Smart TV browser:</strong>
              <span>Open this URL on your TV&apos;s browser:</span>
              <div
                style={{
                  marginTop: 6,
                  padding: 8,
                  background: 'var(--surface)',
                  borderRadius: 6,
                  fontSize: 11,
                  wordBreak: 'break-all',
                  fontFamily: 'monospace',
                }}
              >
                {displayUrl}
              </div>
            </div>
            <div>
              <strong style={{ display: 'block', marginBottom: 4 }}>Roku / Firestick:</strong>
              <span>Use browser app (e.g., Web Browser) → enter URL above</span>
            </div>
            <div style={{ marginTop: 8, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <strong style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                💡 Tip:
              </strong>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                This page works on any device. Open it on your TV&apos;s browser, or cast your screen from any device.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [payload, setPayload] = useState<PollPayload | null>(null);
  const [tickerItems, setTickerItems] = useState<string[]>([]);
  const [connectionTimeout, setConnectionTimeout] = useState(false);

  useEffect(() => {
    if (!pollId) return;
    setConnectionTimeout(false);
    const s = getSocket();
    
    let hasJoined = false;
    
    const joinPoll = () => {
      if (!hasJoined && s.connected && pollId) {
        hasJoined = true;
        s.emit('poll:join', { pollId, role: 'display' });
      }
    };
    
    const onConnect = () => {
      joinPoll();
    };
    
    const onUpdate = (p: PollPayload) => {
      setPayload(p);
      if (p.recentSubmission && p.showTicker) {
        setTickerItems((prev) => [p.recentSubmission!.text, ...prev.slice(0, 14)]);
      }
    };
    
    s.on('connect', onConnect);
    s.on('poll:update', onUpdate);
    
    // Join immediately if already connected
    if (s.connected) {
      joinPoll();
    }
    
    const t = window.setTimeout(() => setConnectionTimeout(true), 8000);
    
    return () => {
      hasJoined = false;
      window.clearTimeout(t);
      s.off('connect', onConnect);
      s.off('poll:update', onUpdate);
    };
  }, [pollId]);

  if (!pollId) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <p>Missing poll ID.</p>
      </div>
    );
  }

  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/poll/${pollId}` : '';
  const qrSize = 280;
  const qrSrc = joinUrl ? `${QR_API}?size=${qrSize}x${qrSize}&margin=8&data=${encodeURIComponent(joinUrl)}` : '';

  if (!payload && connectionTimeout) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, textAlign: 'center' }}>
        <div>
          <p style={{ fontSize: 20, marginBottom: 16 }}>Couldn&apos;t load the poll</p>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 400 }}>
            Check your connection. On the live site, set VITE_SOCKET_URL in Netlify to your backend URL and redeploy.
          </p>
        </div>
      </div>
    );
  }

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
        position: 'relative',
      }}
    >
      <CastingHelper displayUrl={joinUrl} />
      {payload?.logoUrl && (
        <img src={payload.logoUrl} alt="" style={{ height: 56, marginBottom: 20, objectFit: 'contain' }} />
      )}
      <h1 style={{ fontSize: 'clamp(36px, 8vw, 80px)', margin: '0 0 12px', textAlign: 'center', maxWidth: 1000, lineHeight: 1.2, fontWeight: 700 }}>
        {payload?.question || 'Loading…'}
      </h1>
      {payload?.venueName && (
        <p style={{ margin: 0, fontSize: 'clamp(18px, 2.5vw, 28px)', color: 'var(--text-muted)' }}>{payload.venueName}</p>
      )}

      <div style={{ flex: 1, width: '100%', maxWidth: 1000, marginTop: 40, display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {payload?.grouped?.top8?.map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <span style={{ flex: '0 0 56px', fontWeight: 700, fontSize: 'clamp(20px, 3vw, 32px)' }}>#{i + 1}</span>
              <span style={{ flex: '1 1 260px', fontSize: 'clamp(20px, 3.5vw, 36px)', fontWeight: 600 }}>
                {maskForDisplay(e.label)}
              </span>
              <span style={{ flex: '0 0 72px', textAlign: 'right', fontWeight: 700, fontSize: 'clamp(18px, 2.5vw, 28px)' }}>{e.count}</span>
              <div
                style={{
                  flex: '0 0 160px',
                  height: 32,
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
                    minWidth: e.count > 0 ? 8 : 0,
                  }}
                />
              </div>
            </div>
          ))}
          {payload?.grouped && payload.grouped.otherCount > 0 && (
            <p style={{ marginTop: 12, fontSize: 'clamp(18px, 2.5vw, 26px)', color: 'var(--text-muted)' }}>
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

      <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <p style={{ margin: 0, fontSize: 'clamp(18px, 2.5vw, 28px)', fontWeight: 600, color: 'var(--text)' }}>Scan to vote</p>
        {qrSrc && (
          <img
            src={qrSrc}
            alt="QR code to vote"
            style={{ width: qrSize, height: qrSize, borderRadius: 16, border: '4px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}
          />
        )}
      </div>
    </div>
  );
}
