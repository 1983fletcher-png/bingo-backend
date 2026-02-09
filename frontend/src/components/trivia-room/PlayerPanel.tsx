/**
 * Trivia Room — Player panel: question, MC/short-answer, wager, timer, leaderboard.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Socket } from 'socket.io-client';
import type { RoomModel, PlayerModel, TriviaQuestionModel } from '../../lib/models';
import { QuestionCard } from './QuestionCard';
import { AnswerCard } from './AnswerCard';
import { TimerPill } from './TimerPill';
import { LeaderboardList } from './LeaderboardList';

export interface RoomPlayerPanelProps {
  room: RoomModel;
  currentQuestion: TriviaQuestionModel | null;
  pack?: { title?: string; questions?: unknown[]; finalWagerEnabled?: boolean };
  socket: Socket | null;
  roomId: string;
  leaderboardTop: PlayerModel[];
  /** Current player's ID (from stored identity when joined this room). */
  playerId: string | undefined;
}

export function RoomPlayerPanel({
  room,
  currentQuestion,
  pack,
  socket,
  roomId,
  leaderboardTop,
  playerId,
}: RoomPlayerPanelProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [shortAnswer, setShortAnswer] = useState('');
  const [wager, setWager] = useState<number>(0);

  const totalQuestions = pack?.questions?.length ?? 0;
  const currentIndex = room.runtime.currentQuestionIndex ?? 0;
  const isLastQuestion = totalQuestions > 0 && currentIndex === totalQuestions - 1;
  const finalWagerEnabled = Boolean(pack?.finalWagerEnabled);
  const wagerCap = 10;

  useEffect(() => {
    setSelectedOption(null);
    setLocked(false);
    setShortAnswer('');
    setWager(0);
  }, [currentQuestion?.id]);

  const submitMc = (optionId: string) => {
    if (!socket?.connected || !playerId || !currentQuestion) return;
    if (locked) return;
    if (selectedOption === optionId) {
      setLocked(true);
      const payload: { optionId: string; wager?: number } = { optionId };
      if (isLastQuestion && finalWagerEnabled && wager > 0) payload.wager = Math.min(wager, wagerCap);
      socket.emit('room:submit-response', {
        roomId,
        questionId: currentQuestion.id,
        playerId,
        payload,
      });
    } else {
      setSelectedOption(optionId);
    }
  };

  const submitShortAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket?.connected || !playerId || !currentQuestion || locked) return;
    const text = shortAnswer.trim();
    if (!text) return;
    setLocked(true);
    const payload: { text: string; wager?: number } = { text };
    if (isLastQuestion && finalWagerEnabled && wager > 0) payload.wager = Math.min(wager, wagerCap);
    socket.emit('room:submit-response', {
      roomId,
      questionId: currentQuestion.id,
      playerId,
      payload,
    });
  };

  const options = currentQuestion?.type === 'mc' && currentQuestion.answer && 'options' in currentQuestion.answer
    ? (currentQuestion.answer.options || [])
    : [];
  const hasShortAnswer = room.state === 'ACTIVE_ROUND' && currentQuestion && options.length === 0;
  const labels = ['A', 'B', 'C', 'D'];
  const showLeaderboard = room.settings?.leaderboardsVisibleToPlayers !== false && leaderboardTop.length > 0;

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: '0 auto', minHeight: '100vh' }}>
      <p style={{ margin: '0 0 16px', fontSize: 14 }}>
        <Link to="/">Leave room</Link>
      </p>
      <div style={{ marginBottom: 16, fontSize: 14, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span>{pack?.title || 'Trivia'} · {room.state} · Q{room.runtime.currentQuestionIndex + 1}</span>
        {room.state === 'ACTIVE_ROUND' && (room.runtime.timeLimitSec ?? currentQuestion?.timeLimitSec) != null && (
          <TimerPill
            questionStartAt={room.runtime.questionStartAt}
            timeLimitSec={room.runtime.timeLimitSec ?? currentQuestion?.timeLimitSec}
            active={room.state === 'ACTIVE_ROUND'}
          />
        )}
      </div>
      {room.state === 'WAITING_ROOM' || room.state === 'READY_CHECK' ? (
        <p style={{ fontSize: 18 }}>Waiting for host to start the round…</p>
      ) : currentQuestion ? (
        <>
          <QuestionCard question={currentQuestion} size="normal" />
          {room.state === 'ACTIVE_ROUND' && isLastQuestion && finalWagerEnabled && (
            <div style={{ marginTop: 16, padding: 12, background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <label style={{ display: 'block', fontSize: 14, marginBottom: 6 }}>Final wager (optional, max {wagerCap} pts)</label>
              <input
                type="number"
                min={0}
                max={wagerCap}
                value={wager || ''}
                onChange={(e) => setWager(Math.max(0, Math.min(wagerCap, parseInt(e.target.value, 10) || 0)))}
                className="join-page__input"
                style={{ width: 80, marginBottom: 0 }}
                placeholder="0"
              />
            </div>
          )}
          {room.state === 'ACTIVE_ROUND' && options.length > 0 && (
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {options.map((opt, i) => (
                <AnswerCard
                  key={opt.id}
                  option={opt}
                  label={labels[i] ?? opt.id}
                  selected={selectedOption === opt.id}
                  locked={locked}
                  onTap={() => submitMc(opt.id)}
                  disabled={locked}
                  size="compact"
                />
              ))}
            </div>
          )}
          {hasShortAnswer && (
            <form onSubmit={submitShortAnswer} style={{ marginTop: 20 }}>
              <input
                type="text"
                placeholder="Your answer"
                value={shortAnswer}
                onChange={(e) => setShortAnswer(e.target.value)}
                className="join-page__input"
                style={{ marginBottom: 12, width: '100%', maxWidth: 400 }}
                autoComplete="off"
                disabled={locked}
              />
              <button type="submit" className="join-page__btn" disabled={locked || !shortAnswer.trim() || !socket?.connected}>
                {locked ? 'Submitted' : 'Submit answer'}
              </button>
            </form>
          )}
          {room.state === 'REVEAL' && (
            <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>Answer revealed. Next question soon.</p>
          )}
        </>
      ) : (
        <p style={{ color: 'var(--text-muted)' }}>No question right now.</p>
      )}
      {showLeaderboard && (
        <div style={{ marginTop: 24 }}>
          <LeaderboardList players={leaderboardTop} limit={10} showPercentage />
        </div>
      )}
    </div>
  );
}
