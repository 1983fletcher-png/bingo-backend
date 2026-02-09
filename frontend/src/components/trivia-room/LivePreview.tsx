/**
 * Compact live preview of what players and the display see (mock, no extra connection).
 * Lets the host see both views without switching tabs.
 */
import { useState } from 'react';
import type { RoomModel, PlayerModel, TriviaQuestionModel } from '../../lib/models';
import { getAnswerDisplayText } from './roomUtils';

export interface LivePreviewProps {
  room: RoomModel;
  currentQuestion: TriviaQuestionModel | null;
  pack?: { title?: string };
  leaderboardTop: PlayerModel[];
}

type Tab = 'player' | 'display';

export function LivePreview({ room, currentQuestion, pack, leaderboardTop }: LivePreviewProps) {
  const [tab, setTab] = useState<Tab>('player');

  const options = currentQuestion?.type === 'mc' && currentQuestion?.answer && 'options' in currentQuestion.answer
    ? (currentQuestion.answer.options || [])
    : [];
  const correctId = currentQuestion?.type === 'mc' && currentQuestion?.answer && 'correct' in currentQuestion.answer
    ? (currentQuestion.answer as { correct: string }).correct
    : null;
  const showCorrect = room.state === 'REVEAL';
  const answerText = showCorrect && currentQuestion ? getAnswerDisplayText(currentQuestion) : '';
  const labels = ['A', 'B', 'C', 'D'];
  const showLeaderboard = (tab === 'player' ? room.settings?.leaderboardsVisibleToPlayers : room.settings?.leaderboardsVisibleOnDisplay) !== false && leaderboardTop.length > 0;

  const isWaiting = room.state === 'WAITING_ROOM' || room.state === 'READY_CHECK';

  return (
    <div
      style={{
        flexShrink: 0,
        width: 280,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}
    >
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
        <button
          type="button"
          onClick={() => setTab('player')}
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: 12,
            fontWeight: 600,
            background: tab === 'player' ? 'var(--accent)' : 'transparent',
            color: tab === 'player' ? '#fff' : 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Player
        </button>
        <button
          type="button"
          onClick={() => setTab('display')}
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: 12,
            fontWeight: 600,
            background: tab === 'display' ? 'var(--accent)' : 'transparent',
            color: tab === 'display' ? '#fff' : 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Display
        </button>
      </div>
      <div style={{ padding: 12, minHeight: 200, fontSize: 11, color: 'var(--text)' }}>
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
                    {labels[i] ?? opt.id}. {opt.text}
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
            {showLeaderboard && (
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
  );
}
