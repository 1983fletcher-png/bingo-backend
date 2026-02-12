/**
 * Survey Showdown player reveal — 2×4 grid, same structure as TV, mobile-optimized.
 * Shows top answers + vote count per plate when locked/board/summary.
 */
import type { FeudState } from '../../types/feud';
import './feud-player-reveal.css';

type Props = {
  feud: FeudState;
};

export function FeudPlayerReveal({ feud }: Props) {
  const isBoard = feud.checkpointId.startsWith('R1_BOARD_');
  const revealUpTo = isBoard ? Math.max(0, parseInt(feud.checkpointId.replace('R1_BOARD_', ''), 10)) : 0;
  const showAll = feud.checkpointId === 'R1_SUMMARY';
  const boardItems = feud.topAnswers?.length ? feud.topAnswers : [];

  const items = boardItems.length
    ? boardItems
    : Array.from({ length: 8 }, () => ({ answer: '', count: 0, revealed: false, strike: false }));

  return (
    <div className="feud-player-reveal">
      <p className="feud-player-reveal__prompt">
        {feud.prompt || 'Top answers'}
      </p>
      <div className="feud-player-reveal__board">
        {items.map((item, i) => {
          const revealed = item.revealed || (showAll || i < revealUpTo);
          const strike = item.strike;
          return (
            <div
              key={i}
              className={`feud-player-reveal__plate ${revealed ? 'feud-player-reveal__plate--revealed' : ''} ${strike ? 'feud-player-reveal__plate--strike' : ''}`}
            >
              <span className="feud-player-reveal__num">{i + 1}</span>
              <span className="feud-player-reveal__answer">{revealed ? item.answer : '???'}</span>
              {revealed && item.count != null && item.count > 0 && (
                <span className="feud-player-reveal__votes">{item.count}</span>
              )}
              {strike && <span className="feud-player-reveal__strike" aria-hidden>✕</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
