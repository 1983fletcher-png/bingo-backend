/**
 * Market Match display — full-screen, no scroll. Single retro card: image, title, question, options/reveal.
 */
import type { MarketMatchState } from '../types/marketMatch';
import { getMarketMatchItem } from '../data/marketMatchDataset';
import './DisplayMarketMatch.css';

export interface DisplayMarketMatchProps {
  state: MarketMatchState | null;
}

export function DisplayMarketMatch({ state }: DisplayMarketMatchProps) {
  const item = state ? getMarketMatchItem(state.currentIndex ?? 0) : null;
  const revealed = state?.revealed === true;

  if (!item) {
    return (
      <div className="mm-display mm-display--empty">
        <p className="mm-display__empty-text">Host will pick an item.</p>
      </div>
    );
  }

  const questionText = item.question ?? `What did it cost in ${item.year}?`;
  const questionSub = item.unit ? ` (${item.unit})` : '';
  const options = item.options ?? [];
  const isClosestTo = item.answerMode === 'closest_to';
  const showOptions = !isClosestTo && options.length > 0;

  const formatPrice = (): string => {
    const p = item.priceUsd;
    const isSmall = p > 0 && p < 100 && Math.round(p * 100) !== p * 100;
    return '$' + p.toLocaleString(undefined, {
      minimumFractionDigits: isSmall || (p >= 0.01 && p < 10) ? 2 : 0,
      maximumFractionDigits: p >= 10 ? 0 : 2,
    });
  };

  return (
    <div className="mm-display mm-display--fullscreen">
      <div className="mm-display__card">
        <div className="mm-display__card-inner">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt="" className="mm-display__card-img" />
          ) : (
            <div className="mm-display__card-img-placeholder">Image</div>
          )}
          <h2 className="mm-display__card-title">{item.title}</h2>
          <p className="mm-display__card-meta">{item.year} · {item.unit}</p>
          <p className="mm-display__card-question">{questionText}{questionSub}</p>

          {showOptions && (
            <div className="mm-display__options">
              {options.map((label, i) => (
                <div
                  key={i}
                  className={`mm-display__option ${revealed && i === item.correctIndex ? 'mm-display__option--correct' : ''}`}
                >
                  {label}
                </div>
              ))}
            </div>
          )}

          {isClosestTo && !revealed && (
            <p className="mm-display__closest-prompt">Enter your guess on your phone — closest wins!</p>
          )}

          {revealed && (
            <div className="mm-display__reveal">
              <p className="mm-display__reveal-price">{formatPrice()}</p>
              <p className="mm-display__reveal-unit">{item.unit}</p>
              {item.citation && <p className="mm-display__reveal-citation">{item.citation}</p>}
            </div>
          )}
        </div>
      </div>
      {!revealed && !isClosestTo && (
        <p className="mm-display__instruction">Pick one on your phone — host will reveal.</p>
      )}
    </div>
  );
}
