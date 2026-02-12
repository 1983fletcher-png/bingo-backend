/**
 * Market Match display — framed card: item, year, guess on phone, optional reveal.
 * Use inside GameShell mainSlot for /display/:code when gameType is market-match.
 */
import type { MarketMatchState } from '../types/marketMatch';
import { getMarketMatchItem } from '../data/marketMatchDataset';

export interface DisplayMarketMatchProps {
  state: MarketMatchState | null;
}

export function DisplayMarketMatch({ state }: DisplayMarketMatchProps) {
  const item = state ? getMarketMatchItem(state.currentIndex ?? 0) : null;
  const revealed = state?.revealed === true;

  return (
    <div style={{ padding: 32, textAlign: 'center' }}>
      {item ? (
        <>
          <h2 style={{ margin: '0 0 16px', fontSize: 'clamp(1.25rem, 3vw, 2rem)', fontWeight: 600, color: 'var(--pr-text)' }}>
            {item.title}
          </h2>
          <p style={{ margin: 0, fontSize: 18, color: 'var(--pr-muted)' }}>
            What did it cost in {item.year}? ({item.unit})
          </p>
          {revealed && (
            <div style={{ marginTop: 24, padding: '20px 24px', background: 'var(--pr-surface2)', borderRadius: 12, display: 'inline-block' }}>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: 'var(--pr-brand)' }}>
                ${item.priceUsd.toFixed(2)} {item.unit}
              </p>
              {item.citation && (
                <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--pr-muted)' }}>{item.citation}</p>
              )}
            </div>
          )}
          {!revealed && (
            <p style={{ marginTop: 24, color: 'var(--pr-muted)' }}>Guess on your phone — host will reveal.</p>
          )}
        </>
      ) : (
        <p style={{ color: 'var(--pr-muted)' }}>Host will pick an item.</p>
      )}
    </div>
  );
}
