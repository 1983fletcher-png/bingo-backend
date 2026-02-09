/**
 * Live preview of what players and the display see (mock, no extra connection).
 * Shows both Player view and Display view side by side so the host sees exactly
 * what each sees.
 */
import type { RoomModel, PlayerModel, TriviaQuestionModel } from '../../lib/models';
import { getAnswerDisplayText } from './roomUtils';

export interface LivePreviewProps {
  room: RoomModel;
  currentQuestion: TriviaQuestionModel | null;
  pack?: { title?: string };
  leaderboardTop: PlayerModel[];
}

const LABELS = ['A', 'B', 'C', 'D'];

export function LivePreview({ room, currentQuestion, leaderboardTop }: LivePreviewProps) {
  const options = currentQuestion?.type === 'mc' && currentQuestion?.answer && 'options' in currentQuestion.answer
    ? (currentQuestion.answer.options || [])
    : [];
  const correctId = currentQuestion?.type === 'mc' && currentQuestion?.answer && 'correct' in currentQuestion.answer
    ? (currentQuestion.answer as { correct: string }).correct
    : null;
  const showCorrect = room.state === 'REVEAL';
  const answerText = showCorrect && currentQuestion ? getAnswerDisplayText(currentQuestion) : '';
  const showLeaderboardPlayer = room.settings?.leaderboardsVisibleToPlayers !== false && leaderboardTop.length > 0;
  const showLeaderboardDisplay = room.settings?.leaderboardsVisibleOnDisplay !== false && leaderboardTop.length > 0;
  const isWaiting = room.state === 'WAITING_ROOM' || room.state === 'READY_CHECK';

  const panelBase = {
    flex: '1 1 240px',
    minWidth: 200,
    maxWidth: 320,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    overflow: 'hidden' as const,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column' as const,
  };

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', flexShrink: 0 }}>
      {/* Player preview — matches what players see on their phones */}
      <div style={{ ...panelBase }}>
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Player view
        </div>
        <div style={{ padding: 12, minHeight: 200, fontSize: 11, color: 'var(--text)', flex: 1 }}>
          {isWaiting ? (
            <p style={{ margin: 0, color: 'var(--text-muted)', textAlign: 'center', paddingTop: 24 }}>
              Waiting for host to start…
            </p>
          ) : currentQuestion ? (
            <>
              <p style={{ margin: '0 0 8px', fontWeight: 600, lineHeight: 1.3 }}>
                {currentQuestion.prompt}
              </p>
              {options.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {options.map((opt, i) => (
                    <div
                      key={opt.id}
                      style={{
                        padding: '6px 8px',
                        background: showCorrect && opt.id === correctId ? 'var(--accent)' : 'var(--bg)',
                        color: showCorrect && opt.id === correctId ? '#fff' : 'var(--text)',
                        borderRadius: 6,
                        opacity: showCorrect && opt.id !== correctId ? 0.6 : 1,
                      }}
                    >
                      {LABELS[i] ?? opt.id}. {opt.text}
                    </div>
                  ))}
                </div>
              )}
              {showCorrect && answerText && options.length === 0 && (
                <p style={{ margin: '8px 0 0', padding: 8, background: 'var(--accent)', color: '#111', borderRadius: 6, fontWeight: 700 }}>
                  {answerText}
                </p>
              )}
              {showCorrect && answerText && options.length > 0 && (
                <p style={{ margin: '8px 0 0', fontSize: 10, fontWeight: 700, color: 'var(--accent)' }}>
                  ✓ {answerText}
                </p>
              )}
              {showLeaderboardPlayer && (
                <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                  <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: 10 }}>Leaderboard</p>
                  {leaderboardTop.slice(0, 3).map((p) => (
                    <p key={p.playerId} style={{ margin: 0, fontSize: 10 }}>
                      {p.displayName} — {p.score} pts
                    </p>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p style={{ margin: 0, color: 'var(--text-muted)', textAlign: 'center', paddingTop: 24 }}>
              No question yet
            </p>
          )}
        </div>
      </div>

      {/* Display preview — matches what the TV/projector display shows */}
      <div style={{ ...panelBase }}>
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Display view
        </div>
        <div style={{ padding: 12, minHeight: 200, fontSize: 11, color: 'var(--text)', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {isWaiting ? (
            <p style={{ margin: 0, color: 'var(--text-muted)', textAlign: 'center', fontSize: 13 }}>
              Waiting for host to start…
            </p>
          ) : currentQuestion ? (
            <>
              <p style={{ margin: '0 0 12px', fontWeight: 700, lineHeight: 1.3, textAlign: 'center', fontSize: 12 }}>
                {currentQuestion.prompt}
              </p>
              {options.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%' }}>
                  {options.map((opt, i) => (
                    <div
                      key={opt.id}
                      style={{
                        padding: 10,
                        minHeight: 44,
                        background: showCorrect && opt.id === correctId ? 'var(--accent)' : 'var(--surface-elevated)',
                        border: showCorrect && opt.id === correctId ? '2px solid var(--accent)' : '1px solid var(--border)',
                        borderRadius: 8,
                        fontSize: 10,
                        fontWeight: 600,
                        opacity: showCorrect && opt.id !== correctId ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                      }}
                    >
                      {LABELS[i] ?? opt.id}. {opt.text}
                    </div>
                  ))}
                </div>
              )}
              {showCorrect && answerText && options.length === 0 && (
                <p style={{ margin: '12px 0 0', padding: 12, background: 'var(--accent)', color: '#111', borderRadius: 8, fontWeight: 700, fontSize: 12 }}>
                  Answer: {answerText}
                </p>
              )}
              {showCorrect && answerText && options.length > 0 && (
                <p style={{ margin: '8px 0 0', fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>
                  ✓ {answerText}
                </p>
              )}
              {showLeaderboardDisplay && (
                <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid var(--border)', width: '100%' }}>
                  <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: 10 }}>Leaderboard</p>
                  {leaderboardTop.slice(0, 3).map((p) => (
                    <p key={p.playerId} style={{ margin: 0, fontSize: 10 }}>
                      {p.displayName} — {p.score} pts
                    </p>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p style={{ margin: 0, color: 'var(--text-muted)', textAlign: 'center', fontSize: 13 }}>
              Waiting for question…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
