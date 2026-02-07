import { useState } from 'react';
import RollCallGame from './RollCallGame';
import WaitingRoomTiltMaze from './WaitingRoomTiltMaze';
import StretchyLogoFidget from './StretchyLogoFidget';
import type { StretchyImageSource } from './StretchyLogoFidget';
import { pickMapForGame } from '../data/rollCallMaps';
import type { RollCallTheme } from './RollCallGame';

export interface WaitingRoomConfig {
  game: 'roll-call' | null;
  theme: string;
  hostMessage: string;
  /** Stretchy fidget image: playroom default, venue (scraped) logo, or custom URL */
  stretchyImageSource?: StretchyImageSource;
  stretchyImageUrl?: string | null;
}

export interface EventConfigForWaiting {
  gameTitle?: string;
  venueName?: string;
  logoUrl?: string | null;
  drinkSpecials?: string;
  foodSpecials?: string;
  foodMenuUrl?: string;
  drinkMenuUrl?: string;
  eventsUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  promoText?: string;
}

export interface RollCallLeaderboardEntry {
  playerId: string;
  displayName: string;
  bestTimeMs: number;
}

const themeColors: Record<string, RollCallTheme> = {
  default: { wall: '#4a5568', ball: '#e94560', goal: '#48bb78', bg: '#2d3748' },
  neon: { wall: '#6b21a8', ball: '#22d3ee', goal: '#a3e635', bg: '#0f172a' },
  vinyl: { wall: '#78350f', ball: '#f59e0b', goal: '#10b981', bg: '#1c1917' },
  rock: { wall: '#450a0a', ball: '#f97316', goal: '#eab308', bg: '#1c1917' },
  trivia: { wall: '#1e3a5f', ball: '#818cf8', goal: '#34d399', bg: '#0f172a' },
};

interface WaitingRoomViewProps {
  gameCode: string;
  eventTitle: string;
  waitingRoom: WaitingRoomConfig;
  /** Event/venue config so stretchy can show venue logo when host applied scrape */
  eventConfig?: EventConfigForWaiting | null;
  rollCallLeaderboard: RollCallLeaderboardEntry[];
  onRollCallWin?: (timeMs: number) => void;
}

const TILT_MAZE_THEMES = ['classic', 'eighties', 'trivia'] as const;
function useTiltMaze(themeName: string): boolean {
  return TILT_MAZE_THEMES.includes(themeName as (typeof TILT_MAZE_THEMES)[number]);
}

export default function WaitingRoomView({
  gameCode,
  eventTitle,
  waitingRoom,
  eventConfig,
  rollCallLeaderboard,
  onRollCallWin,
}: WaitingRoomViewProps) {
  const [gameKey, setGameKey] = useState(0);
  const themeName = waitingRoom.theme || 'default';
  const theme = themeColors[themeName] || themeColors.default;
  const map = pickMapForGame(gameCode);
  const useTilt = useTiltMaze(themeName);
  const stretchySource = waitingRoom.stretchyImageSource ?? 'playroom';
  const venueLogoUrl = eventConfig?.logoUrl ?? null;
  const customImageUrl = waitingRoom.stretchyImageUrl ?? null;

  const hasSpecials = eventConfig?.drinkSpecials?.trim() || eventConfig?.foodSpecials?.trim();
  const hasLinks = eventConfig?.foodMenuUrl || eventConfig?.drinkMenuUrl || eventConfig?.eventsUrl || eventConfig?.facebookUrl || eventConfig?.instagramUrl;

  return (
    <div style={{ padding: 16, maxWidth: 480, margin: '0 auto', color: 'var(--text)', background: 'var(--bg)' }}>
      {eventConfig?.logoUrl && (
        <img src={eventConfig.logoUrl} alt="" style={{ maxHeight: 64, maxWidth: '100%', objectFit: 'contain', marginBottom: 12 }} />
      )}
      <h2 style={{ marginTop: 0, fontSize: 22, color: 'var(--text)' }}>{eventTitle || 'The Playroom'}</h2>
      {eventConfig?.venueName && <p style={{ margin: '0 0 4px', fontSize: 14, color: 'var(--text-muted)' }}>{eventConfig.venueName}</p>}
      <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>{waitingRoom.hostMessage || 'Starting soon…'}</p>
      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Room: {gameCode}</p>

      {hasSpecials && (
        <div style={{ marginBottom: 16, padding: 12, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
          {eventConfig?.drinkSpecials?.trim() && <p style={{ margin: '0 0 6px', fontSize: 14, color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text)' }}>Drinks:</strong> {eventConfig.drinkSpecials}</p>}
          {eventConfig?.foodSpecials?.trim() && <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text)' }}>Food:</strong> {eventConfig.foodSpecials}</p>}
        </div>
      )}

      {hasLinks && (
        <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {eventConfig?.foodMenuUrl && <a href={eventConfig.foodMenuUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 14px', background: 'var(--accent)', color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>View menu</a>}
          {eventConfig?.drinkMenuUrl && !eventConfig?.foodMenuUrl && <a href={eventConfig.drinkMenuUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 14px', background: 'var(--accent)', color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>View drinks</a>}
          {eventConfig?.eventsUrl && <a href={eventConfig.eventsUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 14px', background: 'var(--surface)', color: 'var(--accent)', border: '2px solid var(--accent)', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Events</a>}
          {eventConfig?.facebookUrl && <a href={eventConfig.facebookUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 14px', background: 'var(--surface)', color: 'var(--accent)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, textDecoration: 'none' }}>Facebook</a>}
          {eventConfig?.instagramUrl && <a href={eventConfig.instagramUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 14px', background: 'var(--surface)', color: 'var(--accent)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, textDecoration: 'none' }}>Instagram</a>}
        </div>
      )}

      {waitingRoom.game === 'roll-call' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {themeName === 'fidget' ? (
              <p style={{ fontSize: 14, margin: 0 }}>
                Stretch game — drag to stretch and bounce.
              </p>
            ) : (
              <p style={{ fontSize: 14, margin: 0 }}>
                Tilt your device or use arrow keys to roll the marble to the goal.
              </p>
            )}
            <button
              type="button"
              onClick={() => setGameKey((k) => k + 1)}
              style={{
                padding: '8px 14px',
                fontSize: 14,
                fontWeight: 600,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text)',
                cursor: 'pointer',
              }}
            >
              Restart game
            </button>
          </div>
          <div style={{ minHeight: 'min(55vh, 420px)', display: 'flex', flexDirection: 'column', marginBottom: 8 }}>
            {themeName === 'fidget' ? (
              <StretchyLogoFidget
                key={gameKey}
                imageSource={stretchySource}
                venueLogoUrl={venueLogoUrl}
                customImageUrl={customImageUrl}
              />
            ) : useTilt ? (
              <WaitingRoomTiltMaze
                key={gameKey}
                themeKey={themeName as 'classic' | 'eighties' | 'trivia'}
                overlay={themeName === 'trivia' ? 'brain' : 'music'}
                onWin={onRollCallWin}
              />
            ) : (
              <RollCallGame key={gameKey} map={map} theme={theme} onWin={onRollCallWin} />
            )}
          </div>
        </>
      )}

      {rollCallLeaderboard.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h3 style={{ fontSize: 16 }}>Best times</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {rollCallLeaderboard.slice(0, 5).map((entry, i) => (
              <li key={entry.playerId} style={{ padding: '4px 0', display: 'flex', justifyContent: 'space-between' }}>
                <span>{i + 1}. {entry.displayName}</span>
                <span>{(entry.bestTimeMs / 1000).toFixed(1)}s</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
