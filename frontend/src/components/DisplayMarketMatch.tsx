/**
 * Market Match display — game-show stage: title, image, question, four options.
 * One correct, three wrong; reveal highlights the correct choice.
 */
import type { MarketMatchState } from '../types/marketMatch';
import { getMarketMatchItem } from '../data/marketMatchDataset';
import { SurveyShowdownStage } from '../games/feud/SurveyShowdownStage';
import './DisplayMarketMatch.css';

export interface DisplayMarketMatchProps {
  state: MarketMatchState | null;
}

export function DisplayMarketMatch({ state }: DisplayMarketMatchProps) {
  const item = state ? getMarketMatchItem(state.currentIndex ?? 0) : null;
  const revealed = state?.revealed === true;

  if (!item) {
    return (
      <SurveyShowdownStage
        variant="tv"
        stageTheme="arcade"
        marqueeSubtitle="Playroom"
        marqueeTitle="Market Match"
        contentSlot={
          <div className="mm-display-wrap">
            <p style={{ margin: 0, color: 'var(--pr-muted)' }}>Host will pick an item.</p>
          </div>
        }
      />
    );
  }

  const questionText = `What did it cost in ${item.year}?`;
  const questionSub = item.unit ? `(${item.unit})` : '';
  const options = item.options ?? [];

  return (
    <SurveyShowdownStage
      variant="tv"
      stageTheme="arcade"
      marqueeSubtitle="Playroom"
      marqueeTitle="Market Match"
      promptSlot={
        <div className="mm-question-panel">
          <p className="mm-question-text">
            {questionText} {questionSub && <span style={{ fontWeight: 500, opacity: 0.9 }}> {questionSub}</span>}
          </p>
        </div>
      }
      contentSlot={
        <div className="mm-display-wrap">
          <div className="mm-content-block">
            <div className="mm-content-inner">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt="" className="mm-item-image" />
              ) : (
                <div className="mm-item-image-wrap">Image</div>
              )}
              <p className="mm-item-title">{item.title}</p>
              <p className="mm-item-meta">
                {item.year} · {item.unit}
              </p>

              {options.length > 0 && (
                <div className="mm-options">
                  {options.map((label, i) => (
                    <div
                      key={i}
                      className={`mm-option ${revealed && i === item.correctIndex ? 'mm-option--correct' : ''}`}
                    >
                      {label}
                    </div>
                  ))}
                </div>
              )}

              {revealed && (
                <div className="mm-reveal-wrap">
                  <p className="mm-reveal-price">
                    ${item.priceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="mm-reveal-unit">{item.unit}</p>
                  {item.citation && <p className="mm-reveal-citation">{item.citation}</p>}
                </div>
              )}
            </div>
          </div>
          {!revealed && (
            <p className="mm-instruction">Pick one on your phone — host will reveal.</p>
          )}
        </div>
      }
    />
  );
}
