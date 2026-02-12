/**
 * Survey Showdown — single tile (answer + count). No baked PNG; full UI styling.
 * Same look for TV and player; size controlled by parent grid.
 */
import './SurveyShowdownTile.css';

export interface SurveyShowdownTileProps {
  text: string;
  count: number;
  revealed: boolean;
  rank: number;
}

function cleanText(s: string): string {
  return (s || '').trim();
}

export function SurveyShowdownTile({ text, count, revealed, rank }: SurveyShowdownTileProps) {
  const cleaned = cleanText(text);
  const displayText = revealed ? (cleaned ? cleaned : '???') : '';
  const showCount = revealed;

  return (
    <div
      className={`survey-showdown-tile ${revealed ? 'survey-showdown-tile--revealed' : ''}`}
      data-rank={rank}
      data-revealed={revealed ? 'true' : 'false'}
    >
      <span className="survey-showdown-tile__rank" aria-hidden>{rank}</span>
      <span className="survey-showdown-tile__text">{displayText}</span>
      {showCount && (
        <span className="survey-showdown-tile__count">{Number.isFinite(count) ? count : 0}</span>
      )}
    </div>
  );
}
