/**
 * Survey Showdown player view — prompt + submit form (or locked message).
 * Used by Play.tsx when gameType === 'feud'. Socket glue: feud:submit, feud:state via getSocket().
 * @see docs/ROUTES-THEME-FEUD-REFERENCE.md
 */
import type { FeudState } from '../../types/feud';
import type { Socket } from 'socket.io-client';
import { GameShell } from '../shared/GameShell';
import { FeudPlayerForm } from '../../components/FeudPlayerForm';

type Props = {
  code: string;
  socket: Socket | null;
  feud: FeudState;
  themeId?: import('../../theme/theme.types').ThemeId;
};

export function PlayerFeud({ code, socket, feud, themeId }: Props) {
  const canSubmit = !feud.locked && (feud.checkpointId === 'R1_COLLECT' || feud.checkpointId === 'R1_TITLE');
  return (
    <GameShell
      gameKey="survey_showdown"
      viewMode="player"
      title="Survey Showdown"
      subtitle={feud.prompt ? undefined : 'Submit your answers'}
      themeId={themeId}
      mainSlot={
        <div style={{ maxWidth: 420, margin: '0 auto', padding: 24 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '1.25rem', fontWeight: 600, color: 'var(--pr-text)' }}>
            {feud.prompt || 'Submit your answers'}
          </h2>
          {feud.locked ? (
            <p style={{ margin: 0, color: 'var(--pr-muted)' }}>Answers are locked. Watch the screen for the reveal!</p>
          ) : canSubmit ? (
            <FeudPlayerForm code={code} socket={socket} />
          ) : (
            <p style={{ margin: 0, color: 'var(--pr-muted)' }}>Wait for the host to show the question.</p>
          )}
        </div>
      }
      footerVariant="minimal"
    />
  );
}
