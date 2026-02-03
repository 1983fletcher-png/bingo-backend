import { useEffect, useState } from 'react';
import type { Song } from '../types/game';

const API_BASE = import.meta.env.VITE_SOCKET_URL || (import.meta.env.DEV ? '' : window.location.origin);

interface SongFactPopUpProps {
  song: Song | null;
  /** When true, fetch and show; when cleared, hide after delay */
  show: boolean;
  onDismiss?: () => void;
  autoHideMs?: number;
}

export default function SongFactPopUp({
  song,
  show,
  onDismiss,
  autoHideMs = 8000,
}: SongFactPopUpProps) {
  const [fact, setFact] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!show || !song) {
      setFact(null);
      return;
    }
    setLoading(true);
    const params = new URLSearchParams({ artist: song.artist, title: song.title });
    fetch(`${API_BASE.replace(/\/$/, '')}/api/song-fact?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setFact(typeof data.fact === 'string' ? data.fact : null);
      })
      .catch(() => setFact(null))
      .finally(() => setLoading(false));
  }, [show, song?.artist, song?.title]);

  useEffect(() => {
    if (!show || !fact) return;
    const t = setTimeout(() => {
      onDismiss?.();
    }, autoHideMs);
    return () => clearTimeout(t);
  }, [show, fact, autoHideMs, onDismiss]);

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        left: 12,
        right: 12,
        maxWidth: 400,
        margin: '0 auto',
        padding: 12,
        background: '#2d3748',
        color: '#e2e8f0',
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        fontSize: 13,
        zIndex: 1000,
      }}
    >
      {loading && <p style={{ margin: 0 }}>Loading fact…</p>}
      {!loading && fact && <p style={{ margin: 0 }}>{fact}</p>}
      {!loading && !fact && <p style={{ margin: 0, color: '#a0aec0' }}>Great tune!</p>}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          style={{
            marginTop: 8,
            padding: '4px 12px',
            fontSize: 12,
            background: 'transparent',
            color: '#a0aec0',
            border: '1px solid #4a5568',
            borderRadius: 6,
          }}
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
