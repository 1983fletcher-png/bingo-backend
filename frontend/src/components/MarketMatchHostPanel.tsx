/**
 * Market Match — host controls: pick next item, reveal.
 */
import { useEffect, type MutableRefObject } from 'react';
import type { Socket } from 'socket.io-client';
import { MARKET_MATCH_DATASET, getMarketMatchItem } from '../data/marketMatchDataset';
import type { MarketMatchState } from '../types/marketMatch';

export type HostKeyboardRef = MutableRefObject<{ forward?: () => void; back?: () => void } | null>;

export interface MarketMatchHostPanelProps {
  gameCode: string;
  hostToken: string | null;
  marketMatch: MarketMatchState;
  socket: Socket | null;
  joinUrl: string;
  displayUrl: string;
  onEndSession: () => void;
  hostKeyboardRef?: HostKeyboardRef | null;
}

export function MarketMatchHostPanel({
  gameCode,
  hostToken,
  marketMatch,
  socket,
  joinUrl,
  displayUrl,
  onEndSession,
  hostKeyboardRef
}: MarketMatchHostPanelProps) {
  const currentIndex = marketMatch.currentIndex ?? 0;
  const revealed = marketMatch.revealed === true;
  const item = getMarketMatchItem(currentIndex);
  const canNext = currentIndex < MARKET_MATCH_DATASET.length - 1;
  const canPrev = currentIndex > 0;

  useEffect(() => {
    if (!hostKeyboardRef) return;
    const forward = () => {
      if (!revealed) sendReveal();
      else if (canNext) sendNext();
    };
    const back = () => {
      if (canPrev) sendPrev();
    };
    hostKeyboardRef.current = { forward, back };
    return () => {
      hostKeyboardRef.current = null;
    };
  }, [hostKeyboardRef, revealed, canNext, canPrev]);

  const sendNext = () => {
    if (socket && gameCode && hostToken) {
      socket.emit('market-match:next', { code: gameCode, hostToken });
    }
  };

  const sendPrev = () => {
    if (socket && gameCode && hostToken && canPrev) {
      socket.emit('market-match:set-index', { code: gameCode, hostToken, index: currentIndex - 1 });
    }
  };

  const sendReveal = () => {
    if (socket && gameCode && hostToken) {
      socket.emit('market-match:reveal', { code: gameCode, hostToken });
    }
  };

  return (
    <div className="host-room__panel" style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, padding: 16, background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)' }}>
        <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current item</p>
        <p style={{ margin: 0, fontWeight: 600 }}>
          {item ? `${item.title} (${item.year})` : '—'}
        </p>
        {item && (
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-muted)' }}>
            {revealed ? `$${item.priceUsd.toFixed(2)} ${item.unit}` : 'Hidden until reveal'}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <button
          type="button"
          className="host-room__btn-secondary"
          onClick={sendPrev}
          disabled={!canPrev}
        >
          ← Previous
        </button>
        <button
          type="button"
          className="host-room__btn-secondary"
          onClick={sendNext}
          disabled={!canNext}
        >
          Next item →
        </button>
        <button
          type="button"
          className="host-room__start-btn"
          onClick={sendReveal}
          disabled={revealed}
        >
          {revealed ? 'Revealed' : 'Reveal answer'}
        </button>
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
        Item {currentIndex + 1} of {MARKET_MATCH_DATASET.length}. Share the join link with players; open Display on the TV.
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <a href={joinUrl} target="_blank" rel="noopener noreferrer" className="host-room__link-btn">
          Player link
        </a>
        <a href={displayUrl} target="_blank" rel="noopener noreferrer" className="host-room__link-btn">
          Display (TV)
        </a>
        <button type="button" onClick={onEndSession} className="host-room__btn-secondary">
          End session
        </button>
      </div>
    </div>
  );
}
