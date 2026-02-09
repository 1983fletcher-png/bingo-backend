/**
 * LeaderboardList — Rank, name, score, % correct.
 * Player view: full list; Display: top 10 only (when enabled).
 */
import type { PlayerModel } from '../../lib/models';

export interface LeaderboardListProps {
  players: PlayerModel[];
  /** Max entries to show (e.g. 10 for display) */
  limit?: number;
  /** Show percentage correct */
  showPercentage?: boolean;
  /** Size for display vs compact */
  size?: 'compact' | 'display';
  className?: string;
}

export function LeaderboardList({
  players,
  limit = 10,
  showPercentage = true,
  size = 'compact',
  className = '',
}: LeaderboardListProps) {
  const list = players.slice(0, limit);
  if (list.length === 0) return null;

  const isDisplay = size === 'display';
  const titleStyle = isDisplay ? { fontSize: 'clamp(20px, 3vw, 32px)', marginBottom: 16 } : { fontSize: 16, marginBottom: 8 };
  const itemStyle = isDisplay ? { fontSize: 'clamp(18px, 2vw, 24px)', padding: '8px 0' } : { fontSize: 14, padding: '4px 0' };

  return (
    <div className={className}>
      <h2 style={{ margin: '0 0 8px', ...titleStyle }}>Leaderboard</h2>
      <ol style={{ margin: 0, paddingLeft: 24, listStyle: 'decimal' }}>
        {list.map((p) => (
          <li key={p.playerId} style={{ ...itemStyle }}>
            {p.displayName} — {p.score} pts
            {showPercentage && p.answeredCount > 0 && (
              <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>
                ({Math.round((p.correctCount / p.answeredCount) * 100)}%)
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
