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
  /** Venue/scraped logo URL (from scrape + Apply event details) */
  logoUrl?: string | null;
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
  const themeName = waitingRoom.theme || 'default';
  const theme = themeColors[themeName] || themeColors.default;
  const map = pickMapForGame(gameCode);
  const useTilt = useTiltMaze(themeName);
  const stretchySource = waitingRoom.stretchyImageSource ?? 'playroom';
  const venueLogoUrl = eventConfig?.logoUrl ?? null;
  const customImageUrl = waitingRoom.stretchyImageUrl ?? null;

  return (
    <div style={{ padding: 16, maxWidth: 480, margin: '0 auto' }}>
      <h2 style={{ marginTop: 0, fontSize: 22 }}>{eventTitle || 'The Playroom'}</h2>
      <p style={{ color: '#a0aec0', marginBottom: 16 }}>{waitingRoom.hostMessage || 'Starting soon…'}</p>
      <p style={{ fontSize: 12, color: '#718096' }}>Room: {gameCode}</p>

      {waitingRoom.game === 'roll-call' && (
        <>
          {themeName === 'fidget' ? (
            <>
              <p style={{ fontSize: 14, marginBottom: 8 }}>
                Stretch game — drag to stretch and bounce. Default is Playroom; use venue/scraped logo or load your own below.
              </p>
              <StretchyLogoFidget
                imageSource={stretchySource}
                venueLogoUrl={venueLogoUrl}
                customImageUrl={customImageUrl}
              />
            </>
          ) : (
            <>
              <p style={{ fontSize: 14, marginBottom: 8 }}>
                Tilt your device or use arrow keys to roll the marble to the goal.
              </p>
              {useTilt ? (
                <WaitingRoomTiltMaze
                  themeKey={themeName as 'classic' | 'eighties' | 'trivia'}
                  overlay={themeName === 'trivia' ? 'brain' : 'music'}
                  onWin={onRollCallWin}
                />
              ) : (
                <RollCallGame map={map} theme={theme} onWin={onRollCallWin} />
              )}
            </>
          )}
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
