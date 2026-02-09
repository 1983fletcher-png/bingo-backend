/**
 * Trivia Room — Display panel (TV): big question, 2x2 answers, timer, leaderboard.
 */
import { Link } from 'react-router-dom';
import type { RoomModel, PlayerModel, TriviaQuestionModel } from '../../lib/models';
import { QuestionCard } from './QuestionCard';
import { TimerPill } from './TimerPill';
import { LeaderboardList } from './LeaderboardList';
import { getAnswerDisplayText } from './roomUtils';

export interface RoomDisplayPanelProps {
  room: RoomModel;
  currentQuestion: TriviaQuestionModel | null;
  pack?: { title?: string };
  leaderboardTop: PlayerModel[];
}

export function RoomDisplayPanel({ room, currentQuestion, pack, leaderboardTop }: RoomDisplayPanelProps) {
  const options = currentQuestion?.type === 'mc' && currentQuestion.answer && 'options' in currentQuestion.answer
    ? (currentQuestion.answer.options || [])
    : [];
  const correctId = currentQuestion?.type === 'mc' && currentQuestion.answer && 'correct' in currentQuestion.answer
    ? (currentQuestion.answer as { correct: string }).correct
    : null;
  const showCorrect = room.state === 'REVEAL';
  const answerText = showCorrect ? getAnswerDisplayText(currentQuestion) : '';
  const labels = ['A', 'B', 'C', 'D'];
  const showLeaderboard = room.settings?.leaderboardsVisibleOnDisplay !== false && leaderboardTop.length > 0;

  return (
    <div style={{ padding: 32, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ position: 'absolute', top: 16, left: 24, margin: 0, fontSize: 14 }}>
        <Link to="/">Leave room</Link>
      </p>
      <div style={{ fontSize: 20, color: 'var(--text-muted)', marginBottom: 16 }}>{pack?.title || 'Trivia'}</div>
      {currentQuestion ? (
        <>
          {room.settings?.mcTipsEnabled && currentQuestion.hostNotes?.mcTip && (
            <p style={{ margin: '0 0 16px', padding: 16, maxWidth: 800, background: 'var(--surface)', borderRadius: 12, borderLeft: '4px solid var(--accent)', fontSize: 'clamp(14px, 2vw, 18px)', color: 'var(--text-muted)' }}>
              <strong>MC tip:</strong> {currentQuestion.hostNotes.mcTip}
            </p>
          )}
          <QuestionCard question={currentQuestion} size="display" />
          {room.state === 'ACTIVE_ROUND' && (room.runtime.timeLimitSec ?? currentQuestion.timeLimitSec) != null && (
            <div style={{ marginTop: 16 }}>
              <TimerPill
                questionStartAt={room.runtime.questionStartAt}
                timeLimitSec={room.runtime.timeLimitSec ?? currentQuestion.timeLimitSec}
                active={room.state === 'ACTIVE_ROUND'}
              />
            </div>
          )}
          {options.length > 0 && (
            <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 800 }}>
              {options.map((opt, i) => (
                <div
                  key={opt.id}
                  style={{
                    padding: 24,
                    minHeight: 80,
                    background: showCorrect && opt.id === correctId ? 'var(--accent)' : 'var(--surface)',
                    border: showCorrect && opt.id === correctId ? '3px solid var(--accent)' : '1px solid var(--border)',
                    borderRadius: 12,
                    fontSize: 'clamp(18px, 2.5vw, 28px)',
                    fontWeight: 600,
                    opacity: showCorrect && opt.id !== correctId ? 0.6 : 1,
                  }}
                >
                  {labels[i] ?? opt.id}. {opt.text}
                </div>
              ))}
            </div>
          )}
          {showCorrect && answerText && options.length === 0 && (
            <p style={{ margin: '24px 0 0', padding: '24px 32px', background: 'var(--accent)', color: '#111', borderRadius: 12, fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 700 }}>
              Answer: {answerText}
            </p>
          )}
          {showLeaderboard && (
            <div style={{ marginTop: 48, width: '100%', maxWidth: 600 }}>
              <LeaderboardList players={leaderboardTop} limit={10} showPercentage size="display" />
            </div>
          )}
        </>
      ) : (
        <p style={{ fontSize: 28, color: 'var(--text-muted)' }}>Waiting for question…</p>
      )}
    </div>
  );
}
