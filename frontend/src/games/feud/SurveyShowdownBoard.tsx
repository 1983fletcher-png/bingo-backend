/**
 * Survey Showdown — live 8-tile board (2×4 grid). Uses FeudState; no baked answers.
 * Classic Feud: locked shows empty board; R1_BOARD_N reveals 1..N; summary reveals all.
 */
import type { FeudState, FeudBoardItem } from '../../types/feud';
import { SurveyShowdownTile } from './SurveyShowdownTile';
import { isSurveyShowdownDebug } from './surveyShowdownConstants';
import './SurveyShowdownBoard.css';

export interface SurveyShowdownBoardProps {
  feud: FeudState;
  variant: 'tv' | 'player';
}

function getRevealedCount(feud: FeudState): number {
  const id = feud.checkpointId || '';
  if (id === 'R1_SUMMARY') return 8;

  const m = id.match(/^R1_BOARD_(\d+)$/);
  if (m) {
    const n = parseInt(m[1], 10);
    return Number.isFinite(n) ? Math.max(0, Math.min(8, n)) : 0;
  }

  // Classic: LOCKED shows the board but reveals nothing yet
  if (id === 'R1_LOCKED') return 0;

  return 0;
}

function normalizeItems(raw: FeudBoardItem[]): FeudBoardItem[] {
  const base = Array.isArray(raw) ? raw.slice(0, 8) : [];
  while (base.length < 8) base.push({ answer: '', count: 0, revealed: false });
  return base;
}

export function SurveyShowdownBoard({ feud, variant }: SurveyShowdownBoardProps) {
  const debug = isSurveyShowdownDebug();
  const items = normalizeItems(feud.topAnswers ?? []);
  const revealedCount = getRevealedCount(feud);

  return (
    <div
      className={`survey-showdown-board survey-showdown-board--${variant}`}
      data-variant={variant}
      data-debug={debug ? 'true' : undefined}
    >
      {items.map((item, i) => {
        const revealed = typeof item.revealed === 'boolean' ? item.revealed : i < revealedCount;
        return (
          <SurveyShowdownTile
            key={i}
            rank={i + 1}
            text={item.answer}
            count={item.count ?? 0}
            revealed={revealed}
          />
        );
      })}
    </div>
  );
}
